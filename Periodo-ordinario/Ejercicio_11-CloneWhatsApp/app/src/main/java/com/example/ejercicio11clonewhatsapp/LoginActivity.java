package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.example.ejercicio11clonewhatsapp.supabase.SupabaseClient;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

public class LoginActivity extends AppCompatActivity {

    public static final String EXTRA_MENSAJE = "mensaje";

    private TextInputLayout tilCorreo, tilPassword;
    private TextInputEditText edtCorreo, edtPassword;
    private MaterialButton btnEntrar;
    private View progreso;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        tilCorreo = findViewById(R.id.tilCorreo);
        tilPassword = findViewById(R.id.tilPassword);
        edtCorreo = findViewById(R.id.edtCorreo);
        edtPassword = findViewById(R.id.edtPassword);
        btnEntrar = findViewById(R.id.btnEntrar);
        progreso = findViewById(R.id.progreso);

        if (!SupabaseClient.get().configurado()) {
            findViewById(R.id.txtAviso).setVisibility(View.VISIBLE);
        }

        String mensaje = getIntent().getStringExtra(EXTRA_MENSAJE);
        if (mensaje != null) Toast.makeText(this, mensaje, Toast.LENGTH_LONG).show();

        btnEntrar.setOnClickListener(v -> entrar());
        edtPassword.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                entrar();
                return true;
            }
            return false;
        });
        findViewById(R.id.btnOlvide).setOnClickListener(v -> {
            Intent i = new Intent(this, RecuperarActivity.class);
            i.putExtra(RecuperarActivity.EXTRA_CORREO, Validar.texto(edtCorreo));
            startActivity(i);
        });
        findViewById(R.id.btnRegistro).setOnClickListener(v ->
                startActivity(new Intent(this, RegistroActivity.class)));
    }

    private void entrar() {
        String correo = Validar.texto(edtCorreo);
        String password = edtPassword.getText() == null ? "" : edtPassword.getText().toString();

        boolean ok = Validar.correo(tilCorreo, correo);
        ok &= Validar.noVacio(tilPassword, password, R.string.err_password);
        if (!ok) return;

        cargando(true);
        AuthRepository.get(this).iniciarSesion(correo, password, new Resultado<Void>() {
            @Override
            public void ok(Void valor) {
                Intent i = new Intent(LoginActivity.this, HomeActivity.class);
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

    private void cargando(boolean si) {
        btnEntrar.setEnabled(!si);
        progreso.setVisibility(si ? View.VISIBLE : View.GONE);
    }
}
