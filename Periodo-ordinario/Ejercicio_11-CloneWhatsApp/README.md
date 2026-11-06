# Ejercicio 11 - CloneWhatsApp (Android Studio + Supabase)

App de mensajeria tipo WhatsApp en **Java + XML** con **Supabase** como backend. Cubre las 8 fases: entorno, base de datos, autenticacion, perfiles/contactos, conversaciones, envio de mensajes, tiempo real y estados de mensajes.

## Fase 1: Entorno

1. **Proyecto Android Studio**: Empty Views Activity, lenguaje Java, minSdk 24, layouts en XML.
2. **Proyecto en Supabase**: [supabase.com](https://supabase.com) > New project.
3. **URL y clave publica**: en Supabase > Project Settings > API (o "Connect") se copian la *Project URL* y la clave publica (*publishable key*). Estan en `supabase/SupabaseClient.java`:

   ```java
   private final String url = "https://azbyrfczkruskdbkrwcn.supabase.co";
   private final String clave = "sb_publishable_KcER3YV1UhdIOC_Qq8HGcQ_-lUb7D78";
   ```

   La clave publica se puede tener en la app: lo que protege los datos son las politicas RLS de la base de datos.
4. **Internet y dependencia**:
   - `AndroidManifest.xml`: permisos `INTERNET` y `ACCESS_NETWORK_STATE`.
   - `gradle/libs.versions.toml` + `app/build.gradle.kts`: dependencia `com.squareup.okhttp3:okhttp:4.12.0`. La libreria oficial de Supabase para Android es solo para Kotlin, asi que desde Java se usa su API REST con OkHttp; el JSON se maneja con `org.json`, que ya viene en Android.

## Fase 2: Diseno de la base de datos

El script completo esta en [`supabase/schema.sql`](supabase/schema.sql). Se pega en Supabase > SQL Editor > Run.

```
auth.users (Supabase)
    | 1:1
profiles ----< devices
    |
    +----< conversaciones_members >---- conversaciones
    |                                        |
    +----< messages >------------------------+
```

| Tabla | Columnas | Llave primaria | Llaves foraneas |
|-------|----------|----------------|-----------------|
| `profiles` | `id, username, nombre, avatar_url, last_seen, created_at` | `id` | `id -> auth.users.id` |
| `devices` | `id, profile_id, device_token, created_at` | `id` | `profile_id -> profiles.id` |
| `conversaciones` | `id, name, is_group, created_at` | `id` | - |
| `conversaciones_members` | `conversacion_id, profile_id, joined_at` | `(conversacion_id, profile_id)` | `conversacion_id -> conversaciones.id`, `profile_id -> profiles.id` |
| `messages` | `id, conversacion_id, sender_id, content, created_at, delivered_at, read_at` | `id` | `conversacion_id -> conversaciones.id`, `sender_id -> profiles.id` |

Ademas el script crea:

- **Trigger `crear_perfil`**: al registrarse un usuario se inserta su fila en `profiles` con el `username` que manda la app (si esta ocupado le agrega un sufijo). Si el trigger no existe, la app crea el perfil la primera vez que entra.
- **Row Level Security** en todas las tablas: cada usuario solo lee/escribe sus dispositivos, las conversaciones donde es miembro y sus propios mensajes. La funcion `es_miembro()` es `security definer` para evitar recursion infinita en las politicas.
- **Realtime** activado en `messages` para las fases siguientes.

## Fase 3: Autenticacion

Todo esta en `supabase/AuthRepository.java`, contra los endpoints REST de Supabase Auth:

| Funcion | Endpoint | Pantalla |
|---------|----------|----------|
| Registro con correo y contrasena | `POST /auth/v1/signup` (manda `data.username` para el perfil) | `RegistroActivity` |
| Inicio de sesion | `POST /auth/v1/token?grant_type=password` | `LoginActivity` |
| Cierre de sesion | `DELETE` de su fila en `devices` + `POST /auth/v1/logout?scope=local` | `HomeActivity` |
| Recuperacion de contrasena | `POST /auth/v1/recover` y luego `PUT /auth/v1/user` con la nueva | `RecuperarActivity` -> correo -> `NuevaPasswordActivity` |
| Manejo de sesion JWT | `POST /auth/v1/token?grant_type=refresh_token` | Automatico + boton "Renovar token" |

### Como se maneja el JWT

- Al iniciar sesion Supabase responde un `access_token` (JWT, dura 1 hora), un `refresh_token` y `expires_at`. `Sesion.java` los guarda en `SharedPreferences`.
- Cada peticion a las tablas lleva `apikey: <clave publica>` y `Authorization: Bearer <access_token>`. Con ese JWT Postgres sabe quien es `auth.uid()` y aplica las politicas RLS.
- Antes de cada peticion, `AuthRepository.obtenerToken()` revisa si el token caduca en menos de 60 s; si es asi lo renueva con el `refresh_token` (Supabase lo rota en cada uso). Si varias peticiones piden token a la vez, solo se hace una renovacion y las demas esperan.
- Si el `refresh_token` ya no es valido (se cerro la sesion o se revoco), se borra la sesion local y se regresa al login.
- `InicioActivity` usa la sesion guardada para entrar directo sin pedir la contrasena otra vez.
- `Jwt.java` decodifica el payload (Base64URL) para mostrar en Home el `sub`, el `role`, la hora de emision, la de expiracion y una cuenta regresiva.

### Enlaces de los correos (confirmar cuenta y recuperar contrasena)

La app manda `redirect_to=clonewhatsapp://auth`. Al abrir el enlace del correo **en el telefono**, Supabase redirige a ese deep link con los tokens en el fragmento (`#access_token=...&type=recovery`). `AuthCallbackActivity` lo recibe:

- `type=recovery`: abre `NuevaPasswordActivity`, que guarda la nueva contrasena con ese token.
- `type=signup`: el correo quedo confirmado; guarda la sesion y entra a Home.

Para que Supabase acepte la redireccion hay que agregarla en **Authentication > URL Configuration > Redirect URLs**: `clonewhatsapp://auth`.

> Para hacer pruebas rapidas se puede desactivar la confirmacion en **Authentication > Sign In / Providers > Email > Confirm email**: el registro entra directo. El servidor de correo gratuito de Supabase solo manda unos cuantos correos por hora.

## Fase 4: Perfiles y contactos

Antes hay que volver a correr `supabase/schema.sql` (o solo su ultima seccion, "Fase 4"): agrega la columna `profiles.nombre` y crea el bucket publico `avatars` en Supabase Storage con sus politicas (cada usuario solo puede escribir en su carpeta `avatars/{su id}/`).

| Requisito | Como se hizo |
|-----------|--------------|
| Registrar nombre y fotografia | `PerfilActivity`: la foto se elige con el *Photo Picker* del sistema (`PickVisualMedia`, no pide permisos). `Imagenes.java` la recorta cuadrada, corrige la rotacion EXIF y la reduce a 512x512 JPEG en un hilo aparte. Se sube a Storage (`POST /storage/v1/object/avatars/{id}/avatar.jpg` con `x-upsert`) y la URL publica se guarda con `PATCH /rest/v1/profiles` junto con el nombre y el username |
| Consultar usuarios | `DatosRepository.buscarUsuarios()`: `GET /rest/v1/profiles?id=neq.{yo}&order=nombre.asc.nullslast,username.asc` |
| Mostrar contactos mediante RecyclerView | `ContactosActivity` + `ContactosAdapter` (ViewHolder `Fila`) + `item_contacto.xml`, con `LinearLayoutManager` y divisores. Las fotos se cargan redondas con Glide (`Avatar.java`) |
| Buscar usuarios | Campo de busqueda con espera de 350 ms tras la ultima tecla; filtra en el servidor con `or=(username.ilike.*texto*,nombre.ilike.*texto*)` y descarta respuestas de busquedas viejas |
| Seleccionar destinatario | Al tocar un contacto, `ContactosActivity` lo regresa con `setResult` (el `Perfil` es `Serializable`). Home lo recibe con `registerForActivityResult` y abre (o crea) el chat con ese destinatario |

La edicion del perfil se abre desde menu > Mi perfil o tocando la tarjeta en menu > Cuenta y sesion (ahi aparece "Toca para agregar tu nombre y foto" si falta alguno). El boton flotante de la lista de chats abre Contactos.

## Fase 5: Conversaciones

Las operaciones que necesitan varias consultas juntas son funciones SQL (`security definer`) que la app llama por RPC: `POST /rest/v1/rpc/{funcion}`.

| Requisito | Como se hizo |
|-----------|--------------|
| Crear conversaciones individuales | `crear_conversacion_directa(otro)`: busca si ya hay un chat (no grupo) con los dos como miembros; si no, inserta la conversacion y sus 2 filas en `conversaciones_members`. Un `pg_advisory_xact_lock` por pareja evita duplicados si ambos lo crean a la vez |
| Identificar participantes | `participantes(conv)`: perfiles de los miembros (solo si quien pregunta es miembro). `ChatActivity` toma al otro para la cabecera |
| Consultar conversaciones existentes | `mis_chats()`: mis conversaciones con el otro participante, el ultimo mensaje y el numero de no leidos, ordenadas por fecha |
| Mostrar lista de chats | `HomeActivity` (ahora la pantalla principal) + `ChatsAdapter` + `item_chat.xml` |
| Mostrar ultimo mensaje | Cada fila muestra el texto del ultimo mensaje, su hora (hoy: hora, ayer, dia de la semana o fecha), la palomita de estado si es mio y un globo verde con los no leidos |

La pantalla anterior de sesion (perfil, JWT y dispositivo) quedo en menu > Cuenta y sesion (`CuentaActivity`).

## Fase 6: Envio de mensajes

| Requisito | Como se hizo |
|-----------|--------------|
| Crear interfaz del chat | `ChatActivity` + `activity_chat.xml`: cabecera con foto, nombre y estado; `RecyclerView` con `stackFromEnd`; caja de texto redondeada y boton de enviar. `adjustResize` para que el teclado no tape los mensajes |
| Disenar burbujas de mensajes | `item_mensaje_enviado.xml` (derecha, verde) e `item_mensaje_recibido.xml` (izquierda, blanca), fondos `bg_burbuja_*.xml`, hora dentro de la burbuja y etiqueta del dia (Hoy, Ayer, fecha) |
| Insertar mensajes en la base de datos | `POST /rest/v1/messages` con `Prefer: return=representation`. El mensaje aparece al instante con un reloj y se cambia por la fila del servidor al confirmarse; si falla queda con icono rojo y se reintenta al tocarlo |
| Consultar historial | `GET /rest/v1/messages?conversacion_id=eq.{id}&order=created_at.desc&limit=200` (se invierte para mostrar del mas viejo al mas nuevo) |
| Diferenciar enviados y recibidos | `MensajesAdapter.getItemViewType()`: si `sender_id` es mi id usa el layout de enviado, si no el de recibido |

## Fase 7: Comunicacion en tiempo real

Supabase no tiene libreria de Realtime para Java, asi que `supabase/RealtimeClient.java` implementa su protocolo (Phoenix Channels) con el `WebSocket` de OkHttp:

| Requisito | Como se hizo |
|-----------|--------------|
| Configurar Supabase Realtime | La tabla `messages` esta en la publicacion `supabase_realtime` (`schema.sql`). La app se conecta a `wss://{proyecto}.supabase.co/realtime/v1/websocket?apikey=...&vsn=1.0.0`, manda un *heartbeat* cada 25 s, envia el JWT al unirse a cada canal (y el nuevo cuando se renueva, para que RLS siga aplicando) y se reconecta sola con espera creciente si se cae la red |
| Suscribirse a cambios en messages | `ChatActivity` se une al canal `chat-{id}` con `postgres_changes` de `INSERT` y `UPDATE` filtrados por `conversacion_id=eq.{id}`. Ademas `CloneApp` mantiene el canal `bandeja` (todos mis mensajes; RLS filtra) para refrescar la lista de chats |
| Detectar mensajes nuevos | Evento `postgres_changes` tipo `INSERT`: se lee `payload.data.record` y se convierte a `Mensaje`. Se descartan duplicados (por id, o mi propio mensaje que ya se mostraba con el reloj) |
| Actualizar RecyclerView | `adapter.agregar()` -> `notifyItemInserted`, y scroll al final si el usuario ya estaba abajo. La lista de chats se recarga (agrupando eventos seguidos) |
| Probar entre dos dispositivos | Ver "Como probar" |

## Fase 8: Estados de mensajes

| Estado | Como se hizo |
|--------|--------------|
| Enviado | La fila existe en `messages`: una palomita gris. Mientras se envia, un reloj |
| Recibido | Columna `delivered_at`. El telefono del destinatario llama `marcar_entregados()` al abrir la app y cada vez que el canal `bandeja` le avisa de un mensaje nuevo (aunque este en otra pantalla): dos palomitas grises |
| Leido | Columna `read_at`. Al tener el chat abierto se llama `marcar_leidos(conv)`: dos palomitas azules. Quien envio ve el cambio al instante porque recibe el `UPDATE` por Realtime |
| Ultima conexion | Columna `profiles.last_seen`, que se actualiza con `actualizar_ultima_conexion()` al abrir la app, al pasar a segundo plano y al cerrar sesion. "En linea" usa **Presence**: `CloneApp` se une al canal `en-linea` y publica su id (`track`); el servidor avisa con `presence_state`/`presence_diff` quien entra y sale. La cabecera del chat muestra "en linea" o "ult. vez hoy a las 20:15" |
| Indicador de escritura | **Broadcast** en el canal del chat: mientras se teclea se manda `escribiendo` como maximo cada 2 s; el otro muestra "escribiendo..." durante 3.5 s o hasta que llega el mensaje. No se guarda en la base de datos |

`CloneApp` (la clase `Application`) cuenta las pantallas visibles para saber si la app esta en primer plano: ahi conecta Realtime y publica su presencia; 2 s despues de pasar a segundo plano guarda `last_seen` y se desconecta.

## Estructura

```
app/src/main/java/com/example/ejercicio11clonewhatsapp/
  InicioActivity.java          arranque: revisa la sesion guardada
  LoginActivity.java           inicio de sesion
  RegistroActivity.java        registro
  RecuperarActivity.java       pedir correo de recuperacion
  AuthCallbackActivity.java    recibe el deep link clonewhatsapp://auth
  NuevaPasswordActivity.java   guardar nueva contrasena
  CloneApp.java                Application: Realtime en primer plano, presencia, recibidos
  HomeActivity.java            Fase 5: lista de chats
  ChatsAdapter.java            filas de la lista de chats
  ChatActivity.java            Fases 6-8: chat, tiempo real, estados, escribiendo
  MensajesAdapter.java         burbujas enviadas/recibidas
  Estados.java                 iconos de estado (reloj, enviado, recibido, leido)
  Fechas.java                  fechas UTC de Supabase a hora local
  CuentaActivity.java          perfil, datos del JWT, dispositivo, renovar y cerrar sesion
  PerfilActivity.java          Fase 4: nombre, username y foto
  ContactosActivity.java       Fase 4: lista, busqueda y seleccion de destinatario
  ContactosAdapter.java        adaptador del RecyclerView
  Imagenes.java                recorta/reduce la foto antes de subirla
  Avatar.java                  carga fotos redondas con Glide
  Validar.java                 validaciones de formularios
  supabase/
    SupabaseClient.java        OkHttp + headers apikey/Authorization + errores en espanol
    AuthRepository.java        Fase 3: signup, login, logout, recover, refresh
    Sesion.java                tokens en SharedPreferences
    Jwt.java                   lee el payload del JWT
    DatosRepository.java       profiles, devices y Storage por REST (crea el perfil si falta)
    Perfil.java                modelo de una fila de profiles
    ChatRepository.java        Fases 5, 6 y 8: RPC y tabla messages
    RealtimeClient.java        Fase 7: WebSocket, canales, postgres_changes, broadcast, presence
    Chat.java, Mensaje.java    modelos
    Resultado.java             callback ok/error en el hilo principal
supabase/schema.sql            Fases 2, 4 y 5-8: tablas, llaves, triggers, RLS, bucket avatars y funciones RPC
```

## Como probar

1. Ejecutar `supabase/schema.sql` completo en el SQL Editor (se puede volver a correr sin problema).
2. Agregar `clonewhatsapp://auth` a las Redirect URLs.
3. Sincronizar Gradle y correr la app.
4. Registrar **dos cuentas** en dos telefonos (o telefono + emulador) y ponerles nombre y foto.
5. En el telefono A: boton verde > elegir a B > escribir. En B el chat aparece solo en la lista con el globo de no leidos y en A el mensaje pasa a dos palomitas grises (recibido).
6. B abre el chat: en A las palomitas se ponen azules (leido). Mientras B escribe, A ve "escribiendo..." y "en linea" en la cabecera; si B cierra la app, A ve "ult. vez hoy a las ...".
7. En Supabase > Table Editor se ven las filas en `conversaciones`, `conversaciones_members` y `messages` (con `delivered_at` y `read_at`).
