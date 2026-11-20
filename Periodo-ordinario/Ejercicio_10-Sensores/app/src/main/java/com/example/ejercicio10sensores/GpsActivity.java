package com.example.ejercicio10sensores;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

public class GpsActivity extends BaseActivity implements LocationListener {

    private LocationManager locationManager;
    private TextView txtUbicacion;
    private View btnPermiso;

    private final ActivityResultLauncher<String> pedirPermiso =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), concedido -> iniciar());

    @Override
    protected int layoutContenido() { return R.layout.content_gps; }

    @Override
    protected int itemMenu() { return R.id.nav_gps; }

    @Override
    protected int titulo() { return R.string.menu_gps; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        txtUbicacion = findViewById(R.id.txtUbicacion);
        btnPermiso = findViewById(R.id.btnPermiso);
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);

        btnPermiso.setOnClickListener(v -> pedirPermiso.launch(Manifest.permission.ACCESS_FINE_LOCATION));
    }

    @Override
    protected void onResume() {
        super.onResume();
        iniciar();
    }

    private void iniciar() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            txtUbicacion.setText(R.string.gps_permiso);
            btnPermiso.setVisibility(View.VISIBLE);
            return;
        }
        btnPermiso.setVisibility(View.GONE);

        if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            txtUbicacion.setText(R.string.gps_apagado);
            return;
        }
        txtUbicacion.setText(R.string.gps_buscando);
        // Una actualizacion cada segundo, sin importar cuanto se haya movido
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 0, this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        locationManager.removeUpdates(this);
    }

    @Override
    public void onLocationChanged(@NonNull Location loc) {
        txtUbicacion.setText(getString(R.string.gps_datos,
                loc.getLatitude(), loc.getLongitude(), loc.getAltitude(), loc.getAccuracy()));
    }
}
