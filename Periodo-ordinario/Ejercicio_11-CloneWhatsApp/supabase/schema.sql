-- =====================================================================
-- CloneWhatsApp - Fase 2: diseno de la base de datos
-- Pegar completo en Supabase > SQL Editor > New query > Run.
-- Se puede volver a ejecutar: las tablas usan "if not exists" (si ya
-- existen no se tocan) y las politicas se borran y se vuelven a crear.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles: datos publicos de cada usuario (1 a 1 con auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    username    text unique,
    avatar_url  text,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. devices: telefonos donde el usuario tiene sesion abierta
--    (device_token servira para las notificaciones push)
-- ---------------------------------------------------------------------
create table if not exists public.devices (
    id            uuid primary key default gen_random_uuid(),
    profile_id    uuid not null references public.profiles (id) on delete cascade,
    device_token  text not null,
    created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. conversaciones: un chat individual o un grupo
-- ---------------------------------------------------------------------
create table if not exists public.conversaciones (
    id          uuid primary key default gen_random_uuid(),
    name        text,                              -- nombre del grupo
    is_group    boolean not null default false,
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. conversaciones_members: quien participa en cada conversacion (N a N)
-- ---------------------------------------------------------------------
create table if not exists public.conversaciones_members (
    conversacion_id  uuid not null references public.conversaciones (id) on delete cascade,
    profile_id       uuid not null references public.profiles (id) on delete cascade,
    joined_at        timestamptz not null default now(),
    primary key (conversacion_id, profile_id)
);

-- ---------------------------------------------------------------------
-- 5. messages: mensajes de cada conversacion
-- ---------------------------------------------------------------------
create table if not exists public.messages (
    id               uuid primary key default gen_random_uuid(),
    conversacion_id  uuid not null references public.conversaciones (id) on delete cascade,
    sender_id        uuid references public.profiles (id) on delete set null,
    content          text not null,
    created_at       timestamptz not null default now()
);

-- Indices para las consultas mas comunes
create index if not exists devices_profile_idx     on public.devices (profile_id);
create index if not exists members_profile_idx     on public.conversaciones_members (profile_id);
create index if not exists messages_conv_fecha_idx on public.messages (conversacion_id, created_at desc);

-- =====================================================================
-- Trigger: al registrarse un usuario (auth.users) se crea su perfil.
-- El username viene de los metadatos del signup (data.username); si ya
-- esta ocupado se le agrega un sufijo para no romper el registro.
-- (La app tambien crea el perfil si no existe, por si falta el trigger.)
-- =====================================================================
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    nombre text := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1));
begin
    begin
        insert into public.profiles (id, username) values (new.id, nombre)
        on conflict (id) do nothing;
    exception when unique_violation then
        insert into public.profiles (id, username) values (new.id, nombre || '_' || substr(new.id::text, 1, 4))
        on conflict (id) do nothing;
    end;
    return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
    after insert on auth.users
    for each row execute function public.crear_perfil();

-- =====================================================================
-- Seguridad: Row Level Security (cada usuario solo ve lo suyo)
-- =====================================================================

-- El usuario actual es miembro de la conversacion?
-- security definer evita la recursion infinita de una politica de
-- conversaciones_members que consulta a la propia conversaciones_members.
create or replace function public.es_miembro(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.conversaciones_members
        where conversacion_id = conv and profile_id = auth.uid()
    );
$$;

alter table public.profiles               enable row level security;
alter table public.devices                enable row level security;
alter table public.conversaciones         enable row level security;
alter table public.conversaciones_members enable row level security;
alter table public.messages               enable row level security;

-- profiles: cualquiera con sesion ve los perfiles (para buscar contactos);
-- cada quien crea y edita solo el suyo.
drop policy if exists "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles
    for select to authenticated using (true);

drop policy if exists "crear mi perfil" on public.profiles;
create policy "crear mi perfil" on public.profiles
    for insert to authenticated
    with check (id = (select auth.uid()));

drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles
    for update to authenticated
    using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- devices: solo mis dispositivos
drop policy if exists "mis dispositivos" on public.devices;
create policy "mis dispositivos" on public.devices
    for all to authenticated
    using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- conversaciones: cualquiera con sesion puede crear; solo los miembros la ven y editan
drop policy if exists "ver mis conversaciones" on public.conversaciones;
create policy "ver mis conversaciones" on public.conversaciones
    for select to authenticated
    using (public.es_miembro(id));

drop policy if exists "crear conversacion" on public.conversaciones;
create policy "crear conversacion" on public.conversaciones
    for insert to authenticated
    with check (true);

drop policy if exists "editar conversacion" on public.conversaciones;
create policy "editar conversacion" on public.conversaciones
    for update to authenticated
    using (public.es_miembro(id));

-- conversaciones_members: veo los miembros de mis conversaciones; me puedo
-- agregar a mi mismo (al crear el chat) y un miembro puede agregar a otros.
drop policy if exists "ver miembros" on public.conversaciones_members;
create policy "ver miembros" on public.conversaciones_members
    for select to authenticated
    using (public.es_miembro(conversacion_id));

drop policy if exists "agregar miembros" on public.conversaciones_members;
create policy "agregar miembros" on public.conversaciones_members
    for insert to authenticated
    with check (profile_id = (select auth.uid()) or public.es_miembro(conversacion_id));

drop policy if exists "salir de conversacion" on public.conversaciones_members;
create policy "salir de conversacion" on public.conversaciones_members
    for delete to authenticated
    using (profile_id = (select auth.uid()));

-- messages: leo y escribo solo en conversaciones donde soy miembro;
-- solo edito/borro mis propios mensajes.
drop policy if exists "leer mensajes" on public.messages;
create policy "leer mensajes" on public.messages
    for select to authenticated
    using (public.es_miembro(conversacion_id));

drop policy if exists "enviar mensajes" on public.messages;
create policy "enviar mensajes" on public.messages
    for insert to authenticated
    with check (sender_id = (select auth.uid()) and public.es_miembro(conversacion_id));

drop policy if exists "editar mis mensajes" on public.messages;
create policy "editar mis mensajes" on public.messages
    for update to authenticated
    using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));

