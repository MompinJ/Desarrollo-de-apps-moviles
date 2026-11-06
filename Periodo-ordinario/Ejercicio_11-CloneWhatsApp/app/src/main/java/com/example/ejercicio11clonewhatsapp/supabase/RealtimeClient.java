package com.example.ejercicio11clonewhatsapp.supabase;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

/**
 * Fase 7: cliente de Supabase Realtime con un WebSocket de OkHttp.
 *
 * Supabase no tiene libreria de Realtime para Java, asi que se implementa su protocolo
 * (Phoenix Channels, mensajes JSON {topic, event, payload, ref, join_ref}):
 * - Conexion:  wss://{proyecto}.supabase.co/realtime/v1/websocket?apikey={clave}&vsn=1.0.0
 * - Canal:     "phx_join" con la configuracion (postgres_changes, broadcast, presence) y el JWT.
 * - Heartbeat: cada 25 s, si no el servidor cierra la conexion.
 * - Eventos:   "postgres_changes" (INSERT/UPDATE en tablas), "broadcast" (mensajes entre
 *              telefonos, p. ej. "escribiendo"), "presence_state"/"presence_diff" (en linea).
 * Todo lo que llega se entrega en el hilo principal. Si se cae la red, reconecta solo.
 */
public final class RealtimeClient {

    private static final String TAG = "Realtime";
    private static final long HEARTBEAT_MS = 25_000;

    /** Recibe los eventos de un canal (en el hilo principal). */
    public interface Escucha {
        void evento(String evento, JSONObject payload);
    }

    /** Configuracion de un canal, armada con metodos encadenados. */
    public static final class Config {
        private final JSONArray postgres = new JSONArray();
        private boolean broadcast = false;
        private String presenciaClave = null;

        /** evento: INSERT, UPDATE, DELETE o *. filtro: por ejemplo "conversacion_id=eq.123" (o null). */
        public Config postgres(String evento, String tabla, @Nullable String filtro) {
            try {
                JSONObject o = new JSONObject()
                        .put("event", evento)
                        .put("schema", "public")
                        .put("table", tabla);
                if (filtro != null) o.put("filter", filtro);
                postgres.put(o);
            } catch (JSONException ignored) { }
            return this;
        }

        public Config broadcast() {
            broadcast = true;
            return this;
        }

        public Config presencia(String clave) {
            presenciaClave = clave;
            return this;
        }

        JSONObject json() {
            try {
                return new JSONObject()
                        .put("broadcast", new JSONObject().put("self", false).put("ack", false))
                        .put("presence", new JSONObject()
                                .put("key", presenciaClave == null ? "" : presenciaClave)
                                .put("enabled", presenciaClave != null))
                        .put("postgres_changes", postgres)
                        .put("private", false);
            } catch (JSONException e) {
                return new JSONObject();
            }
        }
    }

    /** Un canal suscrito. Se obtiene con {@link RealtimeClient#canal}. */
    public final class Canal {
        final String topic;
        final Config config;
        final Escucha escucha;
        String joinRef;
        boolean unido;
        /** Estado de presencia a publicar en cuanto el canal este unido (y tras reconectar). */
        JSONObject presencia;

        Canal(String topic, Config config, Escucha escucha) {
            this.topic = topic;
            this.config = config;
            this.escucha = escucha;
        }

        /** Envia un mensaje broadcast a los demas suscritos del canal (no se guarda en la BD). */
        public void broadcast(String evento, JSONObject datos) {
            if (!unido) return;
            try {
                JSONObject payload = new JSONObject()
                        .put("type", "broadcast")
                        .put("event", evento)
                        .put("payload", datos);
                enviar(topic, "broadcast", payload, joinRef);
            } catch (JSONException ignored) { }
        }

        /** Presence: publica "estoy aqui" con datos; el servidor lo quita al desconectarse. */
        public void track(JSONObject estado) {
            presencia = estado;
            if (unido) enviarTrack(this);
        }

        public void salir() {
            if (canales.get(topic) != this) return;
            canales.remove(topic);
            if (unido) enviar(topic, "phx_leave", new JSONObject(), joinRef);
            unido = false;
            if (canales.isEmpty()) cerrarSocket();
        }
    }

    private static RealtimeClient instancia;

    private final OkHttpClient http = new OkHttpClient.Builder()
            .readTimeout(0, TimeUnit.MILLISECONDS) // el WebSocket queda abierto
            .build();
    private final Handler hilo = new Handler(Looper.getMainLooper());
    private final AuthRepository auth;
    private final Map<String, Canal> canales = new LinkedHashMap<>();

