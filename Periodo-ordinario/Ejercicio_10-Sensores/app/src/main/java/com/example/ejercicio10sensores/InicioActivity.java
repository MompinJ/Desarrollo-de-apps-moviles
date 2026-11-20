package com.example.ejercicio10sensores;

import android.os.Bundle;
import android.view.View;
import android.view.animation.AnticipateInterpolator;

import androidx.core.splashscreen.SplashScreen;

public class InicioActivity extends BaseActivity {

    @Override
    protected int layoutContenido() { return R.layout.content_inicio; }

    @Override
    protected int itemMenu() { return R.id.nav_inicio; }

    @Override
    protected int titulo() { return R.string.menu_inicio; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Debe ir antes de super.onCreate: cambia del tema de splash al tema normal
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        // Animacion de salida: el icono crece y se desvanece
        splash.setOnExitAnimationListener(provider -> {
            View icono = provider.getIconView();
            icono.animate()
                    .scaleX(3f).scaleY(3f).alpha(0f)
                    .setDuration(500)
                    .setInterpolator(new AnticipateInterpolator())
                    .withEndAction(provider::remove)
                    .start();
        });
        super.onCreate(savedInstanceState);
    }
}
