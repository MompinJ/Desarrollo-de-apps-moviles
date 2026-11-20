package com.example.ejercicio09persistencia;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

// Cliente minimo de la API REST (PostgREST) de Supabase. Los metodos son bloqueantes:
// hay que llamarlos fuera del hilo principal.
public class SupabaseClient {

    private static final String URL_BASE = "https://fuegadzsxpqenqcsktfk.supabase.co/rest/v1/Productos";
    private static final String KEY = "sb_publishable_b7noYDlJ2NnTEI0iB_twfg_YCPwQMgP";

    public static List<Producto> consultar() throws IOException, JSONException {
        String cuerpo = enviar("GET", "?select=*&order=id", null);
        JSONArray filas = new JSONArray(cuerpo);
        List<Producto> lista = new ArrayList<>();
        for (int i = 0; i < filas.length(); i++) {
            JSONObject f = filas.getJSONObject(i);
            lista.add(new Producto(
                    f.getLong("id"),
                    f.getString("producto"),
                    f.optString("descripcion", ""),
                    f.getDouble("precio")));
        }
        return lista;
    }

    public static void agregar(String producto, String descripcion, double precio)
            throws IOException, JSONException {
        enviar("POST", "", datos(producto, descripcion, precio));
    }

    public static void actualizar(long id, String producto, String descripcion, double precio)
            throws IOException, JSONException {
        enviar("PATCH", "?id=eq." + id, datos(producto, descripcion, precio));
    }

    public static void eliminar(long id) throws IOException {
        enviar("DELETE", "?id=eq." + id, null);
    }

    private static JSONObject datos(String producto, String descripcion, double precio)
            throws JSONException {
        return new JSONObject()
                .put("producto", producto)
                .put("descripcion", descripcion)
                .put("precio", precio);
    }

    private static String enviar(String metodo, String consulta, JSONObject json)
            throws IOException {
        HttpURLConnection con = (HttpURLConnection) new URL(URL_BASE + consulta).openConnection();
        try {
            con.setRequestMethod(metodo);
            con.setConnectTimeout(10000);
            con.setReadTimeout(10000);
            con.setRequestProperty("apikey", KEY);
            con.setRequestProperty("Content-Type", "application/json");
            if (json != null) {
                con.setDoOutput(true);
                try (OutputStream os = con.getOutputStream()) {
                    os.write(json.toString().getBytes(StandardCharsets.UTF_8));
                }
            }
            int codigo = con.getResponseCode();
            if (codigo >= 400) {
                throw new IOException("HTTP " + codigo + ": " + leer(con.getErrorStream()));
            }
            return leer(con.getInputStream());
        } finally {
            con.disconnect();
        }
    }

    private static String leer(InputStream in) throws IOException {
        if (in == null) return "";
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) sb.append(linea);
        }
        return sb.toString();
    }
}
