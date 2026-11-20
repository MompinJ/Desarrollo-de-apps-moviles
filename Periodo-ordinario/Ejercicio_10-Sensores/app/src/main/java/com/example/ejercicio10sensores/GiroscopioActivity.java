package com.example.ejercicio10sensores;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.TextView;

public class GiroscopioActivity extends BaseActivity implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor giroscopio;
    private TextView txtValores;

    @Override
    protected int layoutContenido() { return R.layout.content_giroscopio; }

    @Override
    protected int itemMenu() { return R.id.nav_giroscopio; }

    @Override
    protected int titulo() { return R.string.menu_giroscopio; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        txtValores = findViewById(R.id.txtValores);
        ((TextView) findViewById(R.id.txtUnidad)).setText(R.string.giro_unidad);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        giroscopio = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
        if (giroscopio == null) txtValores.setText(R.string.sin_sensor);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (giroscopio != null) {
            sensorManager.registerListener(this, giroscopio, SensorManager.SENSOR_DELAY_UI);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        sensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        txtValores.setText(getString(R.string.valor_xyz, event.values[0], event.values[1], event.values[2]));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }
}
