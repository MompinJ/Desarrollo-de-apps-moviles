package com.example.ejercicio03demointent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class ConversorActivity extends AppCompatActivity {

    TextView tvCelsius, tvResultado, tvEstado;
    Button btnRegresar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_conversor);

        tvCelsius = findViewById(R.id.tvCelsius);
        tvResultado = findViewById(R.id.tvResultado);
        tvEstado = findViewById(R.id.tvEstado);
        btnRegresar = findViewById(R.id.btnRegresar);

        // Leer el Extra desde el Bundle del Intent
        Bundle datos = getIntent().getExtras();
        double celsius = datos != null ? datos.getDouble(MainActivity.EXTRA_CELSIUS) : 0;

        double fahrenheit = celsius * 9 / 5 + 32;
        double kelvin = celsius + 273.15;

        int estado;
        if (celsius <= 0) {
            estado = R.string.estado_solido;
        } else if (celsius < 100) {
            estado = R.string.estado_liquido;
        } else {
            estado = R.string.estado_gas;
        }

        tvCelsius.setText(getString(R.string.conversor_celsius, celsius));
        tvResultado.setText(getString(R.string.conversor_resultado, fahrenheit, kelvin));
        tvEstado.setText(getString(R.string.conversor_estado, getString(estado)));

        btnRegresar.setOnClickListener(v -> finish());
    }
}