    @Nullable private WebSocket socket;
    private boolean abierto = false;
    private int ref = 0;
    private int intentos = 0;
    private String tokenEnviado;

    private RealtimeClient(Context context) {
        auth = AuthRepository.get(context);
    }

    public static synchronized RealtimeClient get(Context context) {
        if (instancia == null) instancia = new RealtimeClient(context.getApplicationContext());
        return instancia;
    }

    /**
     * Crea un canal y se suscribe (conectando el socket si hace falta). Si ya habia uno con
     * el mismo nombre, se sale de el primero.
     */
    public Canal canal(String nombre, Config config, Escucha escucha) {
        String topic = "realtime:" + nombre;
        Canal viejo = canales.get(topic);
        if (viejo != null) viejo.salir();

        Canal canal = new Canal(topic, config, escucha);
        canales.put(topic, canal);
        if (abierto) unir(canal);
        else conectar();
        return canal;
    }

    /** Sale de todos los canales y cierra la conexion (al cerrar sesion o ir a segundo plano). */
    public void desconectar() {
        for (Canal c : new ArrayList<>(canales.values())) c.salir();
        cerrarSocket();
    }

    // -----------------------------------------------------------------
    // Conexion
    // -----------------------------------------------------------------

    private void conectar() {
        if (socket != null || canales.isEmpty()) return;
        auth.obtenerToken(new Resultado<String>() {
            @Override
            public void ok(String token) {
                if (socket != null || canales.isEmpty()) return;
                String url = SupabaseClient.get().getUrl().replaceFirst("^http", "ws")
                        + "/realtime/v1/websocket?apikey=" + SupabaseClient.get().getClave() + "&vsn=1.0.0";
                tokenEnviado = token;
                socket = http.newWebSocket(new Request.Builder().url(url).build(), new Oyente());
            }

            @Override
            public void error(String mensaje) {
                Log.w(TAG, "Sin token para Realtime: " + mensaje);
                if (auth.getSesion().activa()) reconectarDespues();
            }
        });
    }

    private void cerrarSocket() {
        hilo.removeCallbacks(heartbeat);
        hilo.removeCallbacks(reconectar);
        if (socket != null) socket.close(1000, "fin");
        socket = null;
        abierto = false;
    }

    private final Runnable reconectar = this::conectar;

    private void reconectarDespues() {
        hilo.removeCallbacks(reconectar);
        if (canales.isEmpty()) return;
        long espera = Math.min(30_000, 1000L << Math.min(intentos, 5)); // 1, 2, 4... hasta 30 s
        intentos++;
        hilo.postDelayed(reconectar, espera);
    }

    /**
     * Heartbeat cada 25 s. De paso revisa el JWT: si se renovo (o esta por caducar y se
     * renueva aqui) se manda el nuevo a cada canal, para que RLS siga funcionando.
     */
    private final Runnable heartbeat = new Runnable() {
        @Override
        public void run() {
            if (!abierto) return;
            enviar("phoenix", "heartbeat", new JSONObject(), null);
            auth.obtenerToken(new Resultado<String>() {
                @Override
                public void ok(String token) {
                    if (token.equals(tokenEnviado)) return;
                    tokenEnviado = token;
                    for (Canal c : canales.values()) {
                        if (!c.unido) continue;
                        try {
                            enviar(c.topic, "access_token", new JSONObject().put("access_token", token), c.joinRef);
                        } catch (JSONException ignored) { }
                    }
                }

                @Override
                public void error(String mensaje) { }
            });
            hilo.postDelayed(this, HEARTBEAT_MS);
        }
    };

    private void unir(Canal c) {
        c.joinRef = String.valueOf(++ref);
        c.unido = false;
        try {
            JSONObject payload = new JSONObject()
                    .put("config", c.config.json())
                    .put("access_token", tokenEnviado);
            enviar(c.topic, "phx_join", payload, c.joinRef, c.joinRef);
        } catch (JSONException ignored) { }
    }

    private void enviarTrack(Canal c) {
        try {
            JSONObject payload = new JSONObject()
                    .put("type", "presence")
                    .put("event", "track")
                    .put("payload", c.presencia);
            enviar(c.topic, "presence", payload, c.joinRef);
        } catch (JSONException ignored) { }
    }

