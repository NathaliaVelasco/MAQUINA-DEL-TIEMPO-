/* ==========================================================================
   PÓRTICO · pantalla grande con los resultados de los 4 grupos en vivo
   Incluye el panel del facilitador (con PIN): nueva sesión, código de acceso,
   reabrir o borrar un grupo y descarga de resultados.
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, C = M.C, J = C.juego, app = document.getElementById('app');
  let T = null, pin = '', ganadorVisto = M.leer('ganador-visto', ''), errorRed = '';

  function qrSVG(texto) {
    try { const q = qrcode(0, 'M'); q.addData(texto); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
    catch (e) { return ''; }
  }

  function estadoGrupo(g) {
    if (!g.registrado) return { texto: 'Esperando tripulación', reloj: '' };
    if (g.actual) {
      const n = M.estacion(g.actual.estacion).numero;
      const trans = (M.ahora() - new Date(g.actual.inicio).getTime()) / 1000, rest = g.actual.limite - trans;
      return { texto: 'En Estación ' + n, reloj: rest > 0 ? M.mmss(rest) : '+' + M.mmss(-rest), gracia: rest <= 0 };
    }
    if (g.terminadas >= 5) return { texto: 'Misión cumplida', reloj: '' };
    if (g.terminadas > 0) return { texto: 'Estación ' + g.terminadas + ' terminada · siguiente en espera', reloj: '' };
    return { texto: 'Tripulación a bordo', reloj: '' };
  }
  function ordenar(gs) {
    return gs.slice().sort((a, b) => (b.registrado - a.registrado) || (b.total - a.total) || (b.terminadas - a.terminadas)
      || ((a.ultimo ? new Date(a.ultimo).getTime() : 9e15) - (b.ultimo ? new Date(b.ultimo).getTime() : 9e15)));
  }

  function render() {
    const base = location.href.replace(/[^/]*(\?.*)?$/, '');
    const cuerpo = !T ? '<p class="suave centro" style="margin-top:10vh">' + M.esc(errorRed || 'Conectando…') + '</p>'
      : '<section class="ranking">' + ordenar(T.grupos).map((g, i) => {
          const info = M.grupo(g.grupo), st = estadoGrupo(g);
          const mini = C.estaciones.map(e => {
            const a = g.estaciones[e.id];
            return '<div class="' + (a ? a.estado : '') + '"><small>E' + e.numero + '</small>' + (a ? (a.estado === 'abierta' ? '··' : a.total) : '–') + '</div>';
          }).join('');
          return '<article class="hud carta-grupo ' + (g.registrado ? '' : 'inactivo') + (i === 0 && g.total > 0 ? ' lider' : '') + '" style="--g:' + info.color + '">'
            + '<span class="puesto">' + (g.registrado ? (i + 1) : '') + '</span>'
            + '<div class="g-nombre"><span class="simbolo">' + info.simbolo + '</span>' + M.esc(info.nombre) + '</div>'
            + '<div class="g-total">' + g.total + '<small> pts</small></div>'
            + '<div class="g-estado">' + M.esc(st.texto) + '</div>'
            + (st.reloj ? '<div class="g-reloj ' + (st.gracia ? 'gracia' : '') + '" data-reloj="' + g.grupo + '">' + st.reloj + '</div>' : '')
            + '<div class="g-miembros">' + (g.registrado ? g.miembros + ' / 7 tripulantes' : '') + '</div>'
            + '<div class="mini-linea">' + mini + '</div></article>';
        }).join('') + '</section>';
    app.innerHTML = '<main class="portico">'
      + '<header class="portico-cab">' + M.logo() + '<div><h1>' + M.esc(J.titulo) + '</h1><small>' + M.esc(J.subtitulo) + ' · Resultados en vivo</small></div>'
      + '<div class="derecha" id="hora"></div></header>'
      + cuerpo
      + '<footer class="portico-pie">'
      + '<div class="qr">' + qrSVG(base + 'kit.html') + '<div><b>Kit de tripulación</b><span>Todos: regístrense aquí</span></div></div>'
      + '<div class="qr">' + qrSVG(base + 'consola.html') + '<div><b>Consola del equipo</b><span>Solo el Comandante de Misión</span></div></div>'
      + '<div class="qr">' + qrSVG(base + 'prevena.html') + '<div><b>App Prevena™</b><span>Estación 5</span></div></div>'
      + '</footer>'
      + '<button class="btn fantasma pequeno admin-btn" data-a="admin">⚙ FACILITADOR</button>'
      + '</main>';
    revisarGanador();
  }

  function revisarGanador() {
    if (!T) return;
    const reg = T.grupos.filter(g => g.registrado);
    if (!reg.length || !reg.every(g => g.terminadas >= 5)) return;
    const orden = ordenar(reg), top = orden[0];
    const firma = reg.map(g => g.grupo + g.total).join('|');
    if (ganadorVisto === firma || document.getElementById('ganador')) return;
    const info = M.grupo(top.grupo);
    app.insertAdjacentHTML('beforeend', '<div class="ganador" id="ganador" data-firma="' + M.esc(firma) + '"><div>'
      + M.logo('logo-portal') + '<p class="sobretitulo">La línea de tiempo ha sido restaurada</p>'
      + '<h2>¡GANADOR!</h2><p style="color:' + info.color + '">' + info.simbolo + ' ' + M.esc(info.nombre) + '</p>'
      + '<p style="font-family:var(--mono);color:var(--malachite)">' + top.total + ' / 100</p>'
      + '<p class="suave" style="font-size:clamp(12px,1vw,18px);margin-top:2vw">Toquen la pantalla para volver al marcador.</p></div></div>');
    M.SFX.portal();
  }

  async function actualizar() {
    try { T = await M.rpc('mdt_tablero', {}); M.sincronizar(T.ahora); errorRed = ''; }
    catch (e) { errorRed = M.mensajeError(e); if (!T) T = null; }
    if (!document.getElementById('modal') && !document.getElementById('ganador')) render();
  }
  function relojes() {
    const h = document.getElementById('hora');
    if (h) h.textContent = new Date(M.ahora()).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!T) return;
    T.grupos.forEach(g => {
      const el = app.querySelector('[data-reloj="' + g.grupo + '"]'); if (!el) return;
      const st = estadoGrupo(g); el.textContent = st.reloj; el.classList.toggle('gracia', !!st.gracia);
    });
  }

  /* ------------------------------------------------- panel del facilitador */
  function modal(html) {
    const m = document.getElementById('modal'); if (m) m.remove();
    app.insertAdjacentHTML('beforeend', '<div class="modal" id="modal"><section class="hud">' + html + '</section></div>');
  }
  function panelPin(err) {
    modal('<p class="sobretitulo">Panel del facilitador</p><form id="fpin"><label class="campo"><span>PIN</span><input type="password" id="pin" autocomplete="off"></label>'
      + '<p class="error">' + M.esc(err || '') + '</p><div class="acciones"><button class="btn fantasma" type="button" data-a="cerrar">CANCELAR</button><button class="btn primario" type="submit">ENTRAR</button></div></form>');
    document.getElementById('pin').focus();
    document.getElementById('fpin').onsubmit = async ev => {
      ev.preventDefault(); const p = document.getElementById('pin').value;
      try { const r = await M.rpc('mdt_admin', { p_pin: p, p_accion: 'verificar' }); pin = p; panel(r); }
      catch (e) { panelPin(M.mensajeError(e)); }
    };
  }
  function panel(info, msg) {
    const op = J.grupos.map(g => '<option value="' + g.id + '">' + M.esc(g.nombre) + '</option>').join('');
    modal('<p class="sobretitulo">Panel del facilitador · Sesión ' + info.sesion + '</p>'
      + '<p class="ok-msg">' + M.esc(msg || '') + '</p>'
      + '<label class="campo"><span>Código de acceso de los participantes</span><input type="text" id="nuevoCodigo" class="mayus" value="' + M.esc(info.codigo_acceso) + '"></label>'
      + '<button class="btn contorno ancho" data-a="cambiarCodigo">GUARDAR CÓDIGO</button>'
      + '<label class="campo" style="margin-top:18px"><span>Grupo</span><select id="grupoAdmin" class="entrada">' + op + '</select></label>'
      + '<div class="acciones" style="margin-top:0"><button class="btn contorno" data-a="reabrir">REINICIAR SU PARTIDA</button><button class="btn peligro" data-a="borrar">BORRAR GRUPO Y TRIPULACIÓN</button></div>'
      + '<p class="suave" style="font-size:12px;margin-top:6px">Reiniciar partida: borra estaciones y respuestas del grupo, conserva la tripulación. Úsenlo solo ante una falla técnica.</p>'
      + '<div class="acciones"><button class="btn contorno" data-a="exportar">DESCARGAR RESULTADOS (CSV)</button></div>'
      + '<div class="acciones"><button class="btn peligro" data-a="nuevaSesion" id="btnSesion">NUEVA SESIÓN (TABLERO EN CERO)</button></div>'
      + '<p class="suave" style="font-size:12px;margin-top:6px">La nueva sesión deja el pórtico en cero para el siguiente turno. Los registros anteriores se conservan y se pueden pedir a Simoné.</p>'
      + '<div class="acciones"><button class="btn primario" data-a="cerrar">CERRAR</button></div>');
  }
  async function admin(accion, dato) {
    const r = await M.rpc('mdt_admin', { p_pin: pin, p_accion: accion, p_dato: dato || null });
    return r;
  }
  function csv(filas, nombre) {
    if (!filas.length) return;
    const cols = Object.keys(filas[0]);
    const lineas = [cols.join(';')].concat(filas.map(f => cols.map(c => '"' + String(f[c] == null ? '' : f[c]).replace(/"/g, '""') + '"').join(';')));
    const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  }

  let confirmSesion = 0;
  app.addEventListener('click', async ev => {
    const gan = ev.target.closest('#ganador');
    if (gan) { ganadorVisto = gan.dataset.firma; M.guardar('ganador-visto', ganadorVisto); gan.remove(); return; }
    const b = ev.target.closest('[data-a]'); if (!b) return;
    M.audio();
    const a = b.dataset.a;
    try {
      if (a === 'admin') return pin ? panel(await admin('verificar')) : panelPin();
      if (a === 'cerrar') { const m = document.getElementById('modal'); if (m) m.remove(); return actualizar(); }
      if (a === 'cambiarCodigo') { await admin('cambiar_codigo', document.getElementById('nuevoCodigo').value); return panel(await admin('verificar'), 'Código actualizado.'); }
      if (a === 'reabrir') { const g = document.getElementById('grupoAdmin').value; await admin('reabrir_grupo', g); return panel(await admin('verificar'), 'Partida reiniciada: ' + M.grupo(g).nombre + '.'); }
      if (a === 'borrar') { const g = document.getElementById('grupoAdmin').value; await admin('borrar_grupo', g); return panel(await admin('verificar'), 'Grupo borrado: ' + M.grupo(g).nombre + '.'); }
      if (a === 'exportar') {
        const r = await admin('exportar'), fecha = new Date().toISOString().slice(0, 10);
        csv(r.filas || [], 'maquina-del-tiempo-participantes-' + fecha + '.csv');
        setTimeout(() => csv(r.estaciones || [], 'maquina-del-tiempo-estaciones-' + fecha + '.csv'), 600);
        return;
      }
      if (a === 'nuevaSesion') {
        if (!confirmSesion || Date.now() - confirmSesion > 5000) { confirmSesion = Date.now(); b.textContent = 'TOQUEN DE NUEVO PARA CONFIRMAR'; return; }
        confirmSesion = 0; await admin('nueva_sesion'); ganadorVisto = ''; M.guardar('ganador-visto', '');
        return panel(await admin('verificar'), 'Nueva sesión creada. El pórtico está en cero.');
      }
    } catch (e) { const m = document.querySelector('#modal .ok-msg'); if (m) { m.style.color = 'var(--alarma)'; m.textContent = M.mensajeError(e); } }
  });

  actualizar(); setInterval(() => { if (!document.getElementById('modal')) actualizar(); }, 3000); setInterval(relojes, 500);
})();
