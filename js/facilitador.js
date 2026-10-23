/* ==========================================================================
   GUÍA ESPECIALISTA · administrador del juego (con PIN)
   - Genera y cambia el código de acceso de los participantes.
   - Muestra los QR del Pórtico de Entrada y de la Sala de Escape (con el código).
   - Abre una nueva sesión (El Gran Tablero en cero) para el siguiente turno.
   - Ve los 4 grupos en vivo: tripulantes, estación actual, reloj y puntos.
   - Reinicia o borra un grupo ante una falla técnica.
   - Descarga los resultados (CSV) y cambia el PIN.
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, C = M.C, J = C.juego, app = document.getElementById('app');
  let pin = '', P = null, msg = { texto: '', error: false }, sondeo = null, confirmar = {}, abierto = {};
  try { pin = sessionStorage.getItem('mdt-pin') || ''; } catch (e) {}

  const base = location.href.replace(/[^/]*(\?.*)?$/, '');
  const enlaceKit = () => base + 'entrada.html?c=' + encodeURIComponent(P.codigo_acceso);
  const enlaceConsola = () => base + 'sala.html?c=' + encodeURIComponent(P.codigo_acceso);
  const enlacePortico = () => base + 'tablero.html';
  const ROLES = { piloto: 'Líder Piloto', copiloto: 'Copiloto', comandante: 'Comandante', tripulante: 'Tripulante de Élite' };

  function qrSVG(texto) {
    try { const q = qrcode(0, 'M'); q.addData(texto); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
    catch (e) { return ''; }
  }
  function cab() {
    return '<header class="cabecera">' + M.logo() + '<div class="titulo-cab"><b>Guía Especialista</b><small>Administrador del juego</small></div>'
      + (pin ? '<button class="btn-sonido" data-a="salir">SALIR</button>' : '') + '</header>';
  }
  async function admin(accion, dato) { return M.rpc('mdt_admin', { p_pin: pin, p_accion: accion, p_dato: dato == null ? null : dato }); }
  function aviso(t, error) { msg = { texto: t, error: !!error }; }

  /* ------------------------------------------------------------ ingreso */
  function pIngreso(err) {
    clearInterval(sondeo); sondeo = null;
    app.innerHTML = cab() + '<main class="pagina"><section class="hud">' + M.logo('logo-portal')
      + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1><p class="subtitulo-juego">Guía Especialista</p>'
      + '<p class="suave centro" style="margin-bottom:18px">Solo para quien dirige la sesión. No compartan el PIN con los participantes.</p>'
      + '<form id="f"><label class="campo"><span>PIN del Guía Especialista</span><input type="password" id="pin" autocomplete="current-password"></label>'
      + '<p class="error">' + M.esc(err || '') + '</p>'
      + '<button class="btn primario ancho grande" type="submit">ENTRAR →</button></form></section></main>';
    const inp = document.getElementById('pin'); if (window.self === window.top) inp.focus();   // dentro de la demo no roba el foco
    document.getElementById('f').onsubmit = async ev => {
      ev.preventDefault(); pin = inp.value.trim();
      try { await cargar(); try { sessionStorage.setItem('mdt-pin', pin); } catch (e) {} iniciarSondeo(); }
      catch (e) { pin = ''; pIngreso(M.mensajeError(e)); }
    };
  }

  async function cargar() { P = await admin('panel'); M.sincronizar(P.ahora); render(); }
  function iniciarSondeo() {
    clearInterval(sondeo);
    sondeo = setInterval(async () => {
      if (document.hidden || app.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
      try { P = await admin('panel'); M.sincronizar(P.ahora); render(true); } catch (e) {}
    }, 5000);
  }

  /* ------------------------------------------------------------- panel */
  function estadoGrupo(g) {
    if (!g.registrado) return 'Sin tripulación registrada';
    if (g.actual) {
      const n = M.estacion(g.actual.estacion).numero;
      const rest = g.actual.limite - (M.ahora() - new Date(g.actual.inicio).getTime()) / 1000;
      return 'En Estación ' + n + ' · ' + (rest > 0 ? M.mmss(rest) : 'gracia +' + M.mmss(-rest));
    }
    const hechas = Object.keys(g.estaciones || {}).length;
    if (hechas >= 5) return 'Misión cumplida';
    if (hechas > 0) return 'Estación ' + hechas + ' terminada · esperando la siguiente';
    return 'Tripulación a bordo';
  }

  function render(silencioso) {
    const y = window.scrollY;
    const grupos = P.grupos.map(g => {
      const info = M.grupo(g.grupo), t = g.tripulantes || [];
      const mini = C.estaciones.map(e => {
        const a = (g.estaciones || {})[e.id];
        return '<div class="' + (a ? a.estado : '') + '"><small>E' + e.numero + '</small>' + (a ? (a.estado === 'abierta' ? '··' : a.total) : '–') + '</div>';
      }).join('');
      const lista = t.length ? '<ul class="lista-tripulacion">' + t.map(x => '<li><span>' + M.esc(x.nombre) + '<small style="display:block;color:var(--gris);font-size:12px">' + M.esc(x.profesion) + '</small></span><span>' + M.esc(ROLES[x.rol] || x.rol) + '</span></li>').join('') + '</ul>'
        : '<p class="suave" style="font-size:14px">Nadie se ha registrado en este grupo.</p>';
      return '<article class="hud bloque grupo-admin" style="--g:' + info.color + '">'
        + '<div class="grupo-admin-cab"><b><span style="color:' + info.color + '">' + info.simbolo + '</span> ' + M.esc(info.nombre) + '</b><span class="total">' + g.total + ' pts</span></div>'
        + '<p class="suave" style="font-size:14px;margin:4px 0 10px">' + M.esc(estadoGrupo(g)) + ' · ' + t.length + ' / 7 tripulantes</p>'
        + '<div class="mini-linea" style="margin-bottom:12px">' + mini + '</div>'
        + '<button class="btn fantasma pequeno" data-a="verTrip" data-g="' + g.grupo + '">' + (abierto[g.grupo] ? 'Ocultar tripulación' : 'Ver tripulación') + '</button>'
        + (abierto[g.grupo] ? '<div style="margin-top:10px">' + lista + '</div>' : '')
        + (g.registrado ? '<div class="acciones" style="margin-top:12px">'
          + '<button class="btn contorno pequeno" data-a="reabrir" data-g="' + g.grupo + '">' + (confirmar['reabrir' + g.grupo] ? '¿SEGURO? TOQUEN DE NUEVO' : 'REINICIAR SU PARTIDA') + '</button>'
          + '<button class="btn peligro pequeno" data-a="borrar" data-g="' + g.grupo + '">' + (confirmar['borrar' + g.grupo] ? '¿SEGURO? TOQUEN DE NUEVO' : 'BORRAR GRUPO') + '</button></div>' : '')
        + '</article>';
    }).join('');

    app.innerHTML = cab() + '<main class="pagina ancha">'
      + (msg.texto ? '<p class="' + (msg.error ? 'error' : 'ok-msg') + ' aviso-admin">' + M.esc(msg.texto) + '</p>' : '')

      /* 1. Claves */
      + '<section class="hud bloque"><p class="sobretitulo">1 · Código de acceso de los participantes</p>'
      + '<div class="clave-grande">' + M.esc(P.codigo_acceso) + '</div>'
      + '<p class="suave" style="font-size:14px">Lo usan todos: el Pórtico de Entrada y la Sala de Escape. Sesión n.º ' + P.sesion + '.</p>'
      + '<div class="acciones"><button class="btn primario" data-a="generar">GENERAR CÓDIGO NUEVO</button>'
      + '<button class="btn contorno" data-a="propio">ESCRIBIR MI PROPIO CÓDIGO</button></div>'
      + '<div id="propio"></div>'
      + '<p class="suave" style="font-size:12px;margin-top:8px">Cambiar el código no borra nada; quienes ya están dentro siguen jugando. Úsenlo, por ejemplo, entre un turno y otro.</p></section>'

      /* 2. QR */
      + '<section class="hud bloque"><p class="sobretitulo">2 · Enlaces para los participantes</p>'
      + '<p class="suave" style="font-size:14px;margin-bottom:12px">Los QR ya llevan el código de acceso. Proyéctenlos o imprímanlos.</p>'
      + '<div class="qrs-admin">'
      + '<div class="qr"> ' + qrSVG(enlaceKit()) + '<div><b>Pórtico de Entrada</b><span>Todos los participantes</span><button class="btn fantasma pequeno" data-a="copiar" data-url="' + M.esc(enlaceKit()) + '">COPIAR ENLACE</button></div></div>'
      + '<div class="qr">' + qrSVG(enlaceConsola()) + '<div><b>Sala de Escape</b><span>Solo el Comandante de Misión</span><button class="btn fantasma pequeno" data-a="copiar" data-url="' + M.esc(enlaceConsola()) + '">COPIAR ENLACE</button></div></div>'
      + '<div class="qr">' + qrSVG(enlacePortico()) + '<div><b>El Gran Tablero</b><span>Pantalla grande</span><a class="btn fantasma pequeno" href="tablero.html" target="_blank" rel="noopener">ABRIR ↗</a></div></div>'
      + '</div></section>'

      /* 3. Grupos en vivo */
      + '<section class="bloque"><p class="sobretitulo">3 · Grupos en vivo</p><div class="grupos-admin">' + grupos + '</div>'
      + '<p class="suave" style="font-size:12px">Reiniciar partida: borra estaciones y respuestas del grupo y conserva su tripulación (solo ante una falla técnica). Borrar grupo: elimina también a sus tripulantes.</p></section>'

      /* 4. Sesión y resultados */
      + '<section class="hud bloque"><p class="sobretitulo">4 · Sesión y resultados</p>'
      + '<div class="acciones" style="justify-content:flex-start"><button class="btn contorno" data-a="exportar">DESCARGAR RESULTADOS (CSV)</button></div>'
      + '<div class="acciones" style="justify-content:flex-start"><button class="btn peligro" data-a="nuevaSesion">' + (confirmar.sesion ? '¿SEGURO? TOQUEN DE NUEVO' : 'NUEVA SESIÓN · TABLERO EN CERO') + '</button></div>'
      + '<p class="suave" style="font-size:12px;margin-top:6px">Descarguen los resultados antes de abrir una nueva sesión. La nueva sesión deja El Gran Tablero y los 4 grupos en cero para el siguiente turno; los registros anteriores quedan guardados en la base de datos.</p></section>'

      /* 5. Seguridad */
      + '<section class="hud bloque"><p class="sobretitulo">5 · Cambiar el PIN del Guía Especialista</p>'
      + '<form id="fpin" class="fila-form"><input type="password" id="pinNuevo" class="entrada" placeholder="PIN nuevo (mínimo 4)" autocomplete="new-password"><button class="btn contorno" type="submit">CAMBIAR PIN</button></form></section>'
      + '</main>';
    if (silencioso) window.scrollTo(0, y);
    document.getElementById('fpin').onsubmit = async ev => {
      ev.preventDefault(); const v = document.getElementById('pinNuevo').value.trim();
      try { await admin('cambiar_pin', v); pin = v; try { sessionStorage.setItem('mdt-pin', pin); } catch (e) {} aviso('PIN cambiado. Anótenlo en un lugar seguro.'); }
      catch (e) { aviso(M.mensajeError(e), true); }
      render(); window.scrollTo(0, 0);
    };
  }

  /* Código fácil de dictar: palabra del juego + número de 4 cifras. */
  function codigoAleatorio() {
    const pal = ['CRONOS', 'PORTAL', 'VACIO', 'FASCIA', 'TIEMPO', 'NEXO', 'ORBITA', 'PULSO'];
    const n = new Uint32Array(2); crypto.getRandomValues(n);
    return pal[n[0] % pal.length] + '-' + String(2000 + (n[1] % 7999));
  }
  function csv(filas, nombre) {
    if (!filas || !filas.length) return false;
    const cols = Object.keys(filas[0]);
    const lineas = [cols.join(';')].concat(filas.map(f => cols.map(c => '"' + String(f[c] == null ? '' : f[c]).replace(/"/g, '""') + '"').join(';')));
    const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    return true;
  }
  function confirmado(k) {
    if (confirmar[k] && Date.now() - confirmar[k] < 6000) { confirmar = {}; return true; }
    confirmar = {}; confirmar[k] = Date.now(); render(true); return false;
  }

  app.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a, g = b.dataset.g;
    try {
      if (a === 'salir') { pin = ''; try { sessionStorage.removeItem('mdt-pin'); } catch (e) {} return pIngreso(); }
      if (a === 'generar') { const c = codigoAleatorio(); await admin('cambiar_codigo', c); aviso('Código nuevo: ' + c + '. Los QR ya están actualizados.'); return cargar(); }
      if (a === 'propio') {
        document.getElementById('propio').innerHTML = '<form id="fcod" class="fila-form" style="margin-top:12px"><input type="text" id="codPropio" class="entrada mayus" placeholder="Mínimo 4 caracteres" autocomplete="off" autocapitalize="characters"><button class="btn primario" type="submit">GUARDAR</button></form>';
        const inp = document.getElementById('codPropio'); inp.focus();
        document.getElementById('fcod').onsubmit = async e2 => {
          e2.preventDefault();
          try { await admin('cambiar_codigo', inp.value); aviso('Código guardado.'); await cargar(); }
          catch (e) { aviso(M.mensajeError(e), true); render(); }
        };
        return;
      }
      if (a === 'copiar') {
        try { await navigator.clipboard.writeText(b.dataset.url); b.textContent = '¡COPIADO!'; }
        catch (e) { prompt('Copien este enlace:', b.dataset.url); }
        return;
      }
      if (a === 'verTrip') { abierto[g] = !abierto[g]; return render(true); }
      if (a === 'reabrir') { if (!confirmado('reabrir' + g)) return; await admin('reabrir_grupo', g); aviso('Partida reiniciada: ' + M.grupo(g).nombre + '.'); return cargar(); }
      if (a === 'borrar') { if (!confirmado('borrar' + g)) return; await admin('borrar_grupo', g); aviso('Grupo borrado: ' + M.grupo(g).nombre + '.'); return cargar(); }
      if (a === 'exportar') {
        const r = await admin('exportar'), f = new Date().toISOString().slice(0, 10);
        const ok = csv(r.filas, 'maquina-del-tiempo-participantes-' + f + '.csv');
        setTimeout(() => csv(r.estaciones, 'maquina-del-tiempo-estaciones-' + f + '.csv'), 600);
        aviso(ok ? 'Descargando 2 archivos: participantes y estaciones.' : 'Todavía no hay participantes en esta sesión.'); return render(true);
      }
      if (a === 'nuevaSesion') { if (!confirmado('sesion')) return; await admin('nueva_sesion'); aviso('Nueva sesión abierta. El Gran Tablero está en cero.'); return cargar(); }
    } catch (e) {
      if (/PIN incorrecto/i.test(e.message)) { pin = ''; return pIngreso('El PIN cambió o no es válido. Ingresen de nuevo.'); }
      aviso(M.mensajeError(e), true); render(); window.scrollTo(0, 0);
    }
  });

  if (pin) cargar().then(iniciarSondeo).catch(() => { pin = ''; pIngreso(); }); else pIngreso();
})();
