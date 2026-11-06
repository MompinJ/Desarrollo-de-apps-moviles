package com.example.ejercicio11clonewhatsapp.supabase;

import android.util.Base64;

import org.json.JSONObject;

import java.nio.charset.StandardCharsets;

/**
 * Lee el contenido (payload) de un JWT. Un JWT son tres partes en Base64URL separadas
 * por puntos: header.payload.firma. La firma la valida Supabase en el servidor; la app
 * solo lee los "claims" (sub, email, role, iat, exp) para mostrarlos y saber cuando caduca.
 */
public final class Jwt {

    private Jwt() { }

    public static JSONObject payload(String token) {
        try {
            String[] partes = token.split("\\.");
            if (partes.length < 2) return new JSONObject();
            byte[] json = Base64.decode(partes[1], Base64.URL_SAFE | Base64.NO_PADDING | Base64.NO_WRAP);
            return new JSONObject(new String(json, StandardCharsets.UTF_8));
        } catch (Exception e) {
            return new JSONObject();
        }
    }
}
