package com.example.ejercicio07listas;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity implements ContactoAdapter.OnContactoListener {

    RecyclerView rvContactos;
    Button btnLista, btnHorizontal, btnCuadricula, btnAgregar;
    TextView tvModo;

    List<Contacto> contactos;
    ContactoAdapter adapter;
    int nuevos = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        rvContactos = findViewById(R.id.rvContactos);
        btnLista = findViewById(R.id.btnLista);
        btnHorizontal = findViewById(R.id.btnHorizontal);
        btnCuadricula = findViewById(R.id.btnCuadricula);
        btnAgregar = findViewById(R.id.btnAgregar);
        tvModo = findViewById(R.id.tvModo);

        // 1. Datos  2. Adapter  3. LayoutManager
        contactos = crearContactos();
        adapter = new ContactoAdapter(contactos, this);
        rvContactos.setAdapter(adapter);
        usarLista();

        btnLista.setOnClickListener(v -> usarLista());
        btnHorizontal.setOnClickListener(v -> usarHorizontal());
        btnCuadricula.setOnClickListener(v -> usarCuadricula());
        btnAgregar.setOnClickListener(v -> agregar());
    }

    // ===== POSICIONAMIENTO (LayoutManager) =====
    // El adapter y los datos son los mismos; solo cambia quien acomoda los elementos

    private void usarLista() {
        adapter.setModo(ContactoAdapter.MODO_LISTA);
        rvContactos.setLayoutManager(new LinearLayoutManager(this));
        tvModo.setText(R.string.modo_lista);
    }

    private void usarHorizontal() {
        adapter.setModo(ContactoAdapter.MODO_HORIZONTAL);
        rvContactos.setLayoutManager(
                new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        tvModo.setText(R.string.modo_horizontal);
    }

    private void usarCuadricula() {
        adapter.setModo(ContactoAdapter.MODO_CUADRICULA);
        rvContactos.setLayoutManager(new GridLayoutManager(this, 2));
        tvModo.setText(R.string.modo_cuadricula);
    }

    // ===== CAMBIOS EN LOS DATOS =====
    // Se avisa al adapter exactamente que cambio, asi solo se redibuja ese
    // elemento y el RecyclerView lo anima (aparece o desaparece)

    private void agregar() {
        nuevos++;
        contactos.add(0, new Contacto("Nuevo contacto " + nuevos, "229 555 " + (1000 + nuevos)));
        adapter.notifyItemInserted(0);
        rvContactos.scrollToPosition(0);
    }

    @Override
    public void onClick(int posicion) {
        Contacto contacto = contactos.get(posicion);
        Toast.makeText(this, contacto.getNombre() + "\n" + contacto.getTelefono(), Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onLongClick(int posicion) {
        Contacto borrado = contactos.remove(posicion);
        adapter.notifyItemRemoved(posicion);
        Toast.makeText(this, "Se borro a " + borrado.getNombre(), Toast.LENGTH_SHORT).show();
    }

    private List<Contacto> crearContactos() {
        List<Contacto> lista = new ArrayList<>();
        lista.add(new Contacto("Ana Lopez", "229 123 4501"));
        lista.add(new Contacto("Bruno Diaz", "229 123 4502"));
        lista.add(new Contacto("Carla Mendez", "229 123 4503"));
        lista.add(new Contacto("Diego Ramirez", "229 123 4504"));
        lista.add(new Contacto("Elena Torres", "229 123 4505"));
        lista.add(new Contacto("Fernando Cruz", "229 123 4506"));
        lista.add(new Contacto("Gabriela Ruiz", "229 123 4507"));
        lista.add(new Contacto("Hector Silva", "229 123 4508"));
        lista.add(new Contacto("Isabel Navarro", "229 123 4509"));
        lista.add(new Contacto("Jorge Herrera", "229 123 4510"));
        lista.add(new Contacto("Karen Vargas", "229 123 4511"));
        lista.add(new Contacto("Luis Castillo", "229 123 4512"));
        lista.add(new Contacto("Monica Rios", "229 123 4513"));
        lista.add(new Contacto("Nicolas Ortega", "229 123 4514"));
        lista.add(new Contacto("Olga Morales", "229 123 4515"));
        lista.add(new Contacto("Pablo Jimenez", "229 123 4516"));
        lista.add(new Contacto("Rosa Aguilar", "229 123 4517"));
        lista.add(new Contacto("Sergio Pena", "229 123 4518"));
        lista.add(new Contacto("Teresa Flores", "229 123 4519"));
        lista.add(new Contacto("Victor Medina", "229 123 4520"));
        return lista;
    }
}
