/* ==========================================================================
   BITÁCORA DE TRÁNSITO TEMPORAL · artefacto de expectativa (3 días antes)
   Pestañas por fase, 20 puntos, casillas para completar con verificación,
   avance guardado en el dispositivo y descarga de la bitácora completada.
   Metodología y diseño: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const B = window.BITACORA;
  const S = window.SONIDO_RUTA || { giro() {}, bajar() {}, encender() {}, enlazar() {}, activo: false };
  const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLAVE_LS = 'mdt-bitacora-v1';

  /* ---------------------------------------------------------------- estado */
  const vacio = { nombre: '', resp: {}, intentos: {}, estado: {}, vista: 'portada' };
  let E = leer();
  function leer() { try { return Object.assign({}, vacio, JSON.parse(localStorage.getItem(CLAVE_LS) || '{}')); } catch (e) { return Object.assign({}, vacio); } }
  function guardar() { try { localStorage.setItem(CLAVE_LS, JSON.stringify(E)); } catch (e) {} }

  /* ------------------------------------------------------------- utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-').replace(/[.,;:¡!¿?"'()]/g, '').replace(/\s+/g, ' ').trim();
  const dos = n => String(n).padStart(2, '0');

  // Recorre todas las casillas de un texto y les asigna un id estable por punto
  const casillasPorPunto = {};
  B.fases.forEach(f => f.puntos.forEach(p => { casillasPorPunto[p.n] = []; }));
  function registrar(n, txt) {
    const lista = casillasPorPunto[n];
    return String(txt || '').replace(/\[\[([^\]]*)\]\]/g, (m, r) => {
      const id = 'p' + n + '-' + lista.length;
      lista.push({ id: id, validas: r ? r.split('|') : null });
      return '\u0000' + id + '\u0000';
    });
  }
  // Pre-registro (para conocer el total de casillas desde el inicio)
  const plantillas = {};
  B.fases.forEach(f => f.puntos.forEach(p => {
    const t = {};
    t.titulo = registrar(p.n, p.titulo);
    t.descripcion = (p.descripcion || []).map(d => registrar(p.n, d));
    t.lista = (p.lista || []).map(d => registrar(p.n, d));
    t.descripcion2 = p.descripcion2 ? registrar(p.n, p.descripcion2) : '';
    t.conceptos = p.conceptos.map(c => ({ t: registrar(p.n, c.t), d: registrar(p.n, c.d) }));
    t.clave = p.clave ? registrar(p.n, p.clave) : '';
    t.acciones = registrar(p.n, p.acciones);
    plantillas[p.n] = t;
  }));
  const TODAS = [].concat.apply([], Object.keys(casillasPorPunto).map(k => casillasPorPunto[k]));
  const casilla = id => TODAS.find(c => c.id === id);

  function conCasillas(txt, mayus) {
    return esc(txt).split('\u0000').map((parte, i) => {
      if (i % 2 === 0) return mayus ? parte : parte;
      const c = casilla(parte), v = E.resp[parte] || '', st = E.estado[parte] || '';
      const largo = c.validas ? Math.max(4, Math.min(26, c.validas[0].length + 2)) : 14;
      const bloqueada = st === 'bien' || st === 'revelada';
      return '<input class="hueco ' + st + '" data-id="' + parte + '" value="' + esc(v) + '" size="' + largo + '"'
        + ' autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Casilla para completar"'
        + (bloqueada ? ' readonly' : '') + '>';
    }).join('');
  }

  function totales() {
    let bien = 0, llenas = 0, reveladas = 0;
    TODAS.forEach(c => {
      const st = E.estado[c.id];
      if (st === 'bien') bien++; if (st === 'revelada') reveladas++;
      if ((E.resp[c.id] || '').trim()) llenas++;
    });
    return { bien, llenas, reveladas, total: TODAS.length };
  }
  function resueltoPunto(n) { return casillasPorPunto[n].every(c => ['bien', 'revelada', 'libre'].includes(E.estado[c.id])); }
  function resueltaFase(f) { return f.puntos.every(p => resueltoPunto(p.n)); }

  /* --------------------------------------------------------------- iconos */
  const ICON = {
    termo: '<path d="M20 8v18a7 7 0 1 0 8 0V8a4 4 0 0 0-8 0z"/><circle cx="24" cy="32" r="3"/><path d="M24 14v15"/>',
    gota: '<path d="M24 6c6 9 11 15 11 22a11 11 0 0 1-22 0c0-7 5-13 11-22z"/><path d="M19 30a5 5 0 0 0 5 5"/>',
    celulas: '<circle cx="16" cy="18" r="5"/><circle cx="31" cy="16" r="4"/><circle cx="24" cy="30" r="6"/><circle cx="35" cy="31" r="3"/><circle cx="13" cy="32" r="3"/>',
    reloj: '<circle cx="24" cy="24" r="16"/><path d="M24 14v10l7 5"/>',
    medidor: '<path d="M8 32a16 16 0 0 1 32 0"/><path d="M24 32l8-10"/><circle cx="24" cy="32" r="2"/><path d="M12 32h3M33 32h3M24 16v3"/>',
    escudo: '<path d="M24 6l14 5v11c0 9-6 16-14 20-8-4-14-11-14-20V11z"/><path d="M18 24l4 4 8-9"/>',
    intestino: '<path d="M14 14c0-4 20-4 20 0s-20 4-20 8 20 4 20 8-20 4-20 8 20 4 20 0"/>',
    lista: '<rect x="12" y="8" width="24" height="32" rx="3"/><path d="M18 18h12M18 25h12M18 32h8"/>',
    lupa: '<circle cx="21" cy="21" r="11"/><path d="M29 29l10 10"/>',
    traccion: '<path d="M10 24h28M10 24l6-6M10 24l6 6M38 24l-6-6M38 24l-6 6"/><path d="M24 12v24"/>'
  };
  function icono(texto) {
    const t = norm(texto);
    let k = 'intestino';
    if (/hipoterm|temperatura/.test(t)) k = 'termo';
    else if (/acidosis|ph |drenaje|fluid|liquid|nutric|aliment|hidric|lavado/.test(t)) k = 'gota';
    else if (/coagul|celul|barrera mucosa/.test(t)) k = 'celulas';
    else if (/frecuencia|hora|recambio|inicio|cada|meta de cierre/.test(t)) k = 'reloj';
    else if (/umbral|presion|ppa|rango|modul|succion|registro cuantitativo|ppa/.test(t)) k = 'medidor';
    else if (/prevencion|preservacion|barrera|proteccion|estandar|seguridad/.test(t)) k = 'escudo';
    else if (/evaluacion|identificacion|inspeccion|vigilancia|deteccion|clasificacion|auditoria/.test(t)) k = 'lupa';
    else if (/traccion|anclaje|aproximacion|cierre|aponeur/.test(t)) k = 'traccion';
    else if (/registro|control|documenta/.test(t)) k = 'lista';
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' + ICON[k] + '</svg>';
  }
  const ABDOMEN = '<svg class="abdomen" viewBox="0 0 160 190" aria-hidden="true"><path d="M30 10c6 30 2 50-6 70-8 22-6 50 6 80M130 10c-6 30-2 50 6 70 8 22 6 50-6 80"/><path d="M50 30c10 12 50 12 60 0"/><path d="M80 40v28M72 50l8-10 8 10"/><path d="M58 90c0-10 44-10 44 0s-40 6-40 14 40 4 40 14-36 6-36 14 30 6 30 14"/><path d="M80 150v30"/><path d="M14 92h20M14 92l7-6M14 92l7 6M146 92h-20M146 92l-7-6M146 92l-7 6"/></svg>';

  /* ---------------------------------------------------------------- vistas */
  const app = document.getElementById('app');
  app.innerHTML =
    '<header class="bt-cab">'
    + '<a class="bt-marca" href="index.html" aria-label="Inicio"><img src="img/solventum-logo.png" alt="Solventum"></a>'
    + '<div class="bt-cab-txt"><b>Bitácora</b><small>Tránsito temporal</small></div>'
    + '<span class="bt-contador" id="contador" title="Casillas resueltas"></span>'
    + '<button class="btn-sonido" id="sonido" type="button" aria-pressed="false">♪</button>'
    + '</header>'
    + '<nav class="bt-pestanas oculto" id="pestanas" role="tablist" aria-label="Fases"></nav>'
    + '<main class="bt-escena" id="escena"></main>';
  const $escena = document.getElementById('escena'), $pest = document.getElementById('pestanas'), $cont = document.getElementById('contador');
  S.enlazar(document.getElementById('sonido'));

  function pintarContador() {
    const t = totales();
    $cont.innerHTML = '<i style="--p:' + Math.round((t.bien + t.reveladas) / t.total * 100) + '%"></i><span>' + (t.bien + t.reveladas) + '/' + t.total + '</span>';
  }
  function pintarPestanas() {
    const activa = E.vista;
    $pest.classList.toggle('oculto', activa === 'portada');
    $pest.innerHTML = '<div class="bt-pest-in">' + B.fases.map(f => {
      const hechos = f.puntos.filter(p => resueltoPunto(p.n)).length;
      return '<button type="button" role="tab" data-vista="' + f.id + '" aria-selected="' + (activa === f.id) + '" class="bt-pest' + (activa === f.id ? ' sel' : '') + (resueltaFase(f) ? ' completa' : '') + '">'
        + '<b>Fase ' + f.id + '</b><small>' + hechos + '/' + f.puntos.length + '</small></button>';
    }).join('') + '<button type="button" role="tab" data-vista="final" aria-selected="' + (activa === 'final') + '" class="bt-pest bt-pest-final' + (activa === 'final' ? ' sel' : '') + '"><b>Registro</b><small>final</small></button></div>';
  }

  function portada() {
    const t = totales();
    return '<section class="bt-portada">'
      + '<p class="bt-transmision"><i></i>Transmisión entrante · T-3 días para el despegue</p>'
      + '<p class="bt-sobre">Bitácora de tránsito temporal</p>'
      + '<p class="bt-consenso">Consenso internacional de expertos</p>'
      + '<h1 class="bt-titulo">Manejo quirúrgico del trauma abdominal</h1>'
      + '<div class="bt-panel bt-intro">'
      + '<p>Tripulante: en tres días la Máquina del Tiempo abrirá sus compuertas. Antes del despegue, recorre esta bitácora: <strong>4 fases y 20 puntos</strong> del manejo del abdomen abierto según el consenso internacional de expertos.</p>'
      + '<p class="suave">Cada punto tiene <span class="hueco-muestra">casillas en blanco</span>. Escribe la palabra que falta y pulsa <strong>Verificar</strong>. Tienes dos intentos por casilla; tu avance queda guardado en este dispositivo.</p>'
      + '<label class="bt-nombre"><span>Nombre del tripulante</span><input id="nombre" type="text" maxlength="60" placeholder="Escribe tu nombre" value="' + esc(E.nombre) + '" autocomplete="name"></label>'
      + '</div>'
      + '<ol class="bt-mapa">' + B.fases.map(f => {
        const hechos = f.puntos.filter(p => resueltoPunto(p.n)).length;
        return '<li><button type="button" data-vista="' + f.id + '" class="' + (resueltaFase(f) ? 'completa' : '') + '">'
          + '<span class="bt-fase-num">' + f.id + '</span><span class="bt-mapa-txt"><b>' + esc(f.nombre) + '</b><small>Puntos ' + f.puntos[0].n + ' a ' + f.puntos[f.puntos.length - 1].n + ' · ' + hechos + '/' + f.puntos.length + ' completos</small></span>'
          + '<span class="bt-barra"><i style="width:' + (hechos / f.puntos.length * 100) + '%"></i></span></button></li>';
      }).join('') + '</ol>'
      + '<div class="acciones"><button class="btn primario grande ancho latido" type="button" data-vista="' + siguienteFase() + '">' + (t.bien + t.reveladas ? 'Continuar la bitácora' : 'Abrir la bitácora') + '</button></div>'
      + '</section>';
  }
  function siguienteFase() { const f = B.fases.find(x => !resueltaFase(x)); return f ? f.id : 'final'; }

  function vistaFase(f) {
    const i = B.fases.indexOf(f), sig = B.fases[i + 1];
    return '<section class="bt-fase">'
      + '<div class="bt-panel bt-fase-cab">'
      + '<p class="bt-fase-etq"><span class="bt-radar"></span>Fase ' + f.id + '</p>'
      + '<h2>' + esc(f.nombre) + '</h2>'
      + '<p class="bt-objetivo"><b>Objetivo:</b> ' + esc(f.objetivo) + '</p>'
      + '<div class="bt-saltos">' + f.puntos.map(p => '<a href="#punto-' + p.n + '" class="' + (resueltoPunto(p.n) ? 'hecho' : '') + '">' + p.n + '</a>').join('') + '</div>'
      + '</div>'
      + f.puntos.map(punto).join('')
      + '<div class="acciones bt-fin-fase">'
      + (i > 0 ? '<button class="btn fantasma" type="button" data-vista="' + B.fases[i - 1].id + '">◀ Fase ' + B.fases[i - 1].id + '</button>' : '<button class="btn fantasma" type="button" data-vista="portada">◀ Inicio</button>')
      + '<button class="btn primario" type="button" data-vista="' + (sig ? sig.id : 'final') + '">' + (sig ? 'Fase ' + sig.id + ' ▶' : 'Registro final ▶') + '</button>'
      + '</div></section>';
  }

  function punto(p) {
    const t = plantillas[p.n], cs = casillasPorPunto[p.n];
    const hechas = cs.filter(c => ['bien', 'revelada', 'libre'].includes(E.estado[c.id])).length;
    const completo = hechas === cs.length;
    return '<article class="bt-punto' + (completo ? ' completo' : '') + '" id="punto-' + p.n + '" data-n="' + p.n + '">'
      + '<header class="bt-punto-cab"><span class="bt-num">' + p.n + '.</span><div>'
      + '<h3>' + conCasillas(t.titulo) + '</h3>'
      + t.descripcion.map(d => '<p class="bt-desc">' + conCasillas(d) + '</p>').join('')
      + '</div></header>'
      + '<div class="bt-cuerpo">'
      + '<ul class="bt-conceptos">' + t.conceptos.map((c, k) => '<li><span class="bt-ico">' + icono(p.conceptos[k].t) + '</span><div><b>' + conCasillas(c.t) + '</b><p>' + conCasillas(c.d) + '</p></div></li>').join('') + '</ul>'
      + '<aside class="bt-lado">' + ABDOMEN
      + (t.lista.length ? '<ul class="bt-lista">' + t.lista.map(l => '<li>' + conCasillas(l) + '</li>').join('') + '</ul>' : '')
      + (t.descripcion2 ? '<p class="bt-clave">' + conCasillas(t.descripcion2) + '</p>' : '')
      + (t.clave ? '<p class="bt-clave">' + conCasillas(t.clave) + '</p>' : '')
      + '</aside></div>'
      + '<div class="bt-acciones"><span class="bt-alerta" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 6l20 36H4z"/><path d="M24 19v11M24 35v1"/></svg></span><div><b>Acciones clave</b><p>' + conCasillas(t.acciones) + '</p></div></div>'
      + '<footer class="bt-punto-pie"><span class="bt-estado">' + (completo ? '✓ Registro completo' : hechas + '/' + cs.length + ' casillas') + '</span>'
      + '<button class="btn contorno pequeno" type="button" data-escuchar="' + p.n + '">▶ Escuchar</button>'
      + (completo ? '' : '<button class="btn primario pequeno" type="button" data-verificar="' + p.n + '">Verificar</button>')
      + '</footer><p class="bt-msg" id="msg-' + p.n + '" aria-live="polite"></p>'
      + '</article>';
  }

  function vistaFinal() {
    const t = totales(), completo = t.bien + t.reveladas === t.total;
    const pct = Math.round(t.bien / t.total * 100);
    return '<section class="bt-final">'
      + '<div class="bt-panel bt-certificado">'
      + '<p class="bt-transmision"><i></i>' + (completo ? 'Bitácora sincronizada' : 'Bitácora en curso') + '</p>'
      + '<h2>' + (completo ? 'Listo para el despegue' : 'Aún hay casillas por resolver') + '</h2>'
      + '<p class="bt-tripulante">' + (E.nombre ? 'Tripulante: <b>' + esc(E.nombre) + '</b>' : '<button class="btn-texto" type="button" data-vista="portada">Agrega tu nombre en la portada</button>') + '</p>'
      + '<div class="bt-metricas">'
      + '<div><b>' + t.bien + '</b><small>correctas</small></div>'
      + '<div><b>' + t.reveladas + '</b><small>reveladas</small></div>'
      + '<div><b>' + (t.total - t.bien - t.reveladas) + '</b><small>pendientes</small></div>'
      + '<div><b>' + pct + '%</b><small>precisión</small></div></div>'
      + B.fases.map(f => '<div class="bt-fila-fase"><span>Fase ' + f.id + ' · ' + esc(f.nombre) + '</span><button class="btn-texto" type="button" data-vista="' + f.id + '">' + f.puntos.filter(p => resueltoPunto(p.n)).length + '/' + f.puntos.length + ' ▶</button></div>').join('')
      + '<p class="suave bt-nota">Lleva esta bitácora en tu memoria: en la Máquina del Tiempo la necesitarás para abrir las estaciones.</p>'
      + '<div class="acciones"><button class="btn primario" type="button" id="descargar">⇩ Descargar mi bitácora</button>'
      + '<button class="btn fantasma" type="button" id="reiniciar">Reiniciar</button></div>'
      + '</div></section>';
  }

  /* ------------------------------------------------------------ navegación */
  function pintar(scrollArriba) {
    callar();
    const f = B.fases.find(x => x.id === E.vista);
    $escena.innerHTML = E.vista === 'final' ? vistaFinal() : f ? vistaFase(f) : portada();
    $escena.dataset.pantalla = E.vista;
    pintarPestanas(); pintarContador();
    if (scrollArriba !== false) window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function ir(v) {
    if (v === E.vista) { window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' }); return; }
    if (E.vista === 'portada' && !S.activo) { let pref = null; try { pref = localStorage.getItem('mdt-cdr-sonido'); } catch (e) {} if (pref !== '0') S.encender(); }
    S.giro();
    E.vista = v; guardar();
    if (reducido) { pintar(); return; }
    $escena.classList.add('sale');
    setTimeout(() => { pintar(); $escena.classList.remove('sale'); $escena.classList.add('entra'); setTimeout(() => $escena.classList.remove('entra'), 360); }, 180);
  }

  /* ---------------------------------------------------------- verificación */
  function verificar(n) {
    const art = document.getElementById('punto-' + n), msg = document.getElementById('msg-' + n);
    let bien = 0, mal = 0, vacias = 0, reveladas = 0;
    casillasPorPunto[n].forEach(c => {
      const st = E.estado[c.id];
      if (st === 'bien' || st === 'revelada' || st === 'libre') return;
      const v = (E.resp[c.id] || '').trim();
      if (!v) { vacias++; return; }
      if (!c.validas) { E.estado[c.id] = 'libre'; bien++; return; }
      if (c.validas.some(x => norm(x) === norm(v))) { E.estado[c.id] = 'bien'; bien++; return; }
      E.intentos[c.id] = (E.intentos[c.id] || 0) + 1;
      if (E.intentos[c.id] >= 2) { E.estado[c.id] = 'revelada'; E.resp[c.id] = c.validas[0]; reveladas++; }
      else { E.estado[c.id] = 'mal'; mal++; }
    });
    guardar();
    const completo = resueltoPunto(n);
    // repintar solo el punto
    const p = B.fases.reduce((a, f) => a || f.puntos.find(x => x.n === n), null);
    const tmp = document.createElement('div'); tmp.innerHTML = punto(p);
    art.replaceWith(tmp.firstChild);
    const nuevo = document.getElementById('punto-' + n), m2 = document.getElementById('msg-' + n);
    let texto = '';
    if (completo) { texto = '✓ Registro ' + n + ' completo. ' + (reveladas ? 'Revisa las respuestas reveladas en ámbar.' : '¡Excelente precisión!'); nuevo.classList.add('recien'); sonidoOk(); }
    else if (vacias && !bien && !mal && !reveladas) texto = 'Completa las casillas en blanco antes de verificar.';
    else {
      const partes = [];
      if (bien) partes.push(bien + ' correcta' + (bien > 1 ? 's' : ''));
      if (mal) partes.push(mal + ' por corregir (te queda 1 intento)');
      if (reveladas) partes.push(reveladas + ' revelada' + (reveladas > 1 ? 's' : ''));
      if (vacias) partes.push(vacias + ' sin llenar');
      texto = partes.join(' · ');
      if (mal) nuevo.querySelectorAll('.hueco.mal').forEach(h => { h.classList.add('sacudir'); setTimeout(() => h.classList.remove('sacudir'), 450); });
    }
    m2.textContent = texto;
    pintarContador(); pintarPestanas();
    actualizarSaltos();
  }
  function actualizarSaltos() {
    document.querySelectorAll('.bt-saltos a').forEach(a => { const n = +a.getAttribute('href').split('-')[1]; a.classList.toggle('hecho', resueltoPunto(n)); });
  }
  function sonidoOk() {
    if (!S.activo) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext, c = new AC(), t = c.currentTime;
      [880, 1318.5, 1760].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * 0.09); g.gain.linearRampToValueAtTime(0.05, t + i * 0.09 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.9); o.connect(g); g.connect(c.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 1); });
      setTimeout(() => c.close(), 1500);
    } catch (e) {}
  }

  /* ---------------------------------------------------------------- voz */
  // 1) Locución grabada: audio/bitacora/punto-N.mp3  2) Respaldo: voz masculina del dispositivo
  const voz = window.speechSynthesis;
  const MASC = /(jorge|juan|diego|carlos|pablo|ra[uú]l|gerardo|enrique|andr[eé]s|alonso|jos[eé]|miguel|antonio|[aá]lvaro|dar[ií]o|tom[aá]s|federico|lucas|mateo|alberto|male|hombre|masculin)/i;
  const FEM = /(paulina|m[oó]nica|helena|laura|sabina|paloma|elvira|dalia|camila|salom[eé]|female|mujer|femenin|marisol|lupe|isabela|ximena|elena|luc[ií]a|sof[ií]a|catalina|valentina|francisca)/i;
  let locucion = null, botonVoz = null;
  function callar() {
    if (locucion) { locucion.pause(); locucion = null; }
    if (voz) voz.cancel();
    S.bajar(false);
    if (botonVoz) { botonVoz.textContent = '▶ Escuchar'; botonVoz = null; }
  }
  function textoPunto(p) {
    const limpio = s => String(s).replace(/\[\[([^\]|]*)[^\]]*\]\]/g, (m, a) => a || 'espacio en blanco').replace(/™/g, '');
    return [p.n + '. ' + limpio(p.titulo) + '.'].concat((p.descripcion || []).map(limpio), (p.lista || []).map(limpio), p.descripcion2 ? [limpio(p.descripcion2)] : [],
      p.conceptos.map(c => limpio(c.t) + '. ' + limpio(c.d)), p.clave ? [limpio(p.clave)] : [], ['Acciones clave. ' + limpio(p.acciones)]).join(' ');
  }
  function escuchar(n, boton) {
    if (botonVoz === boton) { callar(); return; }
    callar();
    const p = B.fases.reduce((a, f) => a || f.puntos.find(x => x.n === n), null);
    botonVoz = boton; boton.textContent = '■ Detener'; S.bajar(true);
    const a = new Audio('audio/bitacora/punto-' + n + '.mp3'); locucion = a;
    a.onended = () => { if (locucion === a) callar(); };
    a.play().catch(() => {
      if (locucion !== a) return; locucion = null;
      if (!voz) { callar(); return; }
      const u = new SpeechSynthesisUtterance(textoPunto(p)); u.lang = 'es-CO'; u.rate = 1.02;
      const vs = voz.getVoices().filter(v => /^es/i.test(v.lang));
      const pts = v => (MASC.test(v.name) ? 100 : 0) - (FEM.test(v.name) ? 100 : 0) + (/es-(CO|MX|US|419)/i.test(v.lang) ? 10 : 0);
      const v = vs.sort((x, y) => pts(y) - pts(x))[0];
      if (v) { u.voice = v; u.lang = v.lang; }
      u.pitch = v && MASC.test(v.name) ? 0.95 : 0.7;
      u.onend = u.onerror = () => callar();
      voz.speak(u);
    });
  }
  if (voz) voz.getVoices();

  /* -------------------------------------------------------------- eventos */
  document.addEventListener('click', e => {
    const v = e.target.closest('[data-vista]'); if (v) { ir(v.getAttribute('data-vista')); return; }
    const ver = e.target.closest('[data-verificar]'); if (ver) { verificar(+ver.getAttribute('data-verificar')); return; }
    const es = e.target.closest('[data-escuchar]'); if (es) { escuchar(+es.getAttribute('data-escuchar'), es); return; }
    const salto = e.target.closest('.bt-saltos a');
    if (salto) { e.preventDefault(); const d = document.querySelector(salto.getAttribute('href')); if (d) d.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' }); return; }
    if (e.target.id === 'descargar') { window.print(); return; }
    if (e.target.id === 'reiniciar') {
      if (e.target.dataset.confirmar) { const nombre = E.nombre; E = Object.assign({}, vacio, { nombre: nombre, vista: 'portada' }); guardar(); pintar(); }
      else { e.target.dataset.confirmar = '1'; e.target.textContent = '¿Seguro? Toca de nuevo'; }
    }
  });
  document.addEventListener('input', e => {
    const h = e.target.closest('.hueco');
    if (h) { E.resp[h.dataset.id] = h.value; if (E.estado[h.dataset.id] === 'mal') { E.estado[h.dataset.id] = ''; h.classList.remove('mal'); } guardar(); return; }
    if (e.target.id === 'nombre') { E.nombre = e.target.value.trim(); guardar(); }
  });
  document.addEventListener('keydown', e => {
    const h = e.target.closest('.hueco');
    if (h && e.key === 'Enter') { e.preventDefault(); verificar(+h.dataset.id.slice(1).split('-')[0]); }
  });

  // Encabezado de impresión (bitácora descargable)
  const imp = document.createElement('div'); imp.className = 'bt-imprimir';
  window.addEventListener('beforeprint', () => {
    const t = totales();
    imp.innerHTML = '<b>Bitácora de tránsito temporal · Consenso internacional de expertos</b><span>Tripulante: ' + esc(E.nombre || '—') + ' · ' + (t.bien + t.reveladas) + '/' + t.total + ' casillas · ' + new Date().toLocaleDateString('es-CO') + '</span>';
    document.body.classList.add('imprimiendo');
    $escena.innerHTML = B.fases.map(vistaFase).join('');
    $escena.prepend(imp);
  });
  window.addEventListener('afterprint', () => { document.body.classList.remove('imprimiendo'); pintar(false); });

  if (!['portada', 'final'].concat(B.fases.map(f => f.id)).includes(E.vista)) E.vista = 'portada';
  pintar();
})();
