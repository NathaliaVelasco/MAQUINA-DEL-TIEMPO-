/* ==========================================================================
   PÓRTICO DE ENTRADA · celular de cada participante
   1. Registro: grupo, nombre completo, profesión, rol y autorización de datos.
   2. Diagnóstico inicial (antes de la Estación 1).
   3. Credencial de misión y tripulación.
   4. Diagnóstico final (se abre cuando el grupo cierra la Estación 5) y
      resultados con el "por qué" de cada pregunta.
   Las respuestas correctas nunca llegan al celular antes de tiempo: el
   servidor califica.
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego, DX = M.C.diagnostico, app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  let codigo = params.get('c') || M.leer('codigo', '');
  let registro = M.leer('registro', null);
  let grupos = {}, sel = { grupo: params.get('grupo') || (registro && registro.grupo) || '', rol: (registro && registro.rol) || '' };
  let sondeo = null;
  let S = null;                 // estado del diagnóstico de este celular (servidor)
  let finalAvisado = false;

  function pinta(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function cab(sub) {
    return '<header class="cabecera">' + M.logo() + '<div class="titulo-cab"><b>' + M.esc(J.titulo) + '</b><small>' + M.esc(sub || 'Pórtico de Entrada') + '</small></div></header>';
  }
  function textoAutorizacion() { return J.autorizacion + (DX ? ' ' + DX.textos.autorizacion : ''); }

  /* ---------- 1. Código de acceso ---------- */
  function pAcceso(err) {
    clearInterval(sondeo);
    pinta(cab() + '<main class="pagina">'
      + '<section class="hud">' + M.logo('logo-portal')
      + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1><p class="subtitulo-juego">Pórtico de Entrada</p>'
      + '<form id="f"><label class="campo"><span>Código de acceso</span><input type="text" id="cod" class="mayus" autocomplete="off" autocapitalize="characters" value="' + M.esc(codigo) + '" placeholder="El que les entregó el Guía Especialista"></label>'
      + '<p class="error" id="err">' + M.esc(err || '') + '</p>'
      + '<button class="btn primario ancho grande" type="submit">ENTRAR →</button></form>'
      + '</section></main>');
    document.getElementById('f').onsubmit = async ev => {
      ev.preventDefault(); M.audio();
      const v = document.getElementById('cod').value.trim();
      if (!v) return pAcceso('Escriban el código de acceso.');
      try {
        const r = await M.rpc('mdt_acceso', { p_codigo: v }); codigo = v; M.guardar('codigo', v); grupos = r.grupos || {};
        if (registro) return entrar(); pFormulario();
      } catch (e) { pAcceso(M.mensajeError(e)); }
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
    clearInterval(sondeo);
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
      + '<label class="casilla"><input type="checkbox" id="autoriza"><span>' + M.esc(textoAutorizacion()) + '</span></label>'
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
      M.guardar('registro', registro); M.SFX.ok(); entrar();
    } catch (e) {
      try { grupos = (await M.rpc('mdt_acceso', { p_codigo: codigo })).grupos || {}; } catch (x) {}
      if (/acceso incorrecto/i.test(e.message)) return pAcceso(M.mensajeError(e));
      pFormulario(M.mensajeError(e));
    }
  }

  /* ---------- Diagnóstico: estado y ruta ---------- */
  async function cargarDiag() {
    if (!DX) { S = { activo: false }; return S; }
    S = await M.rpc('mdt_diagnostico', { p_codigo: codigo, p_dispositivo: M.dispositivo() });
    return S;
  }
  function errorDeSesion(e) {
    const m = (e && e.message) || '';
    if (/acceso incorrecto/i.test(m)) { pAcceso('El código de acceso cambió. Pídanle el nuevo al Guía Especialista.'); return true; }
    if (/^REGISTRO:/.test(m)) {
      registro = null; M.guardar('registro', null); sel = { grupo: '', rol: '' };
      M.rpc('mdt_acceso', { p_codigo: codigo }).then(r => { grupos = r.grupos || {}; pFormulario('Este celular no está registrado en la sesión actual. Regístrense de nuevo.'); })
        .catch(x => pAcceso(M.mensajeError(x)));
      return true;
    }
    return false;
  }
  /* Después del registro (o al volver a abrir la página) decide qué mostrar. */
  async function entrar() {
    try { await cargarDiag(); }
    catch (e) { if (errorDeSesion(e)) return; S = null; }
    if (S && S.activo && !S.antes.terminado) return pDiag('antes');
    pCredencial();
  }

  /* ---------- Diagnóstico: preguntas ---------- */
  const LETRAS = ['A', 'B', 'C', 'D'];
  const LLAVE = { antes: 'Diagnóstico inicial', despues: 'Diagnóstico final' };
  let dq = null;   // pregunta en curso: { momento, p, opcion, certeza, t0 }

  function preguntas(m) { return DX.preguntas.filter(p => p.momento === m); }
  /* Orden de opciones propio de cada celular (estable si recarga la página). */
  function ordenOpciones(p) {
    let h = 2166136261; const s = M.dispositivo() + p.id;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    const idx = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx;
  }
  function pDiag(m) {
    clearInterval(sondeo);
    const todas = preguntas(m), hechas = S[m].respondidas || [];
    const pend = todas.filter(p => hechas.indexOf(p.id) < 0);
    if (!pend.length) return pReflexion(m);
    if (!hechas.length && !(dq && dq.intro === m)) return pIntro(m);
    const p = pend[0], n = todas.length - pend.length + 1;
    if (!dq || !dq.p || dq.p.id !== p.id) dq = { momento: m, intro: m, p: p, opcion: null, certeza: null, t0: Date.now() };
    const orden = ordenOpciones(p);
    pinta(cab(LLAVE[m]) + '<main class="pagina"><section class="hud">'
      + '<div class="diag-progreso"><span>Pregunta ' + n + ' de ' + todas.length + '</span><span class="pista"><i style="width:' + Math.round((n - 1) / todas.length * 100) + '%"></i></span></div>'
      + '<p class="diag-pregunta">' + M.esc(p.texto) + '</p>'
      + '<div class="diag-opciones">' + orden.map((o, i) => '<button type="button" class="opcion' + (dq.opcion === o ? ' sel' : '') + '" data-op="' + o + '"><span class="letra">' + LETRAS[i] + '</span><span>' + M.esc(p.opciones[o]) + '</span></button>').join('') + '</div>'
      + '<div class="diag-certeza"' + (dq.opcion == null ? ' hidden' : '') + '><p>' + M.esc(DX.textos.certeza) + '</p><div class="opciones-vel">'
      + DX.textos.certezas.map(c => '<button type="button" data-cert="' + M.esc(c) + '" class="' + (dq.certeza === c ? 'sel' : '') + '">' + M.esc(c) + '</button>').join('') + '</div></div>'
      + '<p class="error" id="err"></p>'
      + '<button class="btn primario ancho grande" id="sig" ' + (dq.opcion == null || !dq.certeza ? 'disabled' : '') + '>' + (n === todas.length ? 'ENVIAR RESPUESTA →' : 'SIGUIENTE →') + '</button>'
      + '<p class="suave centro" style="font-size:12px;margin-top:10px">Una sola respuesta por pregunta. No se puede volver atrás.</p>'
      + '</section></main>');
    app.querySelectorAll('[data-op]').forEach(b => b.onclick = () => { dq.opcion = +b.dataset.op; M.SFX.paso(); pDiagSuave(m); });
    app.querySelectorAll('[data-cert]').forEach(b => b.onclick = () => { dq.certeza = b.dataset.cert; pDiagSuave(m); });
    document.getElementById('sig').onclick = () => responder(m);
  }
  function pDiagSuave(m) { const y = window.scrollY; pDiag(m); window.scrollTo(0, y); }
  function pIntro(m) {
    pinta(cab(LLAVE[m]) + '<main class="pagina"><section class="hud diag-tarjeta">'
      + '<p class="sobretitulo">' + LLAVE[m] + '</p><h2 class="seccion">' + (m === 'antes' ? 'Antes de cruzar el portal' : 'La línea de tiempo está sellada') + '</h2>'
      + '<p>' + M.esc(m === 'antes' ? DX.textos.introAntes : DX.textos.introDespues) + '</p>'
      + '<p class="suave" style="font-size:14px">Después de cada pregunta le pediremos qué tan seguro está. Al final hay dos preguntas abiertas y una imagen para elegir.</p>'
      + '<div class="acciones"><button class="btn primario grande ancho" id="ir">COMENZAR →</button></div></section></main>');
    document.getElementById('ir').onclick = () => { M.audio(); dq = { intro: m }; pDiag(m); };
  }
  async function responder(m) {
    const b = document.getElementById('sig'); b.disabled = true;
    try {
      await M.rpc('mdt_diag_responder', { p_codigo: codigo, p_dispositivo: M.dispositivo(), p_pregunta: dq.p.id,
        p_opcion: dq.opcion, p_certeza: dq.certeza, p_segundos: Math.round((Date.now() - dq.t0) / 1000) });
      S[m].respondidas = (S[m].respondidas || []).concat([dq.p.id]); dq = { intro: m };
      pDiag(m);
    } catch (e) {
      if (errorDeSesion(e)) return;
      if (/ya fue enviado/i.test(e.message)) { await cargarDiag().catch(() => {}); return pCredencial(); }
      document.getElementById('err').textContent = M.mensajeError(e) + ' Toquen de nuevo para reintentar.'; b.disabled = false;
    }
  }

  /* ---------- Diagnóstico: pensar y expresar ---------- */
  const ICONOS = {
    'Reloj de arena': '<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/>',
    'Brújula': '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
    'Puente': '<path d="M2 17h20M2 12c4-5 16-5 20 0M5 17v-5.5M9 17v-7M12 17v-7.5M15 17v-7M19 17v-5.5"/>',
    'Red de seguridad': '<path d="M2 8c5 3 15 3 20 0M3 13c5 3 13 3 18 0M5 18c4 2 10 2 14 0M6 9v9M10 10v9.5M14 10v9.5M18 9v9"/>',
    'Semilla': '<path d="M12 21v-9M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5zM8 21h8"/>',
    'Laberinto': '<path d="M3 3h18v18H3zM7 3v14h4M11 7h10M15 7v10M7 21v0M11 11v6M15 21v-4h3"/>'
  };
  const icono = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONOS[n] || '') + '</svg>';

  function pReflexion(m, err) {
    clearInterval(sondeo);
    const r = m === 'antes' ? DX.textos.rutinaAntes : DX.textos.rutinaDespues;
    const b = M.leer('diag-borrador-' + m, null) || { rutina: [], imagen: '', palabra: '' };
    pinta(cab(LLAVE[m]) + '<main class="pagina"><section class="hud">'
      + '<div class="diag-progreso"><span>Para terminar</span><span class="pista"><i style="width:100%"></i></span></div>'
      + '<p class="sobretitulo">Pensar</p><h2 class="seccion">' + M.esc(r.titulo) + '</h2>'
      + r.campos.map((c, i) => '<label class="campo"><span>' + M.esc(c) + '</span><textarea data-r="' + i + '" maxlength="1000">' + M.esc(b.rutina[i] || '') + '</textarea></label>').join('')
      + '<p class="sobretitulo" style="margin-top:22px">Expresar</p><p style="margin-top:0">' + M.esc(DX.textos.expresar) + '</p>'
      + '<div class="diag-imagenes">' + DX.textos.imagenes.map(n => '<button type="button" data-img="' + M.esc(n) + '" class="' + (b.imagen === n ? 'sel' : '') + '">' + icono(n) + M.esc(n) + '</button>').join('') + '</div>'
      + '<label class="campo" style="margin-top:14px"><span>Una palabra</span><input type="text" id="palabra" class="mayus" maxlength="40" autocapitalize="characters" value="' + M.esc(b.palabra || '') + '"></label>'
      + '<p class="error" id="err">' + M.esc(err || '') + '</p>'
      + '<button class="btn primario ancho grande" id="enviar">ENVIAR ' + (m === 'antes' ? 'DIAGNÓSTICO INICIAL' : 'DIAGNÓSTICO FINAL') + ' →</button>'
      + '<p class="suave centro" style="font-size:12px;margin-top:10px">Esta parte no se califica.</p>'
      + '</section></main>');
    const leerForm = () => ({
      rutina: Array.from(app.querySelectorAll('[data-r]')).map(t => t.value),
      imagen: app.querySelector('[data-img].sel') ? app.querySelector('[data-img].sel').dataset.img : '',
      palabra: document.getElementById('palabra').value
    });
    const guardarB = () => M.guardar('diag-borrador-' + m, leerForm());
    app.querySelectorAll('textarea, #palabra').forEach(t => t.oninput = guardarB);
    app.querySelectorAll('[data-img]').forEach(x => x.onclick = () => { app.querySelectorAll('[data-img]').forEach(y => y.classList.remove('sel')); x.classList.add('sel'); guardarB(); });
    document.getElementById('enviar').onclick = async ev => {
      const f = leerForm(), e = document.getElementById('err');
      if (!f.rutina.some(t => t.trim())) return (e.textContent = 'Escriban al menos una de las frases.');
      if (!f.imagen) return (e.textContent = 'Elijan la imagen que mejor los representa.');
      if (!f.palabra.trim()) return (e.textContent = 'Escriban una palabra que acompañe la imagen.');
      ev.target.disabled = true;
      try {
        S = await M.rpc('mdt_diag_cerrar', { p_codigo: codigo, p_dispositivo: M.dispositivo(), p_momento: m,
          p_rutina: f.rutina.map(t => t.trim()), p_imagen: f.imagen, p_palabra: f.palabra.trim() });
        M.guardar('diag-borrador-' + m, null); M.SFX.ok();
        return m === 'antes' ? pFinAntes() : pResultado(true);
      } catch (x) {
        if (errorDeSesion(x)) return;
        if (/Faltan/.test(x.message)) { await cargarDiag().catch(() => {}); return pDiag(m); }
        e.textContent = M.mensajeError(x); ev.target.disabled = false;
      }
    };
  }

  function pFinAntes() {
    pinta(cab('Diagnóstico inicial') + '<main class="pagina"><section class="hud desbloqueo">'
      + '<p class="sobretitulo">Diagnóstico inicial</p><h2>¡COMPLETO!</h2><p>' + M.esc(DX.textos.finAntes) + '</p>'
      + '<div class="acciones"><button class="btn primario grande" id="ir">VER MI CREDENCIAL →</button></div></section></main>');
    document.getElementById('ir').onclick = pCredencial;
  }

  /* ---------- Diagnóstico final: resultados con el "por qué" ---------- */
  function pResultado(conVoz) {
    clearInterval(sondeo);
    const R = S.resultado || { aciertos_antes: 0, aciertos_despues: 0, detalle: [] };
    const det = {}; (R.detalle || []).forEach(d => { det[d.pregunta] = d; });
    const lista = preguntas('despues').map(p => {
      const d = det[p.id] || {};
      return '<li class="' + (d.acierto ? 'bien' : '') + '"><b>' + (d.acierto ? '✓ ' : '✗ ') + M.esc(p.texto) + '</b>'
        + (d.acierto ? '' : '<p>Su respuesta: ' + M.esc(d.elegida == null ? '—' : p.opciones[d.elegida]) + '</p>')
        + '<p>Respuesta correcta: <strong>' + M.esc(d.correcta == null ? '' : p.opciones[d.correcta]) + '</strong></p>'
        + '<p>' + M.esc(d.porque || '') + '</p></li>';
    }).join('');
    const tot = preguntas('despues').length;
    pinta(cab('Diagnóstico final') + '<main class="pagina">'
      + '<section class="hud desbloqueo"><p class="sobretitulo">Su avance</p>'
      + '<div class="diag-avance"><div><b>' + R.aciertos_antes + '</b><small>Antes · de ' + preguntas('antes').length + '</small></div><span class="flecha">→</span>'
      + '<div><b>' + R.aciertos_despues + '</b><small>Después · de ' + tot + '</small></div></div>'
      + '<p class="frase-cierre" id="cierre">' + M.esc(DX.textos.cierreDespues) + '</p></section>'
      + '<section class="hud bloque"><p class="sobretitulo">Por qué · diagnóstico final</p><ul class="diag-detalle">' + lista + '</ul></section>'
      + '<div class="acciones"><button class="btn contorno" id="ir">VOLVER A MI CREDENCIAL</button></div></main>');
    document.getElementById('ir').onclick = pCredencial;
    if (conVoz) { M.SFX.portal(); M.decir(DX.textos.cierreDespues); }
  }

  /* ---------- 3. Credencial y tripulación ---------- */
  function tarjetaDiag() {
    if (!S || !S.activo) return '';
    if (!S.antes.terminado) return '<section class="hud bloque diag-tarjeta"><p class="sobretitulo">Diagnóstico inicial · pendiente</p><h3>Antes de cruzar el portal</h3>'
      + '<p class="suave" style="font-size:14px">' + (S.antes.respondidas || []).length + ' de ' + S.antes.total + ' preguntas respondidas.</p>'
      + '<div class="acciones"><button class="btn primario latido" data-d="antes">RESPONDER DIAGNÓSTICO INICIAL →</button></div></section>';
    if (S.despues.terminado) return '<section class="hud bloque diag-tarjeta listo"><p class="sobretitulo">Diagnóstico final · completo ✓</p>'
      + '<p class="suave" style="font-size:14px">' + M.esc(DX.textos.cierreDespues) + '</p>'
      + '<div class="acciones"><button class="btn contorno pequeno" data-d="resultado">VER MIS RESULTADOS</button></div></section>';
    if (S.despues.habilitado) return '<section class="hud bloque diag-tarjeta"><p class="sobretitulo">Diagnóstico final · ahora</p><h3>La línea de tiempo está sellada</h3>'
      + '<p style="font-size:15px">Antes de conocer al equipo ganador, cada tripulante responde el diagnóstico final en su celular.</p>'
      + '<div class="acciones"><button class="btn primario grande latido" data-d="despues">RESPONDER DIAGNÓSTICO FINAL →</button></div></section>';
    return '<section class="hud bloque diag-tarjeta listo"><p class="sobretitulo">Diagnóstico inicial · completo ✓</p>'
      + '<p class="suave" style="font-size:14px">El diagnóstico final se abre aquí mismo cuando su grupo cierre la Estación 5.</p></section>';
  }
  function pCredencial() {
    const g = M.grupo(registro.grupo), r = M.rol(registro.rol);
    const urgente = S && S.activo && S.antes.terminado && S.despues.habilitado && !S.despues.terminado;
    pinta(cab() + '<main class="pagina">'
      + (urgente ? '<div id="diag">' + tarjetaDiag() + '</div>' : '')
      + '<section class="hud credencial">'
      + '<span class="chip-grupo" style="--g:' + g.color + '"><i></i>' + M.esc(g.nombre) + '</span>'
      + '<p class="sobretitulo" style="margin-top:16px">Credencial de misión</p>'
      + '<h2 class="rol-titulo">' + M.esc(r.nombre) + '</h2><p class="rol-sub">' + M.esc(r.subtitulo) + '</p>'
      + '<div class="nombre">' + M.esc(registro.nombre) + '</div>'
      + '<p class="sobretitulo">Misión operativa</p><ul>' + r.mision.map(x => '<li>' + M.esc(x) + '</li>').join('') + '</ul>'
      + (registro.rol === 'comandante'
          ? '<div class="acciones"><a class="btn primario grande latido" href="' + M.esc(M.urlDe('sala.html', { grupo: registro.grupo })) + '">ENTRAR A LA SALA DE ESCAPE →</a></div>'
            + '<p class="suave" style="margin-top:10px;font-size:13px">Para entrar necesita el <b>código de la Sala de Escape</b>: se lo entrega el Guía Especialista. Usted digita los códigos del grupo; mantenga este celular con batería y conexión.</p>'
          : '<p class="suave" style="margin-top:16px;font-size:14px">El Comandante de Misión conduce el juego desde su celular.</p>')
      + '</section>'
      + (urgente ? '' : '<div id="diag">' + tarjetaDiag() + '</div>')
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
    } catch (e) { if (errorDeSesion(e)) return; ul.innerHTML = '<li class="vacio">' + M.esc(M.mensajeError(e)) + '</li>'; }
    // Diagnóstico: avisa cuando se abre el final (el grupo cerró la Estación 5).
    try {
      const antes = S && S.despues && S.despues.habilitado;
      await cargarDiag();
      if (!document.getElementById('trip')) return;
      if (S.activo && S.despues.habilitado && !antes && !S.despues.terminado) {
        if (!finalAvisado) { finalAvisado = true; M.SFX.portal(); M.decir('La línea de tiempo está sellada. Responda el diagnóstico final.'); }
        return pCredencial();
      }
      const d = document.getElementById('diag'); if (d) d.innerHTML = tarjetaDiag();
    } catch (e) { errorDeSesion(e); }
  }

  app.addEventListener('click', ev => {
    const b = ev.target.closest('[data-d]'); if (!b) return;
    M.audio();
    if (b.dataset.d === 'resultado') return pResultado(false);
    dq = null; pDiag(b.dataset.d);
  });

  if (registro && codigo) entrar(); else pAcceso();
})();
