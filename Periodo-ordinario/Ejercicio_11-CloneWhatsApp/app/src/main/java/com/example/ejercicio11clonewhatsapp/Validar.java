package com.example.ejercicio11clonewhatsapp;

import android.util.Patterns;
import android.widget.EditText;

import com.google.android.material.textfield.TextInputLayout;

/** Validaciones de los formularios; marcan el error en el TextInputLayout. */
final class Validar {

    private Validar() { }

    static String texto(EditText edt) {
        return edt.getText() == null ? "" : edt.getText().toString().trim();
    }

    static boolean correo(TextInputLayout til, String correo) {
        boolean ok = Patterns.EMAIL_ADDRESS.matcher(correo).matches();
        til.setError(ok ? null : til.getContext().getString(R.string.err_correo));
        return ok;
    }

    static boolean password(TextInputLayout til, String password) {
        boolean ok = password.length() >= 6;
        til.setError(ok ? null : til.getContext().getString(R.string.err_password));
        return ok;
    }

    static boolean iguales(TextInputLayout til, String a, String b) {
        boolean ok = a.equals(b);
        til.setError(ok ? null : til.getContext().getString(R.string.err_no_coinciden));
        return ok;
    }

    static boolean noVacio(TextInputLayout til, String valor, int mensaje) {
        boolean ok = !valor.isEmpty();
        til.setError(ok ? null : til.getContext().getString(mensaje));
        return ok;
    }
}