drop policy if exists "borrar mis mensajes" on public.messages;
create policy "borrar mis mensajes" on public.messages
    for delete to authenticated
    using (sender_id = (select auth.uid()));

-- =====================================================================
-- Realtime: avisar a la app cuando llega un mensaje (para fases siguientes)
-- =====================================================================
do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) then
        alter publication supabase_realtime add table public.messages;
    end if;
end;
$$;

-- =====================================================================
-- Fase 4: perfiles y contactos
-- =====================================================================

-- Nombre visible del usuario (el username es el identificador unico)
alter table public.profiles add column if not exists nombre text;

-- Bucket publico para las fotos de perfil: avatars/{id_del_usuario}/avatar.jpg
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Cada quien sube, reemplaza y borra solo los archivos de su carpeta.
-- (Subir con x-upsert necesita permisos de insert, select y update.)
drop policy if exists "avatars ver" on storage.objects;
create policy "avatars ver" on storage.objects
    for select to authenticated
    using (bucket_id = 'avatars');

drop policy if exists "avatars subir" on storage.objects;
create policy "avatars subir" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars reemplazar" on storage.objects;
create policy "avatars reemplazar" on storage.objects
    for update to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars borrar" on storage.objects;
create policy "avatars borrar" on storage.objects
    for delete to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- =====================================================================
-- Fases 5 a 8: conversaciones, mensajes, tiempo real y estados
-- =====================================================================

-- Fase 8: estados de cada mensaje y ultima conexion de cada usuario.
--   enviado  = la fila existe en messages
--   recibido = delivered_at (el telefono del destinatario ya lo descargo)
--   leido    = read_at      (el destinatario abrio el chat)
alter table public.messages add column if not exists delivered_at timestamptz;
alter table public.messages add column if not exists read_at      timestamptz;
alter table public.profiles add column if not exists last_seen    timestamptz;

create index if not exists messages_pendientes_idx
    on public.messages (conversacion_id) where read_at is null;

