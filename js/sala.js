/* ==========================================================================
   SALA DE ESCAPE · celular del Comandante de Misión
   Bienvenida del Guardián → Estaciones 1 a 5 en orden → cierre final.
   El reloj, los intentos y los puntos los controla el servidor.
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, C = M.C, J = C.juego, app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  let cfg = M.leer('consola', {});
  if (params.get('grupo')) cfg.grupo = params.get('grupo');
  if (params.get('c')) cfg.codigo = params.get('c').toUpperCase();
  let E = null;                  // estado del equipo que devuelve el servidor
  let pantalla = 'acceso', vista = { est: null, tab: 0 };
  let local = M.leer('consola-local', {});   // monitor revelado, marcas en pantalla, cierres vistos
  let tick = null, sondeo = null, confirmarFin = 0, ocupada = '';
  let ventajas = M.leer('ventajas', null), cargandoVentajas = false;

  const guardarCfg = () => M.guardar('consola', cfg);
  const guardarLocal = () => M.guardar('consola-local', local);
  const clave = k => (cfg.grupo || '') + ':' + k;
  const est = id => E && E.estaciones.find(x => x.id === id);
  const contenido = id => M.estacion(id);
  function pinta(html) { app.innerHTML = html; }

  /* ------------------------------------------------------------- cabecera */
  function cab(sub, conReloj) {
    const g = M.grupo(cfg.grupo);
    return '<header class="cabecera' + (conReloj ? ' con-reloj' : '') + '">' + M.logo()
      + '<div class="titulo-cab"><b>' + M.esc(sub || J.titulo) + '</b><small style="color:' + g.color + '">' + M.esc(g.nombre || 'Sala de Escape') + '</small></div>'
      + (conReloj ? '<div class="reloj" id="reloj">--:--</div>' : '')
      + '<button class="btn-sonido" data-a="voz" aria-label="Ajustes de voz">VOZ</button>'
      + '<button class="btn-sonido" data-a="sonido">' + (M.sonido ? 'SONIDO ON' : 'SONIDO OFF') + '</button>'
      + '</header>';
  }
  function guardian(txt) { return '<div class="guardian"><div class="guardian-reloj"><i class="h"></i><i class="m"></i></div><span>' + M.esc(txt) + '</span></div>'; }

  /* ---------------------------------------------------------- servidor */
  async function refrescar() {
    E = await M.rpc('mdt_consola', { p_codigo: cfg.codigo, p_grupo: cfg.grupo });
    M.sincronizar(E.ahora);
    return E;
  }
  function decidirPantalla() {
    const abierta = E.estaciones.find(x => x.estado === 'abierta');
    if (abierta) { if (vista.est !== abierta.id) vista = { est: abierta.id, tab: primeraPendiente(contenido(abierta.id)) }; return 'estacion'; }
    const sinCierre = E.estaciones.find(x => (x.estado === 'cerrada' || x.estado === 'agotada') && !(local[clave('cierre-' + x.id)]));
    if (sinCierre) { vista.est = sinCierre.id; return 'cierre'; }
    if (E.estaciones.every(x => x.estado !== 'pendiente')) return 'final';
    if (!local[clave('bienvenida')] && E.estaciones.every(x => x.estado === 'pendiente')) return 'bienvenida';
    return 'linea';
  }
  async function cargar() {
    try { await refrescar(); pantalla = decidirPantalla(); render(); }
    catch (e) {
      if (/incorrecto|tripulación registrada/i.test(e.message)) { pantalla = 'acceso'; return pAcceso(M.mensajeError(e)); }
      pinta(cab() + '<main class="pagina"><section class="hud"><p class="error">' + M.esc(M.mensajeError(e)) + '</p><div class="acciones"><button class="btn primario" data-a="reintentar">REINTENTAR</button></div></section></main>');
    }
  }

  function render() {
    clearInterval(tick); tick = null; window.scrollTo(0, 0);
    if (pantalla === 'acceso') return pAcceso();
    if (pantalla === 'bienvenida') return pBienvenida();
    if (pantalla === 'linea') return pLinea();
    if (pantalla === 'estacion') return pEstacion();
    if (pantalla === 'cierre') return pCierre();
    if (pantalla === 'final') return pFinal();
  }

  /* ----------------------------------------------------------- 1. acceso */
  function pAcceso(err) {
    const opGrupos = J.grupos.map(g => '<button type="button" class="opcion ' + (cfg.grupo === g.id ? 'sel' : '') + '" data-grupo="' + g.id + '" style="--g:' + g.color + '"><span class="simbolo">' + g.simbolo + '</span><span>' + M.esc(g.nombre) + '</span></button>').join('');
    pinta(cab('Sala de Escape') + '<main class="pagina"><section class="hud">' + M.logo('logo-portal')
      + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1><p class="subtitulo-juego">Sala de Escape</p>'
      + '<p class="suave centro" style="margin-bottom:18px">Solo el Comandante de Misión (Custodio Digital) usa la Sala de Escape.</p>'
      + '<form id="f"><label class="campo"><span>Código de la Sala de Escape</span><input type="text" id="cod" class="mayus" autocomplete="off" autocapitalize="characters" value="' + M.esc(cfg.codigo || '') + '" placeholder="El que le entregó el Guía Especialista"></label>'
      + '<div class="campo"><span>Su grupo</span><div class="opciones">' + opGrupos + '</div></div>'
      + '<p class="error">' + M.esc(err || '') + '</p>'
      + '<button class="btn primario ancho grande" type="submit">ENTRAR A LA SALA DE ESCAPE →</button></form>'
      + '</section></main>');
    app.querySelectorAll('[data-grupo]').forEach(b => b.onclick = () => { cfg.codigo = document.getElementById('cod').value; cfg.grupo = b.dataset.grupo; pAcceso(err); });
    document.getElementById('f').onsubmit = ev => {
      ev.preventDefault();
      cfg.codigo = document.getElementById('cod').value.trim();
      if (!cfg.codigo) return pAcceso('Escriba el código de la Sala de Escape.');
      if (!cfg.grupo) return pAcceso('Elijan su grupo.');
      M.audio(); M.decir('Acceso concedido.');   // primer gesto: habilita audio y voz en el celular
      guardarCfg(); cargar();
    };
  }

  /* ----------------------------------------------------- 2. bienvenida */
  function pBienvenida() {
    const g = M.grupo(cfg.grupo), t = E.tripulantes || [];
    let lista = t.map(x => '<li><span>' + M.esc(x.nombre) + '</span><span>' + M.esc(M.rol(x.rol).nombre) + '</span></li>').join('');
    for (let i = t.length; i < 7; i++) lista += '<li class="vacio"><span>Esperando tripulante…</span><span></span></li>';
    pinta(cab('Bienvenida') + '<main class="pagina">'
      + '<section class="hud" id="guardian">' + guardian('El Guardián de la Línea del Tiempo')
      + J.bienvenida.map(p => '<p class="texto-guardian">' + M.esc(p) + '</p>').join('')
      + '<div class="acciones"><button class="btn contorno" data-a="escucharBienvenida">▶ ESCUCHAR AL GUARDIÁN</button></div></section>'
      + '<section class="hud bloque"><p class="sobretitulo">Reglas del laberinto</p><ul class="lista-tripulacion">' + J.reglas.map(r => '<li><span>' + M.esc(r) + '</span></li>').join('') + '</ul></section>'
      + '<section class="hud bloque"><p class="sobretitulo">Tripulación · ' + M.esc(g.nombre) + ' (' + t.length + '/7)</p><ul class="lista-tripulacion">' + lista + '</ul>'
      + '<p class="suave" style="font-size:13px;margin-top:10px">Los integrantes se registran desde el Pórtico de Entrada en su propio celular.</p>'
      + '<div class="acciones"><button class="btn fantasma pequeno" data-a="actualizar">Actualizar tripulación</button></div></section>'
      + '<section class="bloque centro"><p class="texto-guardian" style="color:var(--malachite)">' + M.esc(J.portal) + '</p>'
      + '<div class="acciones"><button class="btn primario grande ancho" data-a="cruzar">CRUZAR EL PORTAL →</button></div></section>'
      + '</main>');
    hablarBienvenida();
  }
  function hablarBienvenida() {
    const caja = document.getElementById('guardian'); if (caja) caja.classList.add('hablando');
    M.SFX.impacto();
    M.decir(J.bienvenida.join(' ') + ' ' + J.portal, () => { const c = document.getElementById('guardian'); if (c) c.classList.remove('hablando'); });
  }

  /* ------------------------------------------------ 3. línea de vida */
  function pLinea(msg) {
    const sig = E.estaciones.find(x => x.estado === 'pendiente');
    const nodos = E.estaciones.map(x => {
      const c = contenido(x.id), clase = x.estado === 'pendiente' ? (sig && sig.id === x.id ? 'actual' : '') : x.estado;
      const pts = x.estado === 'cerrada' ? x.total + ' pts' : x.estado === 'agotada' ? '0 pts' : '';
      return '<li class="nodo ' + clase + '"><span class="nodo-num">' + x.numero + '</span><span class="nodo-info"><b>' + M.esc(c.nombre) + '</b><small>'
        + M.esc(x.estado === 'agotada' ? 'Cerrada por tiempo' : x.estado === 'cerrada' ? 'Nodo restaurado' : c.subtitulo) + '</small></span><span class="nodo-pts">' + pts + '</span></li>';
    }).join('');
    const cs = sig && contenido(sig.id);
    pinta(cab('Línea de vida') + '<main class="pagina">'
      + '<p class="sobretitulo">El laberinto temporal</p><h2 class="seccion">Línea de vida del paciente</h2>'
      + '<p class="suave" style="margin-bottom:16px">Cinco estaciones en orden. Doce minutos en cada una. Puntos acumulados: <b style="color:var(--malachite)">' + E.total + '</b></p>'
      + '<ol class="linea-vida">' + nodos + '</ol>'
      + (cs ? '<section class="hud bloque" style="margin-top:20px"><p class="sobretitulo">Siguiente · Estación ' + sig.numero + '</p><h2 class="seccion">' + M.esc(cs.nombre) + '</h2>'
              + '<p class="suave">' + M.esc(cs.subtitulo) + ' · ' + M.esc(cs.lugar) + '</p>'
              + '<p style="margin-top:10px;font-size:14px">Cuando el Guía Especialista tenga lista la estación en la maleta, inicien. Al iniciar empiezan a correr los 12 minutos.</p>'
              + '<p class="error">' + M.esc(msg || '') + '</p>'
              + '<button class="btn primario grande ancho" data-a="abrir" data-est="' + sig.id + '">INICIAR ESTACIÓN ' + sig.numero + ' · 12:00</button></section>' : '')
      + '</main>');
  }
  async function abrir(id) {
    try {
      E = await M.rpc('mdt_abrir', { p_codigo: cfg.codigo, p_grupo: cfg.grupo, p_estacion: id });
      M.sincronizar(E.ahora); vista = { est: id, tab: primeraPendiente(contenido(id)) }; pantalla = 'estacion'; M.SFX.portal(); render();
      const c = contenido(id);
      M.decir('Estación ' + c.numero + ': ' + c.nombre + '. ' + c.narrativa);
    } catch (e) {
      const m = e.message || '';
      if (/^OCUPADA:/.test(m)) {
        const otro = M.grupo(m.split(':')[1]).nombre;
        return pLinea('La estación está ocupada por ' + otro + '. Esperen a que terminen y vuelvan a intentarlo.');
      }
      pLinea(M.mensajeError(e));
    }
  }

  /* --------------------------------------------------- 4. estación */
  function respuesta(id) { return (E.respuestas && E.respuestas[id]) || { intentos: 0, correcta: false, puntos: 0 }; }
  function resuelto(id) { const r = respuesta(id); return r.correcta || r.intentos >= 2; }
  async function cargarVentajas() {
    if (cargandoVentajas) return; cargandoVentajas = true;
    try {
      const d = await M.rpc('mdt_ventajas', { p_codigo: cfg.codigo, p_grupo: cfg.grupo });
      ventajas = (d && d.ventajas) || []; M.guardar('ventajas', ventajas);
      if (pantalla === 'estacion') { const y = window.scrollY; pEstacion(); window.scrollTo(0, y); }
    } catch (e) {} finally { cargandoVentajas = false; }
  }
  /* Las pruebas van en orden: una pestaña se abre cuando la anterior está resuelta. */
  function idsEstacion(c) { return c.pruebas.map(p => p.id).concat([c.clave.id]); }
  function habilitada(c, i) { return idsEstacion(c).slice(0, i).every(resuelto); }
  function primeraPendiente(c) { const ids = idsEstacion(c), i = ids.findIndex(id => !resuelto(id)); return i < 0 ? ids.length - 1 : i; }
  function puntoEstado(id) { const r = respuesta(id); return r.correcta ? 'bien' : r.intentos >= 2 ? 'mal' : ''; }

  function pEstacion() {
    const c = contenido(vista.est), x = est(vista.est);
    if (!habilitada(c, vista.tab)) vista.tab = primeraPendiente(c);
    const pest = (i, txt, id) => { const ok = habilitada(c, i);
      return '<button class="pestana ' + (vista.tab === i ? 'sel' : '') + (ok ? '' : ' bloqueada') + '" ' + (ok ? 'data-tab="' + i + '"' : 'disabled title="Se abre al resolver la prueba anterior"') + '>'
        + (ok ? '<span class="estado ' + puntoEstado(id) + '"></span>' : '<span class="candadito" aria-hidden="true">🔒</span>') + txt + '</button>'; };
    const tabs = c.pruebas.map((p, i) => pest(i, 'PRUEBA ' + p.id, p.id)).join('') + pest(c.pruebas.length, 'CLAVE DE SALIDA', c.clave.id);
    const cuerpo = vista.tab < c.pruebas.length ? vistaPrueba(c, c.pruebas[vista.tab]) : vistaClave(c);
    const pendientes = c.pruebas.map(p => p.id).concat([c.clave.id]).filter(id => { const r = respuesta(id); return !r.correcta && r.intentos < 2; }).length;
    pinta(cab('Estación ' + c.numero, true) + '<main class="pagina">'
      + '<nav class="pestanas">' + tabs + '</nav>' + cuerpo + '</main>'
      + '<div class="barra-inferior"><div class="interior" style="flex-direction:column;align-items:stretch">'
      + '<div id="avisoTiempo"></div>'
      + '<div style="display:flex;gap:10px;align-items:center"><span class="nota" id="notaFin">' + (pendientes ? pendientes + (pendientes === 1 ? ' código sin responder' : ' códigos sin responder') : 'Todos los códigos registrados') + '</span>'
      + '<button class="btn primario" data-a="finalizar">VALIDAR Y FINALIZAR ESTACIÓN</button></div></div></div>');
    iniciarReloj(x);
  }

  function tarjetaHTML(c, p) {
    return '<section class="hud tarjeta">'
      + '<div class="tarjeta-cab"><span>Tarjeta de instrucciones</span><span>Estación ' + c.numero + '</span></div>'
      + '<h3>' + M.esc(c.nombre) + '</h3><p class="reto"><b>Reto:</b> ' + M.esc(p.reto) + '</p>'
      + '<h4>' + M.esc(p.situacionTitulo) + '</h4><div class="situacion">' + p.situacion.map(s => '<p><b>' + M.esc(s[0]) + ':</b> ' + M.esc(s[1]) + '</p>').join('') + '</div>'
      + '<div class="mision"><h4 style="margin-top:0">Misión del equipo</h4><ol>' + p.mision.map(m => '<li><b>' + M.esc(m[0]) + '</b>' + M.esc(m[1]) + '</li>').join('') + '</ol></div>'
      + (p.atencion ? '<p class="atencion"><b>Atención Cronocirujanos:</b> ' + M.esc(p.atencion) + '</p>' : '')
      + '<div class="tarjeta-cab" style="margin:14px 0 0"><span>Prueba ' + M.esc(p.id) + '</span><span>' + M.esc(p.titulo) + '</span></div>'
      + '<button class="btn contorno pequeno btn-escuchar" data-a="escucharTarjeta">▶ ESCUCHAR TARJETA</button>'
      + '</section>';
  }
  function textoTarjeta(c, p) {
    return 'Prueba ' + p.id + '. ' + p.titulo + '. ' + p.situacion.map(s => s[0] + ': ' + s[1]).join(' ')
      + ' Misión del equipo. ' + p.mision.map((m, i) => (i + 1) + '. ' + m[0] + '. ' + m[1]).join(' ')
      + (p.atencion ? ' Atención, Cronocirujanos: ' + p.atencion : '');
  }

  function materialHTML(p, m, i) {
    const k = clave(p.id + '-' + i);
    if (m.tipo === 'monitor') {
      if (!local[k]) return '<div class="material"><div class="material-cab">Exámenes clínicos</div><button class="btn contorno grande ancho latido" data-a="solicitar" data-k="' + k + '">' + M.esc(m.boton) + '</button></div>';
      return '<div class="material"><div class="material-cab">Exámenes clínicos</div><div class="monitor"><svg viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true"><path class="ecg" pathLength="1000" d="M0 45 L60 45 L70 40 L78 45 L95 45 L100 10 L106 70 L112 45 L135 45 L145 36 L160 45 L200 45 L210 40 L218 45 L235 45 L240 10 L246 70 L252 45 L275 45 L285 36 L300 45 L340 45 L350 40 L358 45 L375 45 L380 10 L386 70 L392 45 L415 45 L425 36 L440 45 L480 45 L490 40 L498 45 L515 45 L520 10 L526 70 L532 45 L555 45 L565 36 L580 45 L600 45"/></svg>'
        + '<div class="vitales">' + m.vitales.map(v => '<div class="vital ' + v[3] + '"><small>' + M.esc(v[0]) + '</small><b>' + M.esc(v[1]) + '</b><span>' + M.esc(v[2]) + '</span></div>').join('') + '</div>'
        + '<div class="imagen-dx"><small>' + M.esc(m.imagen[0]) + '</small><b>' + M.esc(m.imagen[1]) + '</b><p>' + M.esc(m.imagen[2]) + '</p></div>'
        + (m.nota ? '<p class="monitor-nota">' + M.esc(m.nota) + '</p>' : '') + '</div></div>';
    }
    if (m.tipo === 'documento') {
      return '<div class="material"><div class="material-cab">Contenido de la caja</div><article class="documento"><header><b>' + M.esc(m.titulo) + '</b><small>' + M.esc(m.encabezado) + '</small></header><dl>'
        + m.lineas.map(l => '<dt>' + M.esc(l[0]) + '</dt><dd>' + M.esc(l[1]) + '</dd>').join('') + '</dl></article></div>';
    }
    if (m.tipo === 'tablero') {
      return '<div class="material"><div class="material-cab">' + M.esc(m.titulo) + '</div><p class="suave" style="font-size:13px;margin-bottom:8px">' + M.esc(m.instruccion) + '</p><div class="tablero">'
        + '<div class="tablero-fila cab"><span>' + m.columnas.map(M.esc).join('</span><span>') + '</span></div>'
        + m.filas.map((f, j) => '<button class="tablero-fila ' + (local[k] === j ? 'marcada' : '') + '" data-a="marcarTablero" data-k="' + k + '" data-j="' + j + '"><b>' + M.esc(f[0]) + '</b><span>' + M.esc(f[1]) + '</span><span class="estado">' + M.esc(f[2]) + '</span></button>').join('')
        + '</div></div>';
    }
    if (m.tipo === 'fichas') {
      return '<div class="material"><div class="material-cab">' + M.esc(m.titulo) + '</div><p class="suave" style="font-size:13px;margin-bottom:8px">' + M.esc(m.instruccion) + '</p><div class="fichas">'
        + m.items.map(it => '<div class="ficha"><span class="valor">' + M.esc(it[1]) + '</span><span>' + M.esc(it[0]) + '</span></div>').join('') + '</div></div>';
    }
    if (m.tipo === 'checklist') {
      const marcadas = local[k] || [];
      return '<div class="material"><div class="material-cab">' + M.esc(m.titulo) + '</div><p class="suave" style="font-size:13px;margin-bottom:8px">' + M.esc(m.instruccion) + '</p><div class="fichas">'
        + m.items.map((it, j) => '<button class="ficha check ' + (marcadas.indexOf(j) >= 0 ? 'marcada' : '') + '" data-a="marcarCheck" data-k="' + k + '" data-j="' + j + '"><span class="valor">' + M.esc(it[0]) + '</span><span>' + M.esc(it[1]) + '</span><span class="distintivo">Embajadores</span></button>').join('')
        + '</div></div>';
    }
    if (m.tipo === 'archivo') {
      return '<div class="material"><div class="material-cab">' + M.esc(m.titulo) + '</div><p class="suave" style="font-size:13px;margin-bottom:8px">' + M.esc(m.instruccion) + '</p><div class="archivo">'
        + m.items.map(it => '<div class="dato"><small>' + M.esc(it[0]) + '</small><b>' + M.esc(it[1]) + '</b></div>').join('') + '</div></div>';
    }
    if (m.tipo === 'appPrevena') {
      const ap = J.appPrevena || {};
      return '<div class="material"><div class="material-cab">' + M.esc(ap.nombre || 'Aplicación Prevena™') + '</div><section class="hud centro">'
        + (ap.url
          ? '<p style="margin-bottom:12px">Cualquier tripulante puede abrirla en su celular (iPhone o Android).</p><a class="btn primario grande ancho" href="' + M.esc(ap.url) + '" target="_blank" rel="noopener">ABRIR APLICACIÓN PREVENA™ ↗</a>'
          : '<p>El Guía Especialista les indicará cómo abrir la aplicación Prevena™ en sus celulares (iPhone o Android).</p>')
        + '<p class="suave" style="font-size:13px;margin-top:10px">Completen el paso a paso y vuelvan a la Sala de Escape.</p></section></div>';
    }
    if (m.tipo === 'ventajas') {
      const v = ventajas;
      if (!v) {
        if (resuelto('5.2')) cargarVentajas();
        return '<div class="material"><div class="material-cab">' + M.esc(m.titulo) + '</div><section class="hud centro"><p class="suave">'
          + (resuelto('5.2') ? 'Cargando la evidencia…' : 'La evidencia aparece cuando el equipo registre el código de la prueba 5.2.') + '</p></section></div>';
      }
      return '<div class="material"><div class="material-cab">' + M.esc(m.titulo) + '</div><figure class="imagen-evidencia" role="img" aria-label="' + M.esc(m.titulo) + '">'
        + '<div class="evidencia-cab">' + M.logo('logo-evidencia') + '<span>Prevena™ · Manejo de incisiones cerradas</span></div>'
        + '<div class="ventajas">' + v.map((x, i) => '<div class="ventaja" style="animation-delay:' + (i * 0.2) + 's"><span class="sim">' + M.esc(x.simbolo) + '</span><span>' + M.esc(x.texto) + '</span></div>').join('') + '</div>'
        + '<div class="sello"><small>Hito histórico · Sello de la línea de tiempo</small><div class="simbolos">' + v.map(x => '<span>' + M.esc(x.simbolo) + '</span>').join('') + '</div></div>'
        + '</figure></div>';
    }
    return '';
  }

  function cajaCodigo(cod, def) {
    const r = respuesta(cod), quedan = 2 - (r.intentos || 0);
    let cuerpo;
    if (r.correcta) {
      cuerpo = (def.candado ? '<div class="candado abierto"><i></i></div>' : '')
        + '<div class="resultado bien"><b>CÓDIGO CORRECTO</b><div class="valor">' + M.esc(r.mostrar || r.valor || '') + '</div><small>+' + r.puntos + ' puntos · Copiloto: regístrenlo en la bitácora</small></div>';
    } else if (r.intentos >= 2) {
      cuerpo = '<div class="resultado mal"><b>SIN INTENTOS · 0 PUNTOS</b><small>La respuesta correcta era</small><div class="valor">' + M.esc(r.mostrar || '') + '</div><small>Anótenla en la bitácora' + (def.candado ? ' y úsenla para abrir el candado.' : ' y sigan avanzando.') + '</small></div>';
    } else {
      cuerpo = (def.candado ? '<div class="candado"><i></i></div>' : '')
        + '<form data-form="' + M.esc(cod) + '"><p class="formato">' + M.esc(def.formato) + '</p>'
        + '<input class="entrada-codigo" id="in-' + M.esc(cod) + '" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="' + M.esc(def.placeholder || '') + '">'
        + '<div class="intentos"><i class="' + (r.intentos >= 1 ? 'gastado' : '') + '"></i><i></i><span>' + quedan + (quedan === 1 ? ' intento' : ' intentos') + '</span></div>'
        + (r.intentos === 1 ? '<p class="error">Código incorrecto. Les queda un intento.</p>' : '<p class="error" id="err-' + M.esc(cod) + '"></p>')
        + '<div class="acciones"><button class="btn primario grande" type="submit">VALIDAR CÓDIGO</button></div></form>';
    }
    return '<section class="hud caja-codigo bloque" style="margin-top:16px"><p class="sobretitulo">Código ' + M.esc(cod) + ' · ' + (r.max || '') + ' puntos</p>'
      + '<p class="pregunta">' + M.esc(def.pregunta) + '</p>' + cuerpo + '</section>';
  }

  function pistasHTML(p) {
    if (!p.pistas || !p.pistas.length) return '';
    const k = clave('vista-' + p.id), desde = local[k] || M.ahora();
    const seg = (M.ahora() - desde) / 1000;
    const items = p.pistas.map((t, i) => {
      const umbral = J.pistasSegundos[i] || 999999;
      return seg >= umbral ? '<div class="pista"><small>Pista ' + (i + 1) + '</small>' + M.esc(t) + '</div>'
                           : (i === 0 || seg >= (J.pistasSegundos[i - 1] || 0)) ? '<div class="pista espera"><small>Pista ' + (i + 1) + '</small>Disponible en ' + M.mmss(umbral - seg) + '</div>' : '';
    }).join('');
    return '<section class="pistas" id="pistas">' + items + '</section>';
  }

  function vistaPrueba(c, p) {
    const k = clave('vista-' + p.id);
    if (!local[k]) { local[k] = M.ahora(); guardarLocal(); }
    return tarjetaHTML(c, p) + (p.pantalla || []).map((m, i) => materialHTML(p, m, i)).join('')
      + cajaCodigo(p.id, p.codigo) + pistasHTML(p)
      + (resuelto(p.id)
          ? '<div class="acciones"><button class="btn primario grande" data-tab="' + (vista.tab + 1) + '">' + (vista.tab + 1 < c.pruebas.length ? 'SIGUIENTE: PRUEBA ' + c.pruebas[vista.tab + 1].id + ' →' : 'IR A LA CLAVE DE SALIDA →') + '</button></div>'
          : '<p class="suave centro" style="font-size:13px;margin-top:14px">🔒 ' + (vista.tab + 1 < c.pruebas.length ? 'La prueba ' + c.pruebas[vista.tab + 1].id : 'La clave de salida') + ' se abre cuando registren el código de esta prueba.</p>');
  }
  function vistaClave(c) {
    return '<section class="hud tarjeta"><div class="tarjeta-cab"><span>Consola de validación</span><span>Estación ' + c.numero + '</span></div>'
      + '<h3>' + M.esc(c.clave.titulo) + '</h3><p class="reto">Con la clave de salida, el equipo desacopla la estación. Después, validen y finalicen.</p></section>'
      + cajaCodigo(c.clave.id, c.clave);
  }

  /* reloj de la estación (hora del servidor) */
  function iniciarReloj(x) {
    let ultimo = -1, aviso = false;
    const pasar = () => {
      const trans = (M.ahora() - new Date(x.inicio).getTime()) / 1000;
      const rest = x.limite - trans, enGracia = rest <= 0, fin = trans >= x.limite + x.gracia;
      const el = document.getElementById('reloj');
      if (el) {
        el.textContent = enGracia ? '+' + M.mmss(-rest) : M.mmss(rest);
        el.classList.toggle('urgente', !enGracia && rest <= 120);
        el.classList.toggle('gracia', enGracia);
      }
      const s = Math.ceil(rest);
      if (s !== ultimo) { ultimo = s; if (s <= 30 && s > -x.gracia) M.SFX.tic(); }
      const av = document.getElementById('avisoTiempo');
      if (enGracia && av && !aviso) {
        aviso = true;
        av.innerHTML = '<div class="aviso-tiempo">¡Tiempo cumplido! Tienen 30 segundos para validar y finalizar.</div>';
        M.SFX.error(); M.decir('Tiempo cumplido. Tienen treinta segundos para validar y finalizar la estación.');
      }
      if (fin) { clearInterval(tick); tick = null; cerrarPorTiempo(); }
      const ps = document.getElementById('pistas');
      if (ps && Math.floor(trans) % 5 === 0) { const c = contenido(vista.est), p = c.pruebas[vista.tab]; if (p) ps.outerHTML = pistasHTML(p); }
    };
    pasar(); tick = setInterval(pasar, 500);
  }
  async function cerrarPorTiempo() {
    try { await refrescar(); } catch (e) {}
    M.SFX.error();
    pantalla = decidirPantalla(); render();
  }

  async function validar(cod) {
    const inp = document.getElementById('in-' + cod);
    const valor = (inp && inp.value || '').trim();
    if (!valor) { const e = document.getElementById('err-' + cod); if (e) e.textContent = 'Escriban el código antes de validar.'; return; }
    const btn = app.querySelector('[data-form="' + cod + '"] button[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'VALIDANDO…'; }
    try {
      const r = await M.rpc('mdt_responder', { p_codigo: cfg.codigo, p_grupo: cfg.grupo, p_codigo_id: cod, p_valor: valor });
      E.respuestas[cod] = Object.assign({}, E.respuestas[cod], r, { valor: valor.toUpperCase() });
      const def = codigoDef(cod);
      if (r.correcta) { def.candado ? M.SFX.candado() : M.SFX.ok(); M.decir('Código correcto.'); }
      else if (r.intentos >= 2) { M.SFX.error(); M.decir('Sin intentos. La respuesta correcta era ' + String(r.mostrar || '').split('').join(' ') + '. Sigan avanzando.'); }
      else { M.SFX.error(); M.decir('Código incorrecto. Les queda un intento.'); }
      const y = window.scrollY; pEstacion(); window.scrollTo(0, y);
      const n = document.getElementById('in-' + cod); if (n && !r.correcta && r.intentos < 2) n.classList.add('sacudir');
    } catch (e) {
      if (/^CERRADA:/.test(e.message)) return cerrarPorTiempo();
      const el = document.getElementById('err-' + cod); if (el) el.textContent = M.mensajeError(e);
      if (btn) { btn.disabled = false; btn.textContent = 'VALIDAR CÓDIGO'; }
    }
  }
  function codigoDef(cod) {
    const c = contenido(vista.est);
    if (c.clave.id === cod) return c.clave;
    const p = c.pruebas.find(x => x.id === cod); return p ? p.codigo : {};
  }

  async function finalizar(btn) {
    if (!confirmarFin || Date.now() - confirmarFin > 5000) {
      confirmarFin = Date.now();
      document.getElementById('notaFin').innerHTML = '<b style="color:var(--blanco)">¿Seguros? Al finalizar se detiene el reloj y no se pueden digitar más códigos. Toquen de nuevo para confirmar.</b>';
      btn.textContent = 'CONFIRMAR FINALIZAR'; return;
    }
    confirmarFin = 0; btn.disabled = true; btn.textContent = 'REGISTRANDO…';
    try {
      E = await M.rpc('mdt_finalizar', { p_codigo: cfg.codigo, p_grupo: cfg.grupo, p_estacion: vista.est });
      M.sincronizar(E.ahora); pantalla = 'cierre'; M.SFX.ok(); render();
    } catch (e) { btn.disabled = false; btn.textContent = 'VALIDAR Y FINALIZAR ESTACIÓN'; document.getElementById('notaFin').textContent = M.mensajeError(e); }
  }

  /* ------------------------------------------------- 5. cierre de estación */
  function pCierre() {
    const c = contenido(vista.est), x = est(vista.est), agotada = x.estado === 'agotada';
    const cods = c.pruebas.map(p => ({ id: p.id, titulo: p.titulo })).concat([{ id: c.clave.id, titulo: c.clave.titulo }]);
    const filas = cods.map(k => {
      const r = respuesta(k.id);
      const det = r.correcta ? '✓ ' + M.esc(r.mostrar || '') : '✗ <em>Correcta: ' + M.esc(r.mostrar || '—') + '</em>';
      return '<tr class="' + (r.correcta && !agotada ? '' : 'mal') + '"><td>Código ' + M.esc(k.id) + ' · ' + det + '</td><td>' + (agotada ? 0 : r.puntos) + ' / ' + (r.max || 0) + '</td></tr>';
    }).join('');
    const sig = E.estaciones.find(y => y.estado === 'pendiente');
    pinta(cab('Estación ' + c.numero + ' · Cierre') + '<main class="pagina">'
      + '<section class="hud desbloqueo ' + (agotada ? 'agotada' : '') + '"><p class="sobretitulo">Estación ' + c.numero + ' · ' + M.esc(c.nombre) + '</p>'
      + '<h2>' + M.esc(agotada ? 'EL RELOJ CERRÓ LA ESTACIÓN' : c.desbloqueo.titulo) + '</h2>'
      + '<p>' + M.esc(agotada ? 'Se cumplieron los 12 minutos y los 30 segundos de gracia. Esta estación no suma puntos, pero el aprendizaje sigue: revisen las respuestas correctas.' : c.desbloqueo.texto) + '</p>'
      + '<div class="marcador"><b>' + (agotada ? 0 : x.total) + '</b><span>/ 20</span></div>'
      + '<table class="tabla-puntos"><tbody>' + filas
      + '<tr class="' + (agotada ? 'mal' : '') + '"><td>Agilidad · tiempo ' + M.mmss(x.seg_usados || 0) + '</td><td>+' + (agotada ? 0 : x.pts_tiempo) + '</td></tr>'
      + '</tbody></table></section>'
      + '<section class="hud bloque" id="guardian">' + guardian('Retroalimentación') + '<p class="frase-cierre">' + M.esc(c.cierre) + '</p>'
      + '<div class="acciones"><button class="btn contorno" data-a="escucharCierre">▶ ESCUCHAR DE NUEVO</button></div></section>'
      + '<div class="acciones"><button class="btn primario grande ancho" data-a="continuar">' + (sig ? 'CONTINUAR A LA ESTACIÓN ' + sig.numero + ' →' : 'VER RESULTADO FINAL →') + '</button></div>'
      + '</main>');
    hablarCierre();
  }
  function hablarCierre() {
    const c = contenido(vista.est), x = est(vista.est);
    const g = document.getElementById('guardian'); if (g) g.classList.add('hablando');
    const intro = x.estado === 'agotada' ? 'El reloj cerró la estación. ' : c.desbloqueo.titulo + ' ';
    M.SFX.impacto();
    M.decir(intro + c.cierre, () => { const h = document.getElementById('guardian'); if (h) h.classList.remove('hablando'); });
  }

  /* ------------------------------------------------------------ 6. final */
  async function pFinal() {
    const filas = E.estaciones.map(x => '<tr class="' + (x.estado === 'agotada' ? 'mal' : '') + '"><td>Estación ' + x.numero + ' · ' + M.esc(contenido(x.id).nombre) + '</td><td>' + x.total + ' / 20</td></tr>').join('');
    pinta(cab('Misión cumplida') + '<main class="pagina">'
      + '<section class="hud desbloqueo"><p class="sobretitulo">Fin de la línea de tiempo</p><h2>' + M.esc(J.final.mensaje) + '</h2><p>' + M.esc(J.final.detalle) + '</p>'
      + '<div class="marcador"><b>' + E.total + '</b><span>/ 100</span></div><p id="puesto" class="sobretitulo centro" style="margin-top:6px"></p>'
      + '<table class="tabla-puntos"><tbody>' + filas + '</tbody></table></section>'
      + '<section class="hud bloque" id="guardian">' + guardian('El Guardián de la Línea del Tiempo') + '<p class="frase-cierre">' + M.esc(J.final.frase) + '</p>'
      + '<div class="acciones"><button class="btn contorno" data-a="escucharFinal">▶ ESCUCHAR</button></div></section>'
      + '<p class="suave centro" style="margin-top:16px">Miren El Gran Tablero para conocer al grupo ganador.</p></main>');
    M.decir(J.final.mensaje + ' ' + J.final.frase);
    try {
      const t = await M.rpc('mdt_tablero', {});
      const orden = t.grupos.filter(g => g.registrado).sort((a, b) => b.total - a.total);
      const i = orden.findIndex(g => g.grupo === cfg.grupo);
      const el = document.getElementById('puesto'); if (el && i >= 0) el.textContent = 'Posición actual: ' + (i + 1) + ' de ' + orden.length;
    } catch (e) {}
  }

  /* ---------------------------------------------------- ajustes de voz */
  function modalVoz() {
    const vs = M.voces;
    const html = '<div class="modal" id="modal"><section class="hud"><p class="sobretitulo">Voz del Guardián</p>'
      + '<p class="suave" style="font-size:14px">Se elige automáticamente una voz masculina en español latinoamericano cuando el celular la tiene. Si suena una voz femenina, elijan otra de la lista (las marcadas con ♂ son masculinas).</p>'
      + '<p class="sobretitulo" style="margin-top:12px">Velocidad</p><div class="opciones-vel">'
      + [['normal', 'Normal'], ['agil', 'Ágil'], ['rapida', 'Rápida']].map(v => '<button data-vel="' + v[0] + '" class="' + (M.velocidad === v[0] ? 'sel' : '') + '">' + v[1] + '</button>').join('') + '</div>'
      + '<p class="sobretitulo" style="margin-top:12px">Voz</p><div class="lista-voces">' + (vs.length ? vs.map(v => '<button data-voz="' + M.esc(v.voiceURI) + '" class="' + (M.vozElegida && M.vozElegida.voiceURI === v.voiceURI ? 'sel' : '') + '">' + (M.esMasculina(v) ? '♂ ' : '') + M.esc(v.name) + '<small>' + M.esc(v.lang) + '</small></button>').join('') : '<p class="suave">Este navegador no tiene voces en español.</p>') + '</div>'
      + '<div class="acciones"><button class="btn primario" data-a="cerrarModal">LISTO</button></div></section></div>';
    app.insertAdjacentHTML('beforeend', html);
  }

  /* ------------------------------------------------------------ eventos */
  app.addEventListener('submit', ev => { const f = ev.target.closest('[data-form]'); if (f) { ev.preventDefault(); validar(f.dataset.form); } });
  app.addEventListener('click', ev => {
    const tab = ev.target.closest('[data-tab]');
    if (tab) { M.callar(); vista.tab = +tab.dataset.tab; pEstacion(); window.scrollTo(0, 0); const c = contenido(vista.est), p = c.pruebas[vista.tab]; if (p && !local[clave('oida-' + p.id)]) { local[clave('oida-' + p.id)] = 1; guardarLocal(); M.decir(textoTarjeta(c, p)); } return; }
    const vel = ev.target.closest('[data-vel]');
    if (vel) { M.elegirVelocidad(vel.dataset.vel); app.querySelectorAll('[data-vel]').forEach(b => b.classList.toggle('sel', b === vel)); M.decir('Doctores, el reloj ya está corriendo.'); return; }
    const v = ev.target.closest('[data-voz]');
    if (v) { M.elegirVoz(v.dataset.voz); app.querySelectorAll('[data-voz]').forEach(b => b.classList.toggle('sel', b === v)); M.decir('Esta es la voz del Guardián de la Línea del Tiempo.'); return; }
    const b = ev.target.closest('[data-a]'); if (!b) return;
    M.audio();
    const a = b.dataset.a;
    if (a === 'sonido') { b.textContent = M.alternarSonido() ? 'SONIDO ON' : 'SONIDO OFF'; return; }
    if (a === 'voz') return modalVoz();
    if (a === 'cerrarModal') { const m = document.getElementById('modal'); if (m) m.remove(); return; }
    if (a === 'reintentar') return cargar();
    if (a === 'escucharBienvenida') return hablarBienvenida();
    if (a === 'actualizar') return cargar();
    if (a === 'cruzar') { local[clave('bienvenida')] = 1; guardarLocal(); M.callar(); M.SFX.portal(); pantalla = 'linea'; return render(); }
    if (a === 'abrir') { b.disabled = true; b.textContent = 'ABRIENDO…'; return abrir(b.dataset.est); }
    if (a === 'escucharTarjeta') { const c = contenido(vista.est); return M.decir(textoTarjeta(c, c.pruebas[vista.tab])); }
    if (a === 'solicitar') {
      local[b.dataset.k] = 1; guardarLocal();
      const y = window.scrollY; pEstacion(); window.scrollTo(0, y); M.SFX.monitor(6);
      const p = contenido(vista.est).pruebas[vista.tab], m = (p.pantalla || []).find(x => x.tipo === 'monitor');
      return M.decir(m && m.voz);
    }
    if (a === 'marcarTablero') { local[b.dataset.k] = +b.dataset.j; guardarLocal(); const y = window.scrollY; pEstacion(); window.scrollTo(0, y); return M.SFX.paso(); }
    if (a === 'marcarCheck') {
      const arr = local[b.dataset.k] || [], j = +b.dataset.j, i = arr.indexOf(j);
      if (i >= 0) arr.splice(i, 1); else arr.push(j);
      local[b.dataset.k] = arr; guardarLocal(); const y = window.scrollY; pEstacion(); window.scrollTo(0, y); return M.SFX.paso();
    }
    if (a === 'finalizar') return finalizar(b);
    if (a === 'escucharCierre') return hablarCierre();
    if (a === 'escucharFinal') return M.decir(J.final.frase);
    if (a === 'continuar') { local[clave('cierre-' + vista.est)] = 1; guardarLocal(); M.callar(); pantalla = decidirPantalla(); return render(); }
  });

  /* Sondeo suave: si el reloj del servidor cierra la estación, la consola se entera. */
  sondeo = setInterval(async () => {
    if (pantalla !== 'estacion' || document.hidden) return;
    try { const antes = vista.est; await refrescar(); const x = est(antes); if (x && x.estado !== 'abierta') { pantalla = decidirPantalla(); render(); } } catch (e) {}
  }, 20000);

  if (cfg.codigo && cfg.grupo && M.leer('consola', null)) cargar(); else pAcceso();
})();
