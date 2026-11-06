package com.example.ejercicio11clonewhatsapp;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.IntentCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ejercicio11clonewhatsapp.supabase.ChatRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Mensaje;
import com.example.ejercicio11clonewhatsapp.supabase.Perfil;
import com.example.ejercicio11clonewhatsapp.supabase.RealtimeClient;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.appbar.MaterialToolbar;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

/**
 * Chat individual.
 * Fase 5: identifica a los participantes (RPC participantes).
 * Fase 6: historial, envio (INSERT en messages) y burbujas enviadas/recibidas.
 * Fase 7: canal Realtime "chat-{id}" con postgres_changes filtrado por la conversacion:
 *         INSERT = mensaje nuevo (se agrega al RecyclerView), UPDATE = cambio de estado.
 * Fase 8: estados (reloj, enviado, recibido, leido), marca como leidos los mensajes al
 *         verlos, muestra "en linea" / ultima conexion (presence) y "escribiendo..." (broadcast).
 */
public class ChatActivity extends AppCompatActivity {

    public static final String EXTRA_CONVERSACION = "conversacion";
    public static final String EXTRA_CONTACTO = "contacto";

    /** Cada cuanto se avisa "escribiendo" mientras se teclea, y cuanto dura el aviso. */
    private static final long AVISO_ESCRIBIENDO_MS = 2000;
    private static final long DURA_ESCRIBIENDO_MS = 3500;

    private ChatRepository chats;
    private String conversacionId, miId;
    private Perfil otro;

    private MensajesAdapter adapter;
    private RecyclerView lista;
    private LinearLayoutManager layoutManager;
    private EditText edtMensaje;
    private ImageView imgAvatar;
    private TextView txtTitulo, txtSubtitulo;
    private View progreso, txtVacio;

    private RealtimeClient.Canal canal;
    private boolean visible;
    private boolean otroEscribiendo;
    private boolean otroEnLinea;
    private long ultimoAvisoEscribiendo;

    private final Handler hilo = new Handler(Looper.getMainLooper());

    private final Runnable dejoDeEscribir = () -> {
        otroEscribiendo = false;
        actualizarSubtitulo();
    };

    /** Cambio la lista de usuarios en linea (presence global de CloneApp). */
    private final Runnable alCambiarPresencia = () -> {
        boolean ahora = otro != null && CloneApp.get().enLinea(otro.id);
        // Si se acaba de desconectar, su last_seen cambio: se vuelve a consultar
        if (otroEnLinea && !ahora) hilo.postDelayed(this::cargarParticipantes, 1500);
        otroEnLinea = ahora;
        actualizarSubtitulo();
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        conversacionId = getIntent().getStringExtra(EXTRA_CONVERSACION);
        if (conversacionId == null) {
            finish();
            return;
        }
        setContentView(R.layout.activity_chat);
        chats = new ChatRepository(this);
        miId = chats.miId();

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());
        imgAvatar = findViewById(R.id.imgAvatar);
        txtTitulo = findViewById(R.id.txtTitulo);
        txtSubtitulo = findViewById(R.id.txtSubtitulo);
        progreso = findViewById(R.id.progreso);
        txtVacio = findViewById(R.id.txtVacio);
        edtMensaje = findViewById(R.id.edtMensaje);

        otro = IntentCompat.getSerializableExtra(getIntent(), EXTRA_CONTACTO, Perfil.class);
        if (otro != null) mostrarCabecera();

