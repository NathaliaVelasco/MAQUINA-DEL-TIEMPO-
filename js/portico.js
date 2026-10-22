/* ==========================================================================
   PÓRTICO · pantalla grande con los resultados de los 4 grupos en vivo
   El botón FACILITADOR lleva al panel de administración (facilitador.html).
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, C = M.C, J = C.juego, app = document.getElementById('app');
  let T = null, ganadorVisto = M.leer('ganador-visto', ''), errorRed = '';

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
      + '</footer>'
      + '<a class="btn fantasma pequeno admin-btn" href="facilitador.html">⚙ FACILITADOR</a>'
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

  app.addEventListener('click', ev => {
    const gan = ev.target.closest('#ganador');
    if (gan) { ganadorVisto = gan.dataset.firma; M.guardar('ganador-visto', ganadorVisto); gan.remove(); }
  });

  actualizar(); setInterval(() => { if (!document.getElementById('modal')) actualizar(); }, 3000); setInterval(relojes, 500);
})();
