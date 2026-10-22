/* ==========================================================================
   MÁQUINA DEL TIEMPO · Consola de misión (celular de cada participante)
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   --------------------------------------------------------------------------
   - Cada participante se registra en su celular (nombre, profesión, grupo, rol).
   - El Comandante de Misión conduce: inicia estaciones y digita los códigos.
   - Los demás celulares del grupo ven lo mismo en vivo.
   - 12:00 de juego por estación + 30 s de gracia. A las 12:30 se cierra sola.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.CONTENIDO, J = C.juego, D = window.DATOS, H = window.HUELLAS;
  const app = document.getElementById('app');
  const SEG_OFICIAL = J.minutos * 60, SEG_CIERRE = J.segundosCierre;
  const CLAVE_YO = 'mdt-yo-v2';

  /* ------------------------------------------------------------ utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, '');
  const mayus = s => String(s || '').toUpperCase().replace(/\s+/g, ' ').trimStart();
  const revelar = c => { try { return atob(H[c].r).split('').reverse().join(''); } catch (e) { return ''; } };
  const mmss = seg => { const n = Math.max(0, Math.ceil(seg)); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
  const grupoDe = id => J.grupos.find(g => g.id === id) || J.grupos[0];
  const rolDe = id => J.roles.find(r => r.id === id) || { nombre: id };
  /* En modo demo cada pestaña es un jugador distinto (sessionStorage); con
     base de datos real, el celular recuerda a su jugador (localStorage). */
  function almacen() { try { return D.modo === 'demo' ? sessionStorage : localStorage; } catch (e) { return null; } }
  function leerYo() { try { return JSON.parse(almacen().getItem(CLAVE_YO) || 'null'); } catch (e) { return null; } }
  function guardarYo() { try { if (YO) almacen().setItem(CLAVE_YO, JSON.stringify(YO)); else almacen().removeItem(CLAVE_YO); } catch (e) {} }

  async function huella(codigo, texto) {
    const datos = new TextEncoder().encode('MDT|' + codigo + '|' + norm(texto));
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', datos);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return window.sha256Respaldo(datos);
  }

  /* ---------------------------------------------------------------- estado */
  let YO = leerYo();                 /* {id, grupo, rol, nombre, profesion, voz} */
  let G = {};                        /* estado compartido del grupo */
  let MIEMBROS = [];                 /* participantes del grupo */
  let TODOS = [];                    /* todos los participantes (registro) */
  let OFFSET = 0;                    /* reloj del servidor − reloj local */
  let ESCRIBIENDO = false;
  const ahora = () => Date.now() + OFFSET;

  function estacionIdx() { return G.est || 0; }
  function estacion() { return C.estaciones[estacionIdx()]; }
  function pasosDe(e) { return e.pruebas.length + 1; }           /* pruebas + clave */
  function codigoDePaso(e, i) { return i < e.pruebas.length ? e.pruebas[i].codigo : e.clave; }
  function fase() { return G.fase || 'portico'; }
  function soyMando() {
    if (!YO) return false;
    if (G.control) return G.control === YO.id;
    return YO.rol === 'COMANDANTE';
  }
  function transcurrido() { return G.inicio ? (ahora() - G.inicio) / 1000 : 0; }

  async function escribir(cambios) {
    G = Object.assign({}, G, cambios, { v: (G.v || 0) + 1 });
    ESCRIBIENDO = true;
    render();
    try { await D.guardarGrupo(YO.grupo, G); }
    catch (e) { aviso(D.mensaje(e)); }
    finally { ESCRIBIENDO = false; }
  }

  /* ----------------------------------------------------------------- audio */
  let ctx = null;
  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tono(f, dur, tipo, vol, ret) {
    const a = audio(); if (!a || !YO || !YO.voz) return;
    const t0 = a.currentTime + (ret || 0), o = a.createOscillator(), g = a.createGain();
    o.type = tipo || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  const SFX = {
    ok() { tono(660, 0.18, 'triangle', 0.18); tono(990, 0.3, 'triangle', 0.16, 0.12); },
    error() { tono(140, 0.35, 'sawtooth', 0.12); tono(110, 0.4, 'sawtooth', 0.1, 0.08); },
    paso() { tono(520, 0.12, 'sine', 0.1); },
    tic() { tono(1400, 0.04, 'square', 0.04); },
    candado() { tono(300, 0.08, 'square', 0.12); tono(420, 0.08, 'square', 0.12, 0.09); tono(880, 0.4, 'triangle', 0.16, 0.2); }
  };

  /* ------------------------------------------------------------------- voz
     Voz automática del dispositivo. Se prefiere una voz MASCULINA de español
     latinoamericano; si el equipo no tiene ninguna, se usa la más cercana con
     un tono más grave. */
  let VOZ = null, GRAVE = false;
  const MASC = /(juan|diego|jorge|carlos|pablo|ra[uú]l|gerardo|andr[eé]s|enrique|[aá]lvaro|jos[eé]|miguel|eddy|reed|rocko|grandpa|male|hombre|masculin)/i;
  const FEM = /(paulina|m[oó]nica|sabina|helena|laura|elvira|dalia|lupe|marisol|isabela|paloma|francisca|soledad|ang[eé]lica|female|mujer|femenin|flo|sandy|shelley|grandma)/i;
  const LATAM = /es[-_](MX|US|419|CO|AR|CL|PE|VE|EC|UY|BO|PY|CR|PA|DO|GT|HN|SV|NI|PR|CU)/i;
  function elegirVoz() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
    let mejor = null, pts = -99;
    vs.forEach(v => {
      let p = 0;
      if (MASC.test(v.name)) p += 5;
      if (FEM.test(v.name)) p -= 5;
      if (LATAM.test(v.lang)) p += 2;
      if (v.localService) p += 0.5;
      if (p > pts) { pts = p; mejor = v; }
    });
    VOZ = mejor; GRAVE = !(mejor && MASC.test(mejor.name));
  }
  if ('speechSynthesis' in window) { elegirVoz(); speechSynthesis.onvoiceschanged = elegirVoz; }
  function decir(texto) {
    if (!YO || !YO.voz || !('speechSynthesis' in window) || !texto) return;
    try {
      speechSynthesis.cancel();
      const partes = String(texto).match(/[^.!?…]+[.!?…]*/g) || [texto];   /* frases cortas: iOS corta textos largos */
      partes.forEach(fr => {
        const u = new SpeechSynthesisUtterance(fr.trim());
        u.lang = VOZ ? VOZ.lang : 'es-MX';
        if (VOZ) u.voice = VOZ;
        u.rate = 1; u.pitch = GRAVE ? 0.7 : 0.95;
        speechSynthesis.speak(u);
      });
    } catch (e) {}
  }
  let vozLista = false;
  function desbloquearVoz() {   /* iOS solo habla si la primera frase nace de un toque */
    if (vozLista || !('speechSynthesis' in window)) return;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); vozLista = true; } catch (e) {}
  }
  function callar() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {} }

  /* ------------------------------------------------------------- avisos */
  let avisoId = null;
  function aviso(txt) {
    let el = document.getElementById('aviso');
    if (!el) { el = document.createElement('div'); el.id = 'aviso'; el.className = 'aviso-flotante'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = txt; el.classList.add('on');
    clearTimeout(avisoId); avisoId = setTimeout(() => el.classList.remove('on'), 4200);
  }

  /* ---------------------------------------------------------------- render */
  function pinta(html) {
    const y = window.scrollY, misma = app.getAttribute('data-clave') === claveVista();
    app.innerHTML = html;
    app.setAttribute('data-clave', claveVista());
    if (!misma) window.scrollTo(0, 0); else window.scrollTo(0, y);
  }
  function claveVista() {
    if (!YO) return 'registro';
    return [fase(), G.est || 0, G.prueba || 0, G.vista || ''].join('|');
  }

  function barra(conReloj) {
    const g = grupoDe(YO.grupo), e = estacion();
    const enJuego = fase() === 'juego';
    return '<header class="barra">'
      + '<div class="barra-marca"><img src="img/solventum-logo.png" alt="Solventum"></div>'
      + '<div class="barra-equipo" style="--g:' + g.color + '"><span></span><b>' + esc(g.nombre) + '</b><small>' + esc(rolDe(YO.rol).nombre) + (soyMando() ? ' · CONSOLA' : '') + '</small></div>'
      + (conReloj && enJuego ? '<div class="reloj" id="reloj"><small>E' + e.numero + '</small><b>' + relojTexto() + '</b></div>' : '')
      + '<button class="btn-icono" data-a="voz" aria-label="Activar o silenciar la voz">' + (YO.voz ? 'VOZ ON' : 'VOZ OFF') + '</button>'
      + '</header>';
  }
  function relojTexto() {
    const t = transcurrido();
    return t <= SEG_OFICIAL ? mmss(SEG_OFICIAL - t) : '+' + mmss(SEG_CIERRE - t);
  }

  function render() {
    if (!YO) return pRegistro();
    const f = fase();
    if (f === 'portico') return pPortico();
    if (f === 'antesala') return pAntesala();
    if (f === 'juego') return pJuego();
    if (f === 'retro') return pRetro();
    if (f === 'fin') return pFin();
    pPortico();
  }

  /* ===================================================== 0 · REGISTRO */
  let REG = { nombre: '', profesion: '', grupo: '', rol: '', autoriza: false };
  function pRegistro() {
    const conteo = g => TODOS.filter(p => p.grupo === g).length;
    const ocupado = (g, r) => {
      const n = TODOS.filter(p => p.grupo === g && p.rol === r).length;
      return n >= rolDe(r).cupo;
    };
    const grupos = J.grupos.map(g => {
      const n = conteo(g.id), lleno = n >= 7;
      return '<button class="grupo ' + (REG.grupo === g.id ? 'sel' : '') + '" data-grupo="' + g.id + '" style="--g:' + g.color + '" ' + (lleno ? 'disabled' : '') + '>'
        + '<span class="grupo-simbolo">' + g.simbolo + '</span><span class="grupo-nombre">' + esc(g.nombre) + '</span><span class="grupo-cupo">' + n + '/7</span></button>';
    }).join('');
    const roles = REG.grupo ? J.roles.map(r => {
      const lleno = ocupado(REG.grupo, r.id);
      return '<button class="rol-op ' + (REG.rol === r.id ? 'sel' : '') + '" data-rol="' + r.id + '" ' + (lleno ? 'disabled' : '') + '>'
        + '<b>' + esc(r.nombre) + '</b><small>' + (lleno ? 'Ocupado' : esc(r.subtitulo)) + '</small></button>';
    }).join('') : '<p class="nota">Primero elijan su grupo.</p>';
    pinta('<main class="portal">'
      + '<div class="portal-anillo" aria-hidden="true"><i></i><i></i><i></i></div>'
      + '<section class="portal-caja hud">'
      + '<img class="portal-logo" src="img/solventum-logo.png" alt="Solventum">'
      + '<p class="sobretitulo">Laboratorio quirúrgico de alta inmersión</p>'
      + '<h1>' + esc(J.titulo) + '</h1>'
      + '<p class="codigo-juego">' + esc(J.subtitulo) + '</p>'
      + '<p class="registro-intro">Registro del Cronocirujano</p>'
      + '<label class="campo"><span>Nombre completo</span><input id="nombre" maxlength="80" autocomplete="name" autocapitalize="characters" value="' + esc(REG.nombre) + '" placeholder="NOMBRES Y APELLIDOS"></label>'
      + '<label class="campo"><span>Profesión</span><input id="profesion" maxlength="60" autocapitalize="characters" value="' + esc(REG.profesion) + '" placeholder="EJ: CIRUJANO GENERAL"></label>'
      + '<div class="campo"><span>Grupo</span><div class="grupos">' + grupos + '</div></div>'
      + '<div class="campo"><span>Rol en la misión</span><div class="roles-op">' + roles + '</div></div>'
      + '<label class="autoriza"><input type="checkbox" id="autoriza" ' + (REG.autoriza ? 'checked' : '') + '><span>' + esc(J.autorizacion) + '</span></label>'
      + '<p class="error" id="err"></p>'
      + '<button class="btn primario grande" data-a="registrar">CRUZAR EL PORTAL →</button>'
      + (D.modo === 'demo' ? '<p class="modo-demo">MODO DEMO · los datos solo se guardan en este navegador</p>' : '')
      + '</section>'
      + '<footer class="creditos">Metodología y diseño del juego: Nathalia Velasco · Simoné</footer>'
      + '</main>');
  }
  function leerCamposRegistro() {
    const n = document.getElementById('nombre'), p = document.getElementById('profesion'), a = document.getElementById('autoriza');
    if (n) REG.nombre = mayus(n.value);
    if (p) REG.profesion = mayus(p.value);
    if (a) REG.autoriza = a.checked;
  }
  async function registrar() {
    leerCamposRegistro();
    const err = document.getElementById('err');
    const nombre = REG.nombre.trim(), profesion = REG.profesion.trim();
    if (nombre.split(' ').filter(Boolean).length < 2) { err.textContent = 'Escriban su nombre completo (nombres y apellidos).'; return; }
    if (!profesion) { err.textContent = 'Escriban su profesión.'; return; }
    if (!REG.grupo) { err.textContent = 'Elijan su grupo.'; return; }
    if (!REG.rol) { err.textContent = 'Elijan su rol en la misión.'; return; }
    if (!REG.autoriza) { err.textContent = 'Para participar deben aceptar la autorización de tratamiento de datos.'; return; }
    err.textContent = 'Registrando…';
    try {
      const fila = await D.registrar({ grupo: REG.grupo, nombre: nombre, profesion: profesion, rol: REG.rol, autoriza: true });
      YO = { id: fila.id, grupo: REG.grupo, rol: REG.rol, nombre: nombre, profesion: profesion, voz: REG.rol === 'COMANDANTE' };
      guardarYo(); SFX.ok();
      await sincronizar(true);
      render();
    } catch (e) {
      err.textContent = D.mensaje(e);
      await cargarTodos(); pRegistro();
      const e2 = document.getElementById('err'); if (e2) e2.textContent = D.mensaje(e);
    }
  }

  /* ===================================================== 1 · PÓRTICO */
  function tripulacionHTML() {
    const orden = ['PILOTO', 'COPILOTO', 'COMANDANTE', 'TRIPULANTE'];
    const filas = MIEMBROS.slice().sort((a, b) => orden.indexOf(a.rol) - orden.indexOf(b.rol)).map(m =>
      '<li class="' + (m.id === YO.id ? 'yo' : '') + '"><span class="rol-chip">' + esc(rolDe(m.rol).nombre) + '</span><b>' + esc(m.nombre) + '</b><small>' + esc(m.profesion) + '</small></li>').join('');
    return '<section class="tripulacion hud"><header><h3>Tripulación</h3><span>' + MIEMBROS.length + ' / 7</span></header><ul>' + filas + '</ul></section>';
  }
  function pPortico() {
    const g = grupoDe(YO.grupo), rol = rolDe(YO.rol);
    const hayMando = soyMando() || MIEMBROS.some(m => m.rol === 'COMANDANTE') || G.control;
    pinta('<div class="pantalla">' + barra(false)
      + '<main class="portico">'
      + '<section class="bienvenida">'
      + guardian('El Guardián de la Línea del Tiempo')
      + J.intro.map(p => '<p class="intro-texto">' + esc(p) + '</p>').join('')
      + '<button class="btn fantasma pequeno" data-a="repetirIntro">Escuchar de nuevo</button>'
      + '</section>'
      + '<section class="credencial hud" style="--g:' + g.color + '">'
      + '<p class="sobretitulo">Credencial de misión</p><h2>' + esc(rol.nombre) + '</h2><p class="sub">' + esc(rol.subtitulo) + '</p>'
      + '<p class="credencial-nombre">' + esc(YO.nombre) + '</p><p class="credencial-grupo"><span>' + g.simbolo + '</span> ' + esc(g.nombre) + '</p>'
      + '<ul class="mision">' + rol.mision.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul></section>'
      + tripulacionHTML()
      + '<section class="reglas hud"><h3>Reglas del laberinto</h3><ul>' + J.reglas.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>'
      + '<p class="arranque">' + esc(J.arranque) + '</p></section>'
      + (soyMando()
        ? '<div class="acciones centro"><button class="btn primario grande" data-a="antesala">CRUZAR EL PORTAL · ESTACIÓN 1 →</button></div>'
        : '<p class="espera">' + (hayMando ? 'El Comandante de Misión abrirá la Estación 1 cuando el Guía Especialista lo indique.' : 'Falta registrar al Comandante de Misión de este grupo.') + '</p>')
      + pieMando()
      + '</main></div>');
  }
  function guardian(nombre) {
    return '<div class="guardian"><div class="guardian-reloj" aria-hidden="true"><i class="h"></i><i class="m"></i></div><span>' + esc(nombre) + '</span></div>';
  }
  let confirmarMando = 0;
  function pieMando() {
    if (soyMando()) return '';
    return '<footer class="pie-mando"><button class="btn fantasma pequeno" data-a="tomarMando">Tomar el mando de la consola</button>'
      + '<small>Solo si el celular del Comandante falló o se quedó sin batería.</small></footer>';
  }

  /* ===================================================== ANTESALA de estación */
  function pAntesala() {
    const e = estacion();
    pinta('<div class="pantalla">' + barra(false)
      + '<main class="antesala">'
      + lineaDeVida()
      + '<p class="sobretitulo">Estación ' + e.numero + ' de 5</p>'
      + '<h2>' + esc(e.nombre) + '</h2><p class="sub">' + esc(e.subtitulo) + '</p>'
      + '<p class="concepto">' + esc(e.concepto) + '</p>'
      + (e.ingreso ? '<article class="tarjeta-clinica"><header>' + esc(e.ingreso.titulo) + '</header>' + e.ingreso.texto.map(t => '<p>' + esc(t) + '</p>').join('') + '</article>' : '')
      + '<p class="nota-guia">Guía Especialista: entreguen al grupo el material de la Estación ' + e.numero + '.</p>'
      + (soyMando()
        ? '<div class="acciones centro"><button class="btn primario grande" data-a="iniciar">INICIAR ESTACIÓN ' + e.numero + ' · 12:00</button></div>'
        : '<p class="espera">El Comandante iniciará el reloj cuando tengan el material.</p>')
      + pieMando()
      + '</main></div>');
  }
  function lineaDeVida() {
    const res = G.res || {};
    return '<ol class="linea-mini">' + C.estaciones.map((e, k) => {
      const r = res[e.id], actual = k === estacionIdx() && fase() !== 'fin';
      return '<li class="' + (r ? 'hecha' : actual ? 'actual' : '') + '"><span>' + e.numero + '</span><small>' + (r ? r.total + ' pts' : esc(e.nombre)) + '</small></li>';
    }).join('') + '</ol>';
  }

  /* ===================================================== JUEGO */
  function pJuego() {
    const e = estacion(), i = G.prueba || 0, total = pasosDe(e);
    const esClave = i >= e.pruebas.length;
    const progreso = '<div class="progreso" aria-label="Avance de la estación">' + Array.from({ length: total }, (_, k) =>
      '<i class="' + (k < i ? 'ok' : k === i ? 'hoy' : '') + '"></i>').join('') + '</div>';
    let cuerpo;
    if (esClave) cuerpo = pantallaClave(e);
    else if (G.vista === 'revela') cuerpo = pantallaRevela(e, e.pruebas[i]);
    else cuerpo = pantallaPrueba(e, e.pruebas[i]);
    pinta('<div class="pantalla">' + barra(true)
      + '<main class="juego">'
      + '<div class="juego-cab"><span class="sobretitulo">Estación ' + e.numero + ' · ' + esc(e.nombre) + '</span>' + progreso
      + (!esClave && G.vista !== 'revela' ? '<button class="ir-codigo" data-a="irCodigo">' + (soyMando() ? 'Digitar el código ↓' : 'Ver el código ↓') + '</button>' : '') + '</div>'
      + cuerpo
      + guiaHTML(e, i)
      + (soyMando() ? '<footer class="pie-finalizar"><button class="btn fantasma pequeno" data-a="finalizarYa" id="btnFinYa">Validar y finalizar la estación ahora</button><small>Guarda los puntos logrados hasta aquí. Lo que no hayan respondido queda en cero.</small></footer>' : '')
      + pieMando()
      + '</main></div>');
    const inp = document.getElementById('codigo');
    if (inp && soyMando() && !('ontouchstart' in window)) inp.focus();
  }

  function tarjetaHTML(e, p) {
    const t = p.tarjeta;
    return '<article class="tarjeta-instrucciones">'
      + '<header><span>Tarjeta de instrucciones</span><span>Estación ' + e.numero + '</span></header>'
      + '<p class="ti-estacion">' + esc(e.nombre) + '</p>'
      + '<h2>Prueba ' + esc(p.id) + '</h2>'
      + '<p class="ti-reto"><b>Reto:</b> ' + esc(t.reto) + '</p>'
      + '<section class="ti-situacion"><h4>' + esc(t.situacionTitulo) + '</h4><dl>'
      + t.situacion.map(s => '<dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd>').join('') + '</dl></section>'
      + '<section class="ti-mision"><h4>Misión del equipo</h4><ol>'
      + t.mision.map(m => '<li><b>' + esc(m.t) + ':</b> ' + esc(m.d)
        + (m.sub ? '<ul>' + m.sub.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' : '') + '</li>').join('')
      + '</ol></section>'
      + (t.atencion ? '<p class="ti-atencion"><b>Atención Cronocirujanos:</b> ' + esc(t.atencion) + '</p>' : '')
      + '<footer><span>Prueba ' + esc(p.id) + '</span></footer>'
      + '</article>';
  }

  function pantallaPrueba(e, p) {
    return tarjetaHTML(e, p)
      + (p.paneles || []).map(x => panelHTML(x)).join('')
      + codigoHTML(p.codigo, false);
  }
  function pantallaClave(e) {
    return '<article class="tarjeta-instrucciones clave"><header><span>Consola de validación</span><span>Estación ' + e.numero + '</span></header>'
      + '<p class="ti-estacion">' + esc(e.nombre) + '</p><h2>Clave de salida</h2>'
      + '<p class="ti-reto">' + esc(e.clave.pregunta) + '</p></article>'
      + codigoHTML(e.clave, true);
  }
  function pantallaRevela(e, p) {
    const r = p.revela;
    let cont = '';
    if (r.documento) {
      const d = r.documento;
      cont = '<article class="documento"><header><b>' + esc(d.titulo) + '</b><small>' + esc(d.encabezado) + '</small></header><dl>'
        + d.lineas.map(l => '<dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd>').join('') + '</dl></article>';
    } else if (r.tarjetas) {
      cont = '<div class="relevancia">' + r.tarjetas.map(t => '<article class="hud"><h4>' + esc(t[0]) + '</h4><p><b>Relevancia clínica:</b> ' + esc(t[1]) + '</p></article>').join('') + '</div>';
    } else if (r.mensaje) {
      cont = '<p class="mensaje-sistema">' + esc(r.mensaje) + '</p>';
    }
    return '<section class="revela"><p class="sobretitulo">Prueba ' + esc(p.id) + '</p><h2>' + esc(r.titulo) + '</h2>' + cont + '</section>'
      + (soyMando() ? '<div class="acciones"><button class="btn primario" data-a="continuar">CONTINUAR →</button></div>' : '<p class="espera">El Comandante continuará cuando el grupo esté listo.</p>');
  }

  function codigoHTML(c, esClave) {
    const st = (G.codigos || {})[c.id] || { i: 0 };
    const resuelto = st.ok || st.rev;
    let h = '<section class="panel-codigo hud ' + (esClave ? 'salida' : '') + '">'
      + '<p class="sobretitulo">' + (esClave ? 'Clave final combinada' : 'Código de validación · registrar en la consola') + '</p>'
      + '<p class="pregunta">' + esc(c.pregunta) + '</p>';
    if (resuelto) {
      h += '<div class="resultado-codigo ' + (st.ok ? 'bien' : 'revelado') + '">'
        + (c.candado ? '<div class="candado abierto" aria-hidden="true"><i></i></div>' : '')
        + '<b>' + (st.ok ? 'CÓDIGO CORRECTO' : 'RESPUESTA CORRECTA') + '</b>'
        + '<span class="codigo-mostrado">' + esc(st.ok ? st.v : revelar(c.id)) + '</span>'
        + '<small>' + (st.ok ? '+' + c.puntos + ' puntos' : 'Agotaron los 2 intentos · esta prueba no suma puntos') + '</small>'
        + '<p>Copiloto: registren este código en la bitácora.</p></div>'
        + (soyMando() ? '<div class="acciones"><button class="btn primario" data-a="continuar">' + (esClave ? 'VALIDAR Y FINALIZAR ESTACIÓN →' : 'CONTINUAR →') + '</button></div>'
          : '<p class="espera">' + (esClave ? 'El Comandante validará y finalizará la estación.' : 'El Comandante continuará con la siguiente prueba.') + '</p>');
    } else if (soyMando()) {
      const quedan = J.intentos - (st.i || 0);
      h += '<form class="form-codigo" data-form="codigo" data-codigo="' + esc(c.id) + '">'
        + (c.candado ? '<div class="candado" aria-hidden="true"><i></i></div>' : '')
        + '<label for="codigo" class="formato">' + esc(c.formato) + '</label>'
        + '<input id="codigo" class="entrada-codigo" maxlength="20" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="' + esc(c.placeholder || '') + '">'
        + '<div class="intentos">' + Array.from({ length: J.intentos }, (_, k) => '<i class="' + (k < (st.i || 0) ? 'gastado' : '') + '"></i>').join('')
        + '<span>' + quedan + (quedan === 1 ? ' intento' : ' intentos') + '</span></div>'
        + '<p class="mensaje-error" id="msgErr" role="alert">' + esc(st.e || '') + '</p>'
        + '<div class="acciones centro"><button type="submit" class="btn primario">VALIDAR CÓDIGO</button></div></form>';
    } else {
      h += '<p class="formato">' + esc(c.formato) + '</p>'
        + '<div class="espera-codigo"><span class="pulso"></span>El Comandante de Misión digitará el código en su consola.'
        + ((st.i || 0) ? '<br><b>Intento fallido: queda ' + (J.intentos - st.i) + '.</b>' + (st.e ? ' ' + esc(st.e) : '') : '') + '</div>';
    }
    return h + '</section>';
  }

  /* --------------------------------------------------- paneles de pantalla */
  const MARCAS = {};   /* marcas locales en tableros (no afectan el puntaje) */
  function panelHTML(x) {
    if (x.tipo === 'monitor') return monitorHTML();
    if (x.tipo === 'tablero-tiempos') {
      return '<section class="panel-pared hud"><p class="sobretitulo">En pantalla · antes en la pared</p><h3>' + esc(x.titulo) + '</h3>'
        + '<div class="tablero-vuelos"><div class="tv-cab"><span>REVISIÓN</span><span>TIEMPO MÁXIMO</span><span>ESTADO</span></div>'
        + x.opciones.map((o, k) => { const on = MARCAS['t' + k]; return '<button class="tv-fila ' + (on ? 'on' : '') + '" data-marca="t' + k + '"><span>CAVIDAD ABDOMINAL</span><span class="tv-tiempo">' + esc(o) + '</span><span>' + (on ? '<i class="sello">S</i> MARCADO' : 'PROGRAMADO') + '</span></button>'; }).join('')
        + '</div><p class="nota">Toquen el tiempo para marcarlo con el adhesivo “S”.</p></section>';
    }
    if (x.tipo === 'excepciones') {
      return '<section class="panel-pared hud"><p class="sobretitulo">En pantalla · antes en la pared</p><h3>' + esc(x.titulo) + '</h3><div class="excepciones">'
        + x.items.map((it, k) => { const on = MARCAS['x' + k]; return '<button class="exc ' + (on ? 'on' : '') + '" data-marca="x' + k + '"><span>' + esc(it[0]) + '</span><b>' + it[1] + '</b></button>'; }).join('')
        + '</div><p class="nota">Toquen las que consideren críticas para marcarlas.</p></section>';
    }
    if (x.tipo === 'criterios') {
      return '<section class="panel-pared hud"><p class="sobretitulo">En pantalla · antes en la pared</p><h3>' + esc(x.titulo) + '</h3><div class="criterios">'
        + x.items.map((it, k) => { const on = MARCAS['c' + k]; return '<button class="crit ' + (on ? 'on' : '') + '" data-marca="c' + k + '"><b class="letra">' + esc(it[1]) + '</b><span>' + esc(it[0]) + '</span>' + (on ? '<i class="emb">EMBAJADORES</i>' : '') + '</button>'; }).join('')
        + '</div><p class="nota">Toquen un criterio para fijarle el distintivo de Embajadores.</p></section>';
    }
    if (x.tipo === 'ocultos') {
      return '<section class="panel-pared hud"><p class="sobretitulo">Parámetros ocultos</p><h3>' + esc(x.titulo) + '</h3><div class="ocultos">'
        + x.items.map((it, k) => { const on = MARCAS['o' + k]; return '<button class="oculto ' + (on ? 'on' : '') + '" data-marca="o' + k + '"><small>' + esc(it[0]) + '</small><b>' + (on ? esc(it[1]) : '▒▒▒▒▒') + '</b></button>'; }).join('')
        + '</div></section>';
    }
    if (x.tipo === 'prevena') {
      return '<section class="panel-prevena hud"><p class="sobretitulo">Aplicación interactiva</p><h3>Prevena™ · Manejo de incisiones</h3>'
        + '<p>Cada integrante puede abrirla en su celular.</p><button class="btn primario" data-a="abrirPrevena">ABRIR APLICACIÓN PREVENA™</button></section>';
    }
    return '';
  }
  function monitorHTML() {
    return '<section class="monitor"><p class="sobretitulo">Monitor del paciente</p>'
      + '<div class="monitor-ecg"><svg viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true"><path class="ecg" pathLength="1000" d="M0 45 L60 45 L70 40 L78 45 L95 45 L100 10 L106 70 L112 45 L135 45 L145 36 L160 45 L200 45 L210 40 L218 45 L235 45 L240 10 L246 70 L252 45 L275 45 L285 36 L300 45 L340 45 L350 40 L358 45 L375 45 L380 10 L386 70 L392 45 L415 45 L425 36 L440 45 L480 45 L490 40 L498 45 L515 45 L520 10 L526 70 L532 45 L555 45 L565 36 L580 45 L600 45"/></svg></div>'
      + '<div class="vitales">'
      + '<div class="vital alerta"><small>TA</small><b>80/50</b><span>mmHg</span></div>'
      + '<div class="vital alerta"><small>FC</small><b>130</b><span>lpm</span></div>'
      + '<div class="vital destacar"><small>T°</small><b>34.8</b><span>°C</span></div>'
      + '<div class="vital"><small>GLASGOW</small><b>14</b><span>/15</span></div></div>'
      + '<div class="imagen-dx"><small>Ecografía FAST</small><b>POSITIVA (+)</b><p>Líquido libre en espacio hepatorrenal (Morison) y cavidad. Compatible con hemoperitoneo masivo.</p></div>'
      + '<p class="monitor-nota">Sin respuesta a 2 L de cristaloides: shock refractario.</p></section>';
  }

  /* --------------------------------------------------- guía y pistas */
  function guiaHTML(e, i) {
    const p = e.pruebas[i];
    let pistas = '';
    if (p && p.pistas && p.pistas.length && G.vista !== 'revela') {
      const seg = G.pruebaDesde ? (ahora() - G.pruebaDesde) / 1000 : 0;
      const items = p.pistas.map((txt, k) => {
        if (seg >= J.pistasSegundos[k]) return '<li class="pista abierta"><small>Pista ' + (k + 1) + '</small><p>' + esc(txt) + '</p></li>';
        if (k === 0 || seg >= J.pistasSegundos[k - 1]) return '<li class="pista espera"><small>Pista ' + (k + 1) + ' en <span data-falta="' + J.pistasSegundos[k] + '">' + mmss(J.pistasSegundos[k] - seg) + '</span></small></li>';
        return '';
      }).join('');
      pistas = '<ul class="pistas">' + items + '</ul>';
    }
    const t = transcurrido();
    const alerta = t > SEG_OFICIAL ? '<p class="guia-alerta">Tiempo oficial agotado. Tienen 30 segundos para validar: si el reloj cierra la estación, queda en cero.</p>'
      : (t > SEG_OFICIAL - 120 ? '<p class="guia-alerta suave">Quedan menos de 2 minutos.</p>' : '');
    if (!pistas && !alerta) return '';
    return '<aside class="guia hud" id="guia">' + guardian('Guía de la misión') + alerta + pistas + '</aside>';
  }

  /* ===================================================== RETROALIMENTACIÓN */
  function pRetro() {
    const e = estacion(), r = (G.res || {})[e.id] || { resp: 0, tiempo: 0, total: 0, por: 'reloj' };
    const porReloj = r.por === 'reloj';
    const ultima = estacionIdx() >= C.estaciones.length - 1;
    pinta('<div class="pantalla">' + barra(false)
      + '<main class="retro">'
      + lineaDeVida()
      + '<section class="retro-cab ' + (porReloj ? 'agotado' : '') + '"><p class="sobretitulo">Estación ' + e.numero + ' · ' + esc(e.nombre) + '</p>'
      + '<h2>' + (porReloj ? 'TIEMPO AGOTADO' : esc(e.desbloqueo.split('!')[0] + '!')) + '</h2>'
      + '<p>' + esc(porReloj ? 'El reloj cerró la estación antes de la validación. Esta estación queda en cero, pero el aprendizaje continúa.' : e.desbloqueo.split('!').slice(1).join('!').trim()) + '</p></section>'
      + '<div class="retro-grid">'
      + '<section class="marcador hud"><div class="marcador-total"><b>' + r.total + '</b><span>/ 20</span></div><table><tbody>'
      + '<tr><td>Puntos por respuestas</td><td>' + r.resp + ' / 14</td></tr>'
      + '<tr><td>Puntos por agilidad' + (r.seg != null ? ' · ' + mmss(r.seg) : '') + '</td><td>+' + r.tiempo + '</td></tr>'
      + '</tbody></table></section>'
      + '<section class="debrief hud">' + guardian('Retroalimentación') + '<blockquote>' + esc(e.cierre) + '</blockquote>'
      + '<button class="btn fantasma pequeno" data-a="repetirCierre">Escuchar de nuevo</button></section>'
      + '</div>'
      + (soyMando()
        ? '<div class="acciones centro"><button class="btn primario grande" data-a="siguiente">' + (ultima ? 'VER EL RESULTADO FINAL →' : 'IR A LA ESTACIÓN ' + (e.numero + 1) + ' →') + '</button></div>'
        : '<p class="espera">Escuchen la retroalimentación. El Comandante abrirá la siguiente etapa.</p>')
      + pieMando()
      + '</main></div>');
  }

  /* ===================================================== 7 · CIERRE */
  let RANKING = null;
  function pFin() {
    const res = G.res || {};
    const total = C.estaciones.reduce((n, e) => n + ((res[e.id] || {}).total || 0), 0);
    const g = grupoDe(YO.grupo);
    let rk = '';
    if (RANKING) {
      rk = '<section class="ranking hud"><h3>Posiciones</h3><ol>' + RANKING.map(x =>
        '<li class="' + (x.id === YO.grupo ? 'yo' : '') + '" style="--g:' + grupoDe(x.id).color + '"><span>' + grupoDe(x.id).simbolo + ' ' + esc(grupoDe(x.id).nombre) + '</span><b>' + x.total + '</b>' + (x.terminado ? '' : '<small>en juego</small>') + '</li>').join('') + '</ol></section>';
    }
    pinta('<div class="pantalla">' + barra(false)
      + '<main class="fin">'
      + lineaDeVida()
      + '<section class="fin-cab"><p class="sobretitulo">' + esc(g.nombre) + '</p><h1>' + esc(C.final.titulo) + '</h1><p>' + esc(C.final.texto) + '</p></section>'
      + '<section class="marcador-final hud"><small>SCORE TOTAL DEL EQUIPO</small><b>' + total + '</b><span>/ 100</span>'
      + '<table><tbody>' + C.estaciones.map(e => { const r = res[e.id] || {}; return '<tr><td>E' + e.numero + ' · ' + esc(e.nombre) + '</td><td>' + (r.total || 0) + '</td></tr>'; }).join('') + '</tbody></table></section>'
      + rk
      + '</main></div>');
  }

  /* ===================================================== lógica de juego */
  function resultado(e, porReloj) {
    if (porReloj) return { resp: 0, tiempo: 0, total: 0, seg: Math.round(transcurrido()), por: 'reloj' };
    const cods = e.pruebas.map(p => p.codigo).concat([e.clave]);
    const resp = cods.reduce((n, c) => n + (((G.codigos || {})[c.id] || {}).ok ? c.puntos : 0), 0);
    const seg = Math.round(transcurrido());
    const banda = (C.bandas[e.bandas] || C.bandas.estandar).find(b => seg <= b.hasta);
    const tiempo = banda ? banda.puntos : 0;
    return { resp: resp, tiempo: tiempo, total: resp + tiempo, seg: seg, por: 'validada' };
  }
  function finalizar(porReloj) {
    const e = estacion();
    if (fase() !== 'juego') return;
    const res = Object.assign({}, G.res || {}); res[e.id] = resultado(e, porReloj);
    if (porReloj) SFX.error(); else SFX.ok();
    escribir({ fase: 'retro', res: res, fin: ahora() });
  }

  async function validarCodigo(id) {
    const inp = document.getElementById('codigo');
    const valor = (inp && inp.value || '').trim();
    const msg = document.getElementById('msgErr');
    if (!valor) { if (msg) msg.textContent = 'Escriban el código antes de validar.'; return; }
    const cods = Object.assign({}, G.codigos || {});
    const st = Object.assign({ i: 0 }, cods[id] || {});
    if (st.ok || st.rev) return;
    const h = await huella(id, valor);
    if (H[id] && h === H[id].h) {
      st.ok = true; st.v = valor.toUpperCase(); st.e = '';
      cods[id] = st;
      const c = codigoActual();
      (c && c.candado) ? SFX.candado() : SFX.ok();
      decir('Código correcto. Copiloto: regístrenlo en la bitácora.');
      return escribir({ codigos: cods });
    }
    st.i = (st.i || 0) + 1;
    const c = codigoActual(), n = norm(valor);
    const esp = c && (c.errores || []).find(x => new RegExp(x.si).test(n));
    st.e = esp ? esp.msg : (c ? c.errorGeneral : 'Código incorrecto.');
    if (st.i >= J.intentos) { st.rev = true; st.e = ''; decir('Agotaron los dos intentos. La respuesta correcta aparece en pantalla.'); }
    else decir('Código incorrecto. ' + st.e + ' Les queda un intento.');
    cods[id] = st;
    SFX.error();
    escribir({ codigos: cods });
  }
  function codigoActual() {
    const e = estacion(), i = G.prueba || 0;
    return codigoDePaso(e, i);
  }
  function continuar() {
    const e = estacion(), i = G.prueba || 0;
    if (i >= e.pruebas.length) return finalizar(false);
    const p = e.pruebas[i];
    if (p.revela && G.vista !== 'revela') return escribir({ vista: 'revela' });
    escribir({ prueba: i + 1, vista: 'prueba', pruebaDesde: ahora() });
  }

  /* ----------------------------------------------- voz según la pantalla */
  let ULTIMA_DICHA = '';
  function narrar() {
    const k = claveVista();
    if (k === ULTIMA_DICHA) return;
    ULTIMA_DICHA = k;
    const f = fase(), e = estacion();
    if (f === 'portico') return decir(J.intro.join(' '));
    if (f === 'antesala') return decir('Estación ' + e.numero + ': ' + e.nombre + '. ' + e.subtitulo + '. ' + e.concepto);
    if (f === 'juego') {
      const i = G.prueba || 0;
      if (i >= e.pruebas.length) return decir('Clave de salida. ' + e.clave.pregunta);
      const p = e.pruebas[i];
      if (G.vista === 'revela') return decir(p.revela.titulo + '. ' + (p.revela.mensaje || ''));
      return decir('Prueba ' + p.id + '. ' + p.tarjeta.reto + '. Misión del equipo. ' + p.tarjeta.mision.map(m => m.t + '. ' + m.d).join(' ') + (p.tarjeta.atencion ? ' Atención, Cronocirujanos. ' + p.tarjeta.atencion : ''));
    }
    if (f === 'retro') {
      const r = (G.res || {})[e.id] || {};
      return decir((r.por === 'reloj' ? 'Tiempo agotado. ' : e.desbloqueo + ' ') + e.cierre);
    }
    if (f === 'fin') return decir(C.final.titulo + ' ' + C.final.texto);
  }

  /* --------------------------------------------------------- reloj (tick) */
  let ultimoSeg = -1;
  setInterval(function () {
    if (!YO || fase() !== 'juego' || !G.inicio) return;
    const t = transcurrido(), el = document.getElementById('reloj');
    if (el) {
      const b = el.querySelector('b'); if (b) b.textContent = relojTexto();
      el.classList.toggle('urgente', t > SEG_OFICIAL - 120 && t <= SEG_OFICIAL);
      el.classList.toggle('agotado', t > SEG_OFICIAL);
    }
    const s = Math.floor(t);
    if (s !== ultimoSeg) {
      if (t > SEG_OFICIAL - 60 && t < SEG_CIERRE) SFX.tic();
      if (s === SEG_OFICIAL) { decir('Tiempo oficial agotado. Tienen treinta segundos para validar.'); render(); }
      if (s === SEG_OFICIAL - 120) render();
      ultimoSeg = s;
    }
    document.querySelectorAll('[data-falta]').forEach(x => {
      const seg = G.pruebaDesde ? (ahora() - G.pruebaDesde) / 1000 : 0;
      const falta = Number(x.getAttribute('data-falta')) - seg;
      if (falta <= 0) { render(); decir('Hay una pista disponible.'); } else x.textContent = mmss(falta);
    });
    if (t >= SEG_CIERRE && soyMando()) finalizar(true);
  }, 250);

  /* ----------------------------------------------------- sincronización */
  async function cargarTodos() { try { TODOS = await D.participantes(); } catch (e) {} }
  async function sincronizar(forzar) {
    if (!YO) return;
    try {
      const [est, todos] = await Promise.all([D.grupo(YO.grupo), D.participantes()]);
      TODOS = todos || [];
      MIEMBROS = TODOS.filter(p => p.grupo === YO.grupo);
      if (!MIEMBROS.some(m => m.id === YO.id) && TODOS.length === 0) {
        /* la sesión fue reiniciada por el facilitador */
        YO = null; guardarYo();
        G = {}; return render();
      }
      if (!ESCRIBIENDO && (est.v || 0) >= (G.v || 0) && (forzar || JSON.stringify(est) !== JSON.stringify(G))) {
        const antes = claveVista();
        G = est || {};
        if (antes !== claveVista() || forzar) { render(); narrar(); }
        else if (!document.activeElement || document.activeElement.id !== 'codigo') render();
      }
      if (fase() === 'fin') await cargarRanking();
    } catch (e) { /* sin conexión: se reintenta en el siguiente ciclo */ }
  }
  async function cargarRanking() {
    try {
      const todos = await D.grupos();
      const conGente = new Set(TODOS.map(p => p.grupo));
      RANKING = Object.keys(todos).filter(id => conGente.has(id)).map(id => {
        const res = (todos[id] || {}).res || {};
        return { id: id, total: Object.values(res).reduce((n, r) => n + (r.total || 0), 0), terminado: (todos[id] || {}).fase === 'fin' };
      }).sort((a, b) => b.total - a.total);
      if (fase() === 'fin' && (!document.activeElement || document.activeElement.tagName !== 'INPUT')) pFin();
    } catch (e) {}
  }
  setInterval(() => { if (YO) sincronizar(false); else if (!document.activeElement || document.activeElement.tagName !== 'INPUT') cargarTodos().then(() => { if (!YO) { leerCamposRegistro(); pRegistro(); } }); }, 2000);
  setInterval(async () => { try { OFFSET = (await D.ahora()) - Date.now(); } catch (e) {} }, 60000);

  /* ------------------------------------------------------------ eventos */
  app.addEventListener('submit', function (ev) {
    const f = ev.target.closest('[data-form="codigo"]');
    if (f) { ev.preventDefault(); validarCodigo(f.getAttribute('data-codigo')); }
  });
  app.addEventListener('input', function (ev) {
    if (ev.target.id === 'nombre' || ev.target.id === 'profesion') {
      const pos = ev.target.selectionStart; ev.target.value = ev.target.value.toUpperCase(); try { ev.target.setSelectionRange(pos, pos); } catch (e) {}
    }
  });
  app.addEventListener('click', function (ev) {
    const gr = ev.target.closest('[data-grupo]');
    if (gr && !YO) { leerCamposRegistro(); REG.grupo = gr.getAttribute('data-grupo'); REG.rol = ''; return pRegistro(); }
    const ro = ev.target.closest('[data-rol]');
    if (ro && !YO) { leerCamposRegistro(); REG.rol = ro.getAttribute('data-rol'); return pRegistro(); }
    const mk = ev.target.closest('[data-marca]');
    if (mk) { const k = mk.getAttribute('data-marca'); MARCAS[k] = !MARCAS[k]; SFX.paso(); return render(); }
    const b = ev.target.closest('[data-a]'); if (!b) return;
    audio(); desbloquearVoz();
    const a = b.getAttribute('data-a');
    switch (a) {
      case 'registrar': return registrar();
      case 'voz': YO.voz = !YO.voz; guardarYo(); if (!YO.voz) callar(); else { ULTIMA_DICHA = ''; narrar(); } return render();
      case 'repetirIntro': return decir(J.intro.join(' '));
      case 'repetirCierre': { const e = estacion(); return decir(e.cierre); }
      case 'antesala': if (soyMando()) escribir({ fase: 'antesala', est: G.est || 0 }); return;
      case 'iniciar': if (soyMando()) { decir(J.arranque); escribir({ fase: 'juego', inicio: ahora(), prueba: 0, vista: 'prueba', pruebaDesde: ahora(), codigos: G.codigos || {} }); } return;
      case 'continuar': if (soyMando()) continuar(); return;
      case 'finalizarYa':
        if (!soyMando()) return;
        if (b.dataset.ok === '1') return finalizar(false);
        b.dataset.ok = '1'; b.textContent = 'Toquen de nuevo para confirmar'; setTimeout(() => { b.dataset.ok = ''; b.textContent = 'Validar y finalizar la estación ahora'; }, 4000); return;
      case 'siguiente': {
        if (!soyMando()) return;
        const sig = estacionIdx() + 1;
        if (sig >= C.estaciones.length) return escribir({ fase: 'fin' });
        return escribir({ fase: 'antesala', est: sig, prueba: 0, vista: 'prueba', inicio: null });
      }
      case 'tomarMando':
        if (confirmarMando && Date.now() - confirmarMando < 4000) { confirmarMando = 0; YO.voz = true; guardarYo(); aviso('Ahora este celular es la consola del grupo.'); return escribir({ control: YO.id }); }
        confirmarMando = Date.now(); b.textContent = 'Toquen de nuevo para confirmar'; return;
      case 'irCodigo': { const pc = document.querySelector('.panel-codigo'); if (pc) pc.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      case 'abrirPrevena': return window.PREVENA && window.PREVENA.abrir();
    }
  });

  /* --------------------------------------------------------------- inicio */
  (async function () {
    try { OFFSET = (await D.ahora()) - Date.now(); } catch (e) {}
    if (YO) {
      await sincronizar(true);
      if (YO && !MIEMBROS.some(m => m.id === YO.id)) { YO = null; guardarYo(); }
    } else {
      await cargarTodos();
    }
    render();
  })();
})();
