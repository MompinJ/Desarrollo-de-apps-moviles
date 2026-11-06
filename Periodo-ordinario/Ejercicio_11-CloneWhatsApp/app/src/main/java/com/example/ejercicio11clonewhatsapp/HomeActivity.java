package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.IntentCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Chat;
import com.example.ejercicio11clonewhatsapp.supabase.ChatRepository;
import com.example.ejercicio11clonewhatsapp.supabase.DatosRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Perfil;
import com.example.ejercicio11clonewhatsapp.supabase.RealtimeClient;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.appbar.MaterialToolbar;

import java.util.List;

/**
 * Pantalla principal (Fase 5): lista de chats existentes con su ultimo mensaje.
 * - El boton flotante abre Contactos; al elegir destinatario se crea (o reutiliza) la
 *   conversacion individual y se abre el chat.
 * - Con Realtime (canal "bandeja" de CloneApp) la lista se actualiza sola cuando llega
 *   un mensaje o cambia su estado.
 */
public class HomeActivity extends AppCompatActivity {

    public static final String EXTRA_MENSAJE = "mensaje";

    private AuthRepository auth;
    private ChatRepository chats;
    private ChatsAdapter adapter;
    private View progreso, txtVacio;
    private boolean primeraCarga = true;

    private final Handler hilo = new Handler(Looper.getMainLooper());
    private final Runnable recargar = this::cargarChats;
    private final RealtimeClient.Escucha alCambiarMensajes = (evento, payload) -> recargarPronto();

    private final ActivityResultLauncher<Intent> elegirContacto =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), r -> {
                if (r.getResultCode() != RESULT_OK || r.getData() == null) return;
                Perfil elegido = IntentCompat.getSerializableExtra(
                        r.getData(), ContactosActivity.EXTRA_CONTACTO, Perfil.class);
                if (elegido != null) abrirChatCon(elegido);
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        auth = AuthRepository.get(this);
        if (!auth.getSesion().activa()) {
            irALogin(null);
            return;
        }
        setContentView(R.layout.activity_home);
        chats = new ChatRepository(this);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.inflateMenu(R.menu.menu_home);
        toolbar.setOnMenuItemClickListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_nuevo_chat) abrirContactos();
            else if (id == R.id.menu_perfil) startActivity(new Intent(this, PerfilActivity.class));
            else if (id == R.id.menu_cuenta) startActivity(new Intent(this, CuentaActivity.class));
            else if (id == R.id.menu_cerrar) cerrarSesion();
            return true;
        });

        progreso = findViewById(R.id.progreso);
        txtVacio = findViewById(R.id.txtVacio);
        adapter = new ChatsAdapter(chats.miId(), chat -> abrirChat(chat.conversacionId, chat.otro));
        RecyclerView lista = findViewById(R.id.lista);
        lista.setLayoutManager(new LinearLayoutManager(this));
        lista.setAdapter(adapter);

        findViewById(R.id.fabNuevoChat).setOnClickListener(v -> abrirContactos());

        String mensaje = getIntent().getStringExtra(EXTRA_MENSAJE);
        if (mensaje != null && savedInstanceState == null) {
            Toast.makeText(this, mensaje, Toast.LENGTH_LONG).show();
        }

        // Fase 3: registrar este telefono en devices (sin mostrar nada si falla)
        new DatosRepository(this).registrarDispositivo(new Resultado<Void>() {
            @Override
            public void ok(Void valor) { }

            @Override
            public void error(String mensaje) { }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (chats != null) CloneApp.get().escucharBandeja(alCambiarMensajes);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (chats != null) cargarChats(); // al volver de un chat cambian los no leidos
    }

    @Override
    protected void onStop() {
        super.onStop();
        CloneApp.get().dejarBandeja(alCambiarMensajes);
        hilo.removeCallbacks(recargar);
    }

    // -----------------------------------------------------------------

    /** Consultar conversaciones existentes (RPC mis_chats). */
    private void cargarChats() {
        if (primeraCarga) progreso.setVisibility(View.VISIBLE);
        chats.misChats(new Resultado<List<Chat>>() {
            @Override
            public void ok(List<Chat> lista) {
                primeraCarga = false;
                progreso.setVisibility(View.GONE);
                adapter.mostrar(lista);
                txtVacio.setVisibility(lista.isEmpty() ? View.VISIBLE : View.GONE);
            }

            @Override
            public void error(String mensaje) {
                progreso.setVisibility(View.GONE);
                manejarError(mensaje);
            }
        });
    }

    /** Varios eventos seguidos de Realtime provocan una sola recarga. */
    private void recargarPronto() {
        hilo.removeCallbacks(recargar);
        hilo.postDelayed(recargar, 400);
    }

    private void abrirContactos() {
        elegirContacto.launch(new Intent(this, ContactosActivity.class));
    }

    /** Crear conversacion individual con el destinatario elegido (o reutilizar la que ya existe). */
    private void abrirChatCon(Perfil destinatario) {
        progreso.setVisibility(View.VISIBLE);
        chats.crearConversacionDirecta(destinatario.id, new Resultado<String>() {
            @Override
            public void ok(String conversacionId) {
                progreso.setVisibility(View.GONE);
                abrirChat(conversacionId, destinatario);
            }

            @Override
            public void error(String mensaje) {
                progreso.setVisibility(View.GONE);
                manejarError(mensaje);
            }
        });
    }

    private void abrirChat(String conversacionId, Perfil otro) {
        Intent i = new Intent(this, ChatActivity.class);
        i.putExtra(ChatActivity.EXTRA_CONVERSACION, conversacionId);
        if (otro != null && !otro.id.isEmpty()) i.putExtra(ChatActivity.EXTRA_CONTACTO, otro);
        startActivity(i);
    }

    private void cerrarSesion() {
        progreso.setVisibility(View.VISIBLE);
        CloneApp.get().cerrarSesion(() -> irALogin(null));
    }

    /** Si la renovacion del token fallo la sesion ya se borro: volver al login. */
    private void manejarError(String mensaje) {
        if (!auth.getSesion().activa()) irALogin(mensaje);
        else Toast.makeText(this, mensaje, Toast.LENGTH_LONG).show();
    }

    private void irALogin(String mensaje) {
        if (isFinishing()) return;
        Intent i = new Intent(this, LoginActivity.class);
        if (mensaje != null) i.putExtra(LoginActivity.EXTRA_MENSAJE, mensaje);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
        finish();
    }
}
