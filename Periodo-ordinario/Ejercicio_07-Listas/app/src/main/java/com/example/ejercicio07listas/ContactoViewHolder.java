package com.example.ejercicio07listas;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

/*
 * HOLDER
 * Guarda las referencias a las vistas de UN elemento de la lista.
 * findViewById() se llama una sola vez aqui, en el constructor. Cuando el
 * RecyclerView recicla este elemento para mostrar otro contacto, solo se
 * llama a bind() con los datos nuevos, sin volver a buscar las vistas.
 */
public class ContactoViewHolder extends RecyclerView.ViewHolder {

    TextView tvAvatar, tvNombre, tvTelefono;

    public ContactoViewHolder(@NonNull View itemView, ContactoAdapter.OnContactoListener listener) {
        super(itemView);
        tvAvatar = itemView.findViewById(R.id.tvAvatar);
        tvNombre = itemView.findViewById(R.id.tvNombre);
        tvTelefono = itemView.findViewById(R.id.tvTelefono);

        // Los listeners tambien se ponen una sola vez. Como el holder se recicla,
        // la posicion se pregunta en el momento del toque con getBindingAdapterPosition()
        itemView.setOnClickListener(v -> {
            int posicion = getBindingAdapterPosition();
            if (posicion != RecyclerView.NO_POSITION) {
                listener.onClick(posicion);
            }
        });

        itemView.setOnLongClickListener(v -> {
            int posicion = getBindingAdapterPosition();
            if (posicion != RecyclerView.NO_POSITION) {
                listener.onLongClick(posicion);
            }
            return true; // true = el evento ya se atendio, no se dispara tambien el click normal
        });
    }

    // Pone los datos de un contacto en las vistas de este elemento
    public void bind(Contacto contacto) {
        tvAvatar.setText(contacto.getInicial());
        tvNombre.setText(contacto.getNombre());
        tvTelefono.setText(contacto.getTelefono());
    }
}
