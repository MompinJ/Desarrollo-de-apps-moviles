package com.example.ejercicio09persistencia;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity implements ProductoAdapter.Listener {

    // La red no puede usarse en el hilo principal: se corre en un hilo aparte y se regresa con el Handler
    private final ExecutorService hilo = Executors.newSingleThreadExecutor();
    private final Handler principal = new Handler(Looper.getMainLooper());

    private ProductoAdapter adapter;
    private TextView txtEstado, txtVacio;

    private interface Tarea {
        void ejecutar() throws Exception;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        txtEstado = findViewById(R.id.txtEstado);
        txtVacio = findViewById(R.id.txtVacio);
        Button btnReintentar = findViewById(R.id.btnReintentar);
        Button btnAgregar = findViewById(R.id.btnAgregar);

        adapter = new ProductoAdapter(this);
        RecyclerView recycler = findViewById(R.id.recycler);
        recycler.setLayoutManager(new LinearLayoutManager(this));
        recycler.setAdapter(adapter);

        btnReintentar.setOnClickListener(v -> consultar());
        btnAgregar.setOnClickListener(v -> mostrarDialogo(null));

        consultar();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        hilo.shutdownNow();
    }

    // Consultar: tambien sirve como comprobacion de la conexion
    private void consultar() {
        txtEstado.setText(R.string.conexion_probando);
        hilo.execute(() -> {
            try {
                List<Producto> lista = SupabaseClient.consultar();
                principal.post(() -> {
                    txtEstado.setText(getString(R.string.conexion_ok, lista.size()));
                    txtVacio.setVisibility(lista.isEmpty() ? View.VISIBLE : View.GONE);
                    adapter.setProductos(lista);
                });
            } catch (Exception e) {
                principal.post(() -> txtEstado.setText(getString(R.string.conexion_error, e.getMessage())));
            }
        });
    }

    // Ejecuta una operacion de escritura y recarga la lista al terminar
    private void escribir(Tarea tarea) {
        hilo.execute(() -> {
            try {
                tarea.ejecutar();
                principal.post(this::consultar);
            } catch (Exception e) {
                principal.post(() -> Toast.makeText(this,
                        getString(R.string.error_generico, e.getMessage()), Toast.LENGTH_LONG).show());
            }
        });
    }

    // Agregar (producto == null) y actualizar comparten el mismo dialogo
    private void mostrarDialogo(Producto existente) {
        View vista = LayoutInflater.from(this).inflate(R.layout.dialogo_producto, null);
        EditText etProducto = vista.findViewById(R.id.etProducto);
        EditText etDescripcion = vista.findViewById(R.id.etDescripcion);
        EditText etPrecio = vista.findViewById(R.id.etPrecio);

        if (existente != null) {
            etProducto.setText(existente.producto);
            etDescripcion.setText(existente.descripcion);
            etPrecio.setText(String.valueOf(existente.precio));
        }

        AlertDialog dialogo = new AlertDialog.Builder(this)
                .setTitle(existente == null ? R.string.dialogo_agregar : R.string.dialogo_editar)
                .setView(vista)
                .setPositiveButton(existente == null ? R.string.btn_guardar : R.string.btn_actualizar, null)
                .setNegativeButton(R.string.btn_cancelar, null)
                .create();
        dialogo.show();

        // El listener se asigna despues de show() para que el dialogo no se cierre si hay error de validacion
        dialogo.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String nombre = etProducto.getText().toString().trim();
            String descripcion = etDescripcion.getText().toString().trim();
            double precio;
            try {
                precio = Double.parseDouble(etPrecio.getText().toString().trim());
            } catch (NumberFormatException e) {
                precio = Double.NaN;
            }
            if (nombre.isEmpty() || Double.isNaN(precio)) {
                Toast.makeText(this, R.string.error_campos, Toast.LENGTH_SHORT).show();
                return;
            }
            final double precioFinal = precio;
            if (existente == null) {
                escribir(() -> SupabaseClient.agregar(nombre, descripcion, precioFinal));
            } else {
                escribir(() -> SupabaseClient.actualizar(existente.id, nombre, descripcion, precioFinal));
            }
            dialogo.dismiss();
        });
    }

    @Override
    public void alEditar(Producto producto) {
        mostrarDialogo(producto);
    }

    @Override
    public void alEliminar(Producto producto) {
        new AlertDialog.Builder(this)
                .setMessage(getString(R.string.confirmar_eliminar, producto.producto))
                .setPositiveButton(R.string.btn_eliminar, (d, w) -> escribir(() -> SupabaseClient.eliminar(producto.id)))
                .setNegativeButton(R.string.btn_cancelar, null)
                .show();
    }
}