        adapter = new MensajesAdapter(miId, this::reintentar);
        layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true); // los mensajes empiezan desde abajo
        lista = findViewById(R.id.lista);
        lista.setLayoutManager(layoutManager);
        lista.setAdapter(adapter);
        // Al abrir el teclado la lista se encoge: mantener visible el ultimo mensaje
        lista.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> {
            if (b < ob) irAlFinal();
        });

        findViewById(R.id.btnEnviar).setOnClickListener(v -> enviar());
        edtMensaje.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) { }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) { }

            @Override
            public void afterTextChanged(Editable s) {
                if (s.length() > 0) avisarEscribiendo();
            }
        });

        suscribirse();
        cargarParticipantes();
        cargarHistorial();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (chats == null) return;
        visible = true;
        CloneApp.get().escucharPresencia(alCambiarPresencia);
        alCambiarPresencia.run();
        chats.marcarLeidos(conversacionId);
    }

    @Override
    protected void onPause() {
        super.onPause();
        visible = false;
        if (chats != null) CloneApp.get().dejarPresencia(alCambiarPresencia);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        hilo.removeCallbacksAndMessages(null);
        if (canal != null) canal.salir();
    }

    // -----------------------------------------------------------------
    // Fase 5: participantes
    // -----------------------------------------------------------------

    private void cargarParticipantes() {
        chats.participantes(conversacionId, new Resultado<List<Perfil>>() {
            @Override
            public void ok(List<Perfil> miembros) {
                for (Perfil p : miembros) {
                    if (!p.id.equals(miId)) otro = p;
                }
                if (otro != null) mostrarCabecera();
                actualizarSubtitulo();
            }

            @Override
            public void error(String mensaje) {
                if (otro == null) Toast.makeText(ChatActivity.this, mensaje, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void mostrarCabecera() {
        txtTitulo.setText(otro.nombreVisible());
        Avatar.cargar(imgAvatar, otro.avatarUrl);
    }

    // -----------------------------------------------------------------
    // Fase 6: historial y envio
    // -----------------------------------------------------------------

    private void cargarHistorial() {
        chats.historial(conversacionId, new Resultado<List<Mensaje>>() {
            @Override
            public void ok(List<Mensaje> historial) {
                progreso.setVisibility(View.GONE);
                adapter.cargarHistorial(historial);
                txtVacio.setVisibility(adapter.getItemCount() == 0 ? View.VISIBLE : View.GONE);
                irAlFinal();
                if (visible) chats.marcarLeidos(conversacionId);
            }

            @Override
            public void error(String mensaje) {
                progreso.setVisibility(View.GONE);
                Toast.makeText(ChatActivity.this, mensaje, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void enviar() {
        String texto = edtMensaje.getText().toString().trim();
        if (texto.isEmpty()) return;
        edtMensaje.setText("");

        // Se muestra de inmediato con el reloj; al confirmar el servidor cambia a enviado
        Mensaje local = new Mensaje("", conversacionId, miId, texto, Fechas.ahoraIso(), "", "");
        local.enviando = true;
        adapter.agregar(local);
        txtVacio.setVisibility(View.GONE);
        irAlFinal();
        mandar(local);
    }

    private void mandar(Mensaje local) {
        chats.enviar(conversacionId, local.contenido, new Resultado<Mensaje>() {
            @Override
            public void ok(Mensaje guardado) {
                adapter.confirmar(local, guardado);
            }

            @Override
            public void error(String mensaje) {
                local.enviando = false;
                local.error = true;
                adapter.refrescar(local);
                Toast.makeText(ChatActivity.this, getString(R.string.chat_error_envio, mensaje),
                        Toast.LENGTH_LONG).show();
            }
        });
    }

    /** Al tocar un mensaje con error se vuelve a intentar. */
    private void reintentar(Mensaje m) {
        m.error = false;
        m.enviando = true;
        adapter.refrescar(m);
        mandar(m);
    }

    // -----------------------------------------------------------------
    // Fase 7: tiempo real
    // -----------------------------------------------------------------

    private void suscribirse() {
        String filtro = "conversacion_id=eq." + conversacionId;
        canal = RealtimeClient.get(this).canal("chat-" + conversacionId,
                new RealtimeClient.Config()
                        .postgres("INSERT", "messages", filtro)
                        .postgres("UPDATE", "messages", filtro)
                        .broadcast(),
                (evento, payload) -> {
                    if ("postgres_changes".equals(evento)) {
                        JSONObject registro = RealtimeClient.registro(payload);
                        if (registro == null) return;
                        Mensaje m = Mensaje.desdeJson(registro);
                        if ("INSERT".equals(RealtimeClient.tipo(payload))) alLlegar(m);
                        else adapter.actualizarEstado(m); // Fase 8: recibido / leido
                    } else if ("broadcast".equals(evento) && "escribiendo".equals(payload.optString("event"))) {
                        JSONObject datos = payload.optJSONObject("payload");
                        if (datos != null && !miId.equals(datos.optString("user_id"))) {
                            otroEscribiendo = true;
                            actualizarSubtitulo();
                            hilo.removeCallbacks(dejoDeEscribir);
                            hilo.postDelayed(dejoDeEscribir, DURA_ESCRIBIENDO_MS);
                        }
                    }
                });
    }

    /** Detectar mensaje nuevo y actualizar el RecyclerView. */
    private void alLlegar(Mensaje m) {
        if (adapter.contiene(m.id)) return;
        boolean mio = m.esMio(miId);
        // Mi propio mensaje: ya se muestra con el reloj, lo confirma la respuesta del INSERT
        if (mio && adapter.hayPendiente(m.contenido)) return;

        boolean estabaAbajo = layoutManager.findLastVisibleItemPosition() >= adapter.getItemCount() - 2;
        adapter.agregar(m);
        txtVacio.setVisibility(View.GONE);
        if (estabaAbajo || mio) irAlFinal();

        if (!mio) {
            otroEscribiendo = false;
            hilo.removeCallbacks(dejoDeEscribir);
            actualizarSubtitulo();
            // El chat esta abierto: el mensaje se lee en este momento
            if (visible) chats.marcarLeidos(conversacionId);
        }
    }

    // -----------------------------------------------------------------
    // Fase 8: escribiendo, en linea, ultima conexion
    // -----------------------------------------------------------------

    /** Broadcast "escribiendo" como maximo cada 2 s mientras se teclea. */
    private void avisarEscribiendo() {
        long ahora = SystemClock.elapsedRealtime();
        if (canal == null || ahora - ultimoAvisoEscribiendo < AVISO_ESCRIBIENDO_MS) return;
        ultimoAvisoEscribiendo = ahora;
        try {
            canal.broadcast("escribiendo", new JSONObject().put("user_id", miId));
        } catch (JSONException ignored) { }
    }

    private void actualizarSubtitulo() {
        String texto = "";
        if (otroEscribiendo) {
            texto = getString(R.string.chat_escribiendo);
        } else if (otro != null && CloneApp.get().enLinea(otro.id)) {
            texto = getString(R.string.chat_en_linea);
        } else if (otro != null) {
            texto = Fechas.ultimaConexion(this, Fechas.leer(otro.lastSeen));
        }
        txtSubtitulo.setText(texto);
        txtSubtitulo.setVisibility(texto.isEmpty() ? View.GONE : View.VISIBLE);
    }

    private void irAlFinal() {
        if (adapter.getItemCount() > 0) lista.post(() -> lista.scrollToPosition(adapter.getItemCount() - 1));
    }
}
