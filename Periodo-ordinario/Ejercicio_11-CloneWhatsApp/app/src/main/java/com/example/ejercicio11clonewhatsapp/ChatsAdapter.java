package com.example.ejercicio11clonewhatsapp;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ejercicio11clonewhatsapp.supabase.Chat;

import java.util.ArrayList;
import java.util.List;

/** Fase 5: lista de chats con el ultimo mensaje, su hora, su estado y los no leidos. */
class ChatsAdapter extends RecyclerView.Adapter<ChatsAdapter.Fila> {

    interface AlTocar {
        void tocar(Chat chat);
    }

    private final List<Chat> chats = new ArrayList<>();
    private final String miId;
    private final AlTocar alTocar;

    ChatsAdapter(String miId, AlTocar alTocar) {
        this.miId = miId;
        this.alTocar = alTocar;
    }

    @SuppressLint("NotifyDataSetChanged")
    void mostrar(List<Chat> nuevos) {
        chats.clear();
        chats.addAll(nuevos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public Fila onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat, parent, false);
        return new Fila(v);
    }

    @Override
    public void onBindViewHolder(@NonNull Fila f, int posicion) {
        Chat c = chats.get(posicion);
        Context ctx = f.itemView.getContext();

        f.txtNombre.setText(c.titulo());
        Avatar.cargar(f.imgAvatar, c.otro.avatarUrl);
        f.txtFecha.setText(Fechas.paraLista(ctx, Fechas.leer(c.fecha())));

        if (c.ultimo == null) {
            f.txtUltimo.setText(R.string.chats_sin_mensajes);
            f.imgEstado.setVisibility(View.GONE);
        } else {
            f.txtUltimo.setText(c.ultimo.contenido);
            // Mostrar el ultimo mensaje: si es mio, con su palomita de estado
            if (c.ultimo.esMio(miId)) {
                Estados.mostrar(f.imgEstado, c.ultimo.estado());
                f.imgEstado.setVisibility(View.VISIBLE);
            } else {
                f.imgEstado.setVisibility(View.GONE);
            }
        }

        boolean hayNuevos = c.noLeidos > 0;
        f.txtNoLeidos.setVisibility(hayNuevos ? View.VISIBLE : View.GONE);
        f.txtNoLeidos.setText(c.noLeidos > 99 ? "99+" : String.valueOf(c.noLeidos));
        f.txtFecha.setTextColor(ContextCompat.getColor(ctx, hayNuevos ? R.color.verde_claro : R.color.texto_secundario));

        f.itemView.setOnClickListener(v -> alTocar.tocar(c));
    }

    @Override
    public int getItemCount() {
        return chats.size();
    }

    static class Fila extends RecyclerView.ViewHolder {
        final ImageView imgAvatar, imgEstado;
        final TextView txtNombre, txtFecha, txtUltimo, txtNoLeidos;

        Fila(View v) {
            super(v);
            imgAvatar = v.findViewById(R.id.imgAvatar);
            imgEstado = v.findViewById(R.id.imgEstado);
            txtNombre = v.findViewById(R.id.txtNombre);
            txtFecha = v.findViewById(R.id.txtFecha);
            txtUltimo = v.findViewById(R.id.txtUltimo);
            txtNoLeidos = v.findViewById(R.id.txtNoLeidos);
        }
    }
}
