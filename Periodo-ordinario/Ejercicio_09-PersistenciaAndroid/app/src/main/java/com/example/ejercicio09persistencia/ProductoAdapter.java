package com.example.ejercicio09persistencia;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductoAdapter extends RecyclerView.Adapter<ProductoAdapter.ViewHolder> {

    public interface Listener {
        void alEditar(Producto producto);

        void alEliminar(Producto producto);
    }

    private final List<Producto> productos = new ArrayList<>();
    private final Listener listener;

    public ProductoAdapter(Listener listener) {
        this.listener = listener;
    }

    public void setProductos(List<Producto> nuevos) {
        productos.clear();
        productos.addAll(nuevos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View vista = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_producto, parent, false);
        return new ViewHolder(vista);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        Producto p = productos.get(position);
        h.nombre.setText(p.producto);
        h.descripcion.setText(p.descripcion);
        h.precio.setText(String.format(Locale.US, "$%.2f", p.precio));
        h.itemView.setOnClickListener(v -> listener.alEditar(p));
        h.eliminar.setOnClickListener(v -> listener.alEliminar(p));
    }

    @Override
    public int getItemCount() {
        return productos.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final TextView nombre, descripcion, precio, eliminar;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            nombre = itemView.findViewById(R.id.txtNombre);
            descripcion = itemView.findViewById(R.id.txtDescripcion);
            precio = itemView.findViewById(R.id.txtPrecio);
            eliminar = itemView.findViewById(R.id.btnEliminarFila);
        }
    }
}
