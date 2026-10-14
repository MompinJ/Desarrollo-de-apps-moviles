package com.example.ejercicio03demointent;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class ContadorActivity extends AppCompatActivity {

    TextView tvTitulo, tvValor;
    Button btnSumar, btnRestar, btnReiniciar, btnRegresar;

    int inicial;
    int valor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contador);

        tvTitulo = findViewById(R.id.tvTitulo);
        tvValor = findViewById(R.id.tvValor);
        btnSumar = findViewById(R.id.btnSumar);
        btnRestar = findViewById(R.id.btnRestar);
        btnReiniciar = findViewById(R.id.btnReiniciar);
        btnRegresar = findViewById(R.id.btnRegresar);

        // El numero recibido como Extra es el valor inicial del contador
        String nombre = getIntent().getStringExtra(MainActivity.EXTRA_NOMBRE);
        inicial = getIntent().getIntExtra(MainActivity.EXTRA_NUMERO, 0);
        valor = inicial;

        tvTitulo.setText(getString(R.string.titulo_contador, nombre));
        actualizar();

        btnSumar.setOnClickListener(v -> {
            valor++;
            actualizar();
        });
        btnRestar.setOnClickListener(v -> {
            valor--;
            actualizar();
        });
        btnReiniciar.setOnClickListener(v -> {
            valor = inicial;
            actualizar();
        });

        btnRegresar.setOnClickListener(v -> finish());
    }

    private void actualizar() {
        tvValor.setText(String.valueOf(valor));

        // Se prepara el Extra de regreso en cada cambio, asi tambien
        // llega si el usuario sale con el boton atras del sistema
        Intent datos = new Intent();
        datos.putExtra(MainActivity.EXTRA_RESULTADO, valor);
        setResult(Activity.RESULT_OK, datos);
    }
}
