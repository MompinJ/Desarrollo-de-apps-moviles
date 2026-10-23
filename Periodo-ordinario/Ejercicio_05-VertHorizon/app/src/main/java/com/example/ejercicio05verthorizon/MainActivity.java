package com.example.ejercicio05verthorizon;

import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    // Filtro para ver los mensajes en Logcat
    private static final String TAG = "VertHorizon";

    // Llave con la que se guarda el dato mostrado en el Bundle
    private static final String KEY_MOSTRADO = "mostrado";

    EditText etValor;
    Button btnMostrar;
    TextView tvMostrado, tvOrientacion;
    CheckBox cbGuardar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etValor = findViewById(R.id.etValor);
        btnMostrar = findViewById(R.id.btnMostrar);
        tvMostrado = findViewById(R.id.tvMostrado);
        tvOrientacion = findViewById(R.id.tvOrientacion);
        cbGuardar = findViewById(R.id.cbGuardar);

        aviso("onCreate()");

        boolean horizontal = getResources().getConfiguration().orientation
                == Configuration.ORIENTATION_LANDSCAPE;
        tvOrientacion.setText(horizontal ? R.string.orientacion_horizontal : R.string.orientacion_vertical);

        // Solucion: si antes de girar se guardo el dato, se vuelve a mostrar
        if (savedInstanceState != null && savedInstanceState.containsKey(KEY_MOSTRADO)) {
            tvMostrado.setText(savedInstanceState.getString(KEY_MOSTRADO));
            Log.d(TAG, "Dato restaurado del Bundle");
        }

        btnMostrar.setOnClickListener(v -> {
            String valor = etValor.getText().toString().trim();
            if (valor.isEmpty()) {
                Toast.makeText(this, R.string.error_valor, Toast.LENGTH_SHORT).show();
                return;
            }
            tvMostrado.setText(valor);
        });
    }

    // Se llama antes de que la actividad se destruya al girar el telefono
    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (cbGuardar.isChecked()) {
            outState.putString(KEY_MOSTRADO, tvMostrado.getText().toString());
            Log.d(TAG, "onSaveInstanceState(): dato guardado en el Bundle");
        } else {
            Log.d(TAG, "onSaveInstanceState(): el dato NO se guardo");
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        aviso("onPause()");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        aviso("onDestroy()");
    }

    // Los demas metodos del ciclo de vida solo van al Log, para ver la secuencia completa
    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart()");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume()");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop()");
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(TAG, "onRestart()");
    }

    // Log + Toast; se usa el contexto de la aplicacion porque en onDestroy()
    // la actividad ya se esta destruyendo
    private void aviso(String metodo) {
        Log.d(TAG, metodo);
        Toast.makeText(getApplicationContext(), metodo, Toast.LENGTH_SHORT).show();
    }
}
