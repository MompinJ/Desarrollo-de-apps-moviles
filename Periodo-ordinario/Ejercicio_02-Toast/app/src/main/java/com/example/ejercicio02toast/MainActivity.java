package com.example.ejercicio02toast;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    EditText etTexto;
    Button btnMostrar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etTexto = findViewById(R.id.etTexto);
        btnMostrar = findViewById(R.id.btnMostrar);

        btnMostrar.setOnClickListener(v -> {
            String texto = etTexto.getText().toString();
            Toast.makeText(this, texto, Toast.LENGTH_SHORT).show();
        });
    }
}
