package com.example.ejercicio11clonewhatsapp;

import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Prepara la foto de perfil antes de subirla: la recorta cuadrada, la reduce a 512x512,
 * corrige la rotacion de la camara (EXIF) y la comprime en JPEG. Una foto del telefono
 * puede pesar varios MB; asi queda en unos 50 KB. Se debe llamar fuera del hilo principal.
 */
final class Imagenes {

    private static final int LADO = 512;

    private Imagenes() { }

    static byte[] prepararAvatar(Context context, Uri uri) throws IOException {
        ContentResolver cr = context.getContentResolver();

        // 1. Leer solo el tamano para elegir cuanto reducir al decodificar (ahorra memoria)
        BitmapFactory.Options opciones = new BitmapFactory.Options();
        opciones.inJustDecodeBounds = true;
        try (InputStream in = cr.openInputStream(uri)) {
            BitmapFactory.decodeStream(in, null, opciones);
        }
        int menor = Math.min(opciones.outWidth, opciones.outHeight);
        if (menor <= 0) throw new IOException("No es una imagen valida");
        int muestra = 1;
        while (menor / (muestra * 2) >= LADO) muestra *= 2;

        opciones = new BitmapFactory.Options();
        opciones.inSampleSize = muestra;
        Bitmap original;
        try (InputStream in = cr.openInputStream(uri)) {
            original = BitmapFactory.decodeStream(in, null, opciones);
        }
        if (original == null) throw new IOException("No se pudo leer la imagen");

        // 2. Recorte cuadrado al centro + rotacion + escala a 512
        int lado = Math.min(original.getWidth(), original.getHeight());
        int x = (original.getWidth() - lado) / 2;
        int y = (original.getHeight() - lado) / 2;
        Matrix m = new Matrix();
        float escala = Math.min(1f, (float) LADO / lado);
        m.postScale(escala, escala);
        m.postRotate(rotacion(cr, uri));
        Bitmap cuadrada = Bitmap.createBitmap(original, x, y, lado, lado, m, true);

        // 3. JPEG al 85 %
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        cuadrada.compress(Bitmap.CompressFormat.JPEG, 85, salida);
        if (cuadrada != original) cuadrada.recycle();
        original.recycle();
        return salida.toByteArray();
    }

    private static int rotacion(ContentResolver cr, Uri uri) {
        try (InputStream in = cr.openInputStream(uri)) {
            if (in == null) return 0;
            int o = new ExifInterface(in).getAttributeInt(
                    ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
            switch (o) {
                case ExifInterface.ORIENTATION_ROTATE_90: return 90;
                case ExifInterface.ORIENTATION_ROTATE_180: return 180;
                case ExifInterface.ORIENTATION_ROTATE_270: return 270;
                default: return 0;
            }
        } catch (IOException e) {
            return 0;
        }
    }
}
