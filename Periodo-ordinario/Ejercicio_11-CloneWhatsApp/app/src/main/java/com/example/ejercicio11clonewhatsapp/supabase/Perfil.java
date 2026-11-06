package com.example.ejercicio11clonewhatsapp.supabase;

import org.json.JSONObject;

import java.io.Serializable;

/** Una fila de la tabla profiles. Serializable para pasarla entre Activities en un Intent. */
public class Perfil implements Serializable {

    public final String id;
    public final String username;
    public final String nombre;
    public final String avatarUrl;
    public final String createdAt;
    /** Ultima conexion (Fase 8); vacio si nunca se ha registrado. */
    public final String lastSeen;

    public Perfil(String id, String username, String nombre, String avatarUrl, String createdAt,
                  String lastSeen) {
        this.id = id;
        this.username = username;
        this.nombre = nombre;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.lastSeen = lastSeen;
    }

    public static Perfil desdeJson(JSONObject o) {
        return new Perfil(
                o.optString("id"),
                texto(o, "username"),
                texto(o, "nombre"),
                texto(o, "avatar_url"),
                texto(o, "created_at"),
                texto(o, "last_seen"));
    }

    /** Lo que se muestra en pantalla: el nombre si ya lo registro, si no el username. */
    public String nombreVisible() {
        return nombre.isEmpty() ? username : nombre;
    }

    public boolean completo() {
        return !nombre.isEmpty() && !avatarUrl.isEmpty();
    }

    /** optString devuelve "null" (texto) cuando la columna es null; aqui se cambia por "". */
    private static String texto(JSONObject o, String campo) {
        return o.isNull(campo) ? "" : o.optString(campo);
    }
}
