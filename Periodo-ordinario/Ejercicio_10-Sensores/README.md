# Ejercicio 10 - Sensores y NavDrawer

## 1. Investigacion: uso de sensores en Android

Todos los sensores de movimiento y ambiente se usan con el mismo patron del framework `android.hardware`:

1. Obtener el `SensorManager`: `getSystemService(SENSOR_SERVICE)`.
2. Pedir el sensor con `getDefaultSensor(Sensor.TYPE_xxx)`. Si devuelve `null`, el dispositivo no lo tiene.
3. Implementar `SensorEventListener` (`onSensorChanged` y `onAccuracyChanged`).
4. Registrar el listener en `onResume()` con `registerListener(...)` y quitarlo en `onPause()` con `unregisterListener(...)` para no gastar bateria.

| Sensor | Constante / API | Datos | Permiso |
|--------|-----------------|-------|---------|
| Acelerometro | `TYPE_ACCELEROMETER` | Aceleracion en x, y, z (m/s2), incluye la gravedad | Ninguno |
| Podometro | `TYPE_STEP_COUNTER` (acumulado desde el arranque) o `TYPE_STEP_DETECTOR` (un evento por paso) | Numero de pasos | `ACTIVITY_RECOGNITION` (en tiempo de ejecucion desde Android 10) |
| Giroscopio | `TYPE_GYROSCOPE` | Velocidad angular en x, y, z (rad/s) | Ninguno |
| Camara | Intent `ACTION_IMAGE_CAPTURE` (o la libreria CameraX para control total) | Foto o miniatura | Ninguno con Intent; `CAMERA` si se usa la camara directamente |
| GPS | `LocationManager` con `GPS_PROVIDER` y `requestLocationUpdates(...)` (o `FusedLocationProviderClient` de Google Play Services) | Latitud, longitud, altitud, precision | `ACCESS_FINE_LOCATION` en tiempo de ejecucion |
| Magnetometro | `TYPE_MAGNETIC_FIELD` | Campo magnetico en x, y, z (microteslas) | Ninguno |

Notas:

- El magnetometro solo no da el norte: se combina con el acelerometro (`SensorManager.getRotationMatrix` + `getOrientation`) para obtener el rumbo aunque el telefono este inclinado.
- Los permisos "peligrosos" (ubicacion, actividad fisica) se declaran en el `AndroidManifest.xml` **y** se piden al usuario en ejecucion.
- La frecuencia de muestreo (`SENSOR_DELAY_UI`, `GAME`, `FASTEST`) cambia la fluidez y el consumo.

## 2. Un ejemplo por Activity

| Activity | Que hace |
|----------|----------|
| `AcelerometroActivity` | Muestra X/Y/Z y avisa cuando detecta una sacudida (aceleracion total mayor a 2.5 g) |
| `PodometroActivity` | Cuenta pasos; guarda una base porque `STEP_COUNTER` es acumulado; boton para reiniciar |
| `GiroscopioActivity` | Muestra la velocidad angular en los tres ejes |
| `CamaraActivity` | Abre la camara del sistema con `TakePicturePreview` y muestra la foto |
| `GpsActivity` | Pide el permiso, pide actualizaciones cada segundo y muestra coordenadas y precision |
| `MagnetometroActivity` | Brujula: aguja que gira, grados, punto cardinal y campo en uT |

## 3. NavDrawer

`BaseActivity` define el `DrawerLayout` (`activity_base.xml`) con una `MaterialToolbar` y un `NavigationView` cuyo menu esta en `res/menu/menu_drawer.xml`. Cada Activity de sensor extiende de `BaseActivity` y solo indica su layout de contenido, su item del menu y su titulo. Al elegir una opcion se abre esa Activity y se cierra la actual para no apilarlas.

## 4. SplashScreen animado

Se usa la API de splash de Android con la libreria `androidx.core:core-splashscreen` (funciona tambien antes de Android 12):

- El tema de arranque `Theme.Ejercicio10Sensores.Splash` define fondo azul e icono (`ic_splash.xml`) y, con `postSplashScreenTheme`, cambia al tema normal.
- `InicioActivity` llama a `SplashScreen.installSplashScreen(this)` antes de `super.onCreate()` y usa `setOnExitAnimationListener` para que el icono crezca y se desvanezca antes de mostrar la app.

## Estructura

```
app/src/main/
  AndroidManifest.xml
  java/com/example/ejercicio10sensores/
    BaseActivity.java, InicioActivity.java
    AcelerometroActivity.java, PodometroActivity.java, GiroscopioActivity.java
    CamaraActivity.java, GpsActivity.java, MagnetometroActivity.java
  res/layout/  activity_base.xml, content_*.xml
  res/menu/    menu_drawer.xml
  res/drawable/ ic_splash.xml, ic_menu.xml, ic_flecha.xml
```

Para probarlo conviene usar un telefono fisico: el emulador casi no simula podometro, GPS real ni magnetometro.
