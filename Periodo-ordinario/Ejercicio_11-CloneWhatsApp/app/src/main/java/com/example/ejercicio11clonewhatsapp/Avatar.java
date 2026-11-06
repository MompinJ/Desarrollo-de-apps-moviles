package com.example.ejercicio11clonewhatsapp;

import android.net.Uri;
import android.widget.ImageView;

import com.bumptech.glide.Glide;

/** Carga fotos de perfil redondas con Glide; sin foto muestra el icono de persona. */
final class Avatar {

    private Avatar() { }

    static void cargar(ImageView destino, String url) {
        Glide.with(destino)
                .load(url == null || url.isEmpty() ? null : url)
                .placeholder(R.drawable.avatar_placeholder)
                .error(R.drawable.avatar_placeholder)
                .fallback(R.drawable.avatar_placeholder)
                .circleCrop()
                .into(destino);
    }

    static void cargar(ImageView destino, Uri local) {
        Glide.with(destino)
                .load(local)
                .placeholder(R.drawable.avatar_placeholder)
                .circleCrop()
                .into(destino);
    }
}
