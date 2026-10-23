# Ejercicio 06 - Layouts

## 1. Investigacion

Un **layout** (o `ViewGroup`) es un contenedor invisible que decide **donde y de que tamano** se dibujan las vistas que tiene adentro (sus hijos). Todos heredan de `ViewGroup`, que a su vez hereda de `View`, por eso un layout puede ir dentro de otro.

Atributos que comparten todos:

| Atributo | Significado |
|----------|-------------|
| `layout_width` / `layout_height` | `match_parent` (tan grande como el padre), `wrap_content` (lo justo para su contenido) o un valor fijo en `dp` |
| `padding` | Espacio **dentro** de la vista, entre su borde y su contenido |
| `layout_margin` | Espacio **fuera** de la vista, entre ella y sus vecinos |
| `gravity` | Se pone en el padre (o en un TextView): como acomoda **su contenido** |
| `layout_gravity` | Se pone en el hijo: como se acomoda **el mismo** dentro de su padre |

Los atributos que empiezan con `layout_` son ordenes que el hijo le da a **su padre**, por eso cambian segun el tipo de layout (por ejemplo, `layout_below` solo existe dentro de un RelativeLayout).

### 1.1 LinearLayout (Horizontal y Vertical)

Acomoda a sus hijos **en una sola linea**, uno tras otro.

- `android:orientation="vertical"`: uno debajo de otro (una columna).
- `android:orientation="horizontal"`: uno al lado de otro (una fila).
- `android:layout_weight`: reparte el espacio que sobra en proporcion. Con pesos 1, 2, 1 el total es 4: el primero toma 1/4, el segundo 2/4 y el tercero 1/4. Para que funcione bien, la medida en esa direccion se pone en `0dp`.
- `android:gravity`: alinea a todos los hijos (`start`, `center`, `end`, `center_vertical`...).

**Ventaja:** el mas sencillo de entender. **Desventaja:** para diseños complejos hay que meter LinearLayouts dentro de LinearLayouts, y muchos niveles hacen la app mas lenta.

**Uso tipico:** listas de botones, una fila con icono + texto, pantallas sencillas.

### 1.2 RelativeLayout (Posicionamiento relativo)

Cada hijo se coloca **en relacion al padre o a otro hijo** (al que se refiere por su `id`). Si no se indica nada, todos se enciman en la esquina superior izquierda.

| Relativo al padre | Relativo a otra vista |
|-------------------|-----------------------|
| `layout_alignParentTop / Bottom / Start / End` | `layout_below` / `layout_above` |
| `layout_centerInParent` | `layout_toStartOf` / `layout_toEndOf` |
| `layout_centerHorizontal` / `layout_centerVertical` | `layout_alignTop / Bottom / Start / End` (alinear bordes) |

**Ventaja:** diseños complejos en un solo nivel, sin anidar. **Desventaja:** si se borra o cambia una vista, las que dependian de su id se desacomodan. Hoy Google recomienda `ConstraintLayout`, que es la evolucion de esta idea.

**Uso tipico:** tarjetas (avatar a la izquierda, texto a la derecha, boton al final).

### 1.3 FrameLayout (Superposicion)

Esta pensado para **un solo hijo**, pero si tiene varios **los apila uno encima de otro**: el que se declara **al final en el XML queda arriba**. Para moverlos dentro del marco se usa `layout_gravity` (`top|end`, `bottom`, `center`...).

**Ventaja:** el mas ligero y rapido. **Desventaja:** no sirve para acomodar vistas una junto a otra.

**Uso tipico:** texto encima de una imagen, insignias ("NUEVO", contador de notificaciones), pantallas de carga encima del contenido, y el contenedor donde se cargan los **Fragments** (como en el Ejercicio 04).

### 1.4 TableLayout (Formularios)

Organiza a sus hijos en **filas y columnas**, como una tabla de HTML. Cada `TableRow` es una fila y cada vista dentro de la fila es una columna. El ancho de cada columna es el de su celda mas ancha.

- `android:stretchColumns="1"`: la columna 1 se estira para llenar el espacio sobrante (las columnas empiezan en 0).
- `android:shrinkColumns`: columnas que se pueden encoger si no cabe el contenido.
- `android:collapseColumns`: columnas que se ocultan.
- `android:layout_span="2"`: una celda ocupa dos columnas (como `colspan` en HTML).

Dentro de un `TableRow` no es obligatorio poner `layout_width` ni `layout_height`.

**Ventaja:** alinea etiquetas y campos automaticamente. **Desventaja:** no dibuja bordes de celdas, y no tiene `rowspan`.

**Uso tipico:** formularios (etiqueta + campo), tablas de datos, una calculadora.

### Comparacion rapida

| Layout | Como acomoda | Ejemplo de uso |
|--------|--------------|----------------|
| LinearLayout | En fila o en columna | Menu de botones |
| RelativeLayout | Respecto al padre o a otras vistas | Tarjeta de contacto |
| FrameLayout | Uno encima de otro | Texto sobre imagen, pantalla de carga |
| TableLayout | En filas y columnas | Formulario de registro |

## 2. Implementacion

- **MainActivity**: cuatro botones (dentro de un LinearLayout vertical); cada uno abre su actividad con un `Intent` explicito.
- Las cuatro actividades tienen la flecha de regreso gracias a `android:parentActivityName` en el Manifest.

| Actividad | Ejemplos |
|-----------|----------|
| `LinearLayoutActivity` | 1. Vertical, con un boton que la cambia a horizontal desde Java (`setOrientation`). 2. Horizontal. 3. `layout_weight` 1 : 2 : 1. 4. `gravity` start / center / end |
| `RelativeLayoutActivity` | 1. Cuadros colocados respecto al padre (esquinas, centro) y respecto al cuadro central (`below`, `toStartOf`, `toEndOf`). 2. Tarjeta de contacto real |
| `FrameLayoutActivity` | 1. Tres capas encimadas; un boton usa `bringToFront()` para rotar cual queda arriba. 2. Titulo e insignia encima de una "imagen". 3. Pantalla de carga que aparece y desaparece encima del contenido (`visibility`) |
| `TableLayoutActivity` | 1. Formulario de registro con `stretchColumns` y `layout_span`. 2. Tabla de resultados cuyas filas se crean desde Java (`new TableRow`) |

En `res/values/styles.xml` hay estilos (`Caja`, `CajaTexto`, `Seccion`, `Descripcion`) para no repetir los mismos atributos en cada cuadro de color.

### Estructura

```
app/src/main/
├── AndroidManifest.xml
├── java/com/example/ejercicio06layouts/
│   ├── MainActivity.java            (menu con los 4 botones)
│   ├── LinearLayoutActivity.java
│   ├── RelativeLayoutActivity.java
│   ├── FrameLayoutActivity.java
│   └── TableLayoutActivity.java
└── res/
    ├── layout/
    │   ├── activity_main.xml
    │   ├── activity_linear.xml
    │   ├── activity_relative.xml
    │   ├── activity_frame.xml
    │   └── activity_table.xml
    └── values/
        ├── colors.xml
        ├── strings.xml
        ├── styles.xml
        └── themes.xml
```
