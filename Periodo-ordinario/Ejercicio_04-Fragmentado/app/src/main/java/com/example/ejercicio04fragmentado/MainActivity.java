package com.example.ejercicio04fragmentado;

import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

public class MainActivity extends AppCompatActivity {

    Button btnFragmento1, btnFragmento2, btnFragmento3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnFragmento1 = findViewById(R.id.btnFragmento1);
        btnFragmento2 = findViewById(R.id.btnFragmento2);
        btnFragmento3 = findViewById(R.id.btnFragmento3);

        // Solo se carga el primer fragmento la primera vez; si se gira el
        // telefono, el FragmentManager restaura el que estaba visible
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.contenedor, new InicioFragment())
                    .commit();
        }

        btnFragmento1.setOnClickListener(v -> mostrar(new InicioFragment()));
        btnFragmento2.setOnClickListener(v -> mostrar(new ContadorFragment()));
        btnFragmento3.setOnClickListener(v -> mostrar(new SaludoFragment()));
    }

    // Reemplaza el fragmento que esta en el contenedor por uno nuevo
    private void mostrar(Fragment fragmento) {
        getSupportFragmentManager().beginTransaction()
                .setReorderingAllowed(true)
                .replace(R.id.contenedor, fragmento)
                .addToBackStack(null) // el boton atras regresa al fragmento anterior
                .commit();
    }
}
