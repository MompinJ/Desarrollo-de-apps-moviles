package com.example.ejercicio07listas;

import android.annotation.SuppressLint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

/*
 * ADAPTER
 * Es el puente entre los datos (la List<Contacto>) y el RecyclerView.
 * El RecyclerView le pregunta tres cosas:
 *   getItemCount()       -> cuantos elementos hay
 *   onCreateViewHolder() -> crea un holder nuevo (infla el XML del elemento)
 *   onBindViewHolder()   -> pon los datos de la posicion X en este holder
 */
public class ContactoAdapter extends RecyclerView.Adapter<ContactoViewHolder> {

    // Lo que pasa al tocar un elemento lo decide la actividad, no el adapter
    public interface OnContactoListener {
        void onClick(int posicion);

        void onLongClick(int posicion);
    }

    // Modos de posicionamiento. Se usan como "viewType" para que cada modo
    // tenga su propio XML y el RecyclerView no mezcle holders de un modo con otro
    public static final int MODO_LISTA = 0;
    public static final int MODO_HORIZONTAL = 1;
    public static final int MODO_CUADRICULA = 2;

    private final List<Contacto> contactos;
    private final OnContactoListener listener;
    private int modo = MODO_LISTA;

    public ContactoAdapter(List<Contacto> contactos, OnContactoListener listener) {
        this.contactos = contactos;
        this.listener = listener;
    }

    // Se cambia el modo y se redibujan todos los elementos con el XML nuevo
    @SuppressLint("NotifyDataSetChanged")
    public void setModo(int modo) {
        this.modo = modo;
        notifyDataSetChanged();
    }

    @Override
    public int getItemViewType(int position) {
        return modo;
    }

    // Se llama solo cuando hace falta un holder nuevo (al inicio, unos cuantos
    // para llenar la pantalla). Despues los holders se reciclan.
    @NonNull
    @Override
    public ContactoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        int layout = (viewType == MODO_LISTA) ? R.layout.item_fila : R.layout.item_tarjeta;
        View vista = LayoutInflater.from(parent.getContext()).inflate(layout, parent, false);

        // En horizontal, match_parent haria que cada tarjeta ocupe toda la pantalla,
        // asi que se le da un ancho fijo de 160dp
        if (viewType == MODO_HORIZONTAL) {
            float densidad = parent.getResources().getDisplayMetrics().density;
            vista.getLayoutParams().width = (int) (160 * densidad);
        }

        return new ContactoViewHolder(vista, listener);
    }

    // Se llama cada vez que un elemento entra a la pantalla al hacer scroll
    @Override
    public void onBindViewHolder(@NonNull ContactoViewHolder holder, int position) {
        holder.bind(contactos.get(position));
    }

    @Override
    public int getItemCount() {
        return contactos.size();
    }
}
