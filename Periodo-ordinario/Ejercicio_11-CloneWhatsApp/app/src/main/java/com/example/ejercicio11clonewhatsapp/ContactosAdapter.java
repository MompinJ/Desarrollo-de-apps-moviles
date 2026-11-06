package com.example.ejercicio11clonewhatsapp;

import android.annotation.SuppressLint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ejercicio11clonewhatsapp.supabase.Perfil;

import java.util.ArrayList;
import java.util.List;

/**
 * Adaptador del RecyclerView de contactos. El RecyclerView solo crea las filas que caben
 * en pantalla (ViewHolder) y las recicla al hacer scroll, cambiando sus datos en onBind.
 */
class ContactosAdapter extends RecyclerView.Adapter<ContactosAdapter.Fila> {

    interface AlElegir {
        void elegir(Perfil contacto);
    }

    private final List<Perfil> contactos = new ArrayList<>();
    private final AlElegir alElegir;

    ContactosAdapter(AlElegir alElegir) {
        this.alElegir = alElegir;
    }

    @SuppressLint("NotifyDataSetChanged")
    void mostrar(List<Perfil> nuevos) {
        contactos.clear();
        contactos.addAll(nuevos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public Fila onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_contacto, parent, false);
        return new Fila(v);
    }

    @Override
    public void onBindViewHolder(@NonNull Fila fila, int posicion) {
        Perfil p = contactos.get(posicion);
        fila.txtNombre.setText(p.nombreVisible());
        fila.txtUsername.setText("@" + p.username);
        Avatar.cargar(fila.imgAvatar, p.avatarUrl);
        fila.itemView.setOnClickListener(v -> alElegir.elegir(p));
    }

    @Override
    public int getItemCount() {
        return contactos.size();
    }

    static class Fila extends RecyclerView.ViewHolder {
        final ImageView imgAvatar;
        final TextView txtNombre, txtUsername;

        Fila(View v) {
            super(v);
            imgAvatar = v.findViewById(R.id.imgAvatar);
            txtNombre = v.findViewById(R.id.txtNombre);
            txtUsername = v.findViewById(R.id.txtUsername);
        }
    }
}
