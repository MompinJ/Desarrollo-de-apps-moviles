package com.example.ejercicio10sensores;

import android.Manifest;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.TextView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;

public class PodometroActivity extends BaseActivity implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor sensorPasos;
    private boolean esContador;
    private TextView txtPasos, txtMensaje;

    // TYPE_STEP_COUNTER devuelve los pasos acumulados desde el arranque, no desde que se abre la pantalla
    private float base = -1;
    private int pasos = 0;

    private final ActivityResultLauncher<String> pedirPermiso =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), concedido -> {
                if (concedido) registrar();
                else txtMensaje.setText(R.string.pasos_permiso);
            });

    @Override
    protected int layoutContenido() { return R.layout.content_podometro; }

    @Override
    protected int itemMenu() { return R.id.nav_podometro; }

    @Override
    protected int titulo() { return R.string.menu_podometro; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        txtPasos = findViewById(R.id.txtPasos);
        txtMensaje = findViewById(R.id.txtMensaje);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        sensorPasos = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        esContador = sensorPasos != null;
        // Si no hay contador, el detector avisa de cada paso individual
        if (!esContador) sensorPasos = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
        if (sensorPasos == null) txtMensaje.setText(R.string.sin_sensor);

        findViewById(R.id.btnReiniciar).setOnClickListener(v -> {
            base = -1;
            pasos = 0;
            txtPasos.setText("0");
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (sensorPasos == null) return;
        // Desde Android 10 los sensores de pasos piden permiso en tiempo de ejecucion
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                && ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION)
                != PackageManager.PERMISSION_GRANTED) {
            pedirPermiso.launch(Manifest.permission.ACTIVITY_RECOGNITION);
        } else {
            registrar();
        }
    }

    private void registrar() {
        txtMensaje.setText(R.string.pasos_instruccion);
        sensorManager.registerListener(this, sensorPasos, SensorManager.SENSOR_DELAY_UI);
    }

    @Override
    protected void onPause() {
        super.onPause();
        sensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (esContador) {
            if (base < 0) base = event.values[0];
            pasos = (int) (event.values[0] - base);
        } else {
            pasos++;
        }
        txtPasos.setText(String.valueOf(pasos));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }
}
