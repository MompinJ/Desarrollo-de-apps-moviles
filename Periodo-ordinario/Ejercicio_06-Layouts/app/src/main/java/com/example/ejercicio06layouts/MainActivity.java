package com.example.ejercicio06layouts;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    Button btnLinear, btnRelative, btnFrame, btnTable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnLinear = findViewById(R.id.btnLinear);
        btnRelative = findViewById(R.id.btnRelative);
        btnFrame = findViewById(R.id.btnFrame);
        btnTable = findViewById(R.id.btnTable);

        // Cada boton abre la actividad de su layout con un Intent explicito
        btnLinear.setOnClickListener(v -> abrir(LinearLayoutActivity.class));
        btnRelative.setOnClickListener(v -> abrir(RelativeLayoutActivity.class));
        btnFrame.setOnClickListener(v -> abrir(FrameLayoutActivity.class));
        btnTable.setOnClickListener(v -> abrir(TableLayoutActivity.class));
    }

    private void abrir(Class<?> actividad) {
        startActivity(new Intent(this, actividad));
    }
}