    private void enviar(String topic, String evento, JSONObject payload, @Nullable String joinRef) {
        enviar(topic, evento, payload, String.valueOf(++ref), joinRef);
    }

    private void enviar(String topic, String evento, JSONObject payload, String ref, @Nullable String joinRef) {
        if (socket == null) return;
        try {
            JSONObject m = new JSONObject()
                    .put("topic", topic)
                    .put("event", evento)
                    .put("payload", payload)
                    .put("ref", ref);
            if (joinRef != null) m.put("join_ref", joinRef);
            socket.send(m.toString());
        } catch (JSONException ignored) { }
    }

    // -----------------------------------------------------------------
    // Mensajes que llegan del servidor (se procesan en el hilo principal)
    // -----------------------------------------------------------------

    private void recibir(String texto) {
        JSONObject m;
        try {
            m = new JSONObject(texto);
        } catch (JSONException e) {
            return;
        }
        String topic = m.optString("topic");
        String evento = m.optString("event");
        JSONObject payload = m.optJSONObject("payload");
        if (payload == null) payload = new JSONObject();

        Canal c = canales.get(topic);
        if (c == null) return;
        String joinRef = m.isNull("join_ref") ? null : m.optString("join_ref", null);

        switch (evento) {
            case "phx_reply":
                // Respuesta al phx_join: el canal queda listo
                if (c.joinRef != null && c.joinRef.equals(m.optString("ref"))) {
                    if ("ok".equals(payload.optString("status"))) {
                        c.unido = true;
                        if (c.presencia != null) enviarTrack(c);
                    } else {
                        Log.w(TAG, "No se pudo unir a " + topic + ": " + payload);
                    }
                }
                return;
            case "phx_error":
            case "phx_close":
                // El servidor saco al canal (p. ej. token vencido): reintentar unirse
                if (joinRef != null && !joinRef.equals(c.joinRef)) return;
                c.unido = false;
                hilo.postDelayed(() -> {
                    if (canales.get(topic) == c && abierto) unir(c);
                }, 2000);
                return;
            case "system":
                if ("error".equals(payload.optString("status"))) Log.w(TAG, topic + ": " + payload.optString("message"));
                return;
            default:
                c.escucha.evento(evento, payload);
        }
    }

    private final class Oyente extends WebSocketListener {
        @Override
        public void onOpen(@NonNull WebSocket ws, @NonNull Response response) {
            hilo.post(() -> {
                if (ws != socket) return;
                abierto = true;
                intentos = 0;
                for (Canal c : canales.values()) unir(c);
                hilo.removeCallbacks(heartbeat);
                hilo.postDelayed(heartbeat, HEARTBEAT_MS);
            });
        }

        @Override
        public void onMessage(@NonNull WebSocket ws, @NonNull String text) {
            hilo.post(() -> {
                if (ws == socket) recibir(text);
            });
        }

        @Override
        public void onClosed(@NonNull WebSocket ws, int code, @NonNull String reason) {
            hilo.post(() -> caido(ws));
        }

        @Override
        public void onFailure(@NonNull WebSocket ws, @NonNull Throwable t, @Nullable Response response) {
            Log.w(TAG, "Conexion caida: " + t.getMessage());
            hilo.post(() -> caido(ws));
        }

        private void caido(WebSocket ws) {
            if (ws != socket) return;
            socket = null;
            abierto = false;
            hilo.removeCallbacks(heartbeat);
            for (Canal c : canales.values()) c.unido = false;
            reconectarDespues();
        }
    }

    /** Lee el registro de un evento postgres_changes: payload.data.record. */
    @Nullable
    public static JSONObject registro(JSONObject payload) {
        JSONObject data = payload.optJSONObject("data");
        return data == null ? null : data.optJSONObject("record");
    }

    /** Tipo de un evento postgres_changes: INSERT, UPDATE o DELETE. */
    public static String tipo(JSONObject payload) {
        JSONObject data = payload.optJSONObject("data");
        return data == null ? "" : data.optString("type");
    }

    /** Claves de presencia (ids de usuario) de un mapa presence_state o joins/leaves. */
    public static List<String> clavesPresencia(@Nullable JSONObject mapa) {
        List<String> claves = new ArrayList<>();
        if (mapa == null) return claves;
        JSONArray nombres = mapa.names();
        if (nombres == null) return claves;
        for (int i = 0; i < nombres.length(); i++) claves.add(nombres.optString(i));
        return claves;
    }
}
