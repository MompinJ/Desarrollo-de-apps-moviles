package com.example.ejercicio11clonewhatsapp;

import android.content.res.ColorStateList;
import android.widget.ImageView;

import androidx.core.content.ContextCompat;
import androidx.core.widget.ImageViewCompat;

import com.example.ejercicio11clonewhatsapp.supabase.Mensaje;

/**
 * Fase 8: icono del estado de un mensaje propio, como en WhatsApp.
 * reloj = enviando, una palomita gris = enviado, dos grises = recibido, dos azules = leido.
 */
final class Estados {

    private Estados() { }

    static void mostrar(ImageView icono, Mensaje.Estado estado) {
        int imagen, descripcion;
        boolean azul = false;
        switch (estado) {
            case ENVIANDO:
                imagen = R.drawable.ic_reloj;
                descripcion = R.string.estado_enviando;
                break;
            case ERROR:
                imagen = R.drawable.ic_error;
                descripcion = R.string.estado_error;
                break;
            case RECIBIDO:
                imagen = R.drawable.ic_doble_check;
                descripcion = R.string.estado_recibido;
                break;
            case LEIDO:
                imagen = R.drawable.ic_doble_check;
                descripcion = R.string.estado_leido;
                azul = true;
                break;
            default:
                imagen = R.drawable.ic_check;
                descripcion = R.string.estado_enviado;
        }
        icono.setImageResource(imagen);
        icono.setContentDescription(icono.getContext().getString(descripcion));
        ImageViewCompat.setImageTintList(icono, azul
                ? ColorStateList.valueOf(ContextCompat.getColor(icono.getContext(), R.color.tick_leido))
                : null);
    }
}
