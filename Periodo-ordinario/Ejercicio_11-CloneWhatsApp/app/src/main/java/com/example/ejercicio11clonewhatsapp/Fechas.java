package com.example.ejercicio11clonewhatsapp;

import android.content.Context;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Supabase guarda timestamptz en UTC y lo manda como texto ISO 8601
 * ("2026-11-04T02:28:50.123456+00:00"). Aqui se convierte a Date y se formatea en la
 * hora local del telefono, al estilo de WhatsApp (hoy: hora, ayer, dia de la semana...).
 */
final class Fechas {

    private Fechas() { }

    /** Devuelve null si el texto esta vacio o no se puede leer. */
    static Date leer(String iso) {
        if (iso == null || iso.length() < 19) return null;
        try {
            SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
            f.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date base = f.parse(iso.substring(0, 19).replace(' ', 'T'));
            if (base == null) return null;

            // Milisegundos y zona horaria despues de los segundos: .123456+00:00 / Z / -06
            String resto = iso.substring(19);
            long ms = 0;
            int i = 0;
            if (resto.startsWith(".")) {
                i = 1;
                StringBuilder fraccion = new StringBuilder();
                while (i < resto.length() && Character.isDigit(resto.charAt(i))) fraccion.append(resto.charAt(i++));
                String tres = (fraccion + "000").substring(0, 3);
                ms = Long.parseLong(tres);
            }
            long desfase = 0;
            String zona = resto.substring(i);
            if (zona.startsWith("+") || zona.startsWith("-")) {
                String[] p = zona.substring(1).split(":");
                int horas = Integer.parseInt(p[0].substring(0, Math.min(2, p[0].length())));
                int minutos = p.length > 1 ? Integer.parseInt(p[1]) : 0;
                desfase = (horas * 60L + minutos) * 60_000L * (zona.startsWith("-") ? -1 : 1);
            }
            return new Date(base.getTime() + ms - desfase);
        } catch (Exception e) {
            return null;
        }
    }

    static String ahoraIso() {
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'+00:00'", Locale.US);
        f.setTimeZone(TimeZone.getTimeZone("UTC"));
        return f.format(new Date());
    }

    static String hora(Date d) {
        return d == null ? "" : new SimpleDateFormat("HH:mm", Locale.getDefault()).format(d);
    }

    /** Lista de chats: hoy -> 14:05, ayer -> Ayer, esta semana -> lunes, antes -> 03/11/26. */
    static String paraLista(Context c, Date d) {
        if (d == null) return "";
        int dias = diasAtras(d);
        if (dias == 0) return hora(d);
        if (dias == 1) return c.getString(R.string.fecha_ayer);
        if (dias < 7) return new SimpleDateFormat("EEEE", Locale.getDefault()).format(d);
        return new SimpleDateFormat("dd/MM/yy", Locale.getDefault()).format(d);
    }

    /** Separador de dia dentro del chat: Hoy, Ayer o 3 de noviembre de 2026. */
    static String separador(Context c, Date d) {
        if (d == null) return "";
        int dias = diasAtras(d);
        if (dias == 0) return c.getString(R.string.fecha_hoy);
        if (dias == 1) return c.getString(R.string.fecha_ayer);
        return new SimpleDateFormat("d 'de' MMMM 'de' yyyy", Locale.getDefault()).format(d);
    }

    /** Fase 8: "ult. vez hoy a las 20:15". */
    static String ultimaConexion(Context c, Date d) {
        if (d == null) return "";
        int dias = diasAtras(d);
        if (dias == 0) return c.getString(R.string.chat_ult_vez_hoy, hora(d));
        if (dias == 1) return c.getString(R.string.chat_ult_vez_ayer, hora(d));
        String dia = new SimpleDateFormat("dd/MM/yy", Locale.getDefault()).format(d);
        return c.getString(R.string.chat_ult_vez_fecha, dia, hora(d));
    }

    static boolean mismoDia(Date a, Date b) {
        if (a == null || b == null) return false;
        Calendar x = Calendar.getInstance();
        x.setTime(a);
        Calendar y = Calendar.getInstance();
        y.setTime(b);
        return x.get(Calendar.YEAR) == y.get(Calendar.YEAR)
                && x.get(Calendar.DAY_OF_YEAR) == y.get(Calendar.DAY_OF_YEAR);
    }

    /** Dias de calendario entre la fecha y hoy (0 = hoy). */
    private static int diasAtras(Date d) {
        Calendar hoy = inicioDelDia(new Date());
        Calendar dia = inicioDelDia(d);
        return (int) Math.round((hoy.getTimeInMillis() - dia.getTimeInMillis()) / 86_400_000.0);
    }

    private static Calendar inicioDelDia(Date d) {
        Calendar c = Calendar.getInstance();
        c.setTime(d);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c;
    }
}
