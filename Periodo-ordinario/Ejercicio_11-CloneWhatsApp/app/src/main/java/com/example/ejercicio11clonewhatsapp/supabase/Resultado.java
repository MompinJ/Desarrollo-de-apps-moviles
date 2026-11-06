package com.example.ejercicio11clonewhatsapp.supabase;

/** Respuesta asincrona de una llamada a Supabase. Siempre se invoca en el hilo principal. */
public interface Resultado<T> {
    void ok(T valor);

    void error(String mensaje);
}
