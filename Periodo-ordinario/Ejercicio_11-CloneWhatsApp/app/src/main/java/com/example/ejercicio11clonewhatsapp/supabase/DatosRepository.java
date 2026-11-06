package com.example.ejercicio11clonewhatsapp.supabase;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;

/**
 * Acceso a las tablas por la API REST de Supabase (PostgREST) usando el JWT del usuario.
 * Las politicas RLS de schema.sql deciden que filas puede leer o escribir.
 *
 * profiles: id (= auth.users.id), username, nombre, avatar_url, created_at
 * devices:  id, profile_id, device_token, created_at
 * Storage:  bucket publico "avatars", archivo {id}/avatar.jpg
 */
public final class DatosRepository {

    private final SupabaseClient cliente = SupabaseClient.get();
    private final AuthRepository auth;
    private final SharedPreferences prefsDispositivo;

    public DatosRepository(Context context) {
        auth = AuthRepository.get(context);
        prefsDispositivo = context.getApplicationContext()
                .getSharedPreferences("dispositivo", Context.MODE_PRIVATE);
    }

    /**
     * Identificador de esta instalacion, guardado en devices.device_token. No se borra al
     * cerrar sesion. Cuando se agreguen notificaciones push se cambiara por el token de FCM.
     */
    public String getDeviceToken() {
        String token = prefsDispositivo.getString("device_token", null);
        if (token == null) {
            token = UUID.randomUUID().toString();
            prefsDispositivo.edit().putString("device_token", token).apply();
        }
        return token;
    }

    // -----------------------------------------------------------------
    // profiles
    // -----------------------------------------------------------------

