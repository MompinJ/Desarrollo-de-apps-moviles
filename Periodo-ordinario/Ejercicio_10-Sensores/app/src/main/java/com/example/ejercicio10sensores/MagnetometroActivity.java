package com.example.ejercicio10sensores;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;

public class MagnetometroActivity extends BaseActivity implements SensorEventListener {

    private static final String[] PUNTOS = {"N", "NE", "E", "SE", "S", "SO", "O", "NO"};

    private SensorManager sensorManager;
    private Sensor magnetometro, acelerometro;
    private ImageView imgBrujula;
    private TextView txtGrados, txtCampo;

    private final float[] gravedad = new float[3];
    private final float[] campo = new float[3];
    private final float[] rotacion = new float[9];
    private final float[] orientacion = new float[3];
    private boolean hayGravedad, hayCampo;
    private float gradosActuales = 0;

    @Override
    protected int layoutContenido() { return R.layout.content_magnetometro; }

    @Override
    protected int itemMenu() { return R.id.nav_magnetometro; }

    @Override
    protected int titulo() { return R.string.menu_magnetometro; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        imgBrujula = findViewById(R.id.imgBrujula);
        txtGrados = findViewById(R.id.txtGrados);
        txtCampo = findViewById(R.id.txtCampo);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        magnetometro = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        acelerometro = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        if (magnetometro == null) txtGrados.setText(R.string.sin_sensor);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (magnetometro == null) return;
        sensorManager.registerListener(this, magnetometro, SensorManager.SENSOR_DELAY_UI);
        // El acelerometro da la inclinacion; sin ella el magnetometro solo no sabe donde esta el norte
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
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(event.values, 0, gravedad, 0, 3);
            hayGravedad = true;
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(event.values, 0, campo, 0, 3);
            hayCampo = true;
            double microteslas = Math.sqrt(campo[0] * campo[0] + campo[1] * campo[1] + campo[2] * campo[2]);
            txtCampo.setText(getString(R.string.mag_campo, microteslas));
        }
        if (!hayGravedad || !hayCampo) return;
        if (!SensorManager.getRotationMatrix(rotacion, null, gravedad, campo)) return;

        SensorManager.getOrientation(rotacion, orientacion);
        float grados = (float) ((Math.toDegrees(orientacion[0]) + 360) % 360);

        // La aguja gira al reves que el telefono para seguir apuntando al norte
        imgBrujula.setRotation(-grados);
        gradosActuales = grados;
        int punto = Math.round(grados / 45f) % 8;
        txtGrados.setText(getString(R.string.brujula_grados, Math.round(gradosActuales), PUNTOS[punto]));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }
}
