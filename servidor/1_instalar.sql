-- ============================================================================
-- MÁQUINA DEL TIEMPO · Código: Cirugía del Futuro
-- Base de datos del juego (Supabase / PostgreSQL)
-- Metodología y diseño del juego: Nathalia Velasco · Simoné
-- ----------------------------------------------------------------------------
-- Este archivo crea la estructura y las reglas del juego. NO contiene las
-- respuestas: esas van en un archivo aparte que no se publica.
-- Se puede ejecutar varias veces: borra y vuelve a crear todo (¡también los
-- registros de partidas!).
-- ============================================================================

drop function if exists public.mdt_acceso(text);
drop function if exists public.mdt_unirse(text,text,text,text,text,boolean,text);
drop function if exists public.mdt_tripulacion(text,text);
drop function if exists public.mdt_consola(text,text);
drop function if exists public.mdt_abrir(text,text,text);
drop function if exists public.mdt_responder(text,text,text,text);
drop function if exists public.mdt_finalizar(text,text,text);
drop function if exists public.mdt_tablero();
drop function if exists public.mdt_prevena(text);
drop function if exists public.mdt_ventajas(text,text);
drop function if exists public.mdt_admin(text,text,text);
drop schema if exists mdt cascade;
create schema mdt;
revoke all on schema mdt from public;

-- ---------------------------------------------------------------- tablas ----
create table mdt.config (
  id            int primary key default 1 check (id = 1),
  codigo_acceso text not null default 'CAMBIAR',
  pin           text not null default 'CAMBIAR',
  sesion        int  not null default 1
);
insert into mdt.config default values;

create table mdt.sesiones (
  id     serial primary key,
  creada timestamptz not null default now()
);
insert into mdt.sesiones default values;

create table mdt.estaciones (
  id         text primary key,
  numero     int  not null unique,
  nombre     text not null,
  limite_seg int  not null default 720,   -- 12:00
  gracia_seg int  not null default 30,    -- 30 s de margen: cierre a las 12:30
  bandas     jsonb not null               -- bonificación por tiempo
);

create table mdt.codigos (
  id         text primary key,            -- '1.1', '1.4'...
  estacion   text not null references mdt.estaciones(id),
  orden      int  not null,
  puntos     int  not null,
  respuestas text[] not null default '{}',-- respuestas aceptadas (normalizadas)
  mostrar    text not null default ''     -- respuesta que se muestra al fallar
);

create table mdt.privado (                -- contenido protegido (ventajas Prevena™ de la prueba 5.3)
  clave text primary key,
  valor jsonb not null
);

create table mdt.equipos (
  id     serial primary key,
  sesion int  not null,
  grupo  text not null,
  creado timestamptz not null default now(),
  unique (sesion, grupo)
);

create table mdt.tripulantes (
  id          serial primary key,
  equipo      int  not null references mdt.equipos(id) on delete cascade,
  nombre      text not null,
  profesion   text not null,
  rol         text not null,
  autoriza    boolean not null,
  dispositivo text not null,
  creado      timestamptz not null default now()
);

create table mdt.avance (
  equipo      int  not null references mdt.equipos(id) on delete cascade,
  estacion    text not null references mdt.estaciones(id),
  inicio      timestamptz not null default now(),
  fin         timestamptz,
  estado      text not null default 'abierta',   -- abierta | cerrada | agotada
  seg_usados  int,
  pts_codigos int not null default 0,
  pts_tiempo  int not null default 0,
  total       int not null default 0,
  primary key (equipo, estacion)
);

create table mdt.respuestas (
  equipo    int  not null references mdt.equipos(id) on delete cascade,
  codigo    text not null references mdt.codigos(id),
  intentos  int  not null default 0,
  correcta  boolean not null default false,
  valor     text,
  puntos    int  not null default 0,
  primary key (equipo, codigo)
);

