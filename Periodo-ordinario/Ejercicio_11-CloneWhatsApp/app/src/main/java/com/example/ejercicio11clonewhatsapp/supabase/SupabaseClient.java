package com.example.ejercicio11clonewhatsapp.supabase;

import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Conexion HTTP con Supabase usando OkHttp.
 * - Auth (GoTrue):   {URL}/auth/v1/...
 * - Tablas (REST):   {URL}/rest/v1/{tabla}
 * Toda peticion lleva el header "apikey" con la clave publica. Las peticiones de un
 * usuario con sesion llevan ademas "Authorization: Bearer {access_token}" (el JWT),
 * que es lo que usan las politicas RLS para saber quien es auth.uid().
 */
public final class SupabaseClient {

    public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    /** Deep link al que Supabase redirige tras confirmar el correo o recuperar la contrasena. */
    public static final String REDIRECT = "clonewhatsapp://auth";

    private static SupabaseClient instancia;

    private final OkHttpClient http = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .build();
    private final Handler hiloPrincipal = new Handler(Looper.getMainLooper());
    /** Project URL y clave publica (Supabase > Project Settings > API). */
    private final String url = "https://azbyrfczkruskdbkrwcn.supabase.co";
    private final String clave = "sb_publishable_KcER3YV1UhdIOC_Qq8HGcQ_-lUb7D78";

    private SupabaseClient() { }

    public static synchronized SupabaseClient get() {
        if (instancia == null) instancia = new SupabaseClient();
        return instancia;
    }

    public boolean configurado() {
        return !url.isEmpty() && !clave.isEmpty();
    }

    public String getUrl() {
        return url;
    }

    public String getClave() {
        return clave;
    }

    /** Arma una peticion con los headers de Supabase. token = null para peticiones sin sesion. */
    Request.Builder peticion(String ruta, @Nullable String token) {
        Request.Builder b = new Request.Builder()
                .url(url + ruta)
                .header("apikey", clave)
                .header("Content-Type", "application/json");
        if (token != null) b.header("Authorization", "Bearer " + token);
        return b;
    }

    static RequestBody cuerpo(JSONObject json) {
        return RequestBody.create(json.toString(), JSON);
    }

    /** Ejecuta en segundo plano y entrega el texto de la respuesta en el hilo principal. */
    void ejecutar(Request request, Resultado<String> cb) {
        if (!configurado()) {
            cb.error("Falta configurar la URL y la clave de Supabase en SupabaseClient");
            return;
        }
        http.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                hiloPrincipal.post(() -> cb.error("Sin conexion con el servidor"));
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                String texto;
                try (ResponseBody body = response.body()) {
                    texto = body != null ? body.string() : "";
                } catch (IOException e) {
                    texto = "";
                }
                final String respuesta = texto;
                final int codigo = response.code();
                if (response.isSuccessful()) {
                    hiloPrincipal.post(() -> cb.ok(respuesta));
                } else {
                    hiloPrincipal.post(() -> cb.error(mensajeError(codigo, respuesta)));
                }
            }
        });
    }

    /** Convierte el error JSON de Supabase en un mensaje en espanol. */
    static String mensajeError(int codigo, String cuerpo) {
        JSONObject json;
        try {
            json = new JSONObject(cuerpo);
        } catch (Exception e) {
            return "Error del servidor (" + codigo + ")";
        }
        // 23505 = violacion de unique en Postgres (por ejemplo, username repetido)
        if ("23505".equals(json.optString("code"))) return "Ese nombre de usuario ya esta en uso";
        String clave = json.optString("error_code", json.optString("error", ""));
        String texto = json.optString("msg",
                json.optString("error_description", json.optString("message", "")));

        switch (clave) {
            case "invalid_credentials":
            case "invalid_grant":
                if (texto.toLowerCase().contains("not confirmed")) return "Primero confirma tu correo";
                return "Correo o contrasena incorrectos";
            case "email_not_confirmed":
                return "Primero confirma tu correo";
            case "user_already_exists":
            case "email_exists":
                return "Ese correo ya esta registrado";
            case "weak_password":
                return "La contrasena es muy debil (minimo 6 caracteres)";
            case "email_address_invalid":
            case "validation_failed":
                return "El correo no es valido";
            case "over_email_send_rate_limit":
            case "over_request_rate_limit":
                return "Demasiados intentos, espera un momento";
            case "same_password":
                return "La nueva contrasena debe ser distinta a la anterior";
            case "refresh_token_not_found":
            case "refresh_token_already_used":
            case "session_not_found":
            case "bad_jwt":
                return "La sesion expiro, inicia sesion de nuevo";
            default:
                if (codigo == 401) return "La sesion expiro, inicia sesion de nuevo";
                return texto.isEmpty() ? "Error del servidor (" + codigo + ")" : texto;
        }
    }
}
