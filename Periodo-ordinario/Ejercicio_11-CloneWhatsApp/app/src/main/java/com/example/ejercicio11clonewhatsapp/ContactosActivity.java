package com.example.ejercicio11clonewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ejercicio11clonewhatsapp.supabase.DatosRepository;
import com.example.ejercicio11clonewhatsapp.supabase.Perfil;
import com.example.ejercicio11clonewhatsapp.supabase.Resultado;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.textfield.TextInputEditText;

import java.util.List;

/**
 * Fase 4: consultar, mostrar (RecyclerView), buscar usuarios y seleccionar destinatario.
 * Al tocar un contacto se devuelve a quien abrio esta pantalla en el extra EXTRA_CONTACTO.
 */
public class ContactosActivity extends AppCompatActivity {

    public static final String EXTRA_CONTACTO = "contacto";

    /** Espera tras la ultima tecla antes de consultar, para no hacer una peticion por letra. */
    private static final long ESPERA_BUSQUEDA_MS = 350;

    private DatosRepository datos;
    private ContactosAdapter adapter;
    private TextInputEditText edtBuscar;
    private TextView txtConteo, txtVacio;
    private View progreso;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable buscarDiferido = this::buscar;
    /** Numero de la ultima busqueda: se ignoran las respuestas de busquedas viejas. */
    private int ultimaBusqueda = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contactos);
        datos = new DatosRepository(this);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        edtBuscar = findViewById(R.id.edtBuscar);
        txtConteo = findViewById(R.id.txtConteo);
        txtVacio = findViewById(R.id.txtVacio);
        progreso = findViewById(R.id.progreso);

        adapter = new ContactosAdapter(this::seleccionar);
        RecyclerView lista = findViewById(R.id.lista);
        lista.setLayoutManager(new LinearLayoutManager(this));
        lista.addItemDecoration(new DividerItemDecoration(this, DividerItemDecoration.VERTICAL));
        lista.setAdapter(adapter);

        edtBuscar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) { }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) { }

            @Override
            public void afterTextChanged(Editable s) {
                handler.removeCallbacks(buscarDiferido);
                handler.postDelayed(buscarDiferido, ESPERA_BUSQUEDA_MS);
            }
        });
        edtBuscar.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                handler.removeCallbacks(buscarDiferido);
                buscar();
                return true;
            }
            return false;
        });

        buscar();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacks(buscarDiferido);
    }

    private void buscar() {
        String texto = Validar.texto(edtBuscar);
        int numero = ++ultimaBusqueda;
        progreso.setVisibility(View.VISIBLE);
        txtVacio.setVisibility(View.GONE);

        datos.buscarUsuarios(texto, new Resultado<List<Perfil>>() {
            @Override
            public void ok(List<Perfil> lista) {
                if (numero != ultimaBusqueda) return;
                progreso.setVisibility(View.GONE);
                adapter.mostrar(lista);
                txtConteo.setText(getResources().getQuantityString(
                        R.plurals.contactos_conteo, lista.size(), lista.size()));
                if (lista.isEmpty()) {
                    txtVacio.setText(texto.isEmpty()
                            ? getString(R.string.contactos_vacio)
                            : getString(R.string.contactos_sin_resultados, texto));
                    txtVacio.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void error(String mensaje) {
                if (numero != ultimaBusqueda) return;
                progreso.setVisibility(View.GONE);
                txtVacio.setText(mensaje);
                txtVacio.setVisibility(View.VISIBLE);
            }
        });
    }

    /** Seleccionar destinatario: se regresa el contacto elegido. */
    private void seleccionar(Perfil contacto) {
        Intent resultado = new Intent();
        resultado.putExtra(EXTRA_CONTACTO, contacto);
        setResult(RESULT_OK, resultado);
        finish();
    }
}
