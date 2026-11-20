package com.example.ejercicio10sensores;

import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

public class CamaraActivity extends BaseActivity {

    private ImageView imgFoto;
    private TextView txtVacia;

    // Delega la captura a la app de camara del sistema, por eso no hace falta el permiso CAMERA
    private final ActivityResultLauncher<Void> tomarFoto =
            registerForActivityResult(new ActivityResultContracts.TakePicturePreview(), (Bitmap foto) -> {
                if (foto != null) {
                    imgFoto.setImageBitmap(foto);
                    txtVacia.setVisibility(View.GONE);
                }
            });

    @Override
    protected int layoutContenido() { return R.layout.content_camara; }

    @Override
    protected int itemMenu() { return R.id.nav_camara; }

    @Override
    protected int titulo() { return R.string.menu_camara; }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        imgFoto = findViewById(R.id.imgFoto);
        txtVacia = findViewById(R.id.txtVacia);

        findViewById(R.id.btnTomar).setOnClickListener(v -> {
            try {
                tomarFoto.launch(null);
            } catch (Exception e) {
                Toast.makeText(this, R.string.camara_error, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
