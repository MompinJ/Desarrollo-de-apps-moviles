package com.example.ejercicio10sensores;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;

import androidx.annotation.IdRes;
import androidx.annotation.LayoutRes;
import androidx.annotation.StringRes;
import androidx.appcompat.app.AppCompatActivity;
import androidx.drawerlayout.widget.DrawerLayout;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.navigation.NavigationView;

// Activity base que pone el NavDrawer. Cada sensor extiende de aqui y solo aporta su contenido
public abstract class BaseActivity extends AppCompatActivity {

    protected DrawerLayout drawer;

    @LayoutRes
    protected abstract int layoutContenido();

    @IdRes
    protected abstract int itemMenu();

    @StringRes
    protected abstract int titulo();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_base);

        drawer = findViewById(R.id.drawer);
        LayoutInflater.from(this).inflate(layoutContenido(), findViewById(R.id.contenido), true);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setTitle(titulo());
        toolbar.setNavigationOnClickListener(v -> drawer.openDrawer(androidx.core.view.GravityCompat.START));

        NavigationView nav = findViewById(R.id.nav_view);
        nav.setCheckedItem(itemMenu());
        nav.setNavigationItemSelectedListener(item -> {
            drawer.closeDrawers();
            Class<?> destino = destino(item.getItemId());
            if (destino != null && item.getItemId() != itemMenu()) {
                Intent intent = new Intent(this, destino);
                // Se reutiliza la Activity si ya existe en la pila, asi no se apilan al navegar
                intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                startActivity(intent);
                if (!(this instanceof InicioActivity)) finish();
            }
            return true;
        });
    }

    private Class<?> destino(int id) {
        if (id == R.id.nav_inicio) return InicioActivity.class;
        if (id == R.id.nav_acelerometro) return AcelerometroActivity.class;
        if (id == R.id.nav_podometro) return PodometroActivity.class;
        if (id == R.id.nav_giroscopio) return GiroscopioActivity.class;
        if (id == R.id.nav_camara) return CamaraActivity.class;
        if (id == R.id.nav_gps) return GpsActivity.class;
        if (id == R.id.nav_magnetometro) return MagnetometroActivity.class;
        return null;
    }

    @Override
    public void onBackPressed() {
        if (drawer.isDrawerOpen(androidx.core.view.GravityCompat.START)) {
            drawer.closeDrawers();
        } else {
            super.onBackPressed();
        }
    }
}
