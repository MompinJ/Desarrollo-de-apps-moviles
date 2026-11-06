package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

public class RegistroActivity extends AppCompatActivity {

    private TextInputLayout tilNombre, tilCorreo, tilPassword, tilConfirmar;
    private TextInputEditText edtNombre, edtCorreo, edtPassword, edtConfirmar;
    private MaterialButton btnRegistrar;
    private View progreso;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registro);

        tilNombre = findViewById(R.id.tilNombre);
        tilCorreo = findViewById(R.id.tilCorreo);
        tilPassword = findViewById(R.id.tilPassword);
        tilConfirmar = findViewById(R.id.tilConfirmar);
        edtNombre = findViewById(R.id.edtNombre);
        edtCorreo = findViewById(R.id.edtCorreo);
        edtPassword = findViewById(R.id.edtPassword);
        edtConfirmar = findViewById(R.id.edtConfirmar);
        btnRegistrar = findViewById(R.id.btnRegistrar);
        progreso = findViewById(R.id.progreso);

        btnRegistrar.setOnClickListener(v -> registrar());
        findViewById(R.id.btnTengoCuenta).setOnClickListener(v -> finish());
    }

    private void registrar() {
        String nombre = Validar.texto(edtNombre);
        String correo = Validar.texto(edtCorreo);
        String password = edtPassword.getText() == null ? "" : edtPassword.getText().toString();
        String confirmar = edtConfirmar.getText() == null ? "" : edtConfirmar.getText().toString();

        boolean ok = Validar.noVacio(tilNombre, nombre, R.string.err_nombre);
        ok &= Validar.correo(tilCorreo, correo);
        ok &= Validar.password(tilPassword, password);
        ok &= Validar.iguales(tilConfirmar, password, confirmar);
        if (!ok) return;

        cargando(true);
        AuthRepository.get(this).registrar(nombre, correo, password, new Resultado<Boolean>() {
            @Override
            public void ok(Boolean sesionAbierta) {
                if (sesionAbierta) {
                    // Confirmacion de correo desactivada en Supabase: entra directo
                    Intent i = new Intent(RegistroActivity.this, HomeActivity.class);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(i);
                    return;
                }
                cargando(false);
                new AlertDialog.Builder(RegistroActivity.this)
                        .setTitle(R.string.registro_titulo)
                        .setMessage(getString(R.string.registro_confirma, correo))
                        .setCancelable(false)
                        .setPositiveButton(android.R.string.ok, (d, w) -> finish())
                        .show();
            }

            @Override
            public void error(String mensaje) {
                cargando(false);
                tilCorreo.setError(mensaje);
            }
        });
    }

    private void cargando(boolean si) {
        btnRegistrar.setEnabled(!si);
        progreso.setVisibility(si ? View.VISIBLE : View.GONE);
    }
}
