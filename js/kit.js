/* ==========================================================================
   KIT DE TRIPULACIÓN · celular de cada participante
   Registro: grupo, nombre completo, profesión, rol y autorización de datos.
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego, app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  let codigo = params.get('c') || M.leer('codigo', '');
  let registro = M.leer('registro', null);
  let grupos = {}, sel = { grupo: params.get('grupo') || (registro && registro.grupo) || '', rol: (registro && registro.rol) || '' };
  let sondeo = null;

  function pinta(html) { app.innerHTML = html; }
  function cab() {
    return '<header class="cabecera">' + M.logo() + '<div class="titulo-cab"><b>' + M.esc(J.titulo) + '</b><small>Kit de tripulación</small></div></header>';
  }

  /* ---------- 1. Código de acceso ---------- */
  function pAcceso(err) {
    pinta(cab() + '<main class="pagina">'
      + '<section class="hud">' + M.logo('logo-portal')
      + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1><p class="subtitulo-juego">Kit de tripulación</p>'
      + '<form id="f"><label class="campo"><span>Código de acceso</span><input type="text" id="cod" class="mayus" autocomplete="off" autocapitalize="characters" value="' + M.esc(codigo) + '" placeholder="El que les entregó el facilitador"></label>'
      + '<p class="error" id="err">' + M.esc(err || '') + '</p>'
      + '<button class="btn primario ancho grande" type="submit">ENTRAR →</button></form>'
      + '</section></main>');
    document.getElementById('f').onsubmit = async ev => {
      ev.preventDefault(); M.audio();
      const v = document.getElementById('cod').value.trim();
      if (!v) return pAcceso('Escriban el código de acceso.');
      try { const r = await M.rpc('mdt_acceso', { p_codigo: v }); codigo = v; M.guardar('codigo', v); grupos = r.grupos || {}; pFormulario(); }
      catch (e) { pAcceso(M.mensajeError(e)); }
    };
  }

  /* ---------- 2. Registro ---------- */
  function libres(g, rolId) {
    const info = grupos[g] || { roles: {} };
    const usados = (info.roles && info.roles[rolId]) || 0;
    const propio = registro && registro.grupo === g && registro.rol === rolId ? 1 : 0;
    return J.roles[rolId].cupo - usados + propio;
  }
  function pFormulario(err) {
    const opGrupos = J.grupos.map(g => {
      const n = (grupos[g.id] && grupos[g.id].miembros) || 0;
      return '<button type="button" class="opcion ' + (sel.grupo === g.id ? 'sel' : '') + '" data-grupo="' + g.id + '" style="--g:' + g.color + '">'
        + '<span class="simbolo">' + g.simbolo + '</span><span>' + M.esc(g.nombre) + '<small>' + n + ' / 7 tripulantes</small></span></button>';
    }).join('');
    const opRoles = Object.keys(J.roles).map(id => {
      const r = J.roles[id], l = sel.grupo ? libres(sel.grupo, id) : r.cupo;
      return '<button type="button" class="opcion ' + (sel.rol === id ? 'sel' : '') + '" data-rol="' + id + '" ' + (l <= 0 && sel.rol !== id ? 'disabled' : '') + '>'
        + '<span>' + M.esc(r.nombre) + '<small>' + (l > 0 ? (l === 1 ? '1 cupo libre' : l + ' cupos libres') : 'Ocupado') + '</small></span></button>';
    }).join('');
    const prev = registro || {};
    pinta(cab() + '<main class="pagina"><section class="hud">'
      + '<p class="sobretitulo">Únanse a la tripulación</p><h2 class="seccion">Registro de Cronocirujano</h2>'
      + '<form id="f">'
      + '<div class="campo"><span>Su grupo</span><div class="opciones">' + opGrupos + '</div></div>'
      + '<label class="campo"><span>Nombre completo</span><input type="text" id="nombre" class="mayus" autocomplete="name" autocapitalize="characters" maxlength="80" value="' + M.esc(prev.nombre || '') + '" placeholder="NOMBRES Y APELLIDOS"></label>'
      + '<label class="campo"><span>Profesión</span><input type="text" id="profesion" class="mayus" autocapitalize="characters" maxlength="60" value="' + M.esc(prev.profesion || '') + '" placeholder="EJ: CIRUJANO GENERAL"></label>'
      + '<div class="campo"><span>Su rol (está en su escarapela)</span><div class="opciones">' + opRoles + '</div></div>'
      + '<label class="casilla"><input type="checkbox" id="autoriza"><span>' + M.esc(J.autorizacion) + '</span></label>'
      + '<p class="error" id="err">' + M.esc(err || '') + '</p>'
      + '<button class="btn primario ancho grande" type="submit">UNIRSE A LA TRIPULACIÓN →</button>'
      + '</form></section></main>');
    app.querySelectorAll('[data-grupo]').forEach(b => b.onclick = () => { guardarCampos(); sel.grupo = b.dataset.grupo; if (sel.rol && libres(sel.grupo, sel.rol) <= 0) sel.rol = ''; pFormulario(); });
    app.querySelectorAll('[data-rol]').forEach(b => b.onclick = () => { guardarCampos(); sel.rol = b.dataset.rol; pFormulario(); });
    if (borrador.nombre) document.getElementById('nombre').value = borrador.nombre;
    if (borrador.profesion) document.getElementById('profesion').value = borrador.profesion;
    document.getElementById('autoriza').checked = !!borrador.autoriza;
    document.getElementById('f').onsubmit = enviar;
  }
  let borrador = {};
  function guardarCampos() {
    borrador = { nombre: document.getElementById('nombre').value, profesion: document.getElementById('profesion').value, autoriza: document.getElementById('autoriza').checked };
  }
  async function enviar(ev) {
    ev.preventDefault(); guardarCampos();
    const err = t => { document.getElementById('err').textContent = t; };
    if (!sel.grupo) return err('Elijan su grupo.');
    if (borrador.nombre.trim().length < 3) return err('Escriban su nombre completo.');
    if (borrador.profesion.trim().length < 2) return err('Escriban su profesión.');
    if (!sel.rol) return err('Elijan su rol.');
    if (!borrador.autoriza) return err('Para participar deben aceptar la autorización de datos.');
    try {
      const r = await M.rpc('mdt_unirse', { p_codigo: codigo, p_grupo: sel.grupo, p_nombre: borrador.nombre, p_profesion: borrador.profesion,
        p_rol: sel.rol, p_autoriza: true, p_dispositivo: M.dispositivo() });
      registro = { grupo: r.grupo, rol: r.rol, nombre: r.nombre, profesion: borrador.profesion.toUpperCase().trim() };
      M.guardar('registro', registro); M.SFX.ok(); pCredencial();
    } catch (e) {
      try { grupos = (await M.rpc('mdt_acceso', { p_codigo: codigo })).grupos || {}; } catch (x) {}
      if (/acceso incorrecto/i.test(e.message)) return pAcceso(M.mensajeError(e));
      pFormulario(M.mensajeError(e));
    }
  }

  /* ---------- 3. Credencial y tripulación ---------- */
  function pCredencial() {
    const g = M.grupo(registro.grupo), r = M.rol(registro.rol);
    pinta(cab() + '<main class="pagina">'
      + '<section class="hud credencial">'
      + '<span class="chip-grupo" style="--g:' + g.color + '"><i></i>' + M.esc(g.nombre) + '</span>'
      + '<p class="sobretitulo" style="margin-top:16px">Credencial de misión</p>'
      + '<h2 class="rol-titulo">' + M.esc(r.nombre) + '</h2><p class="rol-sub">' + M.esc(r.subtitulo) + '</p>'
      + '<div class="nombre">' + M.esc(registro.nombre) + '</div>'
      + '<p class="sobretitulo">Misión operativa</p><ul>' + r.mision.map(x => '<li>' + M.esc(x) + '</li>').join('') + '</ul>'
      + (registro.rol === 'comandante'
          ? '<div class="acciones"><a class="btn primario grande latido" href="' + M.esc(M.urlDe('consola.html', { grupo: registro.grupo })) + '">ABRIR LA CONSOLA DE MISIÓN →</a></div>'
            + '<p class="suave" style="margin-top:10px;font-size:13px">Usted digita los códigos del grupo. Mantenga este celular con batería y conexión.</p>'
          : '<p class="suave" style="margin-top:16px;font-size:14px">El Comandante de Misión conduce el juego desde su celular.</p>')
      + '</section>'
      + '<section class="hud bloque"><p class="sobretitulo">Tripulación · ' + M.esc(g.nombre) + '</p><ul class="lista-tripulacion" id="trip"><li class="vacio">Cargando…</li></ul></section>'
      + '<div class="acciones"><button class="btn fantasma pequeno" id="cambiar">Corregir mi registro</button></div>'
      + '</main>');
    document.getElementById('cambiar').onclick = async () => {
      clearInterval(sondeo);
      try { grupos = (await M.rpc('mdt_acceso', { p_codigo: codigo })).grupos || {}; } catch (e) {}
      sel = { grupo: registro.grupo, rol: registro.rol }; borrador = { nombre: registro.nombre, profesion: registro.profesion || '', autoriza: false };
      pFormulario();
    };
    tripulacion(); clearInterval(sondeo); sondeo = setInterval(tripulacion, 5000);
  }
  async function tripulacion() {
    const ul = document.getElementById('trip'); if (!ul) return clearInterval(sondeo);
    try {
      const r = await M.rpc('mdt_tripulacion', { p_codigo: codigo, p_grupo: registro.grupo });
      const t = r.tripulantes || [];
      let html = t.map(x => '<li><span>' + M.esc(x.nombre) + '</span><span>' + M.esc(M.rol(x.rol).nombre) + '</span></li>').join('');
      for (let i = t.length; i < 7; i++) html += '<li class="vacio"><span>Esperando tripulante…</span><span></span></li>';
      ul.innerHTML = html;
    } catch (e) { ul.innerHTML = '<li class="vacio">' + M.esc(M.mensajeError(e)) + '</li>'; }
  }

  if (registro && codigo) pCredencial(); else pAcceso();
})();
