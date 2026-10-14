# Ejercicio 03 - DemoIntent

## 1. Investigacion

### Intent

Un **Intent** es un objeto de mensajeria que se usa para pedirle una accion a otro componente de Android (una Activity, un Service o un BroadcastReceiver). Es el mecanismo con el que una pantalla abre otra.

Usos principales:

- **Iniciar una Activity**: `startActivity(intent)`.
- **Iniciar un Service**: `startService(intent)`.
- **Enviar un broadcast**: `sendBroadcast(intent)`.

Tipos de Intent:

| Tipo | Que indica | Ejemplo |
|------|------------|---------|
| **Explicito** | El componente exacto (la clase) que se quiere abrir. Se usa dentro de la misma app. | `new Intent(this, SaludoActivity.class)` |
| **Implicito** | Solo una *accion* (y opcionalmente datos); Android busca que app puede atenderla. | `new Intent(Intent.ACTION_VIEW, Uri.parse("https://google.com"))` |

Toda Activity que se abra con un Intent debe estar declarada en el `AndroidManifest.xml`.

### Extra

Un **Extra** es un dato adicional que viaja dentro del Intent en forma de pares **llave-valor**. Sirve para pasar informacion de una Activity a otra.

- Se **envian** con `intent.putExtra("llave", valor)` (acepta String, int, double, boolean, arreglos, Parcelable, Serializable, etc.) o agrupados en un `Bundle` con `intent.putExtras(bundle)`.
- Se **reciben** en la Activity destino con `getIntent().getStringExtra("llave")`, `getIntExtra("llave", valorPorDefecto)`, `getIntent().getExtras()`, etc.
- Tambien se pueden **regresar** datos a la Activity anterior: la Activity destino arma un Intent con Extras y llama a `setResult(RESULT_OK, intent)`; la Activity origen lo recibe con `registerForActivityResult(...)`.

Buena practica: guardar las llaves en constantes (`public static final String EXTRA_NOMBRE = "extra_nombre"`) para no equivocarse al escribirlas en ambas actividades.

## 2. Implementacion

App nativa en Java con una actividad principal y tres actividades secundarias.

**MainActivity**: el usuario escribe su nombre y un numero, y tiene 3 botones.

| Boton | Activity | Extras que recibe | Funcionalidad | Extra de regreso |
|-------|----------|-------------------|---------------|------------------|
| Saludo | `SaludoActivity` | `nombre` (String), `numero` (int) | Saluda segun la hora del dia, cuenta las letras del nombre y dice si el numero es par o impar | - |
| Contador | `ContadorActivity` | `nombre` (String), `numero` (int) | Contador que inicia en el numero recibido, con +1, -1 y reiniciar | `resultado` (int), se muestra en la pantalla principal |
| Conversor | `ConversorActivity` | `celsius` (double, enviado en un Bundle) | Convierte de Celsius a Fahrenheit y Kelvin e indica el estado del agua | - |

Cada actividad secundaria tiene un boton **Regresar** que llama a `finish()` para volver a la principal.

### Estructura

```
app/src/main/
├── AndroidManifest.xml          (declara las 4 actividades)
├── java/com/example/ejercicio03demointent/
│   ├── MainActivity.java        (envia Extras y recibe el resultado del contador)
│   ├── SaludoActivity.java
│   ├── ContadorActivity.java
│   └── ConversorActivity.java
└── res/layout/
    ├── activity_main.xml
    ├── activity_saludo.xml
    ├── activity_contador.xml
    └── activity_conversor.xml
```
