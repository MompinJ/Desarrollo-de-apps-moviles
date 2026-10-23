package com.example.ejercicio04fragmentado;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

// Fragmento que lee un EditText y responde a un boton
public class SaludoFragment extends Fragment {

    EditText etNombre;
    Button btnSaludar;
    TextView tvSaludo;

    public SaludoFragment() {
        super(R.layout.fragment_saludo);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        etNombre = view.findViewById(R.id.etNombre);
        btnSaludar = view.findViewById(R.id.btnSaludar);
        tvSaludo = view.findViewById(R.id.tvSaludo);

        btnSaludar.setOnClickListener(v -> {
            String nombre = etNombre.getText().toString().trim();
            if (nombre.isEmpty()) {
                // Un fragmento usa requireContext() en lugar de "this"
                Toast.makeText(requireContext(), R.string.error_nombre, Toast.LENGTH_SHORT).show();
                return;
            }
            tvSaludo.setText(getString(R.string.saludo, nombre));
        });
    }
}
