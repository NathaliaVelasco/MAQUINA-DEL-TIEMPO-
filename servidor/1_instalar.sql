-- ============================================================================
-- MÁQUINA DEL TIEMPO · Código: Cirugía del Futuro
-- Base de datos del juego (Supabase / PostgreSQL)
-- Metodología y diseño del juego: Nathalia Velasco · Simoné
-- ----------------------------------------------------------------------------
-- Este archivo crea la estructura y las reglas del juego y del diagnóstico
-- antes y después. NO contiene las respuestas: esas van en un archivo aparte
-- que no se publica.
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
drop function if exists public.mdt_diagnostico(text,text);
drop function if exists public.mdt_diag_responder(text,text,text,int,text,int);
drop function if exists public.mdt_diag_cerrar(text,text,text,text[],text,text);
drop schema if exists mdt cascade;
create schema mdt;
revoke all on schema mdt from public;

-- ---------------------------------------------------------------- tablas ----
create table mdt.config (
  id            int primary key default 1 check (id = 1),
  codigo_acceso text not null default 'CAMBIAR',   -- Pórtico de Entrada (registro)
  codigo_sala   text not null default 'CAMBIAR-SALA', -- Sala de Escape (Comandante)
  pin           text not null default 'CAMBIAR',
  sesion        int  not null default 1
);
insert into mdt.config default values;

