package com.example.ejercicio11clonewhatsapp.supabase;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.Nullable;

import org.json.JSONObject;

/**
 * Guarda la sesion JWT en SharedPreferences:
 * - access_token: JWT corto (1 hora por defecto) que se manda en cada peticion.
 * - refresh_token: sirve para pedir un access_token nuevo sin volver a escribir la contrasena.
 * - expires_at: segundos epoch en que caduca el access_token.
 */
public final class Sesion {

    private static final String PREFS = "sesion_supabase";
    /** Se renueva el token un minuto antes de que caduque. */
    private static final long MARGEN_SEGUNDOS = 60;

    private final SharedPreferences prefs;

    public Sesion(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /** Guarda la respuesta de /auth/v1/token (o los datos del deep link). */
    public void guardar(JSONObject r) {
        String access = r.optString("access_token");
        JSONObject claims = Jwt.payload(access);
        long expiraEn = r.optLong("expires_at", 0);
        if (expiraEn == 0) expiraEn = claims.optLong("exp", ahora() + r.optLong("expires_in", 3600));

        JSONObject user = r.optJSONObject("user");
        String id = user != null ? user.optString("id") : claims.optString("sub");
        String email = user != null ? user.optString("email") : claims.optString("email");

        prefs.edit()
                .putString("access_token", access)
                .putString("refresh_token", r.optString("refresh_token"))
                .putLong("expires_at", expiraEn)
                .putString("user_id", id)
                .putString("email", email)
                .apply();
    }

    public void borrar() {
        prefs.edit().clear().apply();
    }

    public boolean activa() {
        return getRefreshToken() != null;
    }

    public boolean expirada() {
        return ahora() >= getExpiraEn() - MARGEN_SEGUNDOS;
    }

    @Nullable
    public String getAccessToken() {
        return vacioANull(prefs.getString("access_token", null));
    }

    @Nullable
    public String getRefreshToken() {
        return vacioANull(prefs.getString("refresh_token", null));
    }

    public long getExpiraEn() {
        return prefs.getLong("expires_at", 0);
    }

    public String getUserId() {
        return prefs.getString("user_id", "");
    }

    public String getEmail() {
        return prefs.getString("email", "");
    }

    public static long ahora() {
        return System.currentTimeMillis() / 1000;
    }

    @Nullable
    private static String vacioANull(@Nullable String s) {
        return s == null || s.isEmpty() ? null : s;
    }
}
