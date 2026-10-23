# Ejercicio 04 - Fragmentado

## 1. Investigacion: ¿que es un fragmento?

Un **Fragment** es una porcion reutilizable de interfaz de usuario que vive *dentro* de una Activity. Tiene su propio layout, su propia logica y su propio ciclo de vida, pero no puede existir solo: siempre necesita una Activity que lo contenga.

Caracteristicas:

- Una Activity puede mostrar **uno o varios** fragmentos, y cambiarlos en tiempo de ejecucion sin abrir otra Activity.
- Un mismo fragmento se puede **reutilizar** en varias actividades.
- Su ciclo de vida depende del de la Activity (si la Activity se pausa, sus fragmentos tambien).
- Permiten adaptar la interfaz a distintos tamanos de pantalla (por ejemplo, en tablet mostrar lista y detalle lado a lado, y en telefono uno a la vez).

Ciclo de vida principal de un fragmento:

| Metodo | Cuando se llama |
|--------|-----------------|
| `onAttach()` | El fragmento se asocia a la Activity |
| `onCreate()` | Se crea el fragmento (sin vista todavia) |
| `onCreateView()` | Se infla su layout |
| `onViewCreated()` | La vista ya existe: aqui se hacen los `findViewById` y los listeners |
| `onStart()` / `onResume()` | El fragmento es visible / interactivo |
| `onPause()` / `onStop()` | Deja de ser interactivo / visible |
| `onDestroyView()` | Se destruye su vista (por ejemplo, al ser reemplazado) |
| `onDestroy()` / `onDetach()` | Se destruye y se separa de la Activity |

## 2. ¿Que se requiere para implementar un fragmento?

1. **Una clase que herede de `Fragment`** (`androidx.fragment.app.Fragment`). La libreria ya viene incluida con `appcompat`.
2. **Un layout XML** para el fragmento (`res/layout/fragment_xxx.xml`). Se le pasa al constructor: `super(R.layout.fragment_xxx)`, o se infla en `onCreateView()`.
3. **La logica en `onViewCreated()`**: buscar las vistas con `view.findViewById(...)` y asignar listeners. Dentro de un fragmento se usa `requireContext()` en lugar de `this` cuando se necesita un `Context` (por ejemplo, para un `Toast`).
4. **Un contenedor en el layout de la Activity** donde se va a colocar el fragmento, normalmente un `FrameLayout` o `FragmentContainerView` con un `id`.
5. **Una Activity que herede de `AppCompatActivity`** (o `FragmentActivity`) para tener acceso al `FragmentManager`.
6. **Una transaccion con el `FragmentManager`** para agregarlo o cambiarlo:

```java
getSupportFragmentManager().beginTransaction()
        .replace(R.id.contenedor, new ContadorFragment())
        .addToBackStack(null)   // opcional: el boton atras regresa al anterior
        .commit();
```

Los fragmentos **no** se declaran en el `AndroidManifest.xml`; solo la Activity.

## 3. Implementacion

App nativa en Java con **una sola Activity** (`MainActivity`) que tiene tres botones y un `FrameLayout` como contenedor. Cada boton reemplaza el contenido del contenedor con un fragmento diferente.

| Boton | Fragmento | Que hace |
|-------|-----------|----------|
| Inicio | `InicioFragment` | Fragmento sencillo que solo muestra texto (fondo azul) |
| Contador | `ContadorFragment` | Contador con +1 y -1; guarda su valor en `onSaveInstanceState()` para no perderlo al girar el telefono (fondo verde) |
| Saludo | `SaludoFragment` | Lee un nombre de un `EditText` y muestra un saludo; usa `Toast` con `requireContext()` si esta vacio (fondo naranja) |

Detalles:

- Al abrir la app se carga `InicioFragment` solo si `savedInstanceState == null`, para que al girar el telefono no se encime un fragmento nuevo sobre el que el sistema ya restauro.
- Las transacciones usan `addToBackStack(null)`, asi que el boton atras del sistema regresa al fragmento anterior antes de cerrar la app.

### Estructura

```
app/src/main/
├── AndroidManifest.xml          (solo declara MainActivity)
├── java/com/example/ejercicio04fragmentado/
│   ├── MainActivity.java        (3 botones + transacciones del FragmentManager)
│   ├── InicioFragment.java
│   ├── ContadorFragment.java
│   └── SaludoFragment.java
└── res/
    ├── layout/
    │   ├── activity_main.xml    (botones + FrameLayout contenedor)
    │   ├── fragment_inicio.xml
    │   ├── fragment_contador.xml
    │   └── fragment_saludo.xml
    └── values/
        ├── strings.xml
        ├── colors.xml
        └── themes.xml
```
