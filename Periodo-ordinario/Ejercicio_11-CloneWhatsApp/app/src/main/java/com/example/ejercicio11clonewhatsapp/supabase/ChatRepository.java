package com.example.ejercicio11clonewhatsapp.supabase;

import android.content.Context;
import android.net.Uri;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import okhttp3.Request;

/**
 * Conversaciones y mensajes (fases 5, 6 y 8).
 * - Lo que necesita varias consultas juntas va en funciones SQL (RPC): POST /rest/v1/rpc/{funcion}
 * - Historial y envio de mensajes usan la tabla directamente: /rest/v1/messages
 */
public final class ChatRepository {

    private final SupabaseClient cliente = SupabaseClient.get();
    private final AuthRepository auth;

    public ChatRepository(Context context) {
        auth = AuthRepository.get(context);
    }

    public String miId() {
        return auth.getSesion().getUserId();
    }

    // -----------------------------------------------------------------
    // Fase 5: conversaciones
    // -----------------------------------------------------------------

    /** Busca la conversacion individual con ese usuario o la crea; devuelve su id. */
    public void crearConversacionDirecta(String otroId, Resultado<String> cb) {
        JSONObject args = new JSONObject();
        try {
            args.put("otro", otroId);
        } catch (JSONException ignored) { }
        rpc("crear_conversacion_directa", args, new Resultado<String>() {
            @Override
            public void ok(String texto) {
                // Una funcion que regresa un uuid llega como texto JSON: "a1b2..."
                String id = texto.trim().replace("\"", "");
                if (id.isEmpty() || id.equals("null")) cb.error("No se pudo crear la conversacion");
                else cb.ok(id);
            }

            @Override
            public void error(String mensaje) {
                cb.error(mensaje);
            }
        });
    }

    /** Lista de chats con el otro participante, el ultimo mensaje y los no leidos. */
    public void misChats(Resultado<List<Chat>> cb) {
        rpc("mis_chats", new JSONObject(), new Resultado<String>() {
            @Override
            public void ok(String texto) {
                try {
                    JSONArray filas = new JSONArray(texto);
                    List<Chat> chats = new ArrayList<>();
                    for (int i = 0; i < filas.length(); i++) chats.add(Chat.desdeJson(filas.getJSONObject(i)));
                    cb.ok(chats);
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

    /** Identificar participantes: los perfiles de los miembros de la conversacion. */
    public void participantes(String conversacionId, Resultado<List<Perfil>> cb) {
        JSONObject args = new JSONObject();
        try {
            args.put("conv", conversacionId);
        } catch (JSONException ignored) { }
        rpc("participantes", args, new Resultado<String>() {
            @Override
            public void ok(String texto) {
                try {
                    JSONArray filas = new JSONArray(texto);
                    List<Perfil> lista = new ArrayList<>();
                    for (int i = 0; i < filas.length(); i++) lista.add(Perfil.desdeJson(filas.getJSONObject(i)));
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
    }

    // -----------------------------------------------------------------
    // Fase 6: mensajes
    // -----------------------------------------------------------------

    private static final String COLUMNAS = "id,conversacion_id,sender_id,content,created_at,delivered_at,read_at";

    /** Historial: los ultimos 200 mensajes, del mas viejo al mas nuevo. */
    public void historial(String conversacionId, Resultado<List<Mensaje>> cb) {
        conToken(cb, token -> {
            String ruta = "/rest/v1/messages?select=" + COLUMNAS
                    + "&conversacion_id=eq." + Uri.encode(conversacionId)
                    + "&order=created_at.desc&limit=200";
            Request req = cliente.peticion(ruta, token).get().build();
            cliente.ejecutar(req, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    try {
                        JSONArray filas = new JSONArray(texto);
                        List<Mensaje> lista = new ArrayList<>();
                        for (int i = 0; i < filas.length(); i++) lista.add(Mensaje.desdeJson(filas.getJSONObject(i)));
                        Collections.reverse(lista);
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

    /** Inserta el mensaje y devuelve la fila guardada (con su id y fecha del servidor). */
    public void enviar(String conversacionId, String contenido, Resultado<Mensaje> cb) {
        conToken(cb, token -> {
            JSONObject body = new JSONObject();
            try {
                body.put("conversacion_id", conversacionId);
                body.put("sender_id", miId());
                body.put("content", contenido);
            } catch (JSONException ignored) { }

            Request req = cliente.peticion("/rest/v1/messages?select=" + COLUMNAS, token)
                    .header("Prefer", "return=representation")
                    .post(SupabaseClient.cuerpo(body))
                    .build();
            cliente.ejecutar(req, new Resultado<String>() {
                @Override
                public void ok(String texto) {
                    try {
                        JSONArray filas = new JSONArray(texto);
                        cb.ok(Mensaje.desdeJson(filas.getJSONObject(0)));
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

    // -----------------------------------------------------------------
    // Fase 8: estados y ultima conexion (errores ignorados: se reintenta la proxima vez)
    // -----------------------------------------------------------------

    public void marcarEntregados() {
        rpc("marcar_entregados", new JSONObject(), ignorar());
    }

    public void marcarLeidos(String conversacionId) {
        JSONObject args = new JSONObject();
        try {
            args.put("conv", conversacionId);
        } catch (JSONException ignored) { }
        rpc("marcar_leidos", args, ignorar());
    }

    public void actualizarUltimaConexion(Resultado<String> cb) {
        rpc("actualizar_ultima_conexion", new JSONObject(), cb);
    }

    // -----------------------------------------------------------------

    private void rpc(String funcion, JSONObject args, Resultado<String> cb) {
        conToken(cb, token -> {
            Request req = cliente.peticion("/rest/v1/rpc/" + funcion, token)
                    .post(SupabaseClient.cuerpo(args))
                    .build();
            cliente.ejecutar(req, cb);
        });
    }

    private interface ConToken {
        void ejecutar(String token);
    }

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

    public static Resultado<String> ignorar() {
        return new Resultado<String>() {
            @Override
            public void ok(String valor) { }

            @Override
            public void error(String mensaje) { }
        };
    }
}
