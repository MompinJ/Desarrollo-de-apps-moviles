package com.example.ejercicio11clonewhatsapp;

import android.annotation.SuppressLint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ejercicio11clonewhatsapp.supabase.Mensaje;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Fase 6: burbujas del chat. Dos tipos de vista para diferenciar enviados (derecha, verde,
 * con estado) y recibidos (izquierda, blanca). Antes del primer mensaje de cada dia se
 * muestra la etiqueta del dia.
 */
class MensajesAdapter extends RecyclerView.Adapter<MensajesAdapter.Burbuja> {

    private static final int ENVIADO = 1;
    private static final int RECIBIDO = 2;

    interface AlTocarError {
        void reintentar(Mensaje mensaje);
    }

    private final List<Mensaje> mensajes = new ArrayList<>();
    private final String miId;
    private final AlTocarError alTocarError;

    MensajesAdapter(String miId, AlTocarError alTocarError) {
        this.miId = miId;
        this.alTocarError = alTocarError;
    }

    @Override
    public int getItemViewType(int posicion) {
        return mensajes.get(posicion).esMio(miId) ? ENVIADO : RECIBIDO;
    }

    @NonNull
    @Override
    public Burbuja onCreateViewHolder(@NonNull ViewGroup parent, int tipo) {
        int layout = tipo == ENVIADO ? R.layout.item_mensaje_enviado : R.layout.item_mensaje_recibido;
        return new Burbuja(LayoutInflater.from(parent.getContext()).inflate(layout, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull Burbuja b, int posicion) {
        Mensaje m = mensajes.get(posicion);
        Date fecha = Fechas.leer(m.createdAt);

        b.txtContenido.setText(m.contenido);
        b.txtHora.setText(Fechas.hora(fecha));

        Date anterior = posicion > 0 ? Fechas.leer(mensajes.get(posicion - 1).createdAt) : null;
        boolean nuevoDia = fecha != null && !Fechas.mismoDia(fecha, anterior);
        b.txtDia.setVisibility(nuevoDia ? View.VISIBLE : View.GONE);
        if (nuevoDia) b.txtDia.setText(Fechas.separador(b.itemView.getContext(), fecha));

        if (b.imgEstado != null) {
            Estados.mostrar(b.imgEstado, m.estado());
            b.burbuja.setOnClickListener(m.error ? v -> alTocarError.reintentar(m) : null);
            b.burbuja.setClickable(m.error);
        }
    }

    @Override
    public int getItemCount() {
        return mensajes.size();
    }

    // -----------------------------------------------------------------

    /**
     * Pone el historial. Conserva lo que ya estaba y no viene en el historial (mensajes
     * pendientes de enviar o que llegaron por Realtime mientras cargaba).
     */
    @SuppressLint("NotifyDataSetChanged")
    void cargarHistorial(List<Mensaje> historial) {
        Set<String> ids = new HashSet<>();
        for (Mensaje m : historial) ids.add(m.id);
        List<Mensaje> extra = new ArrayList<>();
        for (Mensaje m : mensajes) if (m.id.isEmpty() || !ids.contains(m.id)) extra.add(m);
        mensajes.clear();
        mensajes.addAll(historial);
        mensajes.addAll(extra);
        notifyDataSetChanged();
    }

    /** Agrega al final y devuelve la posicion. */
    int agregar(Mensaje m) {
        mensajes.add(m);
        notifyItemInserted(mensajes.size() - 1);
        return mensajes.size() - 1;
    }

    boolean contiene(String id) {
        return indiceDe(id) >= 0;
    }

    /** Hay un mensaje mio con ese texto esperando la confirmacion del servidor? */
    boolean hayPendiente(String contenido) {
        for (Mensaje m : mensajes) if (m.enviando && m.contenido.equals(contenido)) return true;
        return false;
    }

    /** El servidor confirmo el mensaje local: se cambia por la fila guardada. */
    void confirmar(Mensaje local, Mensaje guardado) {
        int i = mensajes.indexOf(local);
        if (i < 0) return;
        if (contiene(guardado.id)) {
            mensajes.remove(i);
            notifyItemRemoved(i);
        } else {
            mensajes.set(i, guardado);
            notifyItemChanged(i);
        }
    }

    void refrescar(Mensaje m) {
        int i = mensajes.indexOf(m);
        if (i >= 0) notifyItemChanged(i);
    }

    /** Fase 8: llego un UPDATE con delivered_at / read_at. */
    void actualizarEstado(Mensaje cambio) {
        int i = indiceDe(cambio.id);
        if (i < 0) return;
        Mensaje m = mensajes.get(i);
        m.deliveredAt = cambio.deliveredAt;
        m.readAt = cambio.readAt;
        notifyItemChanged(i);
    }

    private int indiceDe(@Nullable String id) {
        if (id == null || id.isEmpty()) return -1;
        for (int i = 0; i < mensajes.size(); i++) if (id.equals(mensajes.get(i).id)) return i;
        return -1;
    }

    static class Burbuja extends RecyclerView.ViewHolder {
        final View burbuja;
        final TextView txtDia, txtContenido, txtHora;
        @Nullable final ImageView imgEstado; // solo en los enviados

        Burbuja(View v) {
            super(v);
            burbuja = v.findViewById(R.id.burbuja);
            txtDia = v.findViewById(R.id.txtDia);
            txtContenido = v.findViewById(R.id.txtContenido);
            txtHora = v.findViewById(R.id.txtHora);
            imgEstado = v.findViewById(R.id.imgEstado);
        }
    }
}
