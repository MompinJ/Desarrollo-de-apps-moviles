package com.example.ejercicio11clonewhatsapp;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.ChatRepository;
import com.example.ejercicio11clonewhatsapp.supabase.DatosRepository;
import com.example.ejercicio11clonewhatsapp.supabase.RealtimeClient;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Clase Application: vive mientras la app este abierta y sabe si esta en primer plano
 * (cuenta las Activities visibles). Mientras lo esta y hay sesion, mantiene en Realtime:
 * - Canal "bandeja": INSERT/UPDATE en messages (RLS solo deja ver los de mis chats).
 *   Al llegar un mensaje ajeno lo marca como recibido (Fase 8) y avisa a la lista de chats.
 * - Canal "en-linea": presence; cada usuario publica su id, asi se sabe quien esta en linea.
 * Al pasar a segundo plano guarda la ultima conexion y se desconecta.
 */
public class CloneApp extends Application implements Application.ActivityLifecycleCallbacks {

    /** Margen antes de considerar que la app paso a segundo plano (cambios de pantalla). */
    private static final long ESPERA_SEGUNDO_PLANO_MS = 2000;

    private static CloneApp instancia;

    private final Handler hilo = new Handler(Looper.getMainLooper());
    private int visibles = 0;

    private RealtimeClient realtime;
    private ChatRepository chats;
    @Nullable private RealtimeClient.Canal canalBandeja, canalEnLinea;

    /** Usuarios en linea -> cuantas conexiones tienen (un usuario puede tener 2 telefonos). */
    private final Map<String, Integer> conectados = new HashMap<>();
    private final List<RealtimeClient.Escucha> escuchasBandeja = new ArrayList<>();
    private final List<Runnable> escuchasPresencia = new ArrayList<>();

    public static CloneApp get() {
        return instancia;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instancia = this;
        realtime = RealtimeClient.get(this);
        chats = new ChatRepository(this);
        registerActivityLifecycleCallbacks(this);
    }

    // -----------------------------------------------------------------
    // Primer / segundo plano
    // -----------------------------------------------------------------

    @Override
    public void onActivityStarted(@NonNull Activity activity) {
        visibles++;
        hilo.removeCallbacks(irASegundoPlano);
        iniciarTiempoReal();
    }

    @Override
    public void onActivityStopped(@NonNull Activity activity) {
        visibles = Math.max(0, visibles - 1);
        if (visibles == 0) hilo.postDelayed(irASegundoPlano, ESPERA_SEGUNDO_PLANO_MS);
    }

    private final Runnable irASegundoPlano = () -> {
        if (canalBandeja != null) chats.actualizarUltimaConexion(ChatRepository.ignorar());
        detenerTiempoReal();
    };

    /** Se suscribe a los canales globales si hay sesion y aun no lo estaba. */
    public void iniciarTiempoReal() {
        if (canalBandeja != null || !AuthRepository.get(this).getSesion().activa()) return;
        String yo = chats.miId();

        canalBandeja = realtime.canal("bandeja",
                new RealtimeClient.Config()
                        .postgres("INSERT", "messages", null)
                        .postgres("UPDATE", "messages", null),
                (evento, payload) -> {
                    if (!"postgres_changes".equals(evento)) return;
                    JSONObject registro = RealtimeClient.registro(payload);
                    if (registro == null) return;
                    if ("INSERT".equals(RealtimeClient.tipo(payload))
                            && !yo.equals(registro.optString("sender_id"))) {
                        marcarEntregadosPronto();
                    }
                    for (RealtimeClient.Escucha e : new ArrayList<>(escuchasBandeja)) e.evento(evento, payload);
                });

        canalEnLinea = realtime.canal("en-linea",
                new RealtimeClient.Config().presencia(yo),
                (evento, payload) -> {
                    if ("presence_state".equals(evento)) {
                        conectados.clear();
                        for (String id : RealtimeClient.clavesPresencia(payload)) sumar(id, payload, 1);
                    } else if ("presence_diff".equals(evento)) {
                        JSONObject entran = payload.optJSONObject("joins");
                        JSONObject salen = payload.optJSONObject("leaves");
                        for (String id : RealtimeClient.clavesPresencia(entran)) sumar(id, entran, 1);
                        for (String id : RealtimeClient.clavesPresencia(salen)) sumar(id, salen, -1);
                    } else {
                        return;
                    }
                    for (Runnable r : new ArrayList<>(escuchasPresencia)) r.run();
                });
        try {
            canalEnLinea.track(new JSONObject().put("user_id", yo).put("online_at", Fechas.ahoraIso()));
        } catch (JSONException ignored) { }

        // Al abrir la app: lo que llego mientras estaba cerrada ya se recibio
        chats.marcarEntregados();
        chats.actualizarUltimaConexion(ChatRepository.ignorar());
    }

