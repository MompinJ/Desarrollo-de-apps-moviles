package com.example.ejercicio11clonewhatsapp;

import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.DatosRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Perfil;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Fase 4: registrar nombre y fotografia.
 * La foto se elige con el selector de fotos del sistema (no necesita permisos), se reduce
 * a 512x512, se sube al bucket "avatars" de Supabase Storage y su URL se guarda en
 * profiles.avatar_url junto con el nombre y el username.
 */
public class PerfilActivity extends AppCompatActivity {

    private static final String USERNAME_VALIDO = "[a-zA-Z0-9_.]{3,30}";

    private DatosRepository datos;
    private Perfil perfil;
    private Uri fotoNueva;

    private ImageView imgAvatar;
    private TextInputLayout tilNombre, tilUsername;
    private TextInputEditText edtNombre, edtUsername;
    private MaterialButton btnGuardar;
    private View progreso;

    private final ExecutorService hilo = Executors.newSingleThreadExecutor();

    private final ActivityResultLauncher<PickVisualMediaRequest> elegirFoto =
            registerForActivityResult(new ActivityResultContracts.PickVisualMedia(), uri -> {
                if (uri != null) {
                    fotoNueva = uri;
                    Avatar.cargar(imgAvatar, uri);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_perfil);
        datos = new DatosRepository(this);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        imgAvatar = findViewById(R.id.imgAvatar);
        tilNombre = findViewById(R.id.tilNombre);
        tilUsername = findViewById(R.id.tilUsername);
        edtNombre = findViewById(R.id.edtNombre);
        edtUsername = findViewById(R.id.edtUsername);
        btnGuardar = findViewById(R.id.btnGuardar);
        progreso = findViewById(R.id.progreso);

        View.OnClickListener abrirFotos = v -> elegirFoto.launch(new PickVisualMediaRequest.Builder()
                .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
                .build());
        imgAvatar.setOnClickListener(abrirFotos);
        findViewById(R.id.btnFoto).setOnClickListener(abrirFotos);
        btnGuardar.setOnClickListener(v -> guardar());

        cargarPerfil();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        hilo.shutdown();
    }

    private void cargarPerfil() {
        cargando(true);
        datos.miPerfil(new Resultado<JSONObject>() {
            @Override
            public void ok(JSONObject json) {
                perfil = Perfil.desdeJson(json);
                edtNombre.setText(perfil.nombre);
                edtUsername.setText(perfil.username);
                if (fotoNueva == null) Avatar.cargar(imgAvatar, perfil.avatarUrl);
                cargando(false);
            }

            @Override
            public void error(String mensaje) {
                Toast.makeText(PerfilActivity.this, mensaje, Toast.LENGTH_LONG).show();
                finish();
            }
        });
    }

    private void guardar() {
        if (perfil == null) return;
        String nombre = Validar.texto(edtNombre);
        String username = Validar.texto(edtUsername);

        boolean ok = Validar.noVacio(tilNombre, nombre, R.string.perfil_err_nombre);
        boolean userOk = username.matches(USERNAME_VALIDO);
        tilUsername.setError(userOk ? null : getString(R.string.perfil_err_username));
        if (!ok || !userOk) return;

        cargando(true);
        if (fotoNueva == null) {
            guardarDatos(nombre, username, perfil.avatarUrl);
            return;
        }
        // Reducir la foto es trabajo pesado: se hace en otro hilo y luego se sube
        Uri foto = fotoNueva;
        hilo.execute(() -> {
            try {
                byte[] jpeg = Imagenes.prepararAvatar(this, foto);
                runOnUiThread(() -> datos.subirAvatar(jpeg, new Resultado<String>() {
                    @Override
                    public void ok(String url) {
                        guardarDatos(nombre, username, url);
                    }

                    @Override
                    public void error(String mensaje) {
                        fallo(getString(R.string.perfil_err_foto, mensaje));
                    }
                }));
            } catch (IOException | RuntimeException e) {
                runOnUiThread(() -> fallo(getString(R.string.perfil_err_leer_foto)));
            }
        });
    }

    private void guardarDatos(String nombre, String username, String avatarUrl) {
        datos.actualizarPerfil(nombre, username, avatarUrl, new Resultado<Perfil>() {
            @Override
            public void ok(Perfil guardado) {
                Toast.makeText(PerfilActivity.this, R.string.perfil_guardado, Toast.LENGTH_SHORT).show();
                setResult(RESULT_OK);
                finish();
            }

            @Override
            public void error(String mensaje) {
                if (mensaje.contains("usuario")) tilUsername.setError(mensaje);
                fallo(mensaje);
            }
        });
    }

    private void fallo(String mensaje) {
        cargando(false);
        Toast.makeText(this, mensaje, Toast.LENGTH_LONG).show();
    }

    private void cargando(boolean si) {
        btnGuardar.setEnabled(!si);
        progreso.setVisibility(si ? View.VISIBLE : View.GONE);
    }
}
