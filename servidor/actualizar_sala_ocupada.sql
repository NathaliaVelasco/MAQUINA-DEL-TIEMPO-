-- ============================================================================
-- MÁQUINA DEL TIEMPO · ACTUALIZACIÓN: UNA SOLA SALA A LA VEZ
-- Se ejecuta UNA vez en Supabase → SQL Editor, sobre una base ya instalada.
-- Mientras un grupo está en la Sala de Escape, los demás grupos no pueden
-- entrar ("La sala está ocupada"). La sala se libera cuando el grupo termina
-- la Estación 5 o cuando el Guía Especialista la libera desde su panel.
-- No borra datos.
-- ============================================================================

alter table mdt.sesiones add column if not exists ocupada_por text;   -- grupo que tiene la Sala ahora

-- Entrar a la Sala (solo desde el formulario de acceso): reclama la Sala para el grupo.
-- Si otro grupo la tiene, no deja entrar.
create or replace function public.mdt_entrar_sala(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_ocup text;
begin
  perform mdt.verificar_codigo_sala(p_codigo);
  select ocupada_por into v_ocup from mdt.sesiones where id = mdt.sesion() for update;
  if v_ocup is null then
    update mdt.sesiones set ocupada_por = p_grupo where id = mdt.sesion();
  elsif v_ocup <> p_grupo then
    raise exception 'SALA_OCUPADA:%', v_ocup;
  end if;
  return json_build_object('ok', true);
end $$;

-- Consola (sondeo): si otro grupo tiene la Sala, saca al grupo que no la tiene.
-- Si el grupo ya terminó la ruta, libera la Sala para el siguiente.
create or replace function public.mdt_consola(p_codigo text, p_grupo text) returns json
language plpgsql security definer set search_path = mdt, public as $$
declare v_ocup text; v_eq int; v_total int; v_listas int;
begin
  perform mdt.verificar_codigo_sala(p_codigo);
  perform mdt.vencer();
  select ocupada_por into v_ocup from mdt.sesiones where id = mdt.sesion();
  if v_ocup is not null and v_ocup <> p_grupo then
    raise exception 'SALA_OCUPADA:%', v_ocup;
  end if;
  v_eq := mdt.equipo_id(p_grupo);
  select count(*) into v_total from mdt.estaciones;
  select count(*) into v_listas from mdt.avance where equipo = v_eq and estado in ('cerrada', 'agotada');
  if v_listas >= v_total then
    update mdt.sesiones set ocupada_por = null where id = mdt.sesion() and ocupada_por = p_grupo;
  end if;
  return mdt.estado_equipo(v_eq);
end $$;

-- Guía Especialista: ver quién tiene la Sala y liberarla.
create or replace function public.mdt_ocupacion(p_pin text, p_liberar boolean default false) returns json
language plpgsql security definer set search_path = mdt, public as $$
begin
  if p_pin is distinct from (select pin from mdt.config where id = 1) or p_pin = 'CAMBIAR' then
    raise exception 'PIN incorrecto.';
  end if;
  if coalesce(p_liberar, false) then
    update mdt.sesiones set ocupada_por = null where id = mdt.sesion();
  end if;
  return json_build_object('ok', true, 'ocupada_por', (select ocupada_por from mdt.sesiones where id = mdt.sesion()));
end $$;

revoke execute on function public.mdt_entrar_sala(text, text) from public;
grant execute on function public.mdt_entrar_sala(text, text) to anon, authenticated;
revoke execute on function public.mdt_ocupacion(text, boolean) from public;
grant execute on function public.mdt_ocupacion(text, boolean) to anon, authenticated;
