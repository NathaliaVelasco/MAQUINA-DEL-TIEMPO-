/* ==========================================================================
   MÁQUINA DEL TIEMPO · Consola de resultados en vivo (pantalla grande)
   ========================================================================== */
(function () {
  'use strict';
  const C = window.CONTENIDO, J = C.juego, D = window.DATOS;
  const app = document.getElementById('consola');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mmss = seg => { const n = Math.max(0, Math.ceil(seg)); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
  let GRUPOS = {}, GENTE = [], OFFSET = 0, ERROR = '';
  const ahora = () => Date.now() + OFFSET;

  function totalDe(est) {
    const res = (est && est.res) || {};
    return Object.values(res).reduce((n, r) => n + (r.total || 0), 0);
  }
  function estadoTexto(est) {
    const f = (est && est.fase) || 'portico', e = C.estaciones[(est && est.est) || 0];
    if (f === 'portico') return { t: 'Pórtico de ingreso', reloj: '' };
    if (f === 'antesala') return { t: 'Preparando E' + e.numero, reloj: '' };
    if (f === 'juego') {
      const t = est.inicio ? (ahora() - est.inicio) / 1000 : 0;
      const reloj = t <= J.minutos * 60 ? mmss(J.minutos * 60 - t) : (t < J.segundosCierre ? '+' + mmss(J.segundosCierre - t) : 'CERRADA');
      return { t: 'Jugando E' + e.numero + ' · ' + e.nombre, reloj: reloj, alerta: t > J.minutos * 60 };
    }
    if (f === 'retro') return { t: 'Retroalimentación E' + e.numero, reloj: '' };
    if (f === 'fin') return { t: 'Misión cumplida', reloj: '' };
    return { t: '', reloj: '' };
  }

  function pinta() {
    const activos = J.grupos.filter(g => GENTE.some(p => p.grupo === g.id));
    const lista = (activos.length ? activos : J.grupos).map(g => ({ g: g, est: GRUPOS[g.id] || {}, total: totalDe(GRUPOS[g.id]) }))
      .sort((a, b) => b.total - a.total);
    const todosFin = activos.length > 0 && activos.every(g => (GRUPOS[g.id] || {}).fase === 'fin');
    const lider = lista[0];
    let h = '<header class="consola-cab"><img src="img/solventum-logo.png" alt="Solventum"><div><h1>' + esc(J.titulo) + '</h1><p>' + esc(J.subtitulo) + ' · Resultados en vivo</p></div>'
      + (D.modo === 'demo' ? '<span class="modo-demo">MODO DEMO</span>' : '') + '</header>';
    if (ERROR) h += '<p class="consola-error">' + esc(ERROR) + '</p>';
    if (todosFin && lider) {
      h += '<section class="ganador" style="--g:' + lider.g.color + '"><p class="sobretitulo">Grupo ganador</p><h2>' + lider.g.simbolo + ' ' + esc(lider.g.nombre) + '</h2><b>' + lider.total + ' <small>/ 100</small></b></section>';
    }
    const urlJuego = location.href.replace(/consola\.html.*$/, '').replace(/[?#].*$/, '');
    h += '<section class="qr-ingreso hud"><div class="qr" aria-label="Código QR para ingresar">' + qrSVG(urlJuego) + '</div><div><p class="sobretitulo">Ingreso de los Cronocirujanos</p><h2>Escaneen con su celular</h2><p class="qr-url">' + esc(urlJuego.replace(/^https?:\/\//, '')) + '</p><p class="nota">' + GENTE.length + ' de 28 tripulantes registrados</p></div></section>';
    h += '<section class="tabla-consola"><div class="fila cab"><span>#</span><span>Grupo</span>' + C.estaciones.map(e => '<span>E' + e.numero + '</span>').join('') + '<span>Total</span></div>';
    lista.forEach((x, k) => {
      const st = estadoTexto(x.est), res = x.est.res || {};
      const n = GENTE.filter(p => p.grupo === x.g.id).length;
      h += '<div class="fila" style="--g:' + x.g.color + '"><span class="pos">' + (k + 1) + '</span>'
        + '<span class="nombre"><b><i></i>' + esc(x.g.nombre) + '</b><small>' + n + '/7 tripulantes · ' + esc(st.t) + (st.reloj ? ' · <em class="' + (st.alerta ? 'alerta' : '') + '">' + st.reloj + '</em>' : '') + '</small></span>'
        + C.estaciones.map(e => { const r = res[e.id]; return '<span class="celda ' + (r ? (r.por === 'reloj' ? 'cero' : 'ok') : '') + '">' + (r ? r.total : '—') + '</span>'; }).join('')
        + '<span class="total">' + x.total + '</span></div>';
    });
    h += '</section>';
    h += '<footer class="consola-pie"><details><summary>Panel del facilitador</summary>'
      + '<div class="panel-fac"><button class="btn fantasma" data-c="csv">Descargar participantes y resultados (CSV)</button>'
      + '<label>PIN <input id="pin" type="password" inputmode="numeric" maxlength="12" autocomplete="off"></label>'
      + '<button class="btn fantasma peligro" data-c="reiniciar">Reiniciar la sesión (borra todo)</button><p id="facMsg" class="nota"></p></div></details>'
      + '<small>Metodología y diseño del juego: Nathalia Velasco · Simoné</small></footer>';
    const abierto = app.querySelector('details') && app.querySelector('details').open;
    const pin = app.querySelector('#pin') ? app.querySelector('#pin').value : '';
    const msg = app.querySelector('#facMsg') ? app.querySelector('#facMsg').textContent : '';
    app.innerHTML = h;
    if (abierto) { app.querySelector('details').open = true; app.querySelector('#pin').value = pin; app.querySelector('#facMsg').textContent = msg; }
  }

  function qrSVG(texto) {
    if (!window.qrcode) return '';
    try { const q = window.qrcode(0, 'M'); q.addData(texto); q.make(); return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }); } catch (e) { return ''; }
  }

  function csv() {
    const ranking = J.grupos.map(g => ({ id: g.id, total: totalDe(GRUPOS[g.id]) })).sort((a, b) => b.total - a.total);
    const pos = {}; ranking.forEach((x, k) => { pos[x.id] = k + 1; });
    const filas = [['GRUPO', 'NOMBRE COMPLETO', 'PROFESIÓN', 'ROL', 'AUTORIZA DATOS', 'REGISTRO'].concat(C.estaciones.map(e => 'E' + e.numero)).concat(['TOTAL GRUPO', 'POSICIÓN'])];
    GENTE.forEach(p => {
      const g = J.grupos.find(x => x.id === p.grupo) || {}, res = ((GRUPOS[p.grupo] || {}).res) || {};
      const rol = (J.roles.find(r => r.id === p.rol) || {}).nombre || p.rol;
      filas.push([g.nombre, p.nombre, p.profesion, rol, p.autoriza ? 'SÍ' : 'NO', p.creado].concat(C.estaciones.map(e => (res[e.id] || {}).total || 0)).concat([totalDe(GRUPOS[p.grupo]), pos[p.grupo]]));
    });
    const txt = '﻿' + filas.map(f => f.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = 'maquina-del-tiempo-resultados-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  let confirmar = 0;
  app.addEventListener('click', async function (ev) {
    const b = ev.target.closest('[data-c]'); if (!b) return;
    const msg = document.getElementById('facMsg');
    if (b.dataset.c === 'csv') return csv();
    if (b.dataset.c === 'reiniciar') {
      if (!(confirmar && Date.now() - confirmar < 5000)) { confirmar = Date.now(); msg.textContent = 'Esto borra participantes y puntajes. Descarguen primero el CSV. Toquen de nuevo para confirmar.'; return; }
      confirmar = 0;
      try { await D.reiniciar(document.getElementById('pin').value); msg.textContent = 'Sesión reiniciada.'; await cargar(); }
      catch (e) { msg.textContent = D.mensaje(e); }
    }
  });

  async function cargar() {
    try {
      const [g, p] = await Promise.all([D.grupos(), D.participantes()]);
      GRUPOS = g || {}; GENTE = p || []; ERROR = '';
    } catch (e) { ERROR = 'Sin conexión con la base de datos. Reintentando…'; }
    pinta();
  }
  (async function () {
    try { OFFSET = (await D.ahora()) - Date.now(); } catch (e) {}
    await cargar();
    setInterval(cargar, 2000);
    setInterval(() => { const t = document.querySelectorAll('.fila em'); if (t.length) pinta(); }, 1000);
  })();
})();
