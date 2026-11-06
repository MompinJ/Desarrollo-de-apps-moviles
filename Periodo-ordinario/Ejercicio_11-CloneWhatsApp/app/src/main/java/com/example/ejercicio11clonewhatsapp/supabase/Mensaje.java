package com.example.ejercicio11clonewhatsapp.supabase;

import org.json.JSONObject;

/** Una fila de la tabla messages, mas el estado local mientras se envia. */
public class Mensaje {

    /** Fase 8: estados de un mensaje propio. */
    public enum Estado { ENVIANDO, ERROR, ENVIADO, RECIBIDO, LEIDO }

    public String id;
    public final String conversacionId;
    public final String senderId;
    public final String contenido;
    public String createdAt;
    public String deliveredAt;
    public String readAt;

    /** Solo en el telefono: mensaje mostrado antes de que el servidor confirme. */
    public boolean enviando;
    public boolean error;

    public Mensaje(String id, String conversacionId, String senderId, String contenido,
                   String createdAt, String deliveredAt, String readAt) {
        this.id = id;
        this.conversacionId = conversacionId;
        this.senderId = senderId;
        this.contenido = contenido;
        this.createdAt = createdAt;
        this.deliveredAt = deliveredAt;
        this.readAt = readAt;
    }

    public static Mensaje desdeJson(JSONObject o) {
        return new Mensaje(
                texto(o, "id"),
                texto(o, "conversacion_id"),
                texto(o, "sender_id"),
                texto(o, "content"),
                texto(o, "created_at"),
                texto(o, "delivered_at"),
                texto(o, "read_at"));
    }

    public Estado estado() {
        if (error) return Estado.ERROR;
        if (enviando) return Estado.ENVIANDO;
        if (!readAt.isEmpty()) return Estado.LEIDO;
        if (!deliveredAt.isEmpty()) return Estado.RECIBIDO;
        return Estado.ENVIADO;
    }

    public boolean esMio(String miId) {
        return senderId.equals(miId);
    }

    static String texto(JSONObject o, String campo) {
        return o.isNull(campo) ? "" : o.optString(campo);
    }
}
