-- ============================================================================
--  MÁQUINA DEL TIEMPO · Instalación de la base de datos (Supabase)
--  Se pega completo en: Supabase → SQL Editor → New query → Run
--  ANTES de ejecutar: cambia ESCRIBE-AQUI-TU-PIN (línea marcada abajo) por el
--  PIN del facilitador. Ese PIN permite reiniciar la sesión desde la consola.
-- ============================================================================

-- 1. Participantes: solo nombre completo, profesión, grupo, rol y autorización.
create table if not exists public.participantes (
  id         uuid primary key default gen_random_uuid(),
  grupo      text not null check (grupo in ('G1','G2','G3','G4')),
  nombre     text not null check (char_length(nombre) between 3 and 80),
  profesion  text not null check (char_length(profesion) between 2 and 60),
  rol        text not null check (rol in ('PILOTO','COPILOTO','COMANDANTE','TRIPULANTE')),
  autoriza   boolean not null check (autoriza),
  creado     timestamptz not null default now()
);

-- Un solo Piloto, Copiloto y Comandante por grupo.
create unique index if not exists rol_unico on public.participantes (grupo, rol) where rol <> 'TRIPULANTE';

-- Máximo 7 personas por grupo y 4 Tripulantes de Élite.
create or replace function public.validar_cupo() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.participantes where grupo = new.grupo) >= 7 then
    raise exception 'grupo_lleno';
  end if;
  if new.rol = 'TRIPULANTE' and (select count(*) from public.participantes where grupo = new.grupo and rol = 'TRIPULANTE') >= 4 then
    raise exception 'tripulantes_llenos';
  end if;
  return new;
end $$;
drop trigger if exists trg_cupo on public.participantes;
create trigger trg_cupo before insert on public.participantes for each row execute function public.validar_cupo();

-- 2. Estado de cada grupo (estación, reloj, códigos y puntajes).
create table if not exists public.grupos (
  id          text primary key,
  estado      jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
insert into public.grupos (id) values ('G1'), ('G2'), ('G3'), ('G4') on conflict (id) do nothing;

-- 3. Configuración privada (PIN del facilitador). Nadie la puede leer desde el juego.
create table if not exists public.config (clave text primary key, valor text not null);
insert into public.config (clave, valor) values ('pin', 'ESCRIBE-AQUI-TU-PIN')   -- ← CAMBIA ESTE PIN
  on conflict (clave) do update set valor = excluded.valor;

-- 4. Reloj del servidor: todos los celulares cuentan los 12 minutos con la misma hora.
create or replace function public.ahora() returns timestamptz
language sql stable as $$ select now() $$;

-- 5. Reiniciar la sesión (solo con el PIN): borra participantes y puntajes.
create or replace function public.reiniciar_sesion(p_pin text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_pin is null or p_pin <> (select valor from public.config where clave = 'pin') then
    return false;
  end if;
  delete from public.participantes where true;
  update public.grupos set estado = '{}'::jsonb, actualizado = now() where true;
  return true;
end $$;

-- 6. Permisos para el juego (clave pública "anon").
alter table public.participantes enable row level security;
alter table public.grupos        enable row level security;
alter table public.config        enable row level security;

drop policy if exists leer_participantes  on public.participantes;
drop policy if exists crear_participantes on public.participantes;
drop policy if exists leer_grupos         on public.grupos;
drop policy if exists editar_grupos       on public.grupos;
create policy leer_participantes  on public.participantes for select to anon using (true);
create policy crear_participantes on public.participantes for insert to anon with check (true);
create policy leer_grupos         on public.grupos        for select to anon using (true);
create policy editar_grupos       on public.grupos        for update to anon using (true) with check (true);

grant select, insert on public.participantes to anon;
grant select, update on public.grupos to anon;
grant execute on function public.ahora() to anon;
grant execute on function public.reiniciar_sesion(text) to anon;

-- Listo. Debe aparecer "Success. No rows returned".
