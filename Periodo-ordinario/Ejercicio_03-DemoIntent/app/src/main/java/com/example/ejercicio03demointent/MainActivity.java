package com.example.ejercicio03demointent;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    // Llaves de los Extras, compartidas por todas las actividades
    public static final String EXTRA_NOMBRE = "extra_nombre";
    public static final String EXTRA_NUMERO = "extra_numero";
    public static final String EXTRA_CELSIUS = "extra_celsius";
    public static final String EXTRA_RESULTADO = "extra_resultado";

    EditText etNombre, etNumero;
    Button btnSaludo, btnContador, btnConversor;
    TextView tvResultado;

    // Recibe el Extra que regresa ContadorActivity al cerrarse
    final ActivityResultLauncher<Intent> contadorLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    int valor = result.getData().getIntExtra(EXTRA_RESULTADO, 0);
                    tvResultado.setText(getString(R.string.resultado_contador, valor));
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etNombre = findViewById(R.id.etNombre);
        etNumero = findViewById(R.id.etNumero);
        btnSaludo = findViewById(R.id.btnSaludo);
        btnContador = findViewById(R.id.btnContador);
        btnConversor = findViewById(R.id.btnConversor);
        tvResultado = findViewById(R.id.tvResultado);

        // Intent explicito con Extras String e int
        btnSaludo.setOnClickListener(v -> {
            if (!camposValidos()) return;
            Intent intent = new Intent(this, SaludoActivity.class);
            intent.putExtra(EXTRA_NOMBRE, nombre());
            intent.putExtra(EXTRA_NUMERO, numero());
            startActivity(intent);
        });

        // Intent con Extras que ademas espera un resultado de regreso
        btnContador.setOnClickListener(v -> {
            if (!camposValidos()) return;
            Intent intent = new Intent(this, ContadorActivity.class);
            intent.putExtra(EXTRA_NOMBRE, nombre());
            intent.putExtra(EXTRA_NUMERO, numero());
            contadorLauncher.launch(intent);
        });

        // Intent con los Extras agrupados en un Bundle (double)
        btnConversor.setOnClickListener(v -> {
            if (!camposValidos()) return;
            Bundle datos = new Bundle();
            datos.putDouble(EXTRA_CELSIUS, numero());
            Intent intent = new Intent(this, ConversorActivity.class);
            intent.putExtras(datos);
            startActivity(intent);
        });
    }

    private boolean camposValidos() {
        try {
            Integer.parseInt(etNumero.getText().toString().trim());
        } catch (NumberFormatException e) {
            Toast.makeText(this, R.string.error_campos, Toast.LENGTH_SHORT).show();
            return false;
        }
        if (nombre().isEmpty()) {
            Toast.makeText(this, R.string.error_campos, Toast.LENGTH_SHORT).show();
            return false;
        }
        return true;
    }

    private String nombre() {
        return etNombre.getText().toString().trim();
    }

    private int numero() {
        return Integer.parseInt(etNumero.getText().toString().trim());
    }
}
