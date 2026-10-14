package com.example.ejercicio03demointent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import java.util.Calendar;

public class SaludoActivity extends AppCompatActivity {

    TextView tvSaludo, tvDetalle;
    Button btnRegresar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_saludo);

        tvSaludo = findViewById(R.id.tvSaludo);
        tvDetalle = findViewById(R.id.tvDetalle);
        btnRegresar = findViewById(R.id.btnRegresar);

        // Leer los Extras que mando MainActivity
        String nombre = getIntent().getStringExtra(MainActivity.EXTRA_NOMBRE);
        int numero = getIntent().getIntExtra(MainActivity.EXTRA_NUMERO, 0);

        // Saludo segun la hora del dia
        int hora = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        int saludo;
        if (hora < 12) {
            saludo = R.string.saludo_manana;
        } else if (hora < 19) {
            saludo = R.string.saludo_tarde;
        } else {
            saludo = R.string.saludo_noche;
        }
        tvSaludo.setText(getString(saludo, nombre));

        String paridad = getString(numero % 2 == 0 ? R.string.par : R.string.impar);
        tvDetalle.setText(getString(R.string.saludo_detalle, nombre.length(), numero, paridad));

        btnRegresar.setOnClickListener(v -> finish());
    }
}
