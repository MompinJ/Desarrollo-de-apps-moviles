package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Jwt;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import org.json.JSONException;
import org.json.JSONObject;

/** Paso 2 de la recuperacion: con el token del enlace se guarda la nueva contrasena. */
public class NuevaPasswordActivity extends AppCompatActivity {

    public static final String EXTRA_SESION = "sesion";

    private JSONObject sesionRecuperacion;
    private TextInputLayout tilPassword, tilConfirmar;
    private TextInputEditText edtPassword, edtConfirmar;
    private MaterialButton btnGuardar;
    private View progreso;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nueva_password);

        try {
            sesionRecuperacion = new JSONObject(getIntent().getStringExtra(EXTRA_SESION));
        } catch (JSONException | NullPointerException e) {
            irALogin(getString(R.string.enlace_invalido));
            return;
        }

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> irALogin(null));
        // Atras no regresa al navegador: lleva al login
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                irALogin(null);
            }
        });

        String correo = Jwt.payload(sesionRecuperacion.optString("access_token")).optString("email");
        ((TextView) findViewById(R.id.txtCorreo)).setText(getString(R.string.nueva_texto, correo));

        tilPassword = findViewById(R.id.tilPassword);
        tilConfirmar = findViewById(R.id.tilConfirmar);
        edtPassword = findViewById(R.id.edtPassword);
        edtConfirmar = findViewById(R.id.edtConfirmar);
        btnGuardar = findViewById(R.id.btnGuardar);
        progreso = findViewById(R.id.progreso);

        btnGuardar.setOnClickListener(v -> guardar());
    }

    private void guardar() {
        String password = edtPassword.getText() == null ? "" : edtPassword.getText().toString();
        String confirmar = edtConfirmar.getText() == null ? "" : edtConfirmar.getText().toString();

        boolean ok = Validar.password(tilPassword, password);
        ok &= Validar.iguales(tilConfirmar, password, confirmar);
        if (!ok) return;

        cargando(true);
        AuthRepository.get(this).cambiarPassword(sesionRecuperacion, password, new Resultado<Void>() {
            @Override
            public void ok(Void valor) {
                Intent i = new Intent(NuevaPasswordActivity.this, HomeActivity.class);
                i.putExtra(HomeActivity.EXTRA_MENSAJE, getString(R.string.nueva_ok));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(i);
            }

            @Override
            public void error(String mensaje) {
                cargando(false);
                tilPassword.setError(mensaje);
            }
        });
    }

    private void irALogin(String mensaje) {
        Intent i = new Intent(this, LoginActivity.class);
        if (mensaje != null) i.putExtra(LoginActivity.EXTRA_MENSAJE, mensaje);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
        finish();
    }

    private void cargando(boolean si) {
        btnGuardar.setEnabled(!si);
        progreso.setVisibility(si ? View.VISIBLE : View.GONE);
    }
}
