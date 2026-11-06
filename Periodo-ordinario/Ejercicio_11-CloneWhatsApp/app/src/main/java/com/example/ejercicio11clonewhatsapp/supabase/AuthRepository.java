package com.example.ejercicio11clonewhatsapp.supabase;

import android.content.Context;
import android.net.Uri;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import okhttp3.Request;

/**
 * Fase 3: autenticacion con Supabase Auth (GoTrue) por REST.
 * Registro, inicio de sesion, cierre de sesion, recuperacion de contrasena y
 * manejo del JWT (renovarlo con el refresh_token cuando esta por caducar).
 */
public final class AuthRepository {

    private static AuthRepository instancia;

    private final SupabaseClient cliente = SupabaseClient.get();
    private final Sesion sesion;

    /** Si ya hay una renovacion en curso, las demas peticiones esperan a que termine. */
    private final List<Resultado<String>> esperandoToken = new ArrayList<>();
    private boolean renovando = false;

    private AuthRepository(Context context) {
        sesion = new Sesion(context);
    }

    public static synchronized AuthRepository get(Context context) {
        if (instancia == null) instancia = new AuthRepository(context.getApplicationContext());
        return instancia;
    }

    public Sesion getSesion() {
        return sesion;
    }

    private static String conRedirect(String ruta) {
        return ruta + (ruta.contains("?") ? "&" : "?") + "redirect_to=" + Uri.encode(SupabaseClient.REDIRECT);
    }

    // -----------------------------------------------------------------
    // Registro con correo y contrasena
    // -----------------------------------------------------------------