    public void detenerTiempoReal() {
        hilo.removeCallbacks(entregar);
        realtime.desconectar();
        canalBandeja = null;
        canalEnLinea = null;
        conectados.clear();
        for (Runnable r : new ArrayList<>(escuchasPresencia)) r.run();
    }

    private void sumar(String id, JSONObject mapa, int signo) {
        JSONObject entrada = mapa.optJSONObject(id);
        int metas = entrada != null && entrada.optJSONArray("metas") != null
                ? entrada.optJSONArray("metas").length() : 1;
        int total = (conectados.containsKey(id) ? conectados.get(id) : 0) + signo * metas;
        if (total > 0) conectados.put(id, total);
        else conectados.remove(id);
    }

    /** Agrupa varios mensajes que llegan juntos en una sola llamada a marcar_entregados. */
    private final Runnable entregar = () -> chats.marcarEntregados();

    private void marcarEntregadosPronto() {
        hilo.removeCallbacks(entregar);
        hilo.postDelayed(entregar, 500);
    }

    // -----------------------------------------------------------------
    // Para las pantallas
    // -----------------------------------------------------------------

    public boolean enLinea(String userId) {
        return conectados.containsKey(userId);
    }

    public void escucharBandeja(RealtimeClient.Escucha e) {
        escuchasBandeja.add(e);
    }

    public void dejarBandeja(RealtimeClient.Escucha e) {
        escuchasBandeja.remove(e);
    }

    public void escucharPresencia(Runnable r) {
        escuchasPresencia.add(r);
    }

    public void dejarPresencia(Runnable r) {
        escuchasPresencia.remove(r);
    }

    /**
     * Cierre de sesion completo: guarda la ultima conexion, sale de Realtime, borra el
     * telefono de devices, invalida el refresh_token en Supabase y borra la sesion local.
     */
    public void cerrarSesion(Runnable alTerminar) {
        AuthRepository auth = AuthRepository.get(this);
        DatosRepository datos = new DatosRepository(this);
        Resultado<Void> salir = new Resultado<Void>() {
            @Override
            public void ok(Void valor) {
                auth.cerrarSesion(new Resultado<Void>() {
                    @Override
                    public void ok(Void v) {
                        alTerminar.run();
                    }

                    @Override
                    public void error(String mensaje) {
                        alTerminar.run();
                    }
                });
            }

            @Override
            public void error(String mensaje) {
                ok(null);
            }
        };
        chats.actualizarUltimaConexion(new Resultado<String>() {
            @Override
            public void ok(String valor) {
                seguir();
            }

            @Override
            public void error(String mensaje) {
                seguir();
            }

            private void seguir() {
                detenerTiempoReal();
                datos.eliminarDispositivo(salir);
            }
        });
    }

    // Callbacks que no se usan
    @Override public void onActivityCreated(@NonNull Activity a, @Nullable Bundle b) { }
    @Override public void onActivityResumed(@NonNull Activity a) { }
    @Override public void onActivityPaused(@NonNull Activity a) { }
    @Override public void onActivitySaveInstanceState(@NonNull Activity a, @NonNull Bundle b) { }
    @Override public void onActivityDestroyed(@NonNull Activity a) { }
}
