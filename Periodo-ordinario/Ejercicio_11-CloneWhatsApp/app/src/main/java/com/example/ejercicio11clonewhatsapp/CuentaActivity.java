package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.DatosRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Jwt;
import com.example.ejercicio11clonewhatsapp.supabase.Perfil;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.example.ejercicio11clonewhatsapp.supabase.Sesion;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Cuenta y sesion (fases 3 y 4): perfil leido de profiles, datos del JWT con cuenta
 * regresiva, el telefono registrado en devices, renovar el token y cerrar sesion.
 */
public class CuentaActivity extends AppCompatActivity {

    private AuthRepository auth;
    private DatosRepository datos;

    private ImageView imgAvatar;
    private View txtCompletar;
    private TextView txtNombre, txtEmail, txtInfo, txtJwt, txtRestante, txtDispositivo;
    private MaterialButton btnRenovar, btnCerrar;

    private final Handler reloj = new Handler(Looper.getMainLooper());
    private final Runnable tic = new Runnable() {
        @Override
        public void run() {
            mostrarRestante();
            reloj.postDelayed(this, 1000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        auth = AuthRepository.get(this);
        if (!auth.getSesion().activa()) {
            irALogin(null);
            return;
        }
        setContentView(R.layout.activity_cuenta);
        datos = new DatosRepository(this);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        imgAvatar = findViewById(R.id.imgAvatar);
        txtCompletar = findViewById(R.id.txtCompletar);
        txtNombre = findViewById(R.id.txtNombre);
        txtEmail = findViewById(R.id.txtEmail);
        txtInfo = findViewById(R.id.txtInfo);
        txtJwt = findViewById(R.id.txtJwt);
        txtRestante = findViewById(R.id.txtRestante);
        txtDispositivo = findViewById(R.id.txtDispositivo);
        btnRenovar = findViewById(R.id.btnRenovar);
        btnCerrar = findViewById(R.id.btnCerrar);

        btnRenovar.setOnClickListener(v -> renovar());
        btnCerrar.setOnClickListener(v -> cerrarSesion());
        findViewById(R.id.cardPerfil).setOnClickListener(v ->
                startActivity(new Intent(this, PerfilActivity.class)));

        txtEmail.setText(auth.getSesion().getEmail());
        mostrarJwt();
        registrarDispositivo();
    }

    @Override
    protected void onResume() {
        super.onResume();
        reloj.post(tic);
        if (datos != null) cargarPerfil(); // se recarga al volver de editar el perfil
    }

    @Override
    protected void onPause() {
        super.onPause();
        reloj.removeCallbacks(tic);
    }

    // -----------------------------------------------------------------

    private void cargarPerfil() {
        datos.miPerfil(new Resultado<JSONObject>() {
            @Override
            public void ok(JSONObject json) {
                Perfil perfil = Perfil.desdeJson(json);
                txtNombre.setText(perfil.nombreVisible());
                Date desde = Fechas.leer(perfil.createdAt);
                txtInfo.setText(getString(R.string.perfil_info, perfil.username,
                        desde == null ? "-" : new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(desde)));
                txtCompletar.setVisibility(perfil.completo() ? View.GONE : View.VISIBLE);
                Avatar.cargar(imgAvatar, perfil.avatarUrl);
                mostrarJwt(); // por si el token se renovo antes de la peticion
            }

            @Override
            public void error(String mensaje) {
                manejarError(mensaje);
                txtNombre.setText(R.string.app_name);
            }
        });
    }

    /** Registra el telefono en devices (ya se hizo al abrir la app; aqui se muestra el estado). */
    private void registrarDispositivo() {
        txtDispositivo.setText(textoDispositivo(getString(R.string.disp_registrando)));
        datos.registrarDispositivo(new Resultado<Void>() {
            @Override
            public void ok(Void valor) {
                txtDispositivo.setText(textoDispositivo(getString(R.string.disp_registrado)));
            }

            @Override
            public void error(String mensaje) {
                txtDispositivo.setText(textoDispositivo(mensaje));
            }
        });
    }

    private void renovar() {
        btnRenovar.setEnabled(false);
        auth.renovarToken(new Resultado<String>() {
            @Override
            public void ok(String token) {
                btnRenovar.setEnabled(true);
                mostrarJwt();
                Toast.makeText(CuentaActivity.this, R.string.home_token_renovado, Toast.LENGTH_SHORT).show();
            }

            @Override
            public void error(String mensaje) {
                btnRenovar.setEnabled(true);
                manejarError(mensaje);
            }
        });
    }

    private void cerrarSesion() {
        btnCerrar.setEnabled(false);
        btnRenovar.setEnabled(false);
        CloneApp.get().cerrarSesion(() -> irALogin(null));
    }

    // -----------------------------------------------------------------

    /** Muestra los claims del JWT: quien es (sub), su rol en Postgres y cuando caduca. */
    private void mostrarJwt() {
        String token = auth.getSesion().getAccessToken();
        if (token == null) return;
        JSONObject claims = Jwt.payload(token);
        String abreviado = token.length() > 40
                ? token.substring(0, 24) + "..." + token.substring(token.length() - 12)
                : token;

        String texto = getString(R.string.jwt_usuario, claims.optString("sub")) + "\n"
                + getString(R.string.jwt_rol, claims.optString("role")) + "\n"
                + getString(R.string.jwt_emitido, fecha(claims.optLong("iat"))) + "\n"
                + getString(R.string.jwt_expira, fecha(auth.getSesion().getExpiraEn())) + "\n"
                + getString(R.string.jwt_token, abreviado);
        txtJwt.setText(texto);
        mostrarRestante();
    }

    private void mostrarRestante() {
        if (txtRestante == null) return;
        long restante = auth.getSesion().getExpiraEn() - Sesion.ahora();
        if (restante <= 0) {
            txtRestante.setText(getString(R.string.jwt_restante, getString(R.string.jwt_expirado)));
        } else {
            String tiempo = String.format(Locale.US, "%02d:%02d", restante / 60, restante % 60);
            txtRestante.setText(getString(R.string.jwt_restante, tiempo));
        }
    }

    private String textoDispositivo(String estado) {
        return getString(R.string.disp_token, datos.getDeviceToken()) + "\n"
                + getString(R.string.disp_modelo, Build.MANUFACTURER + " " + Build.MODEL) + "\n"
                + getString(R.string.disp_estado, estado);
    }

    /** Si la renovacion fallo la sesion ya se borro: hay que volver a iniciar sesion. */
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

    private static String fecha(long segundos) {
        if (segundos <= 0) return "-";
        return new SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(new Date(segundos * 1000));
    }
}
