package com.example.ejercicio04fragmentado;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

// Fragmento con su propia logica y su propio estado
public class ContadorFragment extends Fragment {

    private static final String KEY_VALOR = "valor";

    TextView tvValor;
    Button btnSumar, btnRestar;

    int valor = 0;

    public ContadorFragment() {
        super(R.layout.fragment_contador);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        tvValor = view.findViewById(R.id.tvValor);
        btnSumar = view.findViewById(R.id.btnSumar);
        btnRestar = view.findViewById(R.id.btnRestar);

        if (savedInstanceState != null) {
            valor = savedInstanceState.getInt(KEY_VALOR);
        }
        actualizar();

        btnSumar.setOnClickListener(v -> {
            valor++;
            actualizar();
        });
        btnRestar.setOnClickListener(v -> {
            valor--;
            actualizar();
        });
    }

    // Conserva el valor si se gira el telefono
    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(KEY_VALOR, valor);
    }

    private void actualizar() {
        tvValor.setText(String.valueOf(valor));
    }
}
