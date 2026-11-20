package com.example.ejercicio10sensores;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.TextView;

public class AcelerometroActivity extends BaseActivity implements SensorEventListener {

    // Aceleracion total (en g) a partir de la cual se considera una sacudida
    private static final float UMBRAL_SACUDIDA = 2.5f;

    private SensorManager sensorManager;
    private Sensor acelerometro;
    private TextView txtValores, txtEstado;

    @Override
    protected int layoutContenido() { return R.layout.content_acelerometro; }

    @Override
    protected int itemMenu() { return R.id.nav_acelerometro; }

    @Override
    protected int titulo() { return R.string.menu_acelerometro; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        txtValores = findViewById(R.id.txtValores);
        txtEstado = findViewById(R.id.txtEstado);
        ((TextView) findViewById(R.id.txtUnidad)).setText(R.string.acel_unidad);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        acelerometro = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        if (acelerometro == null) txtValores.setText(R.string.sin_sensor);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (acelerometro != null) {
            sensorManager.registerListener(this, acelerometro, SensorManager.SENSOR_DELAY_UI);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        sensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        float x = event.values[0], y = event.values[1], z = event.values[2];
        txtValores.setText(getString(R.string.valor_xyz, x, y, z));

        double g = Math.sqrt(x * x + y * y + z * z) / SensorManager.GRAVITY_EARTH;
        txtEstado.setText(g > UMBRAL_SACUDIDA ? R.string.acel_sacudida : R.string.acel_quieto);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }
}
