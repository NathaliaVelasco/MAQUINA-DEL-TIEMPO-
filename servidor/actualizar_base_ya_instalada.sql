-- ============================================================================
-- MÁQUINA DEL TIEMPO · ACTUALIZACIÓN: DIAGNÓSTICO ANTES Y DESPUÉS (no borra datos)
-- Se ejecuta UNA vez en Supabase → SQL Editor, sobre una base ya instalada.
-- Agrega: diagnóstico individual antes de la Estación 1 y después de la 5,
-- "Liberar Sala" y "Revelar ganador" para el Guía Especialista, y 3 pestañas
-- nuevas en el Excel. Conserva participantes, puntajes, sesiones, códigos y PIN.
-- Las respuestas del diagnóstico se cargan aparte (archivo privado).
-- ============================================================================

alter table mdt.equipos  add column if not exists sala_liberada boolean not null default false;
alter table mdt.sesiones add column if not exists revelado boolean not null default false;

-- Diagnóstico antes y después (individual, en el celular de cada tripulante).
-- La opción correcta y el "por qué" se cargan con el archivo privado.
create table if not exists mdt.diag_claves (
  pregunta text primary key,                 -- 'A1'…'A10' (antes), 'B1'…'B10' (después)
  momento  text not null check (momento in ('antes', 'despues')),
  correcta int  not null check (correcta between 0 and 3),
  porque   text not null default ''
);

create table if not exists mdt.diag_respuestas (
  tripulante int  not null references mdt.tripulantes(id) on delete cascade,
  pregunta   text not null references mdt.diag_claves(pregunta) on delete cascade,
  opcion     int  not null,
  correcta   boolean not null,
  certeza    text not null,
  segundos   int,
  creado     timestamptz not null default now(),
  primary key (tripulante, pregunta)
);

create table if not exists mdt.diag_cierres (            -- rutina de pensamiento, imagen y palabra
  tripulante int  not null references mdt.tripulantes(id) on delete cascade,
  momento    text not null check (momento in ('antes', 'despues')),
  rutina     text[] not null default '{}',
  imagen     text,
  palabra    text,
  terminado  timestamptz not null default now(),
  primary key (tripulante, momento)
);

create or replace function mdt.diag_activo() returns boolean language sql stable as $$
  select exists (select 1 from mdt.diag_claves)
$$;

-- Cuántos tripulantes de un equipo ya enviaron el diagnóstico (antes o después).
create or replace function mdt.diag_listos(v_eq int, v_momento text) returns int language sql stable as $$
  select count(*)::int from mdt.diag_cierres c join mdt.tripulantes t on t.id = c.tripulante
   where t.equipo = v_eq and c.momento = v_momento
$$;

create or replace function mdt.diag_tripulante(p_dispositivo text) returns mdt.tripulantes language plpgsql as $$
declare v mdt.tripulantes;
begin
  select t.* into v from mdt.tripulantes t join mdt.equipos e on e.id = t.equipo
   where e.sesion = mdt.sesion() and t.dispositivo = p_dispositivo;
  if v.id is null then raise exception 'REGISTRO:Este celular no está registrado en la sesión actual.'; end if;
  return v;
end $$;

-- Estado del diagnóstico de un tripulante. Las respuestas correctas solo se
-- entregan cuando ya envió el diagnóstico final.
create or replace function mdt.diag_estado(v mdt.tripulantes) returns json language sql stable as $$
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

create or replace function mdt.estado_equipo(v_eq int) returns json language sql stable as $$
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

create or replace function public.mdt_unirse(p_codigo text, p_grupo text, p_nombre text, p_profesion text,
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

create or replace function public.mdt_abrir(p_codigo text, p_grupo text, p_estacion text) returns json
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

create or replace function public.mdt_tablero() returns json
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

create or replace function public.mdt_admin(p_pin text, p_accion text, p_dato text default null) returns json
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
create or replace function public.mdt_diagnostico(p_codigo text, p_dispositivo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  perform mdt.verificar_codigo(p_codigo);
  perform mdt.vencer();
  return mdt.diag_estado(mdt.diag_tripulante(p_dispositivo));
end $$;

-- 12. Diagnóstico: una respuesta. Sin volver atrás; el acierto se calcula aquí.
create or replace function public.mdt_diag_responder(p_codigo text, p_dispositivo text, p_pregunta text,
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
create or replace function public.mdt_diag_cerrar(p_codigo text, p_dispositivo text, p_momento text,
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
