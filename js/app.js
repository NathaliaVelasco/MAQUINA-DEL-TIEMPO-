/* ==========================================================================
   MÁQUINA DEL TIEMPO · Plataforma del Facilitador Digital
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   La plataforma asume el rol del Guía Especialista: guía cada paso, libera
   información, valida códigos, da pistas por tiempo y cierra con debriefing.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.CONTENIDO;
  const J = C.juego;
  const SEG_ESTACION = J.minutosPorEstacion * 60;
  const CLAVE = 'mdt-partida-v1';
  const app = document.getElementById('app');

  /* ---------------------------------------------------------------- estado */
  let S = cargar() || nuevo();
  function nuevo() {
    return { pantalla: 'inicio', equipo: '', grupo: '', intro: 0, hechas: [], resultados: {}, actual: null, voz: true };
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) {} }
  function cargar() {
    try { const t = localStorage.getItem(CLAVE); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, '');
  const descifrar = b => { try { return atob(b).split('').reverse().join(''); } catch (e) { return ''; } };
  const mmss = seg => { const n = Math.max(0, Math.ceil(seg)); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
  const ahora = () => Date.now();
  const estacion = id => C.estaciones.find(e => e.id === id);
  const grupo = () => J.grupos.find(g => g.id === S.grupo) || { nombre: '', color: '#c8a25a', simbolo: '◆' };

  async function huella(codigo, texto) {
    const datos = new TextEncoder().encode('MDT|' + codigo + '|' + norm(texto));
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', datos);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return sha256Respaldo(datos);
  }

  /* ----------------------------------------------------------------- audio */
  let ctx = null;
  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tono(freq, dur, tipo, vol, retraso) {
    const a = audio(); if (!a || !S.voz) return;
    const t0 = a.currentTime + (retraso || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = tipo || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  const SFX = {
    ok() { tono(660, 0.18, 'triangle', 0.18); tono(990, 0.3, 'triangle', 0.16, 0.12); },
    error() { tono(140, 0.35, 'sawtooth', 0.12); tono(110, 0.4, 'sawtooth', 0.1, 0.08); },
    paso() { tono(520, 0.12, 'sine', 0.1); },
    tic() { tono(1400, 0.04, 'square', 0.04); },
    candado() { tono(300, 0.08, 'square', 0.12); tono(420, 0.08, 'square', 0.12, 0.09); tono(880, 0.4, 'triangle', 0.16, 0.2); },
    monitor(n) { for (let i = 0; i < n; i++) tono(1046, 0.09, 'sine', 0.09, i * (60 / 130)); }
  };

  /* ------------------------------------------------------------------ voz */
  let vozElegida = null;
  function elegirVoz() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().filter(x => /^es/i.test(x.lang));
    vozElegida = v.find(x => /es-(CO|MX|US|419)/i.test(x.lang)) || v.find(x => /es-ES/i.test(x.lang)) || v[0] || null;
  }
  if ('speechSynthesis' in window) { elegirVoz(); speechSynthesis.onvoiceschanged = elegirVoz; }
  function decir(texto) {
    if (!S.voz || !('speechSynthesis' in window) || !texto) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = vozElegida ? vozElegida.lang : 'es-CO';
    if (vozElegida) u.voice = vozElegida;
    u.rate = 0.98; u.pitch = 0.9;
    speechSynthesis.speak(u);
  }
  function callar() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  /* --------------------------------------------------------------- render */
  function pinta(html) { app.innerHTML = html; window.scrollTo(0, 0); }

  function barra(opc) {
    const g = grupo();
    const a = S.actual;
    return '<header class="barra">'
      + '<div class="barra-marca"><span class="engranaje" aria-hidden="true"></span><div><b>' + esc(J.titulo) + '</b><small>' + esc(J.subtitulo) + '</small></div></div>'
      + (S.equipo ? '<div class="barra-equipo" style="--g:' + g.color + '"><span>' + g.simbolo + '</span>' + esc(S.equipo) + '</div>' : '')
      + (opc && opc.reloj && a ? '<div class="reloj" id="reloj">' + mmss(restante()) + '</div>' : '')
      + (opc && opc.puntos ? '<div class="barra-puntos"><small>PUNTOS</small><b>' + totalPuntos() + '</b></div>' : '')
      + '<button class="btn-icono" data-a="voz" aria-label="Activar o silenciar sonido">' + (S.voz ? 'SONIDO ON' : 'SONIDO OFF') + '</button>'
      + '</header>';
  }

  function render() {
    detenerTicker();
    const p = S.pantalla;
    if (p === 'inicio') return pInicio();
    if (p === 'intro') return pIntro();
    if (p === 'mapa') return pMapa();
    if (p === 'briefing') return pBriefing();
    if (p === 'paso') return pPaso();
    if (p === 'cierre') return pCierre();
    pInicio();
  }

  /* ---- Inicio: registro del equipo ---- */
  function pInicio() {
    const opciones = J.grupos.map(g =>
      '<button class="grupo ' + (S.grupo === g.id ? 'sel' : '') + '" data-grupo="' + g.id + '" style="--g:' + g.color + '">'
      + '<span class="grupo-simbolo">' + g.simbolo + '</span><span>' + esc(g.nombre) + '</span></button>').join('');
    pinta('<main class="portal">'
      + '<div class="portal-anillo" aria-hidden="true"><i></i><i></i><i></i></div>'
      + '<section class="portal-caja">'
      + '<p class="sobretitulo">Laboratorio quirúrgico de alta inmersión</p>'
      + '<h1>' + esc(J.titulo) + '</h1>'
      + '<p class="codigo-juego">' + esc(J.subtitulo) + '</p>'
      + '<label class="campo"><span>Nombre del equipo</span><input id="equipo" maxlength="40" autocomplete="off" value="' + esc(S.equipo) + '" placeholder="Escriban el nombre de su tripulación"></label>'
      + '<div class="campo"><span>Su grupo</span><div class="grupos">' + opciones + '</div></div>'
      + '<p class="error" id="err"></p>'
      + '<button class="btn primario grande" data-a="registrar">CRUZAR EL PORTAL →</button>'
      + '</section>'
      + '<footer class="creditos">Metodología y diseño del juego: Nathalia Velasco · Simoné</footer>'
      + '</main>');
  }

  /* ---- Intro: el Guardián de la Línea del Tiempo ---- */
  function pIntro() {
    const i = Math.min(S.intro, J.intro.length - 1);
    const ultimo = i === J.intro.length - 1;
    pinta('<div class="pantalla">' + barra({})
      + '<main class="intro">'
      + guardian('El Guardián de la Línea del Tiempo')
      + '<p class="intro-texto">' + esc(J.intro[i]) + '</p>'
      + '<div class="puntos-intro">' + J.intro.map((_, k) => '<i class="' + (k <= i ? 'on' : '') + '"></i>').join('') + '</div>'
      + (i === 2 ? rolesHTML() : '')
      + '<div class="acciones"><button class="btn fantasma" data-a="introSaltar">Saltar introducción</button>'
      + '<button class="btn primario" data-a="introSig">' + (ultimo ? 'ABRIR LA LÍNEA DE TIEMPO →' : 'CONTINUAR →') + '</button></div>'
      + '</main></div>');
    decir(J.intro[i]);
  }
  function rolesHTML() {
    return '<div class="roles">' + J.roles.map(r => '<div class="rol"><b>' + esc(r.nombre) + '</b><span>' + esc(r.mision) + '</span></div>').join('') + '</div>';
  }
  function guardian(nombre) {
    return '<div class="guardian"><div class="guardian-reloj" aria-hidden="true"><i class="h"></i><i class="m"></i></div><span>' + esc(nombre) + '</span></div>';
  }

  /* ---- Mapa: la línea de vida del paciente ---- */
  function pMapa() {
    const nodos = C.estaciones.map((e, k) => {
      const hecha = S.hechas.indexOf(e.id) >= 0;
      const previaOk = k === 0 || S.hechas.indexOf(C.estaciones[k - 1].id) >= 0;
      let estado = hecha ? 'hecha' : (previaOk ? (e.enConstruccion ? 'construccion' : 'disponible') : 'bloqueada');
      const r = S.resultados[e.id];
      const etiqueta = { hecha: (r ? r.total + ' / 20 pts' : 'Restaurado'), disponible: 'ENTRAR', construccion: 'En construcción', bloqueada: 'Bloqueada' }[estado];
      return '<li class="nodo ' + estado + '">'
        + '<button ' + (estado === 'disponible' ? 'data-a="entrar" data-est="' + e.id + '"' : 'disabled') + '>'
        + '<span class="nodo-num">' + e.numero + '</span>'
        + '<span class="nodo-nombre">' + esc(e.nombre) + '</span>'
        + '<span class="nodo-sub">' + esc(e.nodoLinea) + '</span>'
        + '<span class="nodo-estado">' + etiqueta + '</span>'
        + '</button></li>';
    }).join('');
    const sig = C.estaciones.find((e, k) => S.hechas.indexOf(e.id) < 0);
    pinta('<div class="pantalla">' + barra({ puntos: true })
      + '<main class="mapa">'
      + '<p class="sobretitulo">El laberinto temporal</p>'
      + '<h2>Línea de vida del paciente</h2>'
      + '<p class="mapa-intro">Cinco cámaras en orden estricto. Doce minutos en cada una. Cada cámara superada restaura un nodo de su línea de vida a un año.</p>'
      + '<ol class="linea">' + nodos + '</ol>'
      + (sig && sig.enConstruccion && S.hechas.length ? '<p class="aviso">La siguiente cámara aún está en construcción en este prototipo.</p>' : '')
      + '<div class="mapa-pie"><button class="btn fantasma pequeno" data-a="reiniciar" id="btnReiniciar">Reiniciar partida</button></div>'
      + '</main></div>');
  }

  /* ---- Briefing de la cámara ---- */
  function pBriefing() {
    const e = estacion(S.actual.est);
    pinta('<div class="pantalla">' + barra({})
      + '<main class="briefing">'
      + '<p class="sobretitulo">Cámara ' + e.numero + ' · ' + esc(e.lugar) + '</p>'
      + '<h2>' + esc(e.nombre) + '</h2><p class="sub">' + esc(e.subtitulo) + '</p>'
      + '<article class="tarjeta-clinica"><header>' + esc(e.briefing.titulo) + '</header>'
      + e.briefing.texto.map(t => '<p>' + esc(t) + '</p>').join('') + '</article>'
      + '<p class="briefing-nota">Al pulsar INICIAR empiezan los ' + J.minutosPorEstacion + ' minutos. El Comandante opera esta tablet; el Copiloto anota en la bitácora.</p>'
      + '<button class="btn primario grande" data-a="iniciar">INICIAR CÁMARA · ' + mmss(SEG_ESTACION) + '</button>'
      + '</main></div>');
    decir('Cámara ' + e.numero + ': ' + e.nombre + '. ' + e.briefing.texto.join(' '));
  }

  /* ---- Paso a paso de la cámara ---- */
  function pPaso() {
    const a = S.actual, e = estacion(a.est), paso = e.pasos[a.paso];
    const ruta = '<ol class="ruta">' + e.pasos.map((p, k) =>
      '<li class="' + (k < a.paso ? 'ok' : k === a.paso ? 'hoy' : '') + (p.tipo === 'codigo' ? ' cod' : '') + '">'
      + '<span class="ruta-marca">' + (k < a.paso ? '✓' : (p.tipo === 'codigo' ? '#' : k + 1)) + '</span>'
      + '<span class="ruta-texto">' + esc(p.tipo === 'codigo' ? 'Código ' + p.codigo : p.titulo) + '</span></li>').join('') + '</ol>';
    const progreso = '<div class="progreso" aria-hidden="true">' + e.pasos.map((p, k) => '<i class="' + (k < a.paso ? 'ok' : k === a.paso ? 'hoy' : '') + '"></i>').join('') + '</div>';

    pinta('<div class="pantalla">' + barra({ reloj: true, puntos: false })
      + '<main class="camara">'
      + '<aside class="col-ruta"><p class="sobretitulo">Cámara ' + e.numero + '</p><h3>' + esc(e.nombre) + '</h3>' + ruta + '</aside>'
      + '<section class="col-paso">' + progreso
      + '<div class="paso-cab"><span class="paso-num">PASO ' + (a.paso + 1) + ' DE ' + e.pasos.length + '</span>'
      + (paso.rol ? '<span class="quien">' + esc(paso.rol) + '</span>' : '') + '</div>'
      + cuerpoPaso(e, paso)
      + '</section>'
      + '<aside class="col-guia" id="guia">' + guiaHTML(paso) + '</aside>'
      + '</main></div>');

    if (paso.tipo === 'codigo') { const inp = document.getElementById('codigo'); if (inp && !estadoCodigo(paso).ok) setTimeout(() => inp.focus(), 80); }
    iniciarTicker();
  }

  function cuerpoPaso(e, paso) {
    if (paso.tipo === 'accion') {
      return '<div class="panel accion"><h2>' + esc(paso.titulo) + '</h2><p class="instruccion">' + esc(paso.instruccion) + '</p>'
        + '<div class="mesa-indicador"><span class="mesa-icono" aria-hidden="true"></span>Esta acción se realiza en la mesa física</div>'
        + '<div class="acciones"><button class="btn primario" data-a="hecho">' + esc(paso.boton || 'HECHO') + ' →</button></div></div>';
    }
    if (paso.tipo === 'revelacion') {
      const d = paso.documento;
      return '<div class="panel"><h2>' + esc(paso.titulo) + '</h2><p class="instruccion">' + esc(paso.instruccion) + '</p>'
        + '<article class="documento"><header><b>' + esc(d.titulo) + '</b><small>' + esc(d.encabezado) + '</small></header><dl>'
        + d.lineas.map(l => '<dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd>').join('') + '</dl></article>'
        + '<div class="acciones"><button class="btn primario" data-a="hecho">' + esc(paso.boton || 'CONTINUAR') + ' →</button></div></div>';
    }
    if (paso.tipo === 'solicitud') {
      const visto = !!S.actual.revelados[paso.id];
      return '<div class="panel"><h2>' + esc(paso.titulo) + '</h2><p class="instruccion">' + esc(paso.instruccion) + '</p>'
        + (visto ? monitorHTML(paso.revela) + '<div class="acciones"><button class="btn primario" data-a="hecho">' + esc(paso.boton || 'CONTINUAR') + ' →</button></div>'
          : '<div class="acciones centro"><button class="btn solicitud" data-a="solicitar">' + esc(paso.botonSolicitud) + '</button></div>')
        + '</div>';
    }
    if (paso.tipo === 'codigo') {
      const st = estadoCodigo(paso);
      const quedan = J.intentosPorCodigo - st.intentos;
      let cuerpo;
      if (st.ok || st.liberado) {
        cuerpo = '<div class="resultado-codigo ' + (st.ok ? 'bien' : 'liberado') + '">'
          + (paso.candado ? '<div class="candado abierto" aria-hidden="true"><i></i></div>' : '')
          + '<b>' + (st.ok ? 'CÓDIGO ACEPTADO' : 'CÓDIGO LIBERADO POR EL GUÍA') + '</b>'
          + '<span class="codigo-mostrado">' + esc(st.ok ? st.valor : descifrar(paso.liberar)) + '</span>'
          + (st.ok && !st.sinPuntos ? '<small>+' + paso.puntos + ' puntos</small>' : '<small>Esta prueba no suma puntos</small>')
          + (paso.bitacora ? '<p>' + esc(paso.bitacora) + '</p>' : '')
          + '</div><div class="acciones"><button class="btn primario" data-a="hecho">' + (paso.salida ? 'CERRAR LA CÁMARA →' : 'CONTINUAR →') + '</button></div>';
      } else {
        cuerpo = '<form class="form-codigo" data-form="codigo">'
          + (paso.candado ? '<div class="candado" aria-hidden="true"><i></i></div>' : '')
          + '<label for="codigo" class="formato">' + esc(paso.formato) + '</label>'
          + '<input id="codigo" class="entrada-codigo" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="' + esc(paso.placeholder || '') + '">'
          + '<div class="intentos">' + Array.from({ length: J.intentosPorCodigo }, (_, k) => '<i class="' + (k < st.intentos ? 'gastado' : '') + '"></i>').join('')
          + '<span>' + quedan + (quedan === 1 ? ' intento' : ' intentos') + ' con puntos</span></div>'
          + '<p class="mensaje-error" id="msgErr" role="alert">' + esc(st.ultimoError || '') + '</p>'
          + '<div class="acciones"><button type="submit" class="btn primario">VALIDAR CÓDIGO</button></div>'
          + (st.intentos >= J.intentosPorCodigo ? '<div class="liberar"><p>Agotaron los intentos con puntos. Pueden seguir intentando o pedir al Guía que libere el código para no detener la misión.</p><button type="button" class="btn fantasma" data-a="liberar">LIBERAR CÓDIGO (0 PUNTOS)</button></div>' : '')
          + '</form>';
      }
      return '<div class="panel codigo ' + (paso.salida ? 'salida' : '') + '"><h2>' + esc(paso.titulo) + '</h2><p class="pregunta">' + esc(paso.pregunta) + '</p>' + cuerpo + '</div>';
    }
    return '';
  }

  function monitorHTML(r) {
    return '<div class="monitor"><div class="monitor-ecg"><svg viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true"><path class="ecg" pathLength="1000" d="M0 45 L60 45 L70 40 L78 45 L95 45 L100 10 L106 70 L112 45 L135 45 L145 36 L160 45 L200 45 L210 40 L218 45 L235 45 L240 10 L246 70 L252 45 L275 45 L285 36 L300 45 L340 45 L350 40 L358 45 L375 45 L380 10 L386 70 L392 45 L415 45 L425 36 L440 45 L480 45 L490 40 L498 45 L515 45 L520 10 L526 70 L532 45 L555 45 L565 36 L580 45 L600 45"/></svg></div>'
      + '<div class="vitales">' + r.vitales.map(v => '<div class="vital ' + (v.alerta ? 'alerta' : '') + (v.destacar ? ' destacar' : '') + '"><small>' + esc(v.etiqueta) + '</small><b>' + esc(v.valor) + '</b><span>' + esc(v.unidad) + '</span></div>').join('') + '</div>'
      + '<div class="imagen-dx"><small>' + esc(r.imagen.titulo) + '</small><b>' + esc(r.imagen.resultado) + '</b><p>' + esc(r.imagen.detalle) + '</p></div>'
      + (r.nota ? '<p class="monitor-nota">' + esc(r.nota) + '</p>' : '')
      + '</div>';
  }

  /* ---- Panel del Guía: mensaje + pistas por tiempo ---- */
  function nivelPista(paso) {
    if (!paso.pistas || !paso.pistas.length) return 0;
    const seg = (ahora() - S.actual.pasoDesde) / 1000;
    let n = 0; J.pistasSegundos.forEach((s, k) => { if (seg >= s && k < paso.pistas.length) n = k + 1; });
    return n;
  }
  function guiaHTML(paso) {
    const a = S.actual;
    const nivel = nivelPista(paso);
    const vistas = a.pistasVistas[paso.id] || 0;
    let pistas = '';
    if (paso.pistas && paso.pistas.length) {
      const items = [];
      for (let k = 0; k < paso.pistas.length; k++) {
        const directa = k === paso.pistas.length - 1;
        if (k < vistas) items.push('<li class="pista abierta ' + (directa ? 'directa' : '') + '"><small>Pista ' + (k + 1) + (directa ? ' · directa' : '') + '</small><p>' + esc(paso.pistas[k]) + '</p></li>');
        else if (k < nivel && k === vistas) items.push('<li class="pista disponible"><button class="btn pista-btn ' + (directa ? 'directa' : '') + '" data-a="pista">' + (directa ? 'Ver pista directa (−' + J.costoPistaDirecta + ' punto)' : 'Ver pista ' + (k + 1)) + '</button></li>');
        else if (k === vistas) {
          const falta = Math.max(0, J.pistasSegundos[k] - (ahora() - a.pasoDesde) / 1000);
          items.push('<li class="pista espera"><small>Pista ' + (k + 1) + ' disponible en <span id="faltaPista">' + mmss(falta) + '</span></small></li>');
        }
      }
      pistas = '<ul class="pistas">' + items.join('') + '</ul>';
    }
    const agotado = restante() <= 0;
    return guardian('Guía Especialista')
      + '<p class="guia-texto">' + esc(paso.guia || (paso.tipo === 'codigo' ? 'Comandante: digiten el código cuando el equipo tenga consenso. Copiloto: revisen la bitácora antes de validar. Cada error cuesta un intento.' : '')) + '</p>'
      + (agotado ? '<p class="guia-alerta">Tiempo agotado. La bonificación por tiempo se pierde, pero terminen la cámara: el paciente los necesita.</p>' : '')
      + pistas
      + '<button class="btn fantasma pequeno" data-a="repetir">Repetir indicación</button>';
  }

  /* ---------------------------------------------------- reloj y ticker */
  let tickId = null, ultimoNivel = -1, ultimoSeg = -1;
  function restante() {
    const a = S.actual; if (!a || !a.inicio) return SEG_ESTACION;
    return SEG_ESTACION - (ahora() - a.inicio) / 1000;
  }
  function iniciarTicker() {
    const e = estacion(S.actual.est), paso = e.pasos[S.actual.paso];
    ultimoNivel = nivelPista(paso);
    tickId = setInterval(function () {
      const r = restante(), el = document.getElementById('reloj');
      if (el) {
        el.textContent = mmss(r);
        el.classList.toggle('urgente', r <= 120 && r > 0);
        el.classList.toggle('agotado', r <= 0);
      }
      const s = Math.ceil(r);
      if (s !== ultimoSeg) {
        if (s <= 60 && s > 0) SFX.tic();
        if (s === 0) { SFX.error(); decir('Tiempo agotado. Terminen la cámara.'); }
        ultimoSeg = s;
      }
      const n = nivelPista(paso);
      const g = document.getElementById('guia');
      if (g && n !== ultimoNivel) {
        ultimoNivel = n; SFX.paso();
        if ((S.actual.pistasVistas[paso.id] || 0) < n) decir('Hay una pista disponible.');
        g.innerHTML = guiaHTML(paso);
      } else {
        const f = document.getElementById('faltaPista');
        if (f) { const k = S.actual.pistasVistas[paso.id] || 0; f.textContent = mmss(J.pistasSegundos[k] - (ahora() - S.actual.pasoDesde) / 1000); }
      }
      if (s === 0 && g) g.innerHTML = guiaHTML(paso);
    }, 1000);
  }
  function detenerTicker() { if (tickId) clearInterval(tickId); tickId = null; }

  /* ------------------------------------------------------------- puntaje */
  function estadoCodigo(paso) {
    const a = S.actual;
    if (!a.codigos[paso.codigo]) a.codigos[paso.codigo] = { intentos: 0, ok: false, liberado: false, valor: '', ultimoError: '' };
    return a.codigos[paso.codigo];
  }
  function bonoTiempo(seg) {
    for (const b of J.bonosTiempo) if (seg <= b.hasta) return b;
    return { puntos: 0, etiqueta: 'Fuera de tiempo' };
  }
  function calcularResultado() {
    const a = S.actual, e = estacion(a.est);
    let codigos = 0, maxCodigos = 0, aciertos = 0;
    const detalle = [];
    e.pasos.filter(p => p.tipo === 'codigo').forEach(p => {
      const st = a.codigos[p.codigo] || {};
      const pts = st.ok && !st.sinPuntos ? p.puntos : 0;
      maxCodigos += p.puntos; codigos += pts; if (st.ok) aciertos++;
      detalle.push({ codigo: p.codigo, titulo: p.titulo, puntos: pts, max: p.puntos, ok: !!st.ok, liberado: !!st.liberado, intentos: st.intentos || 0 });
    });
    const usados = Math.round((a.fin - a.inicio) / 1000);
    const bono = bonoTiempo(usados);
    const directas = Object.keys(a.pistasVistas).reduce((n, id) => {
      const p = e.pasos.find(x => x.id === id); return n + (p && p.pistas && a.pistasVistas[id] >= p.pistas.length ? 1 : 0);
    }, 0);
    const penal = directas * J.costoPistaDirecta;
    const total = Math.max(0, codigos + bono.puntos - penal);
    return { codigos, maxCodigos, aciertos, detalle, usados, bono, directas, penal, total };
  }
  function totalPuntos() { return Object.values(S.resultados).reduce((n, r) => n + r.total, 0); }

  /* ---- Cierre de la cámara: resultado y debriefing ---- */
  function pCierre() {
    const e = estacion(S.actual.est), r = S.resultados[e.id], c = e.cierre;
    pinta('<div class="pantalla">' + barra({ puntos: true })
      + '<main class="cierre">'
      + '<section class="cierre-cab"><p class="sobretitulo">Cámara ' + e.numero + ' superada</p><h2>' + esc(c.mensaje) + '</h2><p>' + esc(c.detalle) + '</p></section>'
      + '<div class="cierre-grid">'
      + '<section class="marcador"><div class="marcador-total"><b>' + r.total + '</b><span>/ 20</span></div>'
      + '<table><tbody>'
      + r.detalle.map(d => '<tr><td>Código ' + esc(d.codigo) + (d.liberado ? ' <em>liberado</em>' : '') + '</td><td>' + d.puntos + ' / ' + d.max + '</td></tr>').join('')
      + '<tr><td>Tiempo ' + mmss(r.usados) + ' · ' + esc(r.bono.etiqueta) + '</td><td>+' + r.bono.puntos + '</td></tr>'
      + (r.penal ? '<tr><td>Pistas directas usadas (' + r.directas + ')</td><td>−' + r.penal + '</td></tr>' : '')
      + '</tbody></table></section>'
      + '<section class="debrief">' + guardian('Guía Especialista')
      + '<blockquote>' + esc(c.especialista) + '</blockquote>'
      + '<h4>Lo que se llevan de esta cámara</h4><ul>' + c.aprendizajes.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>'
      + '<p class="linea-vida">' + esc(c.lineaVida) + '</p>'
      + '</section></div>'
      + '<p class="siguiente">' + esc(c.siguiente) + '</p>'
      + '<div class="acciones centro"><button class="btn fantasma" data-a="repetirCierre">Escuchar de nuevo</button><button class="btn primario grande" data-a="mapa">VOLVER A LA LÍNEA DE TIEMPO →</button></div>'
      + '</main></div>');
    decir(c.mensaje + ' ' + c.especialista);
  }

  /* ------------------------------------------------------------- acciones */
  function irPaso(n) {
    const a = S.actual; a.paso = n; a.pasoDesde = ahora(); guardar();
    S.pantalla = 'paso'; render();
    const paso = estacion(a.est).pasos[n];
    SFX.paso();
    decir(paso.tipo === 'codigo' ? paso.titulo + '. ' + paso.pregunta : paso.titulo + '. ' + paso.instruccion + ' ' + (paso.guia || ''));
  }
  function avanzar() {
    const a = S.actual, e = estacion(a.est);
    if (a.paso < e.pasos.length - 1) return irPaso(a.paso + 1);
    a.fin = ahora();
    S.resultados[e.id] = calcularResultado();
    if (S.hechas.indexOf(e.id) < 0) S.hechas.push(e.id);
    S.pantalla = 'cierre'; guardar(); SFX.ok(); render();
  }

  async function validar() {
    const a = S.actual, e = estacion(a.est), paso = e.pasos[a.paso];
    const inp = document.getElementById('codigo'), msg = document.getElementById('msgErr');
    const valor = (inp && inp.value || '').trim();
    if (!valor) { if (msg) msg.textContent = 'Escriban el código antes de validar.'; return; }
    const st = estadoCodigo(paso);
    const h = await huella(paso.codigo, valor);
    if (paso.huellas.indexOf(h) >= 0) {
      st.ok = true; st.valor = valor.toUpperCase(); st.ultimoError = '';
      if (st.intentos >= J.intentosPorCodigo) st.sinPuntos = true;
      guardar(); paso.candado ? SFX.candado() : SFX.ok();
      render(); decir('Código aceptado. ' + (paso.bitacora || ''));
      return;
    }
    st.intentos++;
    const n = norm(valor);
    const especifico = (paso.errores || []).find(x => new RegExp(x.si).test(n));
    st.ultimoError = especifico ? especifico.msg : paso.errorGeneral;
    guardar(); SFX.error(); render(); decir(st.ultimoError);
    const nuevo = document.getElementById('codigo'); if (nuevo) { nuevo.classList.add('sacudir'); }
  }

  app.addEventListener('submit', function (ev) {
    if (ev.target.matches('[data-form="codigo"]')) { ev.preventDefault(); validar(); }
  });

  let confirmarReinicio = 0;
  app.addEventListener('click', function (ev) {
    const g = ev.target.closest('[data-grupo]');
    if (g) { S.grupo = g.getAttribute('data-grupo'); const eq = document.getElementById('equipo'); if (eq) S.equipo = eq.value; guardar(); return pInicio(); }
    const b = ev.target.closest('[data-a]'); if (!b) return;
    const acc = b.getAttribute('data-a');
    audio();
    switch (acc) {
      case 'registrar': {
        const nombre = (document.getElementById('equipo').value || '').trim();
        const err = document.getElementById('err');
        if (!nombre) { err.textContent = 'Escriban el nombre del equipo.'; return; }
        if (!S.grupo) { err.textContent = 'Elijan su grupo.'; return; }
        S.equipo = nombre; S.pantalla = 'intro'; S.intro = 0; guardar(); SFX.ok(); return render();
      }
      case 'introSig':
        if (S.intro < J.intro.length - 1) { S.intro++; guardar(); return render(); }
        S.pantalla = 'mapa'; guardar(); callar(); return render();
      case 'introSaltar': S.pantalla = 'mapa'; guardar(); callar(); return render();
      case 'entrar': {
        const id = b.getAttribute('data-est');
        S.actual = { est: id, paso: 0, inicio: null, fin: null, pasoDesde: null, codigos: {}, pistasVistas: {}, revelados: {} };
        S.pantalla = 'briefing'; guardar(); return render();
      }
      case 'iniciar': S.actual.inicio = ahora(); callar(); return irPaso(0);
      case 'hecho': return avanzar();
      case 'solicitar': {
        const paso = estacion(S.actual.est).pasos[S.actual.paso];
        S.actual.revelados[paso.id] = true; guardar(); render(); SFX.monitor(6);
        decir('Signos vitales: tensión arterial ochenta sobre cincuenta, frecuencia cardíaca ciento treinta, temperatura treinta y cuatro punto ocho grados. FAST positiva: líquido libre en Morison y en toda la cavidad.');
        return;
      }
      case 'pista': {
        const paso = estacion(S.actual.est).pasos[S.actual.paso];
        S.actual.pistasVistas[paso.id] = (S.actual.pistasVistas[paso.id] || 0) + 1; guardar();
        const k = S.actual.pistasVistas[paso.id] - 1;
        document.getElementById('guia').innerHTML = guiaHTML(paso);
        return decir(paso.pistas[k]);
      }
      case 'liberar': {
        const paso = estacion(S.actual.est).pasos[S.actual.paso];
        const st = estadoCodigo(paso); st.liberado = true; st.ultimoError = ''; guardar(); SFX.candado(); render();
        return decir('El Guía libera el código: ' + descifrar(paso.liberar).split('').join(' ') + '. Esta prueba no suma puntos.');
      }
      case 'repetir': {
        const paso = estacion(S.actual.est).pasos[S.actual.paso];
        return decir(paso.tipo === 'codigo' ? paso.pregunta : paso.instruccion + ' ' + (paso.guia || ''));
      }
      case 'repetirCierre': { const c = estacion(S.actual.est).cierre; return decir(c.especialista + ' ' + c.siguiente); }
      case 'mapa': S.pantalla = 'mapa'; guardar(); callar(); return render();
      case 'voz': S.voz = !S.voz; guardar(); if (!S.voz) callar(); b.textContent = S.voz ? 'SONIDO ON' : 'SONIDO OFF'; return;
      case 'reiniciar':
        if (confirmarReinicio && ahora() - confirmarReinicio < 4000) { S = nuevo(); guardar(); confirmarReinicio = 0; callar(); return render(); }
        confirmarReinicio = ahora(); b.textContent = 'Toca de nuevo para borrar la partida'; return;
    }
  });

  /* Respaldo SHA-256 para navegadores sin crypto.subtle (p. ej. archivo local). */
  function sha256Respaldo(bytes) {
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const l = bytes.length, conRelleno = new Uint8Array(((l + 9 + 63) >> 6) << 6);
    conRelleno.set(bytes); conRelleno[l] = 0x80;
    const bits = l * 8, dv = new DataView(conRelleno.buffer);
    dv.setUint32(conRelleno.length - 4, bits >>> 0); dv.setUint32(conRelleno.length - 8, Math.floor(bits / 4294967296));
    const W = new Uint32Array(64), r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < conRelleno.length; i += 64) {
      for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) { const s0 = r(W[t-15],7) ^ r(W[t-15],18) ^ (W[t-15] >>> 3), s1 = r(W[t-2],17) ^ r(W[t-2],19) ^ (W[t-2] >>> 10); W[t] = (W[t-16] + s0 + W[t-7] + s1) >>> 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = r(e,6) ^ r(e,11) ^ r(e,25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
        const S0 = r(a,2) ^ r(a,13) ^ r(a,22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H = [H[0]+a, H[1]+b, H[2]+c, H[3]+d, H[4]+e, H[5]+f, H[6]+g, H[7]+h].map(x => x >>> 0);
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  }

  render();
})();