create table mdt.sesiones (
  id       serial primary key,
  creada   timestamptz not null default now(),
  revelado boolean not null default false    -- el Guía revela al ganador sin esperar el diagnóstico final
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
  sala_liberada boolean not null default false,  -- el Guía abre la Sala sin esperar el diagnóstico
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

-- Diagnóstico antes y después (individual, en el celular de cada tripulante).
-- La opción correcta y el "por qué" se cargan con el archivo privado.
create table mdt.diag_claves (
  pregunta text primary key,                 -- 'A1'…'A10' (antes), 'B1'…'B10' (después)
  momento  text not null check (momento in ('antes', 'despues')),
  correcta int  not null check (correcta between 0 and 3),
  porque   text not null default ''
);

create table mdt.diag_respuestas (
  tripulante int  not null references mdt.tripulantes(id) on delete cascade,
  pregunta   text not null references mdt.diag_claves(pregunta) on delete cascade,
  opcion     int  not null,
  correcta   boolean not null,
  certeza    text not null,
  segundos   int,
  creado     timestamptz not null default now(),
  primary key (tripulante, pregunta)
);

create table mdt.diag_cierres (            -- rutina de pensamiento, imagen y palabra
  tripulante int  not null references mdt.tripulantes(id) on delete cascade,
  momento    text not null check (momento in ('antes', 'despues')),
  rutina     text[] not null default '{}',
  imagen     text,
  palabra    text,
  terminado  timestamptz not null default now(),
  primary key (tripulante, momento)
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

create function mdt.nombre_grupo(g text) returns text language sql immutable as $$
  select case g when 'davinci' then 'Alquimistas de Da Vinci' when 'verne' then 'Exploradores de Verne'
                when 'wells' then 'Viajeros de Wells' when 'tesla' then 'Guardianes de Tesla' else g end
$$;

create function mdt.nombre_rol(r text) returns text language sql immutable as $$
  select case r when 'piloto' then 'Líder Piloto de Vuelo' when 'copiloto' then 'Copiloto'
                when 'comandante' then 'Comandante de Misión' when 'tripulante' then 'Tripulante de Élite' else r end
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

create function mdt.verificar_codigo_sala(p_codigo text) returns void language plpgsql as $$
begin
  if mdt.norm(p_codigo) is distinct from mdt.norm((select codigo_sala from mdt.config where id = 1)) then
    raise exception 'Código de la Sala de Escape incorrecto.';
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

create function mdt.diag_activo() returns boolean language sql stable as $$
  select exists (select 1 from mdt.diag_claves)
$$;

-- Cuántos tripulantes de un equipo ya enviaron el diagnóstico (antes o después).
create function mdt.diag_listos(v_eq int, v_momento text) returns int language sql stable as $$
  select count(*)::int from mdt.diag_cierres c join mdt.tripulantes t on t.id = c.tripulante
   where t.equipo = v_eq and c.momento = v_momento
$$;

create function mdt.diag_tripulante(p_dispositivo text) returns mdt.tripulantes language plpgsql as $$
declare v mdt.tripulantes;
begin
  select t.* into v from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo
   where e.sesion = mdt.sesion() and t.dispositivo = p_dispositivo;
  if v.id is null then raise exception 'REGISTRO:Este celular no está registrado en la sesión actual.'; end if;
  return v;
end $$;

-- Estado del diagnóstico de un tripulante. Las respuestas correctas solo se
-- entregan cuando ya envió el diagnóstico final.
create function mdt.diag_estado(v mdt.tripulantes) returns json language sql stable as $$
  select json_build_object(
    'activo', mdt.diag_activo(),
    'antes', json_build_object(
      'total', (select count(*) from mdt.diag_claves where momento = 'antes'),
      'respondidas', coalesce((select json_agg(r.pregunta) from mdt.diag_respuestas r join mdt.diag_claves k on k.pregunta = r.pregunta
                                where r.tripulante = v.id and k.momento = 'antes'), '[]'::json),
      'terminado', exists (select 1 from mdt.diag_cierres where tripulante = v.id and momento = 'antes')),
    'despues', json_build_object(
      'habilitado', exists (select 1 from mdt.avance where equipo = v.equipo and estacion = 'E5' and estado in ('cerrada', 'agotada')),
      'total', (select count(*) from mdt.diag_claves where momento = 'despues'),
      'respondidas', coalesce((select json_agg(r.pregunta) from mdt.diag_respuestas r join mdt.diag_claves k on k.pregunta = r.pregunta
                                where r.tripulante = v.id and k.momento = 'despues'), '[]'::json),
      'terminado', exists (select 1 from mdt.diag_cierres where tripulante = v.id and momento = 'despues')),
    'resultado', case when exists (select 1 from mdt.diag_cierres where tripulante = v.id and momento = 'despues') then json_build_object(
      'aciertos_antes', (select count(*) from mdt.diag_respuestas r join mdt.diag_claves k on k.pregunta = r.pregunta
                          where r.tripulante = v.id and k.momento = 'antes' and r.correcta),
      'aciertos_despues', (select count(*) from mdt.diag_respuestas r join mdt.diag_claves k on k.pregunta = r.pregunta
                            where r.tripulante = v.id and k.momento = 'despues' and r.correcta),
      'detalle', coalesce((select json_agg(json_build_object('pregunta', k.pregunta, 'acierto', r.correcta, 'elegida', r.opcion,
                                                             'correcta', k.correcta, 'porque', k.porque))
                             from mdt.diag_claves k left join mdt.diag_respuestas r on r.pregunta = k.pregunta and r.tripulante = v.id
                            where k.momento = 'despues'), '[]'::json)) end)
$$;

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
    'diagnostico', json_build_object(
      'activo', mdt.diag_activo(),
      'liberada', (select sala_liberada from mdt.equipos where id = v_eq),
      'miembros', (select count(*) from mdt.tripulantes where equipo = v_eq),
      'antes', mdt.diag_listos(v_eq, 'antes'),
      'despues', mdt.diag_listos(v_eq, 'despues')),
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

  -- El mismo celular puede corregir su registro: se actualiza (y conserva su diagnóstico).
  select t.id into v_previo from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo
   where e.sesion = mdt.sesion() and t.dispositivo = p_dispositivo;

  if (select count(*) from mdt.tripulantes where equipo = v_eq and id is distinct from v_previo) >= 7 then
    raise exception 'Este grupo ya tiene sus 7 tripulantes.';
  end if;
  v_cupo := case p_rol when 'tripulante' then 4 else 1 end;
  select count(*) into v_ocupados from mdt.tripulantes where equipo = v_eq and rol = p_rol and id is distinct from v_previo;
  if v_ocupados >= v_cupo then raise exception 'Ese rol ya está ocupado en este grupo. Revisen su escarapela.'; end if;

  if v_previo is not null then
    update mdt.tripulantes set equipo = v_eq, nombre = v_nombre, profesion = v_prof, rol = p_rol, autoriza = true where id = v_previo;
  else
    insert into mdt.tripulantes (equipo, nombre, profesion, rol, autoriza, dispositivo)
    values (v_eq, v_nombre, v_prof, p_rol, true, p_dispositivo);
  end if;
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
  perform mdt.verificar_codigo_sala(p_codigo);
  perform mdt.vencer();
  return mdt.estado_equipo(mdt.equipo_id(p_grupo));
end $$;

-- 5. Abrir una estación (en orden 1 → 5; una estación no puede tener dos grupos).
create function public.mdt_abrir(p_codigo text, p_grupo text, p_estacion text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int; v_num int; v_prev text; v_otro text; v_miembros int; v_listos int;
begin
  perform mdt.verificar_codigo_sala(p_codigo);
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
    elsif mdt.diag_activo() and not (select sala_liberada from mdt.equipos where id = v_eq) then
      -- La Estación 1 se abre cuando toda la tripulación terminó el diagnóstico
      -- inicial o cuando el Guía Especialista libera la Sala.
      select count(*) into v_miembros from mdt.tripulantes where equipo = v_eq;
      v_listos := mdt.diag_listos(v_eq, 'antes');
      if v_listos < v_miembros then raise exception 'DIAGNOSTICO:%:%', v_listos, v_miembros; end if;
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
  perform mdt.verificar_codigo_sala(p_codigo);
  perform mdt.vencer();
  v_eq := mdt.equipo_id(p_grupo);
  select * into c from mdt.codigos where id = p_codigo_id;
  if c.id is null then raise exception 'Código no válido.'; end if;
  select estado into v_estado from mdt.avance where equipo = v_eq and estacion = c.estacion;
  if v_estado is distinct from 'abierta' then raise exception 'CERRADA:La estación ya está cerrada.'; end if;
  if trim(coalesce(p_valor, '')) = '' then raise exception 'Escriban el código antes de validar.'; end if;
  -- Las pruebas de cada estación se resuelven en orden (1, 2, 3 y luego la clave).
  if exists (select 1 from mdt.codigos c2
              left join mdt.respuestas r2 on r2.codigo = c2.id and r2.equipo = v_eq
             where c2.estacion = c.estacion and c2.orden < c.orden
               and not (coalesce(r2.correcta, false) or coalesce(r2.intentos, 0) >= 2)) then
    raise exception 'Primero resuelvan la prueba anterior.';
  end if;

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
  perform mdt.verificar_codigo_sala(p_codigo);
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
  return json_build_object('ahora', now(),
    'diagnostico', mdt.diag_activo(),
    'revelado', coalesce((select revelado from mdt.sesiones where id = mdt.sesion()), false),
    'grupos', coalesce((select json_agg(json_build_object(
      'grupo', g.grupo,
      'registrado', e.id is not null,
      'miembros', (select count(*) from mdt.tripulantes t where t.equipo = e.id),
      'diag_despues', coalesce(mdt.diag_listos(e.id, 'despues'), 0),
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
  perform mdt.verificar_codigo_sala(p_codigo);
  v_eq := mdt.equipo_id(p_grupo);
  if not exists (select 1 from mdt.respuestas where equipo = v_eq and codigo = '5.2' and (correcta or intentos >= 2)) then
    raise exception 'Primero registren el código de la prueba 5.2.';
  end if;
  return coalesce((select valor from mdt.privado where clave = 'ventajas'), '{}'::jsonb)::json;
end $$;

-- 10. Guía Especialista (con PIN): códigos, panel, liberar Sala, revelar ganador, nueva sesión, claves y Excel.
create function public.mdt_admin(p_pin text, p_accion text, p_dato text default null) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_id int;
begin
  if p_pin is distinct from (select pin from mdt.config where id = 1) or p_pin = 'CAMBIAR' then
    raise exception 'PIN incorrecto.';
  end if;
  if p_accion = 'verificar' then
    return json_build_object('ok', true, 'codigo_acceso', (select codigo_acceso from mdt.config where id = 1),
                             'codigo_sala', (select codigo_sala from mdt.config where id = 1), 'sesion', mdt.sesion());
  elsif p_accion = 'nueva_sesion' then
    insert into mdt.sesiones default values returning id into v_id;
    update mdt.config set sesion = v_id where id = 1;
    return json_build_object('ok', true, 'sesion', v_id);
  elsif p_accion = 'cambiar_pin' then
    if length(trim(coalesce(p_dato, ''))) < 4 then raise exception 'El PIN debe tener al menos 4 caracteres.'; end if;
    update mdt.config set pin = trim(p_dato) where id = 1;
    return json_build_object('ok', true);
  elsif p_accion = 'panel' then
    perform mdt.vencer();
    return json_build_object('ahora', now(), 'sesion', mdt.sesion(),
      'diagnostico', mdt.diag_activo(),
      'revelado', coalesce((select revelado from mdt.sesiones where id = mdt.sesion()), false),
      'codigo_acceso', (select codigo_acceso from mdt.config where id = 1),
      'codigo_sala', (select codigo_sala from mdt.config where id = 1),
      'grupos', (select json_agg(json_build_object(
        'grupo', g.grupo,
        'registrado', e.id is not null,
        'sala_liberada', coalesce(e.sala_liberada, false),
        'diag_antes', coalesce(mdt.diag_listos(e.id, 'antes'), 0),
        'diag_despues', coalesce(mdt.diag_listos(e.id, 'despues'), 0),
        'tripulantes', coalesce((select json_agg(json_build_object('nombre', t.nombre, 'profesion', t.profesion, 'rol', t.rol,
                                   'antes', exists (select 1 from mdt.diag_cierres c where c.tripulante = t.id and c.momento = 'antes'),
                                   'despues', exists (select 1 from mdt.diag_cierres c where c.tripulante = t.id and c.momento = 'despues')) order by t.creado)
                                   from mdt.tripulantes t where t.equipo = e.id), '[]'::json),
        'total', coalesce((select sum(total) from mdt.avance where equipo = e.id), 0),
        'estaciones', coalesce((select json_object_agg(a.estacion, json_build_object('estado', a.estado, 'total', a.total, 'segundos', a.seg_usados))
                                 from mdt.avance a where a.equipo = e.id), '{}'::json),
        'actual', (select json_build_object('estacion', a.estacion, 'inicio', a.inicio, 'limite', s.limite_seg, 'gracia', s.gracia_seg)
                     from mdt.avance a join mdt.estaciones s on s.id = a.estacion
                    where a.equipo = e.id and a.estado = 'abierta' limit 1)))
        from (values ('davinci'), ('verne'), ('wells'), ('tesla')) g(grupo)
        left join mdt.equipos e on e.grupo = g.grupo and e.sesion = mdt.sesion()));
  elsif p_accion = 'cambiar_codigo' then
    if length(trim(coalesce(p_dato, ''))) < 4 then raise exception 'El código debe tener al menos 4 caracteres.'; end if;
    if mdt.norm(p_dato) = mdt.norm((select codigo_sala from mdt.config where id = 1)) then raise exception 'El código de registro debe ser distinto al de la Sala de Escape.'; end if;
    update mdt.config set codigo_acceso = upper(trim(p_dato)) where id = 1;
    return json_build_object('ok', true);
  elsif p_accion = 'cambiar_codigo_sala' then
    if length(trim(coalesce(p_dato, ''))) < 4 then raise exception 'El código debe tener al menos 4 caracteres.'; end if;
    if mdt.norm(p_dato) = mdt.norm((select codigo_acceso from mdt.config where id = 1)) then raise exception 'El código de la Sala de Escape debe ser distinto al de registro.'; end if;
    update mdt.config set codigo_sala = upper(trim(p_dato)) where id = 1;
    return json_build_object('ok', true);
  elsif p_accion = 'reabrir_grupo' then
    delete from mdt.avance where equipo = (select id from mdt.equipos where sesion = mdt.sesion() and grupo = p_dato);
    delete from mdt.respuestas where equipo = (select id from mdt.equipos where sesion = mdt.sesion() and grupo = p_dato);
    return json_build_object('ok', true);
  elsif p_accion = 'borrar_grupo' then
    delete from mdt.equipos where sesion = mdt.sesion() and grupo = p_dato;
    return json_build_object('ok', true);
  elsif p_accion = 'liberar_sala' then
    -- Abre la Estación 1 aunque falten tripulantes por terminar el diagnóstico inicial.
    update mdt.equipos set sala_liberada = true where sesion = mdt.sesion() and grupo = p_dato;
    return json_build_object('ok', true);
  elsif p_accion = 'revelar' then
    -- El Gran Tablero muestra al ganador aunque falten diagnósticos finales.
    update mdt.sesiones set revelado = true where id = mdt.sesion();
    return json_build_object('ok', true);
  elsif p_accion = 'claves' then
    -- Hoja de claves para el Guía Especialista (solo con PIN).
    return json_build_object('claves', coalesce((select json_agg(json_build_object(
        'codigo', c.id, 'estacion', c.estacion, 'puntos', c.puntos, 'respuesta', c.mostrar) order by c.estacion, c.orden)
      from mdt.codigos c), '[]'::json));
  elsif p_accion = 'exportar' then
    -- p_dato = 'historico' → todas las sesiones; si no, solo la sesión actual.
    return json_build_object(
      'puntajes', coalesce((select json_agg(x order by x."Sesión", x."Puntos totales" desc) from (
        select s.id as "Sesión", to_char(coalesce((select max(coalesce(a.fin, a.inicio)) from mdt.avance a where a.equipo = e.id), s.creada) at time zone 'America/Bogota', 'YYYY-MM-DD HH24:MI') as "Fecha",
               mdt.nombre_grupo(e.grupo) as "Grupo",
               (select count(*) from mdt.tripulantes t where t.equipo = e.id) as "N.º integrantes",
               coalesce((select string_agg(t.nombre || ' (' || mdt.nombre_rol(t.rol) || ')', ', ' order by t.creado) from mdt.tripulantes t where t.equipo = e.id), '') as "Integrantes",
               coalesce((select total from mdt.avance where equipo = e.id and estacion = 'E1'), 0) as "E1",
               coalesce((select total from mdt.avance where equipo = e.id and estacion = 'E2'), 0) as "E2",
               coalesce((select total from mdt.avance where equipo = e.id and estacion = 'E3'), 0) as "E3",
               coalesce((select total from mdt.avance where equipo = e.id and estacion = 'E4'), 0) as "E4",
               coalesce((select total from mdt.avance where equipo = e.id and estacion = 'E5'), 0) as "E5",
               coalesce((select sum(total) from mdt.avance where equipo = e.id), 0) as "Puntos totales",
               (select count(*) from mdt.avance where equipo = e.id and estado in ('cerrada', 'agotada')) as "Estaciones completadas"
          from mdt.equipos e join mdt.sesiones s on s.id = e.sesion
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json),
      'participantes', coalesce((select json_agg(x order by x."Sesión", x."Grupo") from (
        select e.sesion as "Sesión", to_char(t.creado at time zone 'America/Bogota', 'YYYY-MM-DD HH24:MI') as "Fecha de registro",
               mdt.nombre_grupo(e.grupo) as "Grupo", t.nombre as "Nombre", t.profesion as "Profesión", mdt.nombre_rol(t.rol) as "Rol",
               case when t.autoriza then 'SÍ' else 'NO' end as "Autoriza datos"
          from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json),
      'estaciones', coalesce((select json_agg(x order by x."Sesión", x."Grupo", x."Estación") from (
        select e.sesion as "Sesión", mdt.nombre_grupo(e.grupo) as "Grupo", a.estacion as "Estación",
               case a.estado when 'cerrada' then 'Completada' when 'agotada' then 'Cerrada por tiempo' else 'En juego' end as "Estado",
               a.seg_usados as "Segundos", a.pts_codigos as "Puntos respuestas", a.pts_tiempo as "Puntos agilidad", a.total as "Total"
          from mdt.avance a join mdt.equipos e on e.id = a.equipo
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json),
      -- Diagnóstico: una fila por respuesta. "Opción elegida" es la posición (0 a 3)
      -- en js/diagnostico-contenido.js; el panel la convierte en texto.
      'diagnostico', coalesce((select json_agg(x order by x."Sesión", x."Grupo", x."Nombre", x."Momento", x."orden") from (
        select e.sesion as "Sesión", mdt.nombre_grupo(e.grupo) as "Grupo", t.nombre as "Nombre", t.profesion as "Profesión",
               mdt.nombre_rol(t.rol) as "Rol", case k.momento when 'antes' then 'Antes' else 'Después' end as "Momento",
               r.pregunta as "Pregunta", substring(r.pregunta from 2)::int as "orden", r.opcion as "Opción elegida",
               case when r.correcta then 'SÍ' else 'NO' end as "Acierto", r.certeza as "Certeza", r.segundos as "Segundos",
               case when r.certeza = 'Seguro' and r.correcta then 'Dominio'
                    when r.correcta then 'Dominio frágil'
                    when r.certeza = 'Seguro' then 'Error peligroso'
                    else 'Vacío reconocido' end as "Cuadrante",
               to_char(r.creado at time zone 'America/Bogota', 'YYYY-MM-DD HH24:MI') as "Fecha"
          from mdt.diag_respuestas r join mdt.diag_claves k on k.pregunta = r.pregunta
          join mdt.tripulantes t on t.id = r.tripulante join mdt.equipos e on e.id = t.equipo
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json),
      'reflexiones', coalesce((select json_agg(x order by x."Sesión", x."Grupo", x."Nombre", x."Momento") from (
        select e.sesion as "Sesión", mdt.nombre_grupo(e.grupo) as "Grupo", t.nombre as "Nombre", t.profesion as "Profesión",
               case c.momento when 'antes' then 'Antes' else 'Después' end as "Momento",
               coalesce(c.rutina[1], '') as "Rutina 1", coalesce(c.rutina[2], '') as "Rutina 2", coalesce(c.rutina[3], '') as "Rutina 3",
               c.imagen as "Imagen", c.palabra as "Palabra",
               to_char(c.terminado at time zone 'America/Bogota', 'YYYY-MM-DD HH24:MI') as "Enviado"
          from mdt.diag_cierres c join mdt.tripulantes t on t.id = c.tripulante join mdt.equipos e on e.id = t.equipo
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json),
      'resumen', coalesce((select json_agg(x order by x."Sesión", x."Grupo", x."Nombre") from (
        select e.sesion as "Sesión", mdt.nombre_grupo(e.grupo) as "Grupo", t.nombre as "Nombre", t.profesion as "Profesión",
               mdt.nombre_rol(t.rol) as "Rol",
               case when exists (select 1 from mdt.diag_cierres c where c.tripulante = t.id and c.momento = 'antes') then 'SÍ' else 'NO' end as "Terminó antes",
               case when exists (select 1 from mdt.diag_cierres c where c.tripulante = t.id and c.momento = 'despues') then 'SÍ' else 'NO' end as "Terminó después",
               d.antes as "Aciertos antes (de 10)", d.despues as "Aciertos después (de 10)", d.despues - d.antes as "Cambio",
               d.peligrosos as "Errores con certeza · después"
          from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo
          cross join lateral (
            select count(*) filter (where k.momento = 'antes' and r.correcta) as antes,
                   count(*) filter (where k.momento = 'despues' and r.correcta) as despues,
                   count(*) filter (where k.momento = 'despues' and not r.correcta and r.certeza = 'Seguro') as peligrosos
              from mdt.diag_respuestas r join mdt.diag_claves k on k.pregunta = r.pregunta where r.tripulante = t.id) d
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json));
  end if;
  raise exception 'Acción no válida.';
end $$;

-- 11. Diagnóstico: estado del tripulante (por su celular).
create function public.mdt_diagnostico(p_codigo text, p_dispositivo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  return mdt.diag_estado(mdt.diag_tripulante(p_dispositivo));
end $$;

-- 12. Diagnóstico: una respuesta. Sin volver atrás; el acierto se calcula aquí.
create function public.mdt_diag_responder(p_codigo text, p_dispositivo text, p_pregunta text,
                                          p_opcion int, p_certeza text, p_segundos int) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v mdt.tripulantes; k mdt.diag_claves;
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  v := mdt.diag_tripulante(p_dispositivo);
  select * into k from mdt.diag_claves where pregunta = p_pregunta;
  if k.pregunta is null then raise exception 'Pregunta no válida.'; end if;
  if p_opcion is null or p_opcion not between 0 and 3 then raise exception 'Elija una opción.'; end if;
  if p_certeza is null or p_certeza not in ('Seguro', 'Creo que sí', 'Lo adivino') then raise exception 'Indique qué tan seguro está de su respuesta.'; end if;
  if k.momento = 'despues' and not exists (select 1 from mdt.avance where equipo = v.equipo and estacion = 'E5' and estado in ('cerrada', 'agotada')) then
    raise exception 'El diagnóstico final se abre cuando su grupo cierre la Estación 5.';
  end if;
  if exists (select 1 from mdt.diag_cierres where tripulante = v.id and momento = k.momento) then
    raise exception 'Este diagnóstico ya fue enviado.';
  end if;
  insert into mdt.diag_respuestas (tripulante, pregunta, opcion, correcta, certeza, segundos)
  values (v.id, k.pregunta, p_opcion, p_opcion = k.correcta, p_certeza, greatest(0, least(coalesce(p_segundos, 0), 3600)))
  on conflict do nothing;
  return json_build_object('ok', true);
end $$;

-- 13. Diagnóstico: rutina de pensamiento, imagen y palabra; cierra el momento.
create function public.mdt_diag_cerrar(p_codigo text, p_dispositivo text, p_momento text,
                                       p_rutina text[], p_imagen text, p_palabra text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v mdt.tripulantes; v_faltan int;
begin
  perform mdt.verificar_codigo(p_codigo);
  v := mdt.diag_tripulante(p_dispositivo);
  if p_momento not in ('antes', 'despues') then raise exception 'Momento no válido.'; end if;
  select count(*) into v_faltan from mdt.diag_claves k
   where k.momento = p_momento and not exists (select 1 from mdt.diag_respuestas r where r.tripulante = v.id and r.pregunta = k.pregunta);
  if v_faltan > 0 then raise exception 'Faltan % preguntas por responder.', v_faltan; end if;
  if length(trim(coalesce(p_imagen, ''))) = 0 then raise exception 'Elija una imagen.'; end if;
  if length(trim(coalesce(p_palabra, ''))) = 0 then raise exception 'Escriba una palabra que acompañe la imagen.'; end if;
  insert into mdt.diag_cierres (tripulante, momento, rutina, imagen, palabra)
  values (v.id, p_momento,
          coalesce((select array_agg(left(trim(x), 1000) order by n) from unnest(p_rutina) with ordinality u(x, n)), '{}'),
          left(trim(p_imagen), 40), left(upper(trim(p_palabra)), 40))
  on conflict do nothing;
  return mdt.diag_estado(v);
end $$;

-- --------------------------------------------------------------- permisos ----
revoke all on all tables in schema mdt from public;
revoke execute on all functions in schema mdt from public;
grant usage on schema mdt to postgres;

do $$ begin
  execute 'grant execute on function public.mdt_acceso(text), public.mdt_unirse(text,text,text,text,text,boolean,text),
           public.mdt_tripulacion(text,text), public.mdt_consola(text,text), public.mdt_abrir(text,text,text),
           public.mdt_responder(text,text,text,text), public.mdt_finalizar(text,text,text), public.mdt_tablero(),
           public.mdt_ventajas(text,text), public.mdt_admin(text,text,text),
           public.mdt_diagnostico(text,text), public.mdt_diag_responder(text,text,text,int,text,int),
           public.mdt_diag_cerrar(text,text,text,text[],text,text) to anon, authenticated';
end $$;