    /**
     * POST /auth/v1/signup. Devuelve true si la sesion quedo abierta (confirmacion de correo
     * desactivada) o false si Supabase envio un correo para confirmar la cuenta.
     */
    public void registrar(String username, String email, String password, Resultado<Boolean> cb) {
        JSONObject body = new JSONObject();
        try {
            body.put("email", email);
            body.put("password", password);
            body.put("data", new JSONObject().put("username", username)); // lo usa el trigger crear_perfil
        } catch (JSONException ignored) { }

        Request req = cliente.peticion(conRedirect("/auth/v1/signup"), null)
                .post(SupabaseClient.cuerpo(body))
                .build();

        cliente.ejecutar(req, new Resultado<String>() {
            @Override
            public void ok(String texto) {
                try {
                    JSONObject r = new JSONObject(texto);
                    if (r.has("access_token")) {
                        sesion.guardar(r);
                        cb.ok(true);
                        return;
                    }
                    // Con confirmacion de correo activa, si el correo ya existe Supabase
                    // responde un usuario "falso" sin identidades para no revelar cuentas.
                    JSONObject user = r.has("user") ? r.getJSONObject("user") : r;
                    JSONArray identidades = user.optJSONArray("identities");
                    if (identidades != null && identidades.length() == 0) {
                        cb.error("Ese correo ya esta registrado");
                    } else {
                        cb.ok(false);
                    }
                } catch (JSONException e) {
                    cb.error("Respuesta inesperada del servidor");
                }
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        });
    }

    // -----------------------------------------------------------------
    // Inicio de sesion
    // -----------------------------------------------------------------

    /** POST /auth/v1/token?grant_type=password. Guarda el JWT y el refresh_token. */
    public void iniciarSesion(String email, String password, Resultado<Void> cb) {
        JSONObject body = new JSONObject();
        try {
            body.put("email", email);
            body.put("password", password);
        } catch (JSONException ignored) { }

        Request req = cliente.peticion("/auth/v1/token?grant_type=password", null)
                .post(SupabaseClient.cuerpo(body))
                .build();
        cliente.ejecutar(req, guardarSesion(cb));
    }

    // -----------------------------------------------------------------
    // Cierre de sesion
    // -----------------------------------------------------------------

    /**
     * POST /auth/v1/logout?scope=local: invalida el refresh_token de este dispositivo.
     * La sesion local se borra aunque falle la red, para no dejar al usuario atrapado.
     */
    public void cerrarSesion(Resultado<Void> cb) {
        String token = sesion.getAccessToken();
        if (token == null) {
            sesion.borrar();
            cb.ok(null);
            return;
        }
        Request req = cliente.peticion("/auth/v1/logout?scope=local", token)
                .post(SupabaseClient.cuerpo(new JSONObject()))
                .build();
        cliente.ejecutar(req, new Resultado<String>() {
            @Override
            public void ok(String valor) {
                sesion.borrar();
                cb.ok(null);
            }

            @Override
            public void error(String mensaje) {
                sesion.borrar();
                cb.ok(null);
            }
        });
    }

    // -----------------------------------------------------------------
    // Recuperacion de contrasena
    // -----------------------------------------------------------------

    /** POST /auth/v1/recover: Supabase manda un correo con un enlace que abre la app. */
    public void recuperarPassword(String email, Resultado<Void> cb) {
        JSONObject body = new JSONObject();
        try {
            body.put("email", email);
        } catch (JSONException ignored) { }

        Request req = cliente.peticion(conRedirect("/auth/v1/recover"), null)
                .post(SupabaseClient.cuerpo(body))
                .build();
        cliente.ejecutar(req, new Resultado<String>() {
            @Override
            public void ok(String valor) {
                cb.ok(null);
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        });
    }

    /**
     * PUT /auth/v1/user con el access_token de recuperacion que llega en el enlace del correo.
     * Si sale bien, guarda esa sesion: el usuario queda dentro con su nueva contrasena.
     */
    public void cambiarPassword(JSONObject sesionRecuperacion, String nueva, Resultado<Void> cb) {
        JSONObject body = new JSONObject();
        try {
            body.put("password", nueva);
        } catch (JSONException ignored) { }

        Request req = cliente.peticion("/auth/v1/user", sesionRecuperacion.optString("access_token"))
                .put(SupabaseClient.cuerpo(body))
                .build();
        cliente.ejecutar(req, new Resultado<String>() {
            @Override
            public void ok(String valor) {
                sesion.guardar(sesionRecuperacion);
                cb.ok(null);
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        });
    }

    // -----------------------------------------------------------------
    // Manejo de la sesion JWT
    // -----------------------------------------------------------------

    /**
     * Entrega un access_token vigente. Si esta por caducar lo renueva antes con el
     * refresh_token. Todas las peticiones a las tablas deben pasar por aqui.
     */
    public void obtenerToken(Resultado<String> cb) {
        if (!sesion.activa()) {
            cb.error("No hay sesion iniciada");
            return;
        }
        if (!sesion.expirada()) {
            cb.ok(sesion.getAccessToken());
            return;
        }
        renovarToken(cb);
    }

    /** POST /auth/v1/token?grant_type=refresh_token. Supabase rota el refresh_token en cada uso. */
    public void renovarToken(Resultado<String> cb) {
        esperandoToken.add(cb);
        if (renovando) return;
        renovando = true;

        JSONObject body = new JSONObject();
        try {
            body.put("refresh_token", sesion.getRefreshToken());
        } catch (JSONException ignored) { }

        Request req = cliente.peticion("/auth/v1/token?grant_type=refresh_token", null)
                .post(SupabaseClient.cuerpo(body))
                .build();
        cliente.ejecutar(req, guardarSesion(new Resultado<Void>() {
            @Override
            public void ok(Void valor) {
                avisarEsperando(sesion.getAccessToken(), null);
            }

            @Override
            public void error(String mensaje) {
                sesion.borrar(); // refresh_token invalido o revocado: hay que volver a entrar
                avisarEsperando(null, mensaje);
            }
        }));
    }

    private void avisarEsperando(String token, String error) {
        renovando = false;
        List<Resultado<String>> lista = new ArrayList<>(esperandoToken);
        esperandoToken.clear();
        for (Resultado<String> r : lista) {
            if (error == null) r.ok(token);
            else r.error(error);
        }
    }

    private Resultado<String> guardarSesion(Resultado<Void> cb) {
        return new Resultado<String>() {
            @Override
            public void ok(String texto) {
                try {
                    sesion.guardar(new JSONObject(texto));
                    cb.ok(null);
                } catch (JSONException e) {
                    cb.error("Respuesta inesperada del servidor");
                }
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        };
    }
}
