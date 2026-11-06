package com.example.ejercicio11clonewhatsapp;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import com.example.ejercicio11clonewhatsapp.supabase.AuthRepository;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Recibe el deep link clonewhatsapp://auth#access_token=...&refresh_token=...&type=...
 * al que redirige Supabase cuando el usuario abre el enlace del correo.
 * - type=recovery -> pantalla para escribir la nueva contrasena.
 * - type=signup   -> correo confirmado: guarda la sesion y entra.
 * No tiene interfaz (tema NoDisplay): procesa el enlace y se cierra.
 */
public class AuthCallbackActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        procesar(getIntent().getData());
        finish();
    }

    private void procesar(Uri uri) {
        if (uri == null) return;

        // Supabase manda los datos en el fragmento (#...) o, si hay error, a veces en la query (?...)
        String datos = uri.getEncodedFragment() != null ? uri.getEncodedFragment() : uri.getEncodedQuery();
        Uri params = Uri.parse("clonewhatsapp://auth?" + (datos == null ? "" : datos));

        String accessToken = params.getQueryParameter("access_token");
        String error = params.getQueryParameter("error_description");
        if (error != null || accessToken == null) {
            abrir(new Intent(this, LoginActivity.class)
                    .putExtra(LoginActivity.EXTRA_MENSAJE, getString(R.string.enlace_invalido)));
            return;
        }

        JSONObject sesion = new JSONObject();
        try {
            sesion.put("access_token", accessToken);
            sesion.put("refresh_token", params.getQueryParameter("refresh_token"));
            sesion.put("expires_at", parseLong(params.getQueryParameter("expires_at")));
            sesion.put("expires_in", parseLong(params.getQueryParameter("expires_in")));
        } catch (JSONException ignored) { }

        if ("recovery".equals(params.getQueryParameter("type"))) {
            abrir(new Intent(this, NuevaPasswordActivity.class)
                    .putExtra(NuevaPasswordActivity.EXTRA_SESION, sesion.toString()));
        } else {
            AuthRepository.get(this).getSesion().guardar(sesion);
            abrir(new Intent(this, HomeActivity.class)
                    .putExtra(HomeActivity.EXTRA_MENSAJE, getString(R.string.correo_confirmado)));
        }
    }

    private void abrir(Intent i) {
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
    }

    private static long parseLong(String s) {
        try {
            return s == null ? 0 : Long.parseLong(s);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
