package com.example.ejercicio09persistencia;

public class Producto {
    public final long id;
    public final String producto;
    public final String descripcion;
    public final double precio;

    public Producto(long id, String producto, String descripcion, double precio) {
        this.id = id;
        this.producto = producto;
        this.descripcion = descripcion;
        this.precio = precio;
    }
}
