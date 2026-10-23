package com.example.ejercicio06layouts;

import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class LinearLayoutActivity extends AppCompatActivity {

    LinearLayout llDemo;
    Button btnCambiar;
    TextView tvOrientacion;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_linear);

        llDemo = findViewById(R.id.llDemo);
        btnCambiar = findViewById(R.id.btnCambiar);
        tvOrientacion = findViewById(R.id.tvOrientacion);

        // La orientacion tambien se puede cambiar desde Java con setOrientation()
        btnCambiar.setOnClickListener(v -> {
            if (llDemo.getOrientation() == LinearLayout.VERTICAL) {
                llDemo.setOrientation(LinearLayout.HORIZONTAL);
                tvOrientacion.setText(R.string.linear_es_horizontal);
            } else {
                llDemo.setOrientation(LinearLayout.VERTICAL);
                tvOrientacion.setText(R.string.linear_es_vertical);
            }
        });
    }
}
