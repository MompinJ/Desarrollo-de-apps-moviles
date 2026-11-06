package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;

/**
 * Pantalla de arranque: decide a donde ir segun la sesion JWT guardada.
 * - Sin sesion -> Login.
 * - Con sesion -> pide un token vigente (lo renueva si caduco) y entra a Home.
 */
public class InicioActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inicio);

        AuthRepository auth = AuthRepository.get(this);
        if (!auth.getSesion().activa()) {
            ir(LoginActivity.class);
            return;
        }
        auth.obtenerToken(new Resultado<String>() {
            @Override
            public void ok(String token) {
                ir(HomeActivity.class);
            }

            @Override
            public void error(String mensaje) {
                // Si no hay internet se entra igual: Home reintentara al cargar los datos.
                ir(auth.getSesion().activa() ? HomeActivity.class : LoginActivity.class);
            }
        });
    }

    private void ir(Class<?> destino) {
        startActivity(new Intent(this, destino));
        finish();
    }
}
