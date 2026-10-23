# Ejercicio 05 - VertHorizon

## 1. Investigacion: ciclo de vida de una actividad

Una Activity pasa por varios estados desde que se abre hasta que se cierra. Android avisa cada cambio de estado llamando a un metodo (callback) que se puede sobrescribir.

```
          onCreate()
              |
          onStart()  <-------- onRestart()
              |                     ^
          onResume()                |
              |                     |
     [ ACTIVIDAD EN EJECUCION ]     |
              |                     |
          onPause()                 |
              |                     |
          onStop()  ----------------+  (si el usuario regresa)
              |
          onDestroy()
```

| Metodo | Cuando se llama | Para que se usa |
|--------|-----------------|-----------------|
| `onCreate()` | Se crea la actividad. Se llama **una vez** por cada instancia | `setContentView()`, `findViewById()`, listeners, restaurar el estado guardado |
| `onStart()` | La actividad se vuelve visible | Iniciar lo que solo debe correr mientras se ve la pantalla |
| `onResume()` | La actividad esta al frente y el usuario puede interactuar | Reanudar animaciones, camara, sensores |
| `onPause()` | La actividad pierde el foco (otra pasa al frente, se gira el telefono, se presiona Home) | Pausar lo que consume recursos y guardar cambios rapidos |
| `onStop()` | La actividad ya no es visible | Liberar recursos pesados |
| `onRestart()` | La actividad estaba detenida y vuelve a mostrarse | Antes de `onStart()` |
| `onDestroy()` | La actividad se destruye (`finish()`, boton atras o **cambio de configuracion como girar el telefono**) | Liberar todo lo que quede |

Ademas existe `onSaveInstanceState(Bundle)`, que Android llama antes de destruir la actividad cuando la va a volver a crear (por ejemplo, al girar). Ahi se guardan los datos que se quieren recuperar despues en `onCreate(savedInstanceState)`.

## 2. Mensajes con Log y Toast

En `onCreate()`, `onPause()` y `onDestroy()` se manda un mensaje al **Log** (`Log.d`) y se muestra un **Toast**. Los metodos `onStart()`, `onResume()`, `onStop()` y `onRestart()` solo escriben en el Log, para poder ver la secuencia completa.

Para verlos en Android Studio: abre **Logcat** y filtra por `tag:VertHorizon`.

El Toast de `onDestroy()` usa `getApplicationContext()` y no `this`, porque en ese momento la actividad ya se esta destruyendo.

## 3. Implementacion

Una actividad con:

- Un `EditText` donde se escribe un valor.
- Un boton **Mostrar** que copia el valor a un `TextView`.
- Un texto que indica la orientacion actual (vertical u horizontal).
- Un `CheckBox` **"Conservar el dato al girar"** para comparar el problema contra la solucion sin cambiar el codigo.

## 4. Girar el telefono

### Como probarlo

1. Con el CheckBox **desmarcado**, escribe un valor, presiona **Mostrar** y gira el telefono (en el emulador: botones de rotar de la barra lateral, o `Ctrl + Izquierda/Derecha`). Si el telefono fisico no gira, activa la rotacion automatica.
2. Observa los Toast: `onPause()`, `onDestroy()`, `onCreate()`. El valor del TextView **desaparece**.
3. Marca el CheckBox, presiona **Mostrar** otra vez y gira. Ahora el valor **se conserva**.

Secuencia en Logcat al girar:

```
onPause()
onStop()
onSaveInstanceState(): el dato NO se guardo
onDestroy()
onCreate()
onStart()
onResume()
```

### 4.1 ¿Que problema sucedio con el dato mostrado?

El valor que se mostraba en el `TextView` **se pierde** al girar el telefono.

Girar el telefono es un **cambio de configuracion**. Android **destruye la actividad y la vuelve a crear** desde cero (`onPause()` -> `onStop()` -> `onDestroy()` -> `onCreate()`), para poder cargar recursos distintos para la nueva orientacion. La actividad nueva infla el layout otra vez, asi que el `TextView` vuelve a estar vacio, y cualquier variable de la instancia anterior tambien se pierde.

Dato curioso: el texto del `EditText` **si** se conserva. Android guarda automaticamente el estado de algunas vistas que tienen `id` (como `EditText` y `CheckBox`), pero un `TextView` normal no guarda su texto.

### 4.2 ¿Como se puede resolver?

**Solucion implementada: `onSaveInstanceState()`.** Antes de destruir la actividad se guarda el dato en un `Bundle`, y en `onCreate()` se recupera:

```java
@Override
protected void onSaveInstanceState(@NonNull Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putString("mostrado", tvMostrado.getText().toString());
}

// En onCreate():
if (savedInstanceState != null) {
    tvMostrado.setText(savedInstanceState.getString("mostrado"));
}
```

Otras formas:

| Solucion | Como | Comentario |
|----------|------|------------|
| `android:freezesText="true"` | Atributo del `TextView` en el XML | Lo mas facil para un solo TextView: Android guarda su texto como hace con el EditText |
| `ViewModel` | Guardar el dato en una clase que hereda de `ViewModel` | Recomendado por Google: el ViewModel sobrevive a la rotacion. Es lo mejor para datos mas complejos |
| `android:configChanges="orientation\|screenSize"` | En la Activity del Manifest | Evita que la actividad se recree, pero Google no lo recomienda porque hay que manejar el cambio a mano |
| `android:screenOrientation="portrait"` | En el Manifest | Bloquea la rotacion. No resuelve el problema, solo lo evita |

### Estructura

```
app/src/main/
├── AndroidManifest.xml
├── java/com/example/ejercicio05verthorizon/
│   └── MainActivity.java     (ciclo de vida con Log/Toast + onSaveInstanceState)
└── res/
    ├── layout/activity_main.xml
    └── values/
        ├── strings.xml
        └── themes.xml
```
