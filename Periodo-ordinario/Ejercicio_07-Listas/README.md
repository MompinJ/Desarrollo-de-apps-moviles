# Ejercicio 07 - Listas

## 1. Investigacion: ListView vs RecyclerView

Los dos muestran una lista de elementos que se puede desplazar, y los dos usan un **Adapter** para convertir cada dato en una vista. La diferencia esta en **como reutilizan las vistas** y en **cuanto se puede personalizar**.

### 1.1 ListView

- Existe desde la primera version de Android (`android.widget.ListView`), no necesita dependencias.
- Solo hace **listas verticales**. Para cuadricula existe otro componente aparte (`GridView`).
- Se usa con `ArrayAdapter` (listas sencillas de texto) o con un `BaseAdapter` propio.
- Recicla vistas, pero **a mano**: `getView(position, convertView, parent)` recibe una vista vieja en `convertView` y el programador decide si la reutiliza. Si siempre se infla una nueva, la lista se vuelve lenta.
- El patron ViewHolder es **opcional**: si no se usa, se llama a `findViewById()` en cada elemento cada vez que se hace scroll.
- Tiene `setOnItemClickListener()` integrado.
- Para avisar cambios solo existe `notifyDataSetChanged()`, que redibuja **toda** la lista y sin animaciones.
- Trae divisores (`android:divider`) y encabezados (`addHeaderView`) integrados.

```java
// ListView: la forma mas corta
ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
        android.R.layout.simple_list_item_1, nombres);
listView.setAdapter(adapter);
listView.setOnItemClickListener((parent, view, position, id) -> { ... });
```

### 1.2 RecyclerView

- Esta en la libreria `androidx.recyclerview` (hay que agregar la dependencia). Es la opcion que recomienda Google.
- Separa el trabajo en piezas:
  - **ViewHolder** (obligatorio): guarda las vistas de un elemento.
  - **Adapter**: conecta los datos con los ViewHolders.
  - **LayoutManager**: decide el **posicionamiento** (lista vertical, horizontal, cuadricula, escalonada).
  - **ItemDecoration** (opcional): divisores y espacios.
  - **ItemAnimator** (opcional): animaciones al agregar, borrar o mover.
- Recicla **automaticamente**: solo crea los holders que caben en pantalla (y unos pocos mas). Al hacer scroll, el elemento que sale por arriba se reutiliza para el que entra por abajo.
- **No** trae click integrado; se programa en el ViewHolder.
- Avisos precisos: `notifyItemInserted()`, `notifyItemRemoved()`, `notifyItemChanged()`, `notifyItemMoved()`. Solo se redibuja lo que cambio y se anima.

### 1.3 Diferencias

| | ListView | RecyclerView |
|---|---|---|
| Paquete | `android.widget` (incluido) | `androidx.recyclerview` (dependencia) |
| ViewHolder | Opcional | Obligatorio |
| Reciclado de vistas | Manual con `convertView` | Automatico |
| Posicionamiento | Solo vertical | Vertical, horizontal, cuadricula, escalonado (`LayoutManager`) |
| Clicks | `setOnItemClickListener()` integrado | Se programan en el ViewHolder |
| Avisar cambios | `notifyDataSetChanged()` (todo) | `notifyItemInserted/Removed/Changed()` (solo lo que cambio) |
| Animaciones | No | Si (`ItemAnimator`) |
| Divisores | Integrados | Con `ItemDecoration` |
| Codigo | Menos codigo | Mas codigo, pero mas flexible |
| Rendimiento con listas grandes | Menor | Mayor |

**En resumen:** ListView es mas facil para una lista corta de textos; RecyclerView es mejor para listas grandes, con diseno propio, que cambian o que no son solo verticales.

## 2. Implementacion: lista de contactos con RecyclerView

### Las piezas

| Pieza | Archivo | Que hace |
|-------|---------|----------|
| Modelo | `Contacto.java` | Los datos de un contacto (nombre y telefono) |
| **Holder** | `ContactoViewHolder.java` | Busca las vistas una sola vez (`findViewById`), pone los listeners de click y tiene `bind()` para llenar los datos |
| **Adapter** | `ContactoAdapter.java` | `onCreateViewHolder()` infla el XML, `onBindViewHolder()` llama a `bind()`, `getItemCount()` regresa el tamano de la lista |
| **Layout (posicionamiento)** | `MainActivity.java` | Tres botones cambian el `LayoutManager` |
| Diseno de cada elemento | `item_fila.xml`, `item_tarjeta.xml` | Fila (para lista) y tarjeta (para horizontal y cuadricula) |

### Posicionamiento (LayoutManager)

| Boton | LayoutManager | Resultado |
|-------|---------------|-----------|
| Lista | `new LinearLayoutManager(this)` | Una columna, scroll vertical |
| Horizontal | `new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)` | Una fila, scroll horizontal |
| Cuadricula | `new GridLayoutManager(this, 2)` | Dos columnas |

Los datos y el adapter son los mismos en los tres modos; solo cambia el LayoutManager. El adapter usa `getItemViewType()` para saber que XML inflar (fila o tarjeta), asi el RecyclerView no reutiliza una fila cuando necesita una tarjeta.

### Interaccion

- **Agregar contacto**: lo inserta al inicio con `notifyItemInserted(0)` (se ve la animacion).
- **Tocar** un contacto: Toast con nombre y telefono.
- **Mantener presionado**: lo borra con `notifyItemRemoved(posicion)`.

### Flujo

```
MainActivity
  |-- crea la List<Contacto>
  |-- crea el ContactoAdapter(lista, listener)
  |-- rvContactos.setAdapter(adapter)
  |-- rvContactos.setLayoutManager(...)
          |
RecyclerView pregunta al adapter:
  getItemCount()       -> 20
  onCreateViewHolder() -> solo los que caben en pantalla (unos 8-10)
  onBindViewHolder()   -> cada vez que un elemento entra a la pantalla
```

### Estructura

```
app/src/main/
├── AndroidManifest.xml
├── java/com/example/ejercicio07listas/
│   ├── MainActivity.java         (datos, LayoutManager, clicks)
│   ├── Contacto.java             (modelo)
│   ├── ContactoViewHolder.java   (Holder)
│   └── ContactoAdapter.java      (Adapter)
└── res/
    ├── drawable/fondo_avatar.xml
    ├── layout/
    │   ├── activity_main.xml
    │   ├── item_fila.xml
    │   └── item_tarjeta.xml
    └── values/
        ├── colors.xml
        ├── strings.xml
        └── themes.xml
```
