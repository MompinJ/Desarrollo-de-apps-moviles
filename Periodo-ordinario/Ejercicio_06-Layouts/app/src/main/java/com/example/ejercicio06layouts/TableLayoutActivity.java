package com.example.ejercicio06layouts;

import android.os.Bundle;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class TableLayoutActivity extends AppCompatActivity {

    EditText etNombre, etCorreo, etEdad, etCarrera;
    CheckBox cbTerminos;
    Button btnLimpiar, btnRegistrar;
    TableLayout tlResumen;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_table);

        etNombre = findViewById(R.id.etNombre);
        etCorreo = findViewById(R.id.etCorreo);
        etEdad = findViewById(R.id.etEdad);
        etCarrera = findViewById(R.id.etCarrera);
        cbTerminos = findViewById(R.id.cbTerminos);
        btnLimpiar = findViewById(R.id.btnLimpiar);
        btnRegistrar = findViewById(R.id.btnRegistrar);
        tlResumen = findViewById(R.id.tlResumen);

        btnLimpiar.setOnClickListener(v -> limpiar());
        btnRegistrar.setOnClickListener(v -> registrar());
    }

    private void registrar() {
        String nombre = etNombre.getText().toString().trim();
        String correo = etCorreo.getText().toString().trim();
        String edad = etEdad.getText().toString().trim();
        String carrera = etCarrera.getText().toString().trim();

        if (nombre.isEmpty() || correo.isEmpty() || edad.isEmpty() || carrera.isEmpty()) {
            Toast.makeText(this, R.string.error_campos, Toast.LENGTH_SHORT).show();
            return;
        }
        if (!cbTerminos.isChecked()) {
            Toast.makeText(this, R.string.error_terminos, Toast.LENGTH_SHORT).show();
            return;
        }

        // Se borran las filas del registro anterior; la fila 0 (encabezado) se queda
        tlResumen.removeViews(1, tlResumen.getChildCount() - 1);

        agregarFila("Nombre", nombre);
        agregarFila("Correo", correo);
        agregarFila("Edad", edad);
        agregarFila("Carrera", carrera);

        Toast.makeText(this, R.string.registro_ok, Toast.LENGTH_SHORT).show();
    }

    // Una fila tambien se puede crear desde Java: new TableRow + addView de cada columna
    private void agregarFila(String campo, String valor) {
        TableRow fila = new TableRow(this);
        fila.addView(crearCelda(campo));
        fila.addView(crearCelda(valor));
        tlResumen.addView(fila);
    }

    private TextView crearCelda(String texto) {
        TextView celda = new TextView(this);
        celda.setText(texto);
        int padding = (int) (8 * getResources().getDisplayMetrics().density); // 8dp a pixeles
        celda.setPadding(padding, padding, padding, padding);
        return celda;
    }

    private void limpiar() {
        etNombre.setText("");
        etCorreo.setText("");
        etEdad.setText("");
        etCarrera.setText("");
        cbTerminos.setChecked(false);
        tlResumen.removeViews(1, tlResumen.getChildCount() - 1);
        etNombre.requestFocus();
    }
}
