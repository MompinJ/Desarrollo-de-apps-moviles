create table productos (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  precio numeric(10, 2) not null default 0,
  cantidad integer not null default 0,
  created_at timestamptz not null default now()
);

alter table productos enable row level security;

create policy "acceso publico a productos"
  on productos for all
  using (true)
  with check (true);