-- ---------------------------------------------------------------------
-- Fase 5: crear (o reutilizar) la conversacion individual con otro usuario.
-- Se hace en una funcion porque necesita 3 inserciones juntas (la
-- conversacion y sus 2 miembros) y buscar antes si ya existia.
-- App: POST /rest/v1/rpc/crear_conversacion_directa {"otro": "<uuid>"}
-- ---------------------------------------------------------------------
create or replace function public.crear_conversacion_directa(otro uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    yo   uuid := auth.uid();
    conv uuid;
begin
    if yo is null then
        raise exception 'No hay sesion iniciada';
    end if;
    if otro = yo then
        raise exception 'No puedes iniciar un chat contigo mismo';
    end if;
    if not exists (select 1 from public.profiles where id = otro) then
        raise exception 'El usuario no existe';
    end if;

    -- Candado por pareja de usuarios: si los dos crean el chat al mismo tiempo
    -- no se duplica la conversacion.
    perform pg_advisory_xact_lock(hashtext(least(yo, otro)::text || greatest(yo, otro)::text));

    select c.id into conv
    from public.conversaciones c
    join public.conversaciones_members a on a.conversacion_id = c.id and a.profile_id = yo
    join public.conversaciones_members b on b.conversacion_id = c.id and b.profile_id = otro
    where c.is_group = false
    limit 1;

    if conv is null then
        insert into public.conversaciones (is_group) values (false) returning id into conv;
        insert into public.conversaciones_members (conversacion_id, profile_id)
        values (conv, yo), (conv, otro);
    end if;
    return conv;
end;
$$;

-- ---------------------------------------------------------------------
-- Fase 5: lista de chats del usuario con el otro participante, el ultimo
-- mensaje (y su estado) y cuantos mensajes recibidos no ha leido.
-- App: POST /rest/v1/rpc/mis_chats
-- ---------------------------------------------------------------------
drop function if exists public.mis_chats();
create function public.mis_chats()
returns table (
    conversacion_id   uuid,
    is_group          boolean,
    name              text,
    creada            timestamptz,
    otro_id           uuid,
    otro_username     text,
    otro_nombre       text,
    otro_avatar       text,
    otro_last_seen    timestamptz,
    ultimo_id         uuid,
    ultimo_contenido  text,
    ultimo_sender     uuid,
    ultimo_fecha      timestamptz,
    ultimo_entregado  timestamptz,
    ultimo_leido      timestamptz,
    no_leidos         bigint
)
language sql
stable
security definer
set search_path = ''
as $$
    select c.id, c.is_group, c.name, c.created_at,
           o.id, o.username, o.nombre, o.avatar_url, o.last_seen,
           m.id, m.content, m.sender_id, m.created_at, m.delivered_at, m.read_at,
           (select count(*) from public.messages x
             where x.conversacion_id = c.id
               and x.sender_id is distinct from auth.uid()
               and x.read_at is null)
    from public.conversaciones_members yo
    join public.conversaciones c on c.id = yo.conversacion_id
    left join lateral (
        select p.id, p.username, p.nombre, p.avatar_url, p.last_seen
        from public.conversaciones_members om
        join public.profiles p on p.id = om.profile_id
        where om.conversacion_id = c.id and om.profile_id <> auth.uid()
        limit 1
    ) o on true
    left join lateral (
        select mm.id, mm.content, mm.sender_id, mm.created_at, mm.delivered_at, mm.read_at
        from public.messages mm
        where mm.conversacion_id = c.id
        order by mm.created_at desc
        limit 1
    ) m on true
    where yo.profile_id = auth.uid()
    order by coalesce(m.created_at, c.created_at) desc;
$$;

-- ---------------------------------------------------------------------
-- Fase 5: participantes de una conversacion (solo si soy miembro).
-- App: POST /rest/v1/rpc/participantes {"conv": "<uuid>"}
-- ---------------------------------------------------------------------
drop function if exists public.participantes(uuid);
create function public.participantes(conv uuid)
returns table (id uuid, username text, nombre text, avatar_url text, last_seen timestamptz, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
    select p.id, p.username, p.nombre, p.avatar_url, p.last_seen, cm.joined_at
    from public.conversaciones_members cm
    join public.profiles p on p.id = cm.profile_id
    where cm.conversacion_id = conv and public.es_miembro(conv)
    order by cm.joined_at;
$$;

-- ---------------------------------------------------------------------
-- Fase 8: marcar como recibidos todos los mensajes que me llegaron.
-- (Lo llama la app al abrirse y cada vez que Realtime le avisa de uno nuevo.)
-- ---------------------------------------------------------------------
create or replace function public.marcar_entregados()
returns void
language sql
security definer
set search_path = ''
as $$
    update public.messages m
    set delivered_at = now()
    where m.delivered_at is null
      and m.sender_id is distinct from auth.uid()
      and exists (
          select 1 from public.conversaciones_members cm
          where cm.conversacion_id = m.conversacion_id and cm.profile_id = auth.uid()
      );
$$;

-- Fase 8: marcar como leidos los mensajes recibidos de una conversacion.
create or replace function public.marcar_leidos(conv uuid)
returns void
language sql
security definer
set search_path = ''
as $$
    update public.messages
    set read_at = now(), delivered_at = coalesce(delivered_at, now())
    where conversacion_id = conv
      and sender_id is distinct from auth.uid()
      and read_at is null
      and public.es_miembro(conv);
$$;

-- Fase 8: ultima conexion (la app la actualiza al pasar a segundo plano).
create or replace function public.actualizar_ultima_conexion()
returns void
language sql
security definer
set search_path = ''
as $$
    update public.profiles set last_seen = now() where id = auth.uid();
$$;

-- Las funciones solo las usan usuarios con sesion
revoke execute on function public.crear_conversacion_directa(uuid) from public, anon;
revoke execute on function public.mis_chats()                       from public, anon;
revoke execute on function public.participantes(uuid)               from public, anon;
revoke execute on function public.marcar_entregados()               from public, anon;
revoke execute on function public.marcar_leidos(uuid)              from public, anon;
revoke execute on function public.actualizar_ultima_conexion()      from public, anon;
grant  execute on function public.crear_conversacion_directa(uuid) to authenticated;
grant  execute on function public.mis_chats()                       to authenticated;
grant  execute on function public.participantes(uuid)               to authenticated;
grant  execute on function public.marcar_entregados()               to authenticated;
grant  execute on function public.marcar_leidos(uuid)              to authenticated;
grant  execute on function public.actualizar_ultima_conexion()      to authenticated;

-- Fase 7: Realtime. messages ya esta en la publicacion supabase_realtime
-- (seccion de arriba). Con eso la app recibe INSERT (mensaje nuevo) y
-- UPDATE (cambio a recibido/leido) respetando las politicas RLS.
