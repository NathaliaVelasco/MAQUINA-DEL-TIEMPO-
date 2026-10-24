/* ==========================================================================
   DEMO DEL ECOSISTEMA · recorrido guiado para presentar la experiencia
   Muestra la ruta completa, las 6 pantallas, el diagnóstico y los roles, con cada
   pantalla funcionando en vivo dentro de un marco de celular o de pantalla.
   En la esquina, una nota con las claves de la sesión para la demostración
   (se abre con el PIN del Guía Especialista).
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego, app = document.getElementById('app');

  const PANTALLAS = [
    { id: 'bitacora', nombre: 'Bitácora', archivo: 'bitacora.html', marco: 'celular', quien: 'Cada participante, en su celular o computador',
      cuando: '3 días antes de la experiencia (se envía el enlace)',
      que: ['Transmisión de expectativa: 4 fases y 20 puntos del consenso internacional de expertos.', 'Completa 44 casillas que se verifican (2 intentos por casilla).', 'El avance queda guardado en su dispositivo y al final descarga su bitácora.'],
      enlace: 'https://www.experienciasimone.com/maquina-del-tiempo/bitacora.html' },
    { id: 'guia', nombre: 'Guía Especialista', archivo: 'guia.html', marco: 'celular', quien: 'Personal de Solventum a cargo de la maleta',
      cuando: 'Antes, durante y después de la sesión',
      que: ['Entra con su PIN: es el administrador del juego.', 'Genera los dos códigos (registro y Sala de Escape) y proyecta sus QR.', 'Ve los 4 grupos en vivo: tripulación, diagnóstico, estación, reloj y puntos.', 'Puede liberar la Sala o revelar al ganador sin esperar a quienes falten por el diagnóstico.', 'Reinicia un grupo ante una falla técnica, descarga el Excel y abre una nueva sesión.'] },
    { id: 'entrada', nombre: 'Pórtico de Entrada', archivo: 'entrada.html', marco: 'celular', quien: 'Los 7 integrantes de cada grupo, en su propio celular',
      cuando: 'Al llegar (registro y diagnóstico inicial) y al terminar (diagnóstico final)',
      que: ['Escanean el QR (ya trae el código de registro).', 'Eligen su grupo, escriben nombre completo y profesión, toman su rol y aceptan la autorización de datos.', 'Responden el diagnóstico inicial: 10 preguntas con escala de certeza, una rutina de pensamiento y una imagen.', 'Reciben su credencial digital de misión y ven a su tripulación completarse.', 'Al cerrar la Estación 5 se abre ahí mismo el diagnóstico final, con su avance y el porqué de cada respuesta.'] },
    { id: 'sala', nombre: 'Sala de Escape', archivo: 'sala.html', marco: 'celular', quien: 'Solo el Comandante de Misión (Custodio Digital)',
      cuando: 'Durante el juego: bienvenida, Estaciones 1 a 5 y cierre',
      que: ['El Guardián de la Línea del Tiempo da la bienvenida con voz.', 'La Estación 1 se abre cuando toda la tripulación terminó el diagnóstico inicial.', 'Las estaciones se abren en orden; cada una corre 12 minutos (+30 s de gracia).', 'Muestra las tarjetas de instrucciones y lo que antes estaba en las paredes.', 'El Comandante digita los códigos: 2 intentos; si fallan, ve la respuesta correcta.', 'Al cerrar cada estación: puntaje, agilidad y retroalimentación con voz.'] },
    { id: 'tablero', nombre: 'El Gran Tablero', archivo: 'tablero.html', marco: 'pantalla', quien: 'Pantalla grande o televisor de la sala',
      cuando: 'Todo el tiempo, a la vista de todos',
      que: ['Ranking de los 4 grupos en vivo.', 'Estación en curso y reloj de cada grupo.', 'Puntos por estación y total sobre 100.', 'Revela al grupo ganador cuando todos terminan el diagnóstico final.'] },
    { id: 'cierre', nombre: 'Cierre de Ruta', archivo: 'cierre-de-ruta.html', marco: 'celular', quien: 'Cada participante, en su celular o computador',
      cuando: 'Después de la experiencia (se envía el enlace)',
      que: ['Las 5 postales en digital: del minuto cero a la reconstrucción.', 'Cada postal se gira: frente con ilustración y texto; reverso con mensaje clave y referencias.', 'Termina con la línea de tiempo de los 5 mensajes clave.'],
      enlace: 'https://www.experienciasimone.com/maquina-del-tiempo/cierre-de-ruta.html' }
  ];

  const MOMENTOS = [
    ['T−3', 'Bitácora de Tránsito Temporal', 'Expectativa: 3 días antes'],
    ['1', 'Pórtico de ingreso', 'Registro, diagnóstico inicial y bienvenida del Guardián'],
    ['2', 'Estación 1', 'El Umbral del Trauma'],
    ['3', 'Estación 2', 'El Enigma del Vacío'],
    ['4', 'Estación 3', 'El Taller del Cronógrafo'],
    ['5', 'Estación 4', 'El Vínculo de Vigilancia'],
    ['6', 'Estación 5', 'El Salto Temporal'],
    ['7', 'Diagnóstico final', 'Qué cambió en cada tripulante'],
    ['8', 'Cierre', 'Puntaje total y grupo ganador'],
    ['T+1', 'Cierre de Ruta', 'Las 5 postales, después de la experiencia']
  ];

  let sel = (location.hash || '').slice(1);
  if (!PANTALLAS.some(p => p.id === sel)) sel = 'guia';

  function marco(p) {
    const src = p.archivo + '?demo=1';
    if (p.marco === 'pantalla') {
      return '<div class="marco-pantalla"><div class="escala"><iframe title="' + M.esc(p.nombre) + '" src="' + src + '" loading="lazy"></iframe></div><span class="pie-tv"></span></div>';
    }
    return '<div class="marco-celular"><iframe title="' + M.esc(p.nombre) + '" src="' + src + '" loading="lazy"></iframe></div>';
  }

  function render() {
    const p = PANTALLAS.find(x => x.id === sel);
    const roles = Object.keys(J.roles).map(k => {
      const r = J.roles[k];
      return '<div class="rol-demo"><b>' + M.esc(r.nombre) + '</b><small>' + M.esc(r.subtitulo || '') + '</small>'
        + '<ul>' + (r.mision || []).map(m => '<li>' + M.esc(m) + '</li>').join('') + '</ul></div>';
    }).join('');

    app.innerHTML = '<header class="cabecera">' + M.logo() + '<div class="titulo-cab"><b>' + M.esc(J.titulo) + '</b><small>Demo del ecosistema digital</small></div></header>'
      + '<main class="pagina demo">'
      + '<section class="demo-intro"><p class="sobretitulo">Escape room médica híbrida</p><h1 class="titulo-juego">Así funciona el ecosistema</h1>'
      + '<p class="suave">La maleta trae el juego físico: fichas, cubos, candados y el kit AbThera™. El ecosistema digital asume el papel del facilitador: registra a los participantes, conduce las 5 estaciones en orden, controla el tiempo, valida los códigos y muestra los resultados en vivo.</p></section>'

      + '<section class="bloque"><p class="sobretitulo">La ruta completa</p><ol class="momentos">'
      + MOMENTOS.map(m => '<li><span class="num">' + m[0] + '</span><b>' + M.esc(m[1]) + '</b><small>' + M.esc(m[2]) + '</small></li>').join('') + '</ol></section>'

      + '<section class="bloque"><p class="sobretitulo">Las 6 pantallas · tóquelas para verlas funcionando</p>'
      + '<nav class="pestanas-demo">' + PANTALLAS.map(x => '<button data-p="' + x.id + '" class="' + (x.id === sel ? 'sel' : '') + '">' + M.esc(x.nombre) + '</button>').join('') + '</nav>'
      + '<div class="demo-grid ' + (p.marco === 'pantalla' ? 'ancha' : '') + '">'
      + '<div class="hud demo-info"><h2 class="seccion">' + M.esc(p.nombre) + '</h2>'
      + '<p><b>Quién:</b> ' + M.esc(p.quien) + '</p><p><b>Cuándo:</b> ' + M.esc(p.cuando) + '</p>'
      + '<ul class="lista-demo">' + p.que.map(t => '<li>' + M.esc(t) + '</li>').join('') + '</ul>'
      + '<div class="acciones" style="justify-content:flex-start"><a class="btn contorno pequeno" href="' + p.archivo + '" target="_blank" rel="noopener">ABRIR EN PANTALLA COMPLETA ↗</a>'
      + (p.enlace ? '<button class="btn fantasma pequeno" data-copiar="' + M.esc(p.enlace) + '">COPIAR ENLACE PARA ENVIAR</button>' : '') + '</div>'
      + (p.enlace ? '<p class="suave" style="font-size:12px;margin-top:8px;word-break:break-all">' + M.esc(p.enlace) + '</p>' : '')
      + '<p class="suave" style="font-size:12px;margin-top:10px">Las pantallas funcionan en vivo y se guardan en la sesión actual. Después de una demostración, el Guía Especialista toca "Nueva sesión" para dejar todo en cero.</p></div>'
      + marco(p) + '</div></section>'

      + '<section class="hud bloque"><p class="sobretitulo">Diagnóstico antes y después</p>'
      + '<p>Cada tripulante responde en su celular un diagnóstico individual antes de la Estación 1 y otro al cerrar la Estación 5. Mide qué cambió en lo que sabe, decide y piensa. No suma puntos al juego y su resultado individual es confidencial.</p>'
      + '<ul class="lista-demo">'
      + '<li><b>Saber y hacer:</b> 10 preguntas antes y 10 después, dos por estación (un concepto y un caso). Las opciones salen en orden distinto en cada celular y no se puede volver atrás.</li>'
      + '<li><b>Certeza:</b> después de cada respuesta, "Seguro · Creo que sí · Lo adivino". Así se distingue el dominio real del error con certeza.</li>'
      + '<li><b>Pensar:</b> antes, "Pienso que… · Me inquieta… · Quiero explorar…"; después, "Antes pensaba que… · Ahora pienso que…".</li>'
      + '<li><b>Expresar:</b> elige una imagen (reloj de arena, brújula, puente, red de seguridad, semilla o laberinto) y escribe una palabra.</li>'
      + '<li><b>Ritmo del juego:</b> la Sala se abre cuando toda la tripulación terminó el diagnóstico inicial; El Gran Tablero revela al ganador cuando todos envían el final. El Guía Especialista puede adelantar cualquiera de los dos.</li>'
      + '<li><b>Resultados:</b> al final cada persona ve su avance (antes → después) y el porqué de cada pregunta. El Excel del Guía trae cada respuesta con su certeza, las reflexiones y el resumen por persona.</li>'
      + '</ul><p class="suave" style="font-size:12px;margin-top:8px">Las respuestas correctas se califican en el servidor: nunca viajan al celular.</p>'
      + '</section>'

      + '<section class="bloque"><p class="sobretitulo">Los roles de cada tripulación (7 integrantes)</p><div class="roles-demo">' + roles + '</div></section>'

      + '<section class="hud bloque"><p class="sobretitulo">Reglas del juego</p><ul class="lista-demo">'
      + '<li>4 grupos de 7: 1 Líder Piloto, 1 Copiloto, 1 Comandante de Misión y 4 Tripulantes de Élite.</li>'
      + '<li>Las 5 estaciones se recorren en orden. Una estación ocupada por otro grupo no se abre (una sola maleta).</li>'
      + '<li>12 minutos por estación + 30 segundos de gracia. Si el reloj cierra la estación, esa estación queda en cero.</li>'
      + '<li>2 intentos por código. Al segundo error se muestra la respuesta correcta: el foco es aprender.</li>'
      + '<li>Cada estación vale 20 puntos: 14 por respuestas y hasta 6 por agilidad. Total: 100 puntos.</li>'
      + '</ul></section>'
      + '<p class="suave centro" style="margin:24px 0;font-size:13px">Metodología y diseño del juego: Nathalia Velasco · Simoné</p>'
      + '</main>' + notaClaves();
  }

  /* ------------------------------------------------------------------------
     Nota de claves (esquina inferior derecha) · solo para la demostración.
     Se abre con el PIN del Guía Especialista y muestra los dos códigos de la
     sesión y la respuesta de cada prueba. Las claves vienen de la base de
     datos (no están en este archivo).
     ------------------------------------------------------------------------ */
  let notaAbierta = M.leer('demo-nota', null), K = null, kErr = '';
  if (notaAbierta === null) notaAbierta = window.innerWidth > 900;   // en celular empieza minimizada
  function pinGuardado() { try { return sessionStorage.getItem('mdt-pin') || ''; } catch (e) { return ''; } }
  function notaClaves() {
    if (!notaAbierta) return '<aside class="nota-claves cerrada"><button class="nota-tab" data-k="abrir">🔑 CLAVES</button></aside>';
    let cuerpo;
    if (!K) {
      cuerpo = '<form data-k="form"><p>Escriba el PIN del Guía Especialista para ver las claves de esta sesión.</p>'
        + '<input type="password" id="kpin" class="entrada" placeholder="PIN" autocomplete="current-password">'
        + '<button class="btn primario pequeno" data-k="entrar" type="submit">VER CLAVES</button>'
        + '<p class="error">' + M.esc(kErr) + '</p></form>';
    } else {
      const porEst = {};
      K.claves.forEach(c => { (porEst[c.estacion] = porEst[c.estacion] || []).push(c); });
      cuerpo = '<dl class="nota-codigos"><dt>Código de registro</dt><dd>' + M.esc(K.codigo_acceso) + '</dd><dt>Código Sala de Escape</dt><dd>' + M.esc(K.codigo_sala) + '</dd></dl>'
        + Object.keys(porEst).map(e => {
            const c = M.estacion(e) || { numero: e, nombre: '' };
            return '<p class="nota-est">E' + c.numero + ' · ' + M.esc(c.nombre) + '</p><ul>'
              + porEst[e].map(x => '<li><span>' + M.esc(x.codigo) + '</span><b>' + M.esc(x.respuesta || '—') + '</b></li>').join('') + '</ul>';
          }).join('')
        + '<p class="nota-pie">Diagnóstico: cualquier respuesta sirve para avanzar en la demo.</p>'
        + '<div class="nota-acc"><button data-k="recargar">↻ ACTUALIZAR</button><button data-k="olvidar">OLVIDAR PIN</button></div>';
    }
    return '<aside class="nota-claves"><header><b>🔑 Claves de la demo</b><button data-k="cerrar" aria-label="Minimizar">–</button></header>'
      + '<div class="nota-cuerpo">' + cuerpo + '</div></aside>';
  }
  async function intentar(pin) {
    kErr = '';
    if (!pin) { kErr = 'Escriba el PIN.'; return; }
    try {
      const v = await M.rpc('mdt_admin', { p_pin: pin, p_accion: 'verificar', p_dato: null });
      const c = await M.rpc('mdt_admin', { p_pin: pin, p_accion: 'claves', p_dato: null });
      K = { codigo_acceso: v.codigo_acceso, codigo_sala: v.codigo_sala, claves: c.claves || [] };
      try { sessionStorage.setItem('mdt-pin', pin); } catch (e) {}
    } catch (e) { K = null; kErr = M.mensajeError(e); }
  }
  function repintarNota() { const n = app.querySelector('.nota-claves'); if (n) n.outerHTML = notaClaves(); }
  async function claves(ev) {
    const b = ev.target.closest('[data-k]'); if (!b || b.dataset.k === 'form') return;
    ev.preventDefault();
    const k = b.dataset.k;
    if (k === 'abrir' || k === 'cerrar') {
      notaAbierta = k === 'abrir'; M.guardar('demo-nota', notaAbierta);
      if (notaAbierta && !K && pinGuardado()) await intentar(pinGuardado());
      return repintarNota();
    }
    if (k === 'entrar') { await intentar(document.getElementById('kpin').value.trim()); return repintarNota(); }
    if (k === 'recargar') { await intentar(pinGuardado()); return repintarNota(); }
    if (k === 'olvidar') { K = null; try { sessionStorage.removeItem('mdt-pin'); } catch (e) {} return repintarNota(); }
  }
  app.addEventListener('submit', ev => { if (ev.target.closest('.nota-claves')) ev.preventDefault(); });
  /* Si el Guía ya entró con su PIN (aquí o en la pantalla del Guía), la nota se llena sola
     y se mantiene al día cuando se generan códigos nuevos. */
  setInterval(async () => {
    const pin = pinGuardado();
    if (!notaAbierta || !pin || document.hidden) return;
    const antes = JSON.stringify(K); await intentar(pin);
    if (JSON.stringify(K) !== antes) repintarNota();
  }, 8000);


  /* El Gran Tablero se diseña para 1600 × 900: se escala al ancho del marco. */
  function escalar() {
    const e = app.querySelector('.marco-pantalla .escala'); if (!e) return;
    const w = e.parentElement.clientWidth; e.style.transform = 'scale(' + (w / 1600) + ')';
    e.parentElement.style.height = (900 * w / 1600) + 'px';
  }
  window.addEventListener('resize', escalar);

  app.addEventListener('click', async ev => {
    const cp = ev.target.closest('[data-copiar]');
    if (cp) { try { await navigator.clipboard.writeText(cp.dataset.copiar); cp.textContent = '¡COPIADO!'; } catch (e) { prompt('Copien este enlace:', cp.dataset.copiar); } return; }
    if (ev.target.closest('.nota-claves')) return claves(ev);
    const b = ev.target.closest('[data-p]'); if (!b) return;
    sel = b.dataset.p; history.replaceState(null, '', '#' + sel);
    const y = window.scrollY; render(); escalar(); window.scrollTo(0, y);
  });
  render(); escalar();
  if (notaAbierta && pinGuardado()) intentar(pinGuardado()).then(repintarNota);
})();
