package com.example.ejercicio07listas;

// Modelo: los datos de UN elemento de la lista
public class Contacto {

    private final String nombre;
    private final String telefono;

    public Contacto(String nombre, String telefono) {
        this.nombre = nombre;
        this.telefono = telefono;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    // Primera letra del nombre para el avatar
    public String getInicial() {
        return nombre.substring(0, 1).toUpperCase();
    }
}
