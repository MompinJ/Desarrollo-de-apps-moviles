package com.example.ejercicio11clonewhatsapp.supabase;

import org.json.JSONObject;

/** Una fila de la funcion mis_chats(): conversacion + el otro participante + ultimo mensaje. */
public class Chat {

    public final String conversacionId;
    public final boolean esGrupo;
    public final String nombreGrupo;
    public final String creada;
    public final Perfil otro;
    /** Ultimo mensaje de la conversacion; null si todavia no hay mensajes. */
    public final Mensaje ultimo;
    public final long noLeidos;

    private Chat(String conversacionId, boolean esGrupo, String nombreGrupo, String creada,
                 Perfil otro, Mensaje ultimo, long noLeidos) {
        this.conversacionId = conversacionId;
        this.esGrupo = esGrupo;
        this.nombreGrupo = nombreGrupo;
        this.creada = creada;
        this.otro = otro;
        this.ultimo = ultimo;
        this.noLeidos = noLeidos;
    }

    public static Chat desdeJson(JSONObject o) {
        String conv = Mensaje.texto(o, "conversacion_id");
        Perfil otro = new Perfil(
                Mensaje.texto(o, "otro_id"),
                Mensaje.texto(o, "otro_username"),
                Mensaje.texto(o, "otro_nombre"),
                Mensaje.texto(o, "otro_avatar"),
                "",
                Mensaje.texto(o, "otro_last_seen"));
        Mensaje ultimo = null;
        if (!o.isNull("ultimo_id")) {
            ultimo = new Mensaje(
                    Mensaje.texto(o, "ultimo_id"), conv,
                    Mensaje.texto(o, "ultimo_sender"),
                    Mensaje.texto(o, "ultimo_contenido"),
                    Mensaje.texto(o, "ultimo_fecha"),
                    Mensaje.texto(o, "ultimo_entregado"),
                    Mensaje.texto(o, "ultimo_leido"));
        }
        return new Chat(conv, o.optBoolean("is_group"), Mensaje.texto(o, "name"),
                Mensaje.texto(o, "creada"), otro, ultimo, o.optLong("no_leidos"));
    }

    public String titulo() {
        if (esGrupo && !nombreGrupo.isEmpty()) return nombreGrupo;
        return otro.id.isEmpty() ? "?" : otro.nombreVisible();
    }

    /** Fecha para ordenar y mostrar: la del ultimo mensaje o la de creacion del chat. */
    public String fecha() {
        return ultimo != null ? ultimo.createdAt : creada;
    }
}
