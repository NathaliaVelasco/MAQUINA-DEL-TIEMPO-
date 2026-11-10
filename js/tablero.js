/* ==========================================================================
   EL GRAN TABLERO · pantalla grande con los resultados de los 4 grupos en vivo
   El botón GUÍA ESPECIALISTA lleva al panel de administración (guia.html).
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, C = M.C, J = C.juego, app = document.getElementById('app');
  let T = null, ganadorVisto = M.leer('ganador-visto', ''), errorRed = '';
  /* Códigos de la sesión: El Gran Tablero es la pantalla del Guía Especialista
     (televisor o tablet). Con su PIN muestra los QR con el código incluido y los
     códigos en grande para que los participantes abran los enlaces en su celular. */
  let pin = (() => { try { return localStorage.getItem('mdt-pin-tablero') || sessionStorage.getItem('mdt-pin') || ''; } catch (e) { return ''; } })();
  let K = null;                           // { registro, sala }
  let anuncios = M.leer('tablero-anuncios', false);
  const anunciados = M.leer('tablero-anunciados', {});

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
    if (g.terminadas >= 5) return { texto: T && T.diagnostico && g.diag_despues < g.miembros ? 'Misión cumplida · diagnóstico final ' + g.diag_despues + ' / ' + g.miembros : 'Misión cumplida', reloj: '' };
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
            + '<div class="g-nombre"><span class="simbolo">' + M.insignia(g.grupo) + '</span>' + M.esc(info.nombre) + '</div>'
            + '<div class="g-total">' + g.total + '<small> pts</small></div>'
            + '<div class="g-estado">' + M.esc(st.texto) + '</div>'
            + (st.reloj ? '<div class="g-reloj ' + (st.gracia ? 'gracia' : '') + '" data-reloj="' + g.grupo + '">' + st.reloj + '</div>' : '')
            + '<div class="g-miembros">' + (g.registrado ? g.miembros + ' / 7 tripulantes' : '') + '</div>'
            + '<div class="mini-linea">' + mini + '</div></article>';
        }).join('') + '</section>';
    app.innerHTML = '<main class="portico">'
      + '<header class="portico-cab">' + M.logo() + '<div><h1>' + M.esc(J.titulo) + '</h1><small>El Gran Tablero · Resultados en vivo</small></div>'
      + '<div class="derecha" id="hora"></div></header>'
      + cuerpo
      + '<footer class="portico-pie">'
      + '<div class="qr">' + qrSVG(base + 'entrada.html' + (K ? '?c=' + encodeURIComponent(K.registro) : '')) + '<div><b>Pórtico de Entrada</b><span>Todos: escaneen y regístrense</span>'
      + (K ? '<span class="codigo-grande">' + M.esc(K.registro) + '</span>' : '') + '</div></div>'
      + '<div class="qr">' + qrSVG(base + 'sala.html' + (K ? '?c=' + encodeURIComponent(K.sala) : '')) + '<div><b>Sala de Escape</b><span>Solo el Comandante de Misión</span>'
      + (K ? '<span class="codigo-grande">' + M.esc(K.sala) + '</span>' : '') + '</div></div>'
      + '</footer>'
      + '<div class="tablero-ctrl">'
      + '<button class="btn fantasma pequeno" data-t="anuncios">' + (anuncios ? '🔊 ANUNCIOS DEL RELOJ: SÍ' : '🔇 ANUNCIOS DEL RELOJ: NO') + '</button>'
      + (K ? '' : '<button class="btn fantasma pequeno" data-t="codigos">🔑 MOSTRAR CÓDIGOS</button>')
      + '<a class="btn fantasma pequeno" href="guia.html">⚙ GUÍA ESPECIALISTA</a></div>'
      + '</main>';
    revisarGanador();
  }

  function revisarGanador() {
    if (!T) return;
    const reg = T.grupos.filter(g => g.registrado);
    if (!reg.length || !reg.every(g => g.terminadas >= 5)) return;
    // Con diagnóstico: el ganador se revela cuando todos enviaron el diagnóstico
    // final o cuando el Guía Especialista lo decide.
    if (T.diagnostico && !T.revelado && !reg.every(g => g.diag_despues >= g.miembros)) return;
    const orden = ordenar(reg), top = orden[0];
    const firma = reg.map(g => g.grupo + g.total).join('|');
    if (ganadorVisto === firma || document.getElementById('ganador')) return;
    const info = M.grupo(top.grupo);
    app.insertAdjacentHTML('beforeend', '<div class="ganador" id="ganador" data-firma="' + M.esc(firma) + '"><div>'
      + M.logo('logo-portal') + '<p class="sobretitulo">La línea de tiempo ha sido restaurada</p>'
      + '<h2>¡GANADOR!</h2><p style="color:' + info.color + '">' + M.insignia(top.grupo, 'grande') + ' ' + M.esc(info.nombre) + '</p>'
      + '<p style="font-family:var(--mono);color:var(--malachite)">' + top.total + ' / 100</p>'
      + '<p class="suave" style="font-size:clamp(12px,1vw,18px);margin-top:2vw">Toquen la pantalla para volver al marcador.</p></div></div>');
    M.SFX.portal();
  }

  /* Anuncios por el parlante de la maleta: minutos 6, 10 y 11 de cada grupo. */
  const AVISOS = [[360, 'minuto seis. Quedan seis minutos.'], [600, 'minuto diez. Quedan dos minutos.'], [660, 'minuto once. Queda un minuto.']];
  function anunciar() {
    if (!anuncios || !T) return;
    T.grupos.forEach(g => {
      if (!g.actual) return;
      const trans = (M.ahora() - new Date(g.actual.inicio).getTime()) / 1000, n = M.estacion(g.actual.estacion).numero;
      AVISOS.forEach(([s, txt], i) => {
        const k = g.grupo + g.actual.inicio + i;
        if (trans >= s && trans < s + 25 && !anunciados[k]) {
          anunciados[k] = 1; M.guardar('tablero-anunciados', anunciados);
          M.SFX.tic(); M.decir(M.grupo(g.grupo).nombre + ', estación ' + n + ': ' + txt);
        }
      });
    });
  }
  async function cargarCodigos() {
    if (!pin) return;
    try { const v = await M.rpc('mdt_admin', { p_pin: pin, p_accion: 'verificar', p_dato: null }); K = { registro: v.codigo_acceso, sala: v.codigo_sala }; }
    catch (e) { if (/PIN/i.test(e.message)) { pin = ''; try { localStorage.removeItem('mdt-pin-tablero'); } catch (x) {} } }
  }
  function modalPin(err) {
    const m = document.getElementById('modal'); if (m) m.remove();
    app.insertAdjacentHTML('beforeend', '<div class="modal" id="modal"><section class="hud"><p class="sobretitulo">Guía Especialista</p>'
      + '<p>Escriba su PIN para mostrar en El Gran Tablero los códigos de registro y de la Sala de Escape. Este equipo lo recordará.</p>'
      + '<form id="fpin"><input type="password" id="tpin" class="entrada" placeholder="PIN" autocomplete="current-password"><p class="error">' + M.esc(err || '') + '</p>'
      + '<div class="acciones"><button class="btn fantasma" type="button" data-t="cerrar">CANCELAR</button><button class="btn primario" type="submit">MOSTRAR</button></div></form></section></div>');
    document.getElementById('fpin').onsubmit = async ev => {
      ev.preventDefault(); pin = document.getElementById('tpin').value.trim(); await cargarCodigos();
      if (!K) return modalPin('PIN incorrecto.');
      try { localStorage.setItem('mdt-pin-tablero', pin); } catch (e) {}
      document.getElementById('modal').remove(); render();
    };
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
    const t = ev.target.closest('[data-t]');
    if (t) {
      M.audio();
      if (t.dataset.t === 'anuncios') { anuncios = !anuncios; M.guardar('tablero-anuncios', anuncios); if (anuncios) M.decir('Anuncios del reloj activados.'); render(); }
      if (t.dataset.t === 'codigos') modalPin();
      if (t.dataset.t === 'cerrar') document.getElementById('modal').remove();
      return;
    }
    const gan = ev.target.closest('#ganador');
    if (gan) { ganadorVisto = gan.dataset.firma; M.guardar('ganador-visto', ganadorVisto); gan.remove(); }
  });

  cargarCodigos().then(actualizar); setInterval(() => { if (!document.getElementById('modal')) actualizar(); }, 3000);
  setInterval(() => { relojes(); anunciar(); }, 500); setInterval(cargarCodigos, 20000);
})();
