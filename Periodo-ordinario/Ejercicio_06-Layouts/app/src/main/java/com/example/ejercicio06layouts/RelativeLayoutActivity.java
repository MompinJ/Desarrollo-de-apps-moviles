package com.example.ejercicio06layouts;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class RelativeLayoutActivity extends AppCompatActivity {

    TextView tvNombre;
    Button btnLlamar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Todo el acomodo se hace en el XML; aqui solo se le da accion al boton
        setContentView(R.layout.activity_relative);

        tvNombre = findViewById(R.id.tvNombre);
        btnLlamar = findViewById(R.id.btnLlamar);

        btnLlamar.setOnClickListener(v ->
                Toast.makeText(this, "Llamando a " + tvNombre.getText(), Toast.LENGTH_SHORT).show());
    }
}
