/* ==========================================================================
   CIERRE DE RUTA · el juego de 5 postales en versión digital
   Máquina del Tiempo · Cirugía del Futuro
   Metodología y diseño: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------ contenido */
  const POSTALES = [
    {
      etapa: 'Minuto cero',
      producto: 'Control de daños',
      titulo: 'El presente cero',
      subtitulo: 'El control de daños comienza antes del cierre',
      imagen: 'img/cierre-de-ruta/postal-1.jpg',
      alt: 'Paciente crítico en camilla con collar cervical y líquidos endovenosos, en estilo radiográfico.',
      texto: [
        'El objetivo inicial no es reconstruir, sino preservar la vida. Cuando aparecen los signos de la tríada letal (hipotermia, acidosis y coagulopatía), el paciente ha entrado en un escenario donde la fisiología tiene prioridad sobre la anatomía. En este momento, el abdomen abierto se convierte en una estrategia terapéutica que permite controlar la hemorragia, limitar la contaminación, corregir alteraciones metabólicas críticas y ganar tiempo para recuperar la estabilidad fisiológica del paciente. La decisión de mantener el abdomen abierto no representa un fracaso del procedimiento quirúrgico, sino una intervención deliberada que busca evitar el deterioro progresivo del paciente y aumentar las posibilidades de recuperación.',
        'Diversas recomendaciones internacionales reconocen el abdomen abierto como parte esencial de la cirugía de control de daños en pacientes con sepsis abdominal, trauma complejo, hipertensión intraabdominal o síndrome compartimental abdominal. Antes de pensar en reconstruir la pared abdominal, es indispensable restaurar la fisiología del paciente.'
      ],
      clave: 'El futuro de la pared abdominal se define desde el minuto cero.',
      referencias: [
        'Coccolini F, Ottolino P, Berrevoet F, et al. Negative pressure therapy for open abdominal management in nontraumatic and traumatic emergency surgery: international expert recommendations. International Journal of Surgery Open. 2026.',
        'Roberts DJ, Leppäniemi A, Tolonen M, et al. The open abdomen in trauma, acute care and vascular surgery. BJS Open. Referenciado en recomendaciones internacionales.'
      ]
    },
    {
      etapa: 'Cierre temporal',
      producto: 'AbThera™',
      titulo: 'No todos los cierres temporales son iguales',
      subtitulo: 'Preservar el dominio abdominal para preservar el futuro del paciente',
      imagen: 'img/cierre-de-ruta/postal-2.jpg',
      alt: 'Equipo de atención prehospitalaria trasladando a un paciente en camilla desde una ambulancia.',
      texto: [
        'Una vez tomada la decisión de realizar control de daños, la selección del método de cierre temporal determina gran parte del desenlace posterior. Las recomendaciones internacionales identifican la terapia de presión negativa como el método preferido para el manejo del abdomen abierto debido a su capacidad para remover fluidos, reducir edema, proteger las vísceras, preservar el dominio abdominal y facilitar el cierre fascial definitivo.',
        'AbThera™ fue diseñado específicamente para responder a estas necesidades mediante una capa protectora visceral fenestrada y un sistema cerrado que aísla y protege el contenido abdominal mientras favorece la recuperación fisiológica. Para el paciente, esto significa una mejor oportunidad de alcanzar cierre fascial primario, menor retracción fascial y una menor probabilidad de evolucionar hacia abdomen congelado o pérdida de dominio abdominal.'
      ],
      clave: 'La oportunidad de un cierre fascial exitoso comienza con la elección correcta del cierre temporal.',
      referencias: [
        'Cheatham ML, Demetriades D, Fabian TC, et al. Prospective study examining clinical outcomes associated with a negative pressure wound therapy system and Barker\'s vacuum packing technique. World Journal of Surgery. 2013.',
        'Atema JJ, Gans SL, Boermeester MA. Systematic Review and Meta-analysis of the Open Abdomen and Temporary Abdominal Closure Techniques. World Journal of Surgery. 2015.',
        'Coccolini F, et al. International Expert Recommendations. International Journal of Surgery Open. 2026.'
      ]
    },
    {
      etapa: 'Seguimiento',
      producto: 'AbThera™ Advance · Cavilon™',
      titulo: 'La técnica no termina en el quirófano',
      subtitulo: 'La tensión medial, el tiempo y la protección de la piel cambian el desenlace',
      imagen: 'img/cierre-de-ruta/postal-3.jpg',
      alt: 'Imagen radiográfica de la pared abdominal y la columna con una zona inflamada resaltada.',
      texto: [
        'El éxito del abdomen abierto depende tanto de la técnica quirúrgica como del seguimiento posterior. AbThera™ Advance está diseñado para proporcionar tensión medial bajo presión negativa, ayudando a aproximar los bordes fasciales, minimizar la retracción de la fascia y preservar el dominio abdominal mientras el paciente recupera estabilidad fisiológica.',
        'Paralelamente, el equipo debe monitorear activamente variables críticas como el drenaje, la evolución del edema, la presión intraabdominal, el estado hemodinámico y la necesidad de reexploraciones tempranas dentro de las primeras 24 a 72 horas.',
        'En esta misma etapa cobra importancia la protección de la piel. Cavilon™ Película Protectora Sin Ardor ayuda a proteger la integridad cutánea frente a humedad, adhesivos, fricción y cizallamiento relacionados con dispositivos médicos, apósitos y drenajes, contribuyendo a disminuir el riesgo de lesiones cutáneas asociadas a adhesivos médicos (MARSI) y lesiones asociadas a humedad. Mantener una piel íntegra reduce interrupciones terapéuticas.'
      ],
      clave: 'Preservar el dominio abdominal, proteger la piel y actuar dentro de las ventanas críticas de seguimiento son decisiones que acercan al paciente al cierre definitivo.',
      referencias: [
        'Coccolini F, et al. International Expert Recommendations for Open Abdomen Management. International Journal of Surgery Open. 2026.',
        'Schmidt M, Hall C, Mercer D, Kieswetter K. Novel foam design actively draws wound edges together under negative pressure. SAWC/WHS Scientific Meeting. Referenciado en AbThera™ Advance.',
        'Información clínica de Cavilon™ Película Protectora Sin Ardor para prevención de MARSI y lesiones asociadas a humedad.'
      ]
    },
    {
      etapa: 'Proteger la incisión',
      producto: 'Prevena™',
      titulo: 'Proteger el resultado quirúrgico',
      subtitulo: 'Reducir el riesgo también es parte de la cirugía',
      imagen: 'img/cierre-de-ruta/postal-4.jpg',
      alt: 'Figura humana completa en estilo radiográfico con zonas de riesgo resaltadas en el abdomen.',
      texto: [
        'El cierre fascial marca el comienzo de una nueva etapa donde el objetivo es proteger el resultado obtenido. La evaluación del riesgo debe considerar factores relacionados con el paciente, como obesidad, diabetes, tabaquismo, inmunosupresión, trauma, sepsis o estado crítico, así como factores relacionados con la intervención quirúrgica, incluyendo procedimientos de emergencia, duración prolongada de la cirugía, contaminación, laparotomías extensas e incisiones sometidas a alta tensión. Cuando estos factores están presentes, aumenta significativamente la probabilidad de complicaciones del sitio quirúrgico.',
        'En estos escenarios, Prevena™ se incorpora como una estrategia de terapia de presión negativa sobre incisiones cerradas diseñada para ayudar a mantener los bordes aproximados, manejar exudado y actuar como barrera frente a contaminación externa. Los estudios clínicos incluidos en el compendio de evidencia reportan reducciones en complicaciones del sitio quirúrgico, infecciones y readmisiones en comparación con el cuidado estándar en pacientes de alto riesgo.'
      ],
      clave: 'Proteger la incisión hoy significa reducir las complicaciones que pueden comprometer la recuperación mañana.',
      referencias: [
        'Estudio PROMISES. Complicaciones del sitio quirúrgico y resultados a 90 días.',
        'Prevena™ Clinical and Economic Performance. Metaanálisis y reducción de riesgo de complicaciones.',
        'Guía clínica y selección de pacientes Prevena™.'
      ]
    },
    {
      etapa: 'Reconstrucción',
      producto: 'Veraflo™',
      titulo: 'Preparar el tejido para la reconstrucción',
      subtitulo: 'Cuando controlar la biocarga también acelera la recuperación',
      imagen: 'img/cierre-de-ruta/postal-5.jpg',
      alt: 'Corte de tejido blando con espuma de presión negativa y partículas de limpieza en el lecho de la herida.',
      texto: [
        'En pacientes con heridas complejas de tejidos blandos, contaminación significativa, tejido desvitalizado o elevada carga biológica, el objetivo ya no es solamente cerrar, sino preparar adecuadamente el lecho de la herida para favorecer la reconstrucción posterior.',
        'En este contexto, la Terapia Veraflo™ combina presión negativa con instilación controlada y ciclos automatizados de limpieza de la herida, ayudando a remover exudado, material infeccioso y detritos. Diversas publicaciones sobre NPWTi-d han reportado una formación más rápida de tejido de granulación y una mejor preparación del lecho de la herida en comparación con la terapia convencional de presión negativa, además de reducciones en el número de procedimientos requeridos para alcanzar cierre o cobertura definitiva. El valor clínico de esta estrategia radica en preparar el entorno biológico adecuado antes de reconstruir.'
      ],
      clave: 'La presión negativa limpia la herida; la instilación ayuda a transformar el entorno biológico. Juntas, crean las condiciones necesarias para llevar una herida compleja hacia la reconstrucción.',
      referencias: [
        'Kim PJ, Attinger CE, Crist BD, et al. Negative Pressure Wound Therapy With Instillation: International Consensus Guidelines.',
        'Gabriel A, Shores J, Bernstein B, et al. Clinical outcomes of NPWTi-d compared with conventional NPWT.',
        'Brinkert D, Ali M, Naud M, et al. Negative pressure wound therapy with saline instillation.'
      ]
    }
  ];
  const TOTAL = POSTALES.length;

  /* ------------------------------------------------------------- utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dos = n => String(n).padStart(2, '0');
  const leer = (k, d) => { try { const v = localStorage.getItem('mdt-cdr-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem('mdt-cdr-' + k, JSON.stringify(v)); } catch (e) {} };
  const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- estado */
  // indice: 0 = portada · 1..5 = postal · 6 = ruta cerrada
  let indice = 0, cara = 'frente', ocupado = false;
  const vistas = new Set(leer('vistas', []));

  const app = document.getElementById('app');
  app.innerHTML =
    '<header class="cdr-cab">'
    + '<a class="cdr-marca" href="index.html" aria-label="Inicio"><img src="img/solventum-logo.png" alt="Solventum"></a>'
    + '<div class="cdr-cab-txt"><b>Cierre de Ruta</b><small>Máquina del Tiempo</small></div>'
    + '<button class="btn-sonido" id="sonido" type="button" aria-pressed="false">♪</button>'
    + '<button class="btn-sonido" id="voz" type="button" aria-pressed="false" aria-label="Escuchar">▶<span class="txt-largo"> Escuchar</span></button>'
    + '</header>'
    + '<nav class="cdr-ruta" id="ruta" aria-label="Las 5 postales"></nav>'
    + '<main class="cdr-escena" id="escena"></main>';

  const $ruta = document.getElementById('ruta');
  const $escena = document.getElementById('escena');
  const $voz = document.getElementById('voz');
  const S = window.SONIDO_RUTA || { giro() {}, bajar() {}, encender() {}, enlazar() {} };
  S.enlazar(document.getElementById('sonido'));

  /* ------------------------------------------------------------ la ruta */
  function pintarRuta() {
    let h = '<div class="cdr-ruta-in"><ol>';
    POSTALES.forEach((p, i) => {
      const n = i + 1;
      const cls = (n === indice ? ' actual' : '') + (vistas.has(n) ? ' vista' : '');
      h += '<li class="cdr-parada' + cls + '"><button type="button" data-ir="' + n + '" aria-label="Postal ' + n + ': ' + esc(p.titulo) + '"'
        + (n === indice ? ' aria-current="step"' : '') + '>'
        + '<span class="cdr-punto">' + dos(n) + '</span><span class="cdr-etapa">' + esc(p.etapa) + '</span></button></li>';
    });
    const act = POSTALES[indice - 1];
    h += '</ol><div class="cdr-progreso"><i style="width:' + (Math.min(indice, TOTAL) - 1) / (TOTAL - 1) * 100 + '%"></i></div></div>'
      + '<p class="cdr-ruta-actual">' + (act ? dos(indice) + ' · ' + esc(act.etapa) : 'Ruta completa') + '</p>';
    $ruta.innerHTML = h;
    $ruta.classList.toggle('oculto', indice === 0);
  }

  /* ------------------------------------------------------------ vistas */
  function portada() {
    return '<section class="cdr-portada">'
      + '<img class="cdr-emblema" src="img/cierre-de-ruta/emblema.png" alt="">'
      + '<p class="sobretitulo centro">Máquina del Tiempo · Cirugía del Futuro</p>'
      + '<h1 class="titulo-juego cdr-titulo">Cierre de Ruta</h1>'
      + '<p class="subtitulo-juego">5 postales · del minuto cero a la reconstrucción</p>'
      + '<div class="hud cdr-intro">'
      + '<p>La misión terminó, pero el paciente sigue su camino. Estas cinco postales recorren la ruta completa del abdomen abierto: desde la decisión de no cerrar hasta la preparación del tejido para reconstruir.</p>'
      + '<p class="suave">Lee el frente de cada postal y gírala para descubrir su mensaje clave y la evidencia que lo respalda.</p>'
      + '</div>'
      + '<ol class="cdr-indice">'
      + POSTALES.map((p, i) => '<li><button type="button" data-ir="' + (i + 1) + '" class="' + (vistas.has(i + 1) ? 'vista' : '') + '">'
        + '<span class="cdr-num">' + dos(i + 1) + '</span><span><b>' + esc(p.titulo) + '</b><small>' + esc(p.producto) + '</small></span></button></li>').join('')
      + '</ol>'
      + '<div class="acciones"><button class="btn primario grande ancho latido" type="button" data-ir="1">Iniciar el recorrido</button></div>'
      + '</section>';
  }

  function postal(n) {
    const p = POSTALES[n - 1];
    const cab = '<div class="cdr-postal-cab"><span>Postal ' + dos(n) + ' / ' + dos(TOTAL) + '</span><span class="cdr-chip">' + esc(p.producto) + '</span></div>';
    let cuerpo;
    if (cara === 'frente') {
      cuerpo = cab
        + '<h2 class="cdr-h2">' + esc(p.titulo) + '</h2>'
        + '<p class="cdr-sub">' + esc(p.subtitulo) + '</p>'
        + '<div class="cdr-pulso" aria-hidden="true"></div>'
        + '<div class="cdr-frente">'
        + '<figure class="cdr-figura cdr-figura-' + n + '"><img src="' + p.imagen + '" alt="' + esc(p.alt) + '"></figure>'
        + '<div class="cdr-texto">' + p.texto.map(t => '<p>' + resaltar(esc(t)) + '</p>').join('') + '</div>'
        + '</div>';
    } else {
      cuerpo = cab
        + '<p class="cdr-mensaje-etq">Mensaje clave</p>'
        + '<blockquote class="cdr-mensaje">' + esc(p.clave) + '</blockquote>'
        + '<div class="cdr-pulso" aria-hidden="true"></div>'
        + '<h3 class="cdr-ref-tit">Referencias</h3>'
        + '<ol class="cdr-refs">' + p.referencias.map(r => '<li>' + esc(r) + '</li>').join('') + '</ol>';
    }
    return '<article class="hud cdr-postal ' + cara + '" id="postal" aria-live="polite">' + cuerpo + '</article>'
      + '<div class="cdr-controles">'
      + '<button class="btn fantasma" type="button" data-ir="' + (n - 1) + '" aria-label="Anterior">◀<span class="txt-largo"> Anterior</span></button>'
      + '<button class="btn contorno cdr-girar" type="button" id="girar">⟲ ' + (cara === 'frente' ? 'Ver reverso' : 'Ver frente') + '</button>'
      + '<button class="btn primario" type="button" data-ir="' + (n + 1) + '" aria-label="Siguiente">' + (n === TOTAL ? 'Cerrar ruta' : '<span class="txt-largo">Siguiente </span>▶') + '</button>'
      + '</div>'
      + '<p class="cdr-ayuda suave centro">Desliza para cambiar de postal · toca «Ver reverso» para girarla</p>';
  }

  function cierre() {
    return '<section class="cdr-cierre">'
      + '<img class="cdr-emblema" src="img/cierre-de-ruta/emblema.png" alt="">'
      + '<p class="sobretitulo centro">Recorrido completo</p>'
      + '<h1 class="titulo-juego cdr-titulo">Ruta cerrada</h1>'
      + '<p class="subtitulo-juego">Cinco decisiones que acercan al paciente al cierre definitivo</p>'
      + '<ol class="cdr-linea">'
      + POSTALES.map((p, i) => '<li><button type="button" data-ir="' + (i + 1) + '">'
        + '<span class="cdr-num">' + dos(i + 1) + '</span>'
        + '<span class="cdr-linea-txt"><small>' + esc(p.etapa) + ' · ' + esc(p.producto) + '</small><b>' + esc(p.clave) + '</b></span></button></li>').join('')
      + '</ol>'
      + '<div class="acciones"><button class="btn contorno" type="button" data-ir="1">⟲ Volver a recorrer</button><a class="btn fantasma" href="index.html">Inicio</a></div>'
      + '</section>';
  }

  // Resalta los nombres de producto dentro del texto
  function resaltar(html) {
    return html.replace(/(AbThera™ Advance|AbThera™|Cavilon™ Película Protectora Sin Ardor|Prevena™|Terapia Veraflo™)/g, '<strong>$1</strong>');
  }

  /* ------------------------------------------------------------ navegación */
  function pintar() {
    callar();
    if (indice === 0) $escena.innerHTML = portada();
    else if (indice > TOTAL) $escena.innerHTML = cierre();
    else {
      $escena.innerHTML = postal(indice);
      vistas.add(indice); guardar('vistas', Array.from(vistas));
    }
    pintarRuta();
    $voz.classList.toggle('oculto', indice === 0 || indice > TOTAL);
    const h = indice === 0 ? '' : indice > TOTAL ? '#ruta-cerrada' : '#postal-' + indice;
    if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
  }

  function ir(n) {
    n = Math.max(0, Math.min(TOTAL + 1, n));
    if (n === indice || ocupado) return;
    const dir = n > indice ? 1 : -1;
    S.giro();
    indice = n; cara = 'frente';
    if (reducido) { pintar(); return; }
    ocupado = true;
    $escena.classList.add(dir > 0 ? 'sale-izq' : 'sale-der');
    setTimeout(() => {
      pintar();
      $escena.classList.remove('sale-izq', 'sale-der');
      $escena.classList.add(dir > 0 ? 'entra-der' : 'entra-izq');
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      setTimeout(() => { $escena.classList.remove('entra-der', 'entra-izq'); ocupado = false; }, 320);
    }, 200);
  }

  function girar() {
    if (ocupado || indice < 1 || indice > TOTAL) return;
    callar();
    S.giro();
    const art = document.getElementById('postal');
    if (reducido || !art) { cara = cara === 'frente' ? 'reverso' : 'frente'; pintar(); return; }
    ocupado = true;
    art.classList.add('gira-sale');
    setTimeout(() => {
      cara = cara === 'frente' ? 'reverso' : 'frente';
      pintar();
      const nuevo = document.getElementById('postal');
      nuevo.classList.add('gira-entra');
      const arriba = nuevo.getBoundingClientRect().top - 150;
      if (arriba < 0) window.scrollBy({ top: arriba, behavior: 'smooth' });
      setTimeout(() => { nuevo.classList.remove('gira-entra'); ocupado = false; }, 280);
    }, 260);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ir]');
    if (b) {
      // al iniciar el recorrido se enciende el ambiente, salvo que la persona lo haya apagado antes
      if (indice === 0 && !S.activo) { let pref = null; try { pref = localStorage.getItem('mdt-cdr-sonido'); } catch (e2) {} if (pref !== '0') S.encender(); }
      ir(parseInt(b.getAttribute('data-ir'), 10)); return;
    }
    if (e.target.closest('#girar')) girar();
    if (e.target.closest('#voz')) alternarVoz();
  });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') ir(indice + 1);
    else if (e.key === 'ArrowLeft') ir(indice - 1);
    else if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('button, a') && indice >= 1 && indice <= TOTAL) { e.preventDefault(); girar(); }
  });

  // gestos: deslizar a los lados
  let x0 = null, y0 = null;
  $escena.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  $escena.addEventListener('touchend', e => {
    if (x0 == null || indice < 1 || indice > TOTAL) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) ir(indice + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ------------------------------------------------------------ voz */
  // 1) Locución grabada (voz masculina de ElevenLabs): audio/voz/postal-N-frente.mp3 y -reverso.mp3
  // 2) Respaldo: voz del dispositivo, eligiendo siempre una masculina en español si existe.
  const voz = window.speechSynthesis;
  const MASCULINAS = /(jorge|juan|diego|carlos|pablo|ra[uú]l|gerardo|enrique|andr[eé]s|alonso|jos[eé]|miguel|antonio|[aá]lvaro|dar[ií]o|tom[aá]s|federico|lucas|mateo|alberto|eddy|reed|rocko|grandpa|male|hombre|masculin)/i;
  const FEMENINAS = /(paulina|m[oó]nica|helena|laura|sabina|paloma|elvira|dalia|camila|salom[eé]|female|mujer|femenin|marisol|lupe|isabela|ximena|elena|luc[ií]a|sof[ií]a|catalina|valentina|francisca)/i;
  let locucion = null;
  function elegirVoz() {
    if (!voz) return null;
    const vs = voz.getVoices().filter(v => /^es/i.test(v.lang));
    const puntos = v => (MASCULINAS.test(v.name) ? 100 : 0) - (FEMENINAS.test(v.name) ? 100 : 0) + (/es-(CO|MX|US|419)/i.test(v.lang) ? 10 : 0) + (v.localService ? 0 : 2);
    return vs.sort((a, b2) => puntos(b2) - puntos(a))[0] || null;
  }
  function marcarBoton(sonando) {
    $voz.innerHTML = sonando ? '■<span class="txt-largo"> Detener</span>' : '▶<span class="txt-largo"> Escuchar</span>';
    $voz.setAttribute('aria-pressed', sonando ? 'true' : 'false');
  }
  function callar() {
    if (locucion) { locucion.pause(); locucion = null; }
    if (voz) voz.cancel();
    S.bajar(false);
    marcarBoton(false);
  }
  function hablarDispositivo(p) {
    if (!voz) { marcarBoton(false); S.bajar(false); return; }
    const txt = cara === 'frente' ? [p.titulo + '.', p.subtitulo + '.'].concat(p.texto).join(' ') : 'Mensaje clave. ' + p.clave;
    const u = new SpeechSynthesisUtterance(txt.replace(/™/g, ''));
    u.lang = 'es-CO'; u.rate = 1.02;
    const v = elegirVoz(); if (v) { u.voice = v; u.lang = v.lang; }
    u.pitch = v && MASCULINAS.test(v.name) ? 0.95 : 0.7;   // sin voz masculina en el equipo: tono más grave
    u.onend = u.onerror = () => { S.bajar(false); marcarBoton(false); };
    voz.speak(u);
  }
  function alternarVoz() {
    if (locucion || (voz && voz.speaking)) { callar(); return; }
    const p = POSTALES[indice - 1]; if (!p) return;
    S.bajar(true); marcarBoton(true);
    const a = new Audio('audio/voz/postal-' + indice + '-' + cara + '.mp3');
    locucion = a;
    a.onended = () => { if (locucion === a) { locucion = null; S.bajar(false); marcarBoton(false); } };
    a.play().catch(() => { if (locucion === a) { locucion = null; hablarDispositivo(p); } });
  }
  if (voz) { voz.getVoices(); voz.onvoiceschanged = () => {}; }

  /* ------------------------------------------------------------ inicio */
  function desdeHash() {
    const m = /^#postal-(\d)$/.exec(location.hash);
    if (m) return Math.min(TOTAL, Math.max(1, +m[1]));
    if (location.hash === '#ruta-cerrada') return TOTAL + 1;
    return 0;
  }
  indice = desdeHash();
  pintar();
  window.addEventListener('hashchange', () => { const n = desdeHash(); if (n !== indice) { indice = n; cara = 'frente'; pintar(); } });
})();