-- Estaciones y bandas de tiempo.
-- E3 tiene bandas más amplias: es el procedimiento físico con el dispositivo.
insert into mdt.estaciones (id, numero, nombre, bandas) values
 ('E1', 1, 'El Umbral del Trauma',     '[{"hasta":300,"puntos":6},{"hasta":480,"puntos":5},{"hasta":660,"puntos":4},{"hasta":750,"puntos":3}]'),
 ('E2', 2, 'El Enigma del Vacío',      '[{"hasta":300,"puntos":6},{"hasta":480,"puntos":5},{"hasta":660,"puntos":4},{"hasta":750,"puntos":3}]'),
 ('E3', 3, 'El Taller del Cronógrafo', '[{"hasta":360,"puntos":6},{"hasta":540,"puntos":5},{"hasta":690,"puntos":4},{"hasta":750,"puntos":3}]'),
 ('E4', 4, 'El Vínculo de Vigilancia', '[{"hasta":300,"puntos":6},{"hasta":480,"puntos":5},{"hasta":660,"puntos":4},{"hasta":750,"puntos":3}]'),
 ('E5', 5, 'El Salto Temporal',        '[{"hasta":300,"puntos":6},{"hasta":480,"puntos":5},{"hasta":660,"puntos":4},{"hasta":750,"puntos":3}]');

-- Códigos y puntos (los definió el cliente). Las respuestas se cargan aparte.
insert into mdt.codigos (id, estacion, orden, puntos) values
 ('1.1','E1',1,4),('1.2','E1',2,4),('1.3','E1',3,4),('1.4','E1',4,2),
 ('2.1','E2',1,4),('2.2','E2',2,4),('2.3','E2',3,4),('2.4','E2',4,2),
 ('3.1','E3',1,4),('3.2','E3',2,8),('3.3','E3',3,2),
 ('4.1','E4',1,4),('4.2','E4',2,4),('4.3','E4',3,4),('4.4','E4',4,2),
 ('5.1','E5',1,4),('5.2','E5',2,4),('5.3','E5',3,4),('5.4','E5',4,2);

