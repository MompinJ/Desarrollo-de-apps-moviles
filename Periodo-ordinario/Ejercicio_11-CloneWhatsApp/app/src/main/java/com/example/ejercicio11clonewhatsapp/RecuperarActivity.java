package com.example.ejercicio11clonewhatsapp;

import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

/** Paso 1 de la recuperacion: pedir a Supabase que mande el correo con el enlace. */
public class RecuperarActivity extends AppCompatActivity {

    public static final String EXTRA_CORREO = "correo";

    private TextInputLayout tilCorreo;
    private TextInputEditText edtCorreo;
    private MaterialButton btnEnviar;
    private View progreso, txtEnviado;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recuperar);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        tilCorreo = findViewById(R.id.tilCorreo);
        edtCorreo = findViewById(R.id.edtCorreo);
        btnEnviar = findViewById(R.id.btnEnviar);
        progreso = findViewById(R.id.progreso);
        txtEnviado = findViewById(R.id.txtEnviado);

        String correo = getIntent().getStringExtra(EXTRA_CORREO);
        if (correo != null) edtCorreo.setText(correo);

        btnEnviar.setOnClickListener(v -> enviar());
    }

    private void enviar() {
        String correo = Validar.texto(edtCorreo);
        if (!Validar.correo(tilCorreo, correo)) return;

        cargando(true);
        txtEnviado.setVisibility(View.GONE);
        AuthRepository.get(this).recuperarPassword(correo, new Resultado<Void>() {
            @Override
            public void ok(Void valor) {
                cargando(false);
                txtEnviado.setVisibility(View.VISIBLE);
            }

            @Override
            public void error(String mensaje) {
                cargando(false);
                tilCorreo.setError(mensaje);
            }
        });
    }

    private void cargando(boolean si) {
        btnEnviar.setEnabled(!si);
        progreso.setVisibility(si ? View.VISIBLE : View.GONE);
    }
}