    /**
     * GET /rest/v1/profiles?id=eq.{yo}. Si todavia no existe la fila (no hay trigger o la
     * cuenta es anterior a el), la crea con el username que se mando en el registro.
     */
    public void miPerfil(Resultado<JSONObject> cb) {
        conToken(cb, token -> {
            String ruta = "/rest/v1/profiles?select=*&id=eq." + Uri.encode(auth.getSesion().getUserId());
            Request req = cliente.peticion(ruta, token).get().build();
            cliente.ejecutar(req, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    JSONObject perfil = primeraFila(texto);
                    if (perfil != null) cb.ok(perfil);
                    else crearPerfil(token, cb);
                }

                @Override
                public void error(String mensaje) {
                    cb.error(mensaje);
                }
            });
        });
    }

    /** POST /rest/v1/profiles con Prefer return=representation para recibir la fila creada. */
    private void crearPerfil(String token, Resultado<JSONObject> cb) {
        JSONObject claims = Jwt.payload(token);
        JSONObject metadata = claims.optJSONObject("user_metadata");
        String username = metadata != null ? metadata.optString("username") : "";
        if (username.isEmpty()) username = claims.optString("email").split("@")[0];

        JSONObject body = new JSONObject();
        try {
            body.put("id", auth.getSesion().getUserId());
            body.put("username", username);
        } catch (JSONException ignored) { }

        Request req = cliente.peticion("/rest/v1/profiles", token)
                .header("Prefer", "return=representation")
                .post(SupabaseClient.cuerpo(body))
                .build();
        cliente.ejecutar(req, new Resultado<String>() {
            @Override
            public void ok(String texto) {
                JSONObject perfil = primeraFila(texto);
                if (perfil != null) cb.ok(perfil);
                else cb.error("No se pudo crear el perfil");
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        });
    }

    /** PATCH /rest/v1/profiles?id=eq.{yo}: guarda nombre, username y foto. */
    public void actualizarPerfil(String nombre, String username, String avatarUrl, Resultado<Perfil> cb) {
        conToken(cb, token -> {
            JSONObject body = new JSONObject();
            try {
                body.put("nombre", nombre);
                body.put("username", username);
                body.put("avatar_url", avatarUrl == null || avatarUrl.isEmpty() ? JSONObject.NULL : avatarUrl);
            } catch (JSONException ignored) { }

            Request req = cliente.peticion("/rest/v1/profiles?id=eq." + Uri.encode(miId()), token)
                    .header("Prefer", "return=representation")
                    .patch(SupabaseClient.cuerpo(body))
                    .build();
            cliente.ejecutar(req, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    JSONObject fila = primeraFila(texto);
                    if (fila != null) cb.ok(Perfil.desdeJson(fila));
                    else cb.error("No se pudo guardar el perfil");
                }

                @Override
                public void error(String mensaje) {
                    cb.error(mensaje);
                }
            });
        });
    }

    /**
     * Sube la foto a Storage (POST /storage/v1/object/avatars/{yo}/avatar.jpg, x-upsert para
     * reemplazar la anterior) y devuelve su URL publica. Se le agrega ?v= con la hora para
     * que Glide no muestre la foto vieja guardada en cache.
     */
    public void subirAvatar(byte[] jpeg, Resultado<String> cb) {
        conToken(cb, token -> {
            String ruta = "avatars/" + miId() + "/avatar.jpg";
            Request req = cliente.peticion("/storage/v1/object/" + ruta, token)
                    .header("x-upsert", "true")
                    .header("cache-control", "3600")
                    .post(RequestBody.create(jpeg, MediaType.get("image/jpeg")))
                    .build();
            cliente.ejecutar(req, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    cb.ok(cliente.getUrl() + "/storage/v1/object/public/" + ruta
                            + "?v=" + System.currentTimeMillis());
                }

                @Override
                public void error(String mensaje) {
                    cb.error(mensaje);
                }
            });
        });
    }

    // -----------------------------------------------------------------
    // Contactos: los demas usuarios de la tabla profiles
    // -----------------------------------------------------------------

    /**
     * GET /rest/v1/profiles sin incluirme, ordenados por nombre. Si hay texto de busqueda
     * filtra con ilike (sin distinguir mayusculas) por username o nombre.
     */
    public void buscarUsuarios(String busqueda, Resultado<List<Perfil>> cb) {
        conToken(cb, token -> {
            StringBuilder ruta = new StringBuilder("/rest/v1/profiles?select=id,username,nombre,avatar_url,created_at")
                    .append("&id=neq.").append(Uri.encode(miId()))
                    .append("&order=nombre.asc.nullslast,username.asc&limit=100");

            // Se quitan los caracteres que tienen significado en la sintaxis de PostgREST
            String q = busqueda == null ? "" : busqueda.replaceAll("[,()*%\\\\]", "").trim();
            if (!q.isEmpty()) {
                String patron = Uri.encode("*" + q + "*");
                ruta.append("&or=(username.ilike.").append(patron)
                        .append(",nombre.ilike.").append(patron).append(")");
            }

            Request req = cliente.peticion(ruta.toString(), token).get().build();
            cliente.ejecutar(req, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    List<Perfil> lista = new ArrayList<>();
                    try {
                        JSONArray filas = new JSONArray(texto);
                        for (int i = 0; i < filas.length(); i++) {
                            lista.add(Perfil.desdeJson(filas.getJSONObject(i)));
                        }
                        cb.ok(lista);
                    } catch (JSONException e) {
                        cb.error("Respuesta inesperada del servidor");
                    }
                }

                @Override
                public void error(String mensaje) {
                    cb.error(mensaje);
                }
            });
        });
    }

    private String miId() {
        return auth.getSesion().getUserId();
    }

    // -----------------------------------------------------------------
    // devices
    // -----------------------------------------------------------------

    /** Registra este telefono en devices si todavia no esta (consulta y, si no existe, inserta). */
    public void registrarDispositivo(Resultado<Void> cb) {
        conToken(cb, token -> {
            Request consulta = cliente.peticion(rutaMiDispositivo("id"), token).get().build();
            cliente.ejecutar(consulta, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    if (primeraFila(texto) != null) {
                        cb.ok(null); // ya estaba registrado
                        return;
                    }
                    JSONObject body = new JSONObject();
                    try {
                        body.put("profile_id", auth.getSesion().getUserId());
                        body.put("device_token", getDeviceToken());
                    } catch (JSONException ignored) { }

                    Request alta = cliente.peticion("/rest/v1/devices", token)
                            .header("Prefer", "return=minimal")
                            .post(SupabaseClient.cuerpo(body))
                            .build();
                    cliente.ejecutar(alta, vacio(cb));
                }

                @Override
                public void error(String mensaje) {
                    cb.error(mensaje);
                }
            });
        });
    }

    /** Borra este telefono de devices (se llama antes de cerrar sesion). */
    public void eliminarDispositivo(Resultado<Void> cb) {
        conToken(cb, token -> {
            Request req = cliente.peticion(rutaMiDispositivo(null), token).delete().build();
            cliente.ejecutar(req, vacio(cb));
        });
    }

    private String rutaMiDispositivo(String select) {
        return "/rest/v1/devices?"
                + (select != null ? "select=" + select + "&" : "")
                + "profile_id=eq." + Uri.encode(auth.getSesion().getUserId())
                + "&device_token=eq." + Uri.encode(getDeviceToken());
    }

    // -----------------------------------------------------------------

    private interface ConToken {
        void ejecutar(String token);
    }

    /** Pide un JWT vigente (renovandolo si hace falta) y luego hace la peticion. */
    private void conToken(Resultado<?> cb, ConToken accion) {
        auth.obtenerToken(new Resultado<String>() {
            @Override
            public void ok(String token) {
                accion.ejecutar(token);
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        });
    }

    private static JSONObject primeraFila(String texto) {
        try {
            JSONArray filas = new JSONArray(texto);
            return filas.length() > 0 ? filas.getJSONObject(0) : null;
        } catch (JSONException e) {
            return null;
        }
    }

    private static Resultado<String> vacio(Resultado<Void> cb) {
        return new Resultado<String>() {
            @Override
            public void ok(String valor) {
                cb.ok(null);
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        };
    }
}
