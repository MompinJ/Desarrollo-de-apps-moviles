package com.example.ejercicio06layouts;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import androidx.appcompat.app.AppCompatActivity;

public class FrameLayoutActivity extends AppCompatActivity {

    FrameLayout flCapas;
    LinearLayout llCargando;
    Button btnFrente, btnCarga;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_frame);

        flCapas = findViewById(R.id.flCapas);
        llCargando = findViewById(R.id.llCargando);
        btnFrente = findViewById(R.id.btnFrente);
        btnCarga = findViewById(R.id.btnCarga);

        // El hijo 0 es el que esta hasta abajo. bringToFront() lo pasa al final
        // de la lista de hijos, o sea, encima de todos. Al repetirlo las capas rotan.
        btnFrente.setOnClickListener(v -> flCapas.getChildAt(0).bringToFront());

        // GONE: no se ve ni ocupa espacio. VISIBLE: tapa el contenido de abajo
        btnCarga.setOnClickListener(v -> {
            if (llCargando.getVisibility() == View.VISIBLE) {
                llCargando.setVisibility(View.GONE);
            } else {
                llCargando.setVisibility(View.VISIBLE);
            }
        });
    }
}