-- ------------------------------------------------------------- utilidades ----
create function mdt.norm(t text) returns text language sql immutable as $$
  select upper(translate(regexp_replace(coalesce(t, ''), '\s', '', 'g'),
               'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))
$$;

create function mdt.sesion() returns int language sql stable as $$
  select sesion from mdt.config where id = 1
$$;

create function mdt.verificar_codigo(p_codigo text) returns void language plpgsql as $$
begin
  if mdt.norm(p_codigo) is distinct from mdt.norm((select codigo_acceso from mdt.config where id = 1)) then
    raise exception 'Código de acceso incorrecto.';
  end if;
end $$;

create function mdt.equipo_id(p_grupo text) returns int language plpgsql as $$
declare v int;
begin
  select id into v from mdt.equipos where sesion = mdt.sesion() and grupo = p_grupo;
  if v is null then
    raise exception 'Este grupo todavía no tiene tripulación registrada.';
  end if;
  return v;
end $$;

-- Cierra por tiempo (12:30) las estaciones vencidas: sin puntos.
create function mdt.vencer() returns void language plpgsql as $$
begin
  update mdt.avance a
     set estado = 'agotada',
         fin = a.inicio + make_interval(secs => e.limite_seg + e.gracia_seg),
         seg_usados = e.limite_seg + e.gracia_seg,
         pts_codigos = 0, pts_tiempo = 0, total = 0
    from mdt.estaciones e
   where e.id = a.estacion and a.estado = 'abierta'
     and now() > a.inicio + make_interval(secs => e.limite_seg + e.gracia_seg);
end $$;

-- Estado completo de un equipo (lo que necesita la consola).
create function mdt.estado_equipo(v_eq int) returns json language sql stable as $$
  select json_build_object(
    'grupo', (select grupo from mdt.equipos where id = v_eq),
    'ahora', now(),
    'tripulantes', coalesce((select json_agg(json_build_object('nombre', t.nombre, 'rol', t.rol, 'profesion', t.profesion) order by t.creado)
                               from mdt.tripulantes t where t.equipo = v_eq), '[]'::json),
    'estaciones', (select json_agg(json_build_object(
                      'id', e.id, 'numero', e.numero, 'nombre', e.nombre,
                      'limite', e.limite_seg, 'gracia', e.gracia_seg,
                      'estado', coalesce(a.estado, 'pendiente'), 'inicio', a.inicio, 'fin', a.fin,
                      'seg_usados', a.seg_usados, 'pts_codigos', coalesce(a.pts_codigos, 0),
                      'pts_tiempo', coalesce(a.pts_tiempo, 0), 'total', coalesce(a.total, 0)) order by e.numero)
                     from mdt.estaciones e left join mdt.avance a on a.estacion = e.id and a.equipo = v_eq),
    'respuestas', coalesce((select json_object_agg(c.id, json_build_object(
                      'intentos', coalesce(r.intentos, 0), 'correcta', coalesce(r.correcta, false),
                      'puntos', coalesce(r.puntos, 0), 'valor', r.valor, 'max', c.puntos,
                      'mostrar', case when coalesce(r.correcta, false) or coalesce(r.intentos, 0) >= 2
                                        or coalesce(a.estado, 'pendiente') in ('cerrada', 'agotada')
                                      then c.mostrar end))
                     from mdt.codigos c
                     left join mdt.respuestas r on r.codigo = c.id and r.equipo = v_eq
                     left join mdt.avance a on a.estacion = c.estacion and a.equipo = v_eq), '{}'::json),
    'total', coalesce((select sum(total) from mdt.avance where equipo = v_eq), 0)
  )
$$;

-- ------------------------------------------------------- funciones públicas ----
-- 1. Verificar el código de acceso y ver la ocupación de los 4 grupos.
create function public.mdt_acceso(p_codigo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  perform mdt.verificar_codigo(p_codigo);
  return json_build_object('ok', true, 'grupos', coalesce((
    select json_object_agg(e.grupo, json_build_object(
      'miembros', (select count(*) from mdt.tripulantes t where t.equipo = e.id),
      'roles', coalesce((select json_object_agg(r.rol, r.n) from (select rol, count(*) n from mdt.tripulantes where equipo = e.id group by rol) r), '{}'::json)))
    from mdt.equipos e where e.sesion = mdt.sesion()), '{}'::json));
end $$;

-- 2. Unirse a la tripulación (Kit de tripulación, celular de cada persona).
create function public.mdt_unirse(p_codigo text, p_grupo text, p_nombre text, p_profesion text,
                                  p_rol text, p_autoriza boolean, p_dispositivo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int; v_cupo int; v_ocupados int; v_previo int; v_nombre text; v_prof text;
begin
  perform mdt.verificar_codigo(p_codigo);
  if p_grupo not in ('davinci', 'verne', 'wells', 'tesla') then raise exception 'Grupo no válido.'; end if;
  if p_rol not in ('piloto', 'copiloto', 'comandante', 'tripulante') then raise exception 'Rol no válido.'; end if;
  if not coalesce(p_autoriza, false) then raise exception 'Para participar deben aceptar la autorización de tratamiento de datos.'; end if;
  v_nombre := upper(trim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g')));
  v_prof   := upper(trim(regexp_replace(coalesce(p_profesion, ''), '\s+', ' ', 'g')));
  if length(v_nombre) < 3 then raise exception 'Escriban el nombre completo.'; end if;
  if length(v_prof) < 2 then raise exception 'Escriban la profesión.'; end if;

  insert into mdt.equipos (sesion, grupo) values (mdt.sesion(), p_grupo)
    on conflict (sesion, grupo) do nothing;
  v_eq := mdt.equipo_id(p_grupo);

  -- El mismo celular puede volver a registrarse: se reemplaza su registro anterior.
  select t.id into v_previo from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo
   where e.sesion = mdt.sesion() and t.dispositivo = p_dispositivo;
  if v_previo is not null then delete from mdt.tripulantes where id = v_previo; end if;

  if (select count(*) from mdt.tripulantes where equipo = v_eq) >= 7 then
    raise exception 'Este grupo ya tiene sus 7 tripulantes.';
  end if;
  v_cupo := case p_rol when 'tripulante' then 4 else 1 end;
  select count(*) into v_ocupados from mdt.tripulantes where equipo = v_eq and rol = p_rol;
  if v_ocupados >= v_cupo then raise exception 'Ese rol ya está ocupado en este grupo. Revisen su escarapela.'; end if;

  insert into mdt.tripulantes (equipo, nombre, profesion, rol, autoriza, dispositivo)
  values (v_eq, v_nombre, v_prof, p_rol, true, p_dispositivo);
  return json_build_object('ok', true, 'grupo', p_grupo, 'rol', p_rol, 'nombre', v_nombre);
end $$;

-- 3. Ver la tripulación de un grupo (Kit y Consola).
create function public.mdt_tripulacion(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int;
begin
  perform mdt.verificar_codigo(p_codigo);
  select id into v_eq from mdt.equipos where sesion = mdt.sesion() and grupo = p_grupo;
  return json_build_object('tripulantes', coalesce((select json_agg(json_build_object('nombre', nombre, 'rol', rol) order by creado)
                                                    from mdt.tripulantes where equipo = v_eq), '[]'::json));
end $$;

-- 4. Consola: estado completo del equipo.
create function public.mdt_consola(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  return mdt.estado_equipo(mdt.equipo_id(p_grupo));
end $$;

-- 5. Abrir una estación (en orden 1 → 5; una estación no puede tener dos grupos).
create function public.mdt_abrir(p_codigo text, p_grupo text, p_estacion text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int; v_num int; v_prev text; v_otro text;
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  v_eq := mdt.equipo_id(p_grupo);
  select numero into v_num from mdt.estaciones where id = p_estacion;
  if v_num is null then raise exception 'Estación no válida.'; end if;

  if not exists (select 1 from mdt.avance where equipo = v_eq and estacion = p_estacion) then
    if v_num > 1 then
      select id into v_prev from mdt.estaciones where numero = v_num - 1;
      if not exists (select 1 from mdt.avance where equipo = v_eq and estacion = v_prev and estado in ('cerrada', 'agotada')) then
        raise exception 'Primero deben cerrar la estación anterior.';
      end if;
    end if;
    select e.grupo into v_otro from mdt.avance a join mdt.equipos e on e.id = a.equipo
     where a.estacion = p_estacion and a.estado = 'abierta' and e.sesion = mdt.sesion() and a.equipo <> v_eq limit 1;
    if v_otro is not null then raise exception 'OCUPADA:%', v_otro; end if;
    insert into mdt.avance (equipo, estacion) values (v_eq, p_estacion);
  end if;
  return mdt.estado_equipo(v_eq);
end $$;

-- 6. Responder un código: 2 intentos. Al segundo fallo se muestra la respuesta.
create function public.mdt_responder(p_codigo text, p_grupo text, p_codigo_id text, p_valor text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int; c mdt.codigos; v_estado text; r mdt.respuestas; v_ok boolean;
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  v_eq := mdt.equipo_id(p_grupo);
  select * into c from mdt.codigos where id = p_codigo_id;
  if c.id is null then raise exception 'Código no válido.'; end if;
  select estado into v_estado from mdt.avance where equipo = v_eq and estacion = c.estacion;
  if v_estado is distinct from 'abierta' then raise exception 'CERRADA:La estación ya está cerrada.'; end if;
  if trim(coalesce(p_valor, '')) = '' then raise exception 'Escriban el código antes de validar.'; end if;

  insert into mdt.respuestas (equipo, codigo) values (v_eq, c.id) on conflict do nothing;
  select * into r from mdt.respuestas where equipo = v_eq and codigo = c.id for update;
  if r.correcta or r.intentos >= 2 then
    return json_build_object('correcta', r.correcta, 'intentos', r.intentos, 'puntos', r.puntos, 'mostrar', c.mostrar);
  end if;

  v_ok := mdt.norm(p_valor) = any (c.respuestas);
  update mdt.respuestas
     set intentos = intentos + 1, correcta = v_ok, valor = upper(trim(p_valor)),
         puntos = case when v_ok then c.puntos else 0 end
   where equipo = v_eq and codigo = c.id
   returning * into r;
  return json_build_object('correcta', r.correcta, 'intentos', r.intentos, 'puntos', r.puntos,
                           'mostrar', case when r.correcta or r.intentos >= 2 then c.mostrar end);
end $$;

-- 7. Validar y finalizar la estación: detiene el reloj y calcula los puntos.
create function public.mdt_finalizar(p_codigo text, p_grupo text, p_estacion text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int; a mdt.avance; e mdt.estaciones; v_seg int; v_cod int; v_tiempo int := 0; b jsonb;
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  v_eq := mdt.equipo_id(p_grupo);
  select * into a from mdt.avance where equipo = v_eq and estacion = p_estacion for update;
  if a.equipo is null then raise exception 'La estación no ha comenzado.'; end if;
  if a.estado = 'abierta' then
    select * into e from mdt.estaciones where id = p_estacion;
    v_seg := ceil(extract(epoch from now() - a.inicio));
    select coalesce(sum(r.puntos), 0) into v_cod
      from mdt.respuestas r join mdt.codigos c on c.id = r.codigo
     where r.equipo = v_eq and c.estacion = p_estacion;
    for b in select * from jsonb_array_elements(e.bandas) loop
      if v_seg <= (b->>'hasta')::int then v_tiempo := (b->>'puntos')::int; exit; end if;
    end loop;
    update mdt.avance set estado = 'cerrada', fin = now(), seg_usados = v_seg,
           pts_codigos = v_cod, pts_tiempo = v_tiempo, total = v_cod + v_tiempo
     where equipo = v_eq and estacion = p_estacion;
  end if;
  return mdt.estado_equipo(v_eq);
end $$;

-- 8. Pórtico: marcador en vivo de los 4 grupos.
create function public.mdt_tablero() returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  perform mdt.vencer();
  return json_build_object('ahora', now(), 'grupos', coalesce((select json_agg(json_build_object(
      'grupo', g.grupo,
      'registrado', e.id is not null,
      'miembros', (select count(*) from mdt.tripulantes t where t.equipo = e.id),
      'total', coalesce((select sum(total) from mdt.avance where equipo = e.id), 0),
      'terminadas', (select count(*) from mdt.avance where equipo = e.id and estado in ('cerrada', 'agotada')),
      'estaciones', coalesce((select json_object_agg(a.estacion, json_build_object('estado', a.estado, 'total', a.total))
                               from mdt.avance a where a.equipo = e.id), '{}'::json),
      'actual', (select json_build_object('estacion', a.estacion, 'inicio', a.inicio, 'limite', s.limite_seg, 'gracia', s.gracia_seg)
                   from mdt.avance a join mdt.estaciones s on s.id = a.estacion
                  where a.equipo = e.id and a.estado = 'abierta' limit 1),
      'ultimo', (select max(coalesce(a.fin, a.inicio)) from mdt.avance a where a.equipo = e.id)))
    from (values ('davinci'), ('verne'), ('wells'), ('tesla')) g(grupo)
    left join mdt.equipos e on e.grupo = g.grupo and e.sesion = mdt.sesion()), '[]'::json));
end $$;

-- 9. Evidencia de Prevena™ (prueba 5.3): se entrega cuando el equipo ya
--    resolvió el código 5.2 (acertó o agotó sus 2 intentos).
create function public.mdt_ventajas(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int;
begin
  perform mdt.verificar_codigo(p_codigo);
  v_eq := mdt.equipo_id(p_grupo);
  if not exists (select 1 from mdt.respuestas where equipo = v_eq and codigo = '5.2' and (correcta or intentos >= 2)) then
    raise exception 'Primero registren el código de la prueba 5.2.';
  end if;
  return coalesce((select valor from mdt.privado where clave = 'ventajas'), '{}'::jsonb)::json;
end $$;

-- 10. Facilitador (con PIN): nueva sesión, código de acceso, reabrir grupo, exportar.
create function public.mdt_admin(p_pin text, p_accion text, p_dato text default null) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_id int;
begin
  if p_pin is distinct from (select pin from mdt.config where id = 1) or p_pin = 'CAMBIAR' then
    raise exception 'PIN incorrecto.';
  end if;
  if p_accion = 'verificar' then
    return json_build_object('ok', true, 'codigo_acceso', (select codigo_acceso from mdt.config where id = 1), 'sesion', mdt.sesion());
  elsif p_accion = 'nueva_sesion' then
    insert into mdt.sesiones default values returning id into v_id;
    update mdt.config set sesion = v_id where id = 1;
    return json_build_object('ok', true, 'sesion', v_id);
  elsif p_accion = 'cambiar_codigo' then
    if length(trim(coalesce(p_dato, ''))) < 4 then raise exception 'El código debe tener al menos 4 caracteres.'; end if;
    update mdt.config set codigo_acceso = upper(trim(p_dato)) where id = 1;
    return json_build_object('ok', true);
  elsif p_accion = 'reabrir_grupo' then
    delete from mdt.avance where equipo = (select id from mdt.equipos where sesion = mdt.sesion() and grupo = p_dato);
    delete from mdt.respuestas where equipo = (select id from mdt.equipos where sesion = mdt.sesion() and grupo = p_dato);
    return json_build_object('ok', true);
  elsif p_accion = 'borrar_grupo' then
    delete from mdt.equipos where sesion = mdt.sesion() and grupo = p_dato;
    return json_build_object('ok', true);
  elsif p_accion = 'exportar' then
    return json_build_object('filas', coalesce((select json_agg(json_build_object(
        'sesion', e.sesion, 'grupo', e.grupo, 'nombre', t.nombre, 'profesion', t.profesion, 'rol', t.rol,
        'autoriza_datos', t.autoriza, 'registro', t.creado,
        'puntaje_grupo', (select coalesce(sum(total), 0) from mdt.avance where equipo = e.id)) order by e.grupo, t.creado)
      from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo where e.sesion = mdt.sesion()), '[]'::json),
      'estaciones', coalesce((select json_agg(json_build_object(
        'grupo', e.grupo, 'estacion', a.estacion, 'estado', a.estado, 'segundos', a.seg_usados,
        'puntos_codigos', a.pts_codigos, 'puntos_tiempo', a.pts_tiempo, 'total', a.total) order by e.grupo, a.estacion)
      from mdt.avance a join mdt.equipos e on e.id = a.equipo where e.sesion = mdt.sesion()), '[]'::json));
  end if;
  raise exception 'Acción no válida.';
end $$;

-- --------------------------------------------------------------- permisos ----
revoke all on all tables in schema mdt from public;
revoke execute on all functions in schema mdt from public;
grant usage on schema mdt to postgres;

do $$ begin
  execute 'grant execute on function public.mdt_acceso(text), public.mdt_unirse(text,text,text,text,text,boolean,text),
           public.mdt_tripulacion(text,text), public.mdt_consola(text,text), public.mdt_abrir(text,text,text),
           public.mdt_responder(text,text,text,text), public.mdt_finalizar(text,text,text), public.mdt_tablero(),
           public.mdt_ventajas(text,text), public.mdt_admin(text,text,text) to anon, authenticated';
end $$;
