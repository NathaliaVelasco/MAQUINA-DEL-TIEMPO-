-- ============================================================================
-- MÁQUINA DEL TIEMPO · ACTUALIZACIÓN (no borra datos)
-- Se ejecuta UNA vez en Supabase → SQL Editor, sobre una base ya instalada.
-- Agrega: código propio para la Sala de Escape, pruebas en secuencia y
-- exportación a Excel con histórico de todas las sesiones.
-- Conserva participantes, puntajes, sesiones, respuestas, código y PIN.
-- ============================================================================

alter table mdt.config add column if not exists codigo_sala text not null default 'CAMBIAR-SALA';

-- >>> Código para entrar a la Sala de Escape (distinto al de registro). Puede cambiarlo aquí o desde el panel del Guía Especialista.
update mdt.config set codigo_sala = 'SALA-2026' where id = 1 and codigo_sala = 'CAMBIAR-SALA';

-- ------------------------------------------------------------- utilidades ----
create or replace function mdt.norm(t text) returns text language sql immutable as $$
  select upper(translate(regexp_replace(coalesce(t, ''), '\s', '', 'g'),
               'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))
$$;

create or replace function mdt.nombre_grupo(g text) returns text language sql immutable as $$
  select case g when 'davinci' then 'Alquimistas de Da Vinci' when 'verne' then 'Exploradores de Verne'
                when 'wells' then 'Viajeros de Wells' when 'tesla' then 'Guardianes de Tesla' else g end
$$;

create or replace function mdt.nombre_rol(r text) returns text language sql immutable as $$
  select case r when 'piloto' then 'Líder Piloto de Vuelo' when 'copiloto' then 'Copiloto'
                when 'comandante' then 'Comandante de Misión' when 'tripulante' then 'Tripulante de Élite' else r end
$$;

create or replace function mdt.sesion() returns int language sql stable as $$
  select sesion from mdt.config where id = 1
$$;

create or replace function mdt.verificar_codigo(p_codigo text) returns void language plpgsql as $$
begin
  if mdt.norm(p_codigo) is distinct from mdt.norm((select codigo_acceso from mdt.config where id = 1)) then
    raise exception 'Código de acceso incorrecto.';
  end if;
end $$;

create or replace function mdt.verificar_codigo_sala(p_codigo text) returns void language plpgsql as $$
begin
  if mdt.norm(p_codigo) is distinct from mdt.norm((select codigo_sala from mdt.config where id = 1)) then
    raise exception 'Código de la Sala de Escape incorrecto.';
  end if;
end $$;

create or replace function mdt.equipo_id(p_grupo text) returns int language plpgsql as $$
declare v int;
begin
  select id into v from mdt.equipos where sesion = mdt.sesion() and grupo = p_grupo;
  if v is null then
    raise exception 'Este grupo todavía no tiene tripulación registrada.';
  end if;
  return v;
end $$;

-- Cierra por tiempo (12:30) las estaciones vencidas: sin puntos.
create or replace function mdt.vencer() returns void language plpgsql as $$
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
create or replace function mdt.estado_equipo(v_eq int) returns json language sql stable as $$
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
create or replace function public.mdt_acceso(p_codigo text) returns json
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
create or replace function public.mdt_tripulacion(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int;
begin
  perform mdt.verificar_codigo(p_codigo);
  select id into v_eq from mdt.equipos where sesion = mdt.sesion() and grupo = p_grupo;
  return json_build_object('tripulantes', coalesce((select json_agg(json_build_object('nombre', nombre, 'rol', rol) order by creado)
                                                    from mdt.tripulantes where equipo = v_eq), '[]'::json));
end $$;

-- 4. Consola: estado completo del equipo.
create or replace function public.mdt_consola(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  perform mdt.verificar_codigo_sala(p_codigo);
  perform mdt.vencer();
  return mdt.estado_equipo(mdt.equipo_id(p_grupo));
end $$;

-- 5. Abrir una estación (en orden 1 → 5; una estación no puede tener dos grupos).
create or replace function public.mdt_abrir(p_codigo text, p_grupo text, p_estacion text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_eq int; v_num int; v_prev text; v_otro text;
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
    end if;
    select e.grupo into v_otro from mdt.avance a join mdt.equipos e on e.id = a.equipo
     where a.estacion = p_estacion and a.estado = 'abierta' and e.sesion = mdt.sesion() and a.equipo <> v_eq limit 1;
    if v_otro is not null then raise exception 'OCUPADA:%', v_otro; end if;
    insert into mdt.avance (equipo, estacion) values (v_eq, p_estacion);
  end if;
  return mdt.estado_equipo(v_eq);
end $$;

-- 6. Responder un código: 2 intentos. Al segundo fallo se muestra la respuesta.
create or replace function public.mdt_responder(p_codigo text, p_grupo text, p_codigo_id text, p_valor text) returns json
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
create or replace function public.mdt_finalizar(p_codigo text, p_grupo text, p_estacion text) returns json
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
create or replace function public.mdt_tablero() returns json
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
create or replace function public.mdt_ventajas(p_codigo text, p_grupo text) returns json
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

-- 10. Facilitador (con PIN): nueva sesión, código de acceso, reabrir grupo, exportar.
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
      'codigo_acceso', (select codigo_acceso from mdt.config where id = 1),
      'codigo_sala', (select codigo_sala from mdt.config where id = 1),
      'grupos', (select json_agg(json_build_object(
        'grupo', g.grupo,
        'registrado', e.id is not null,
        'tripulantes', coalesce((select json_agg(json_build_object('nombre', t.nombre, 'profesion', t.profesion, 'rol', t.rol) order by t.creado)
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
         where p_dato = 'historico' or e.sesion = mdt.sesion()) x), '[]'::json));
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
