/* ==========================================================================
   DEMO DEL ECOSISTEMA · recorrido guiado para presentar la experiencia
   Muestra el flujo de 7 momentos, las 4 pantallas y los roles, con cada
   pantalla funcionando en vivo dentro de un marco de celular o de pantalla.
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego, app = document.getElementById('app');

  const PANTALLAS = [
    { id: 'guia', nombre: 'Guía Especialista', archivo: 'guia.html', marco: 'celular', quien: 'Personal de Solventum a cargo de la maleta',
      cuando: 'Antes, durante y después de la sesión',
      que: ['Entra con su PIN: es el administrador del juego.', 'Genera el código de acceso y proyecta los QR del Pórtico de Entrada y de la Sala de Escape.', 'Ve los 4 grupos en vivo: tripulación, estación, reloj y puntos.', 'Reinicia un grupo ante una falla técnica, descarga los resultados y abre una nueva sesión.'] },
    { id: 'entrada', nombre: 'Pórtico de Entrada', archivo: 'entrada.html', marco: 'celular', quien: 'Los 7 integrantes de cada grupo, en su propio celular',
      cuando: 'Al llegar, antes de cruzar el portal',
      que: ['Escanean el QR (ya trae el código de acceso).', 'Eligen su grupo, escriben nombre completo y profesión, y toman su rol.', 'Aceptan la autorización de tratamiento de datos.', 'Reciben su credencial digital de misión y ven a su tripulación completarse.'] },
    { id: 'sala', nombre: 'Sala de Escape', archivo: 'sala.html', marco: 'celular', quien: 'Solo el Comandante de Misión (Custodio Digital)',
      cuando: 'Durante el juego: bienvenida, Estaciones 1 a 5 y cierre',
      que: ['El Guardián de la Línea del Tiempo da la bienvenida con voz.', 'Las estaciones se abren en orden; cada una corre 12 minutos (+30 s de gracia).', 'Muestra las tarjetas de instrucciones y lo que antes estaba en las paredes.', 'El Comandante digita los códigos: 2 intentos; si fallan, ve la respuesta correcta.', 'Al cerrar cada estación: puntaje, agilidad y retroalimentación con voz.'] },
    { id: 'tablero', nombre: 'El Gran Tablero', archivo: 'tablero.html', marco: 'pantalla', quien: 'Pantalla grande o televisor de la sala',
      cuando: 'Todo el tiempo, a la vista de todos',
      que: ['Ranking de los 4 grupos en vivo.', 'Estación en curso y reloj de cada grupo.', 'Puntos por estación y total sobre 100.', 'Anuncia al grupo ganador al terminar.'] }
  ];

  const MOMENTOS = [
    ['1', 'Pórtico de ingreso', 'Registro y bienvenida del Guardián'],
    ['2', 'Estación 1', 'El Umbral del Trauma'],
    ['3', 'Estación 2', 'El Enigma del Vacío'],
    ['4', 'Estación 3', 'El Taller del Cronógrafo'],
    ['5', 'Estación 4', 'El Vínculo de Vigilancia'],
    ['6', 'Estación 5', 'El Salto Temporal'],
    ['7', 'Cierre', 'Puntaje total y grupo ganador']
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

      + '<section class="bloque"><p class="sobretitulo">Los 7 momentos</p><ol class="momentos">'
      + MOMENTOS.map(m => '<li><span class="num">' + m[0] + '</span><b>' + M.esc(m[1]) + '</b><small>' + M.esc(m[2]) + '</small></li>').join('') + '</ol></section>'

      + '<section class="bloque"><p class="sobretitulo">Las 4 pantallas · tóquelas para verlas funcionando</p>'
      + '<nav class="pestanas-demo">' + PANTALLAS.map(x => '<button data-p="' + x.id + '" class="' + (x.id === sel ? 'sel' : '') + '">' + M.esc(x.nombre) + '</button>').join('') + '</nav>'
      + '<div class="demo-grid ' + (p.marco === 'pantalla' ? 'ancha' : '') + '">'
      + '<div class="hud demo-info"><h2 class="seccion">' + M.esc(p.nombre) + '</h2>'
      + '<p><b>Quién:</b> ' + M.esc(p.quien) + '</p><p><b>Cuándo:</b> ' + M.esc(p.cuando) + '</p>'
      + '<ul class="lista-demo">' + p.que.map(t => '<li>' + M.esc(t) + '</li>').join('') + '</ul>'
      + '<div class="acciones" style="justify-content:flex-start"><a class="btn contorno pequeno" href="' + p.archivo + '" target="_blank" rel="noopener">ABRIR EN PANTALLA COMPLETA ↗</a></div>'
      + '<p class="suave" style="font-size:12px;margin-top:10px">Las pantallas funcionan en vivo y se guardan en la sesión actual. Después de una demostración, el Guía Especialista toca "Nueva sesión" para dejar todo en cero.</p></div>'
      + marco(p) + '</div></section>'

      + '<section class="bloque"><p class="sobretitulo">Los roles de cada tripulación (7 integrantes)</p><div class="roles-demo">' + roles + '</div></section>'

      + '<section class="hud bloque"><p class="sobretitulo">Reglas del juego</p><ul class="lista-demo">'
      + '<li>4 grupos de 7: 1 Líder Piloto, 1 Copiloto, 1 Comandante de Misión y 4 Tripulantes de Élite.</li>'
      + '<li>Las 5 estaciones se recorren en orden. Una estación ocupada por otro grupo no se abre (una sola maleta).</li>'
      + '<li>12 minutos por estación + 30 segundos de gracia. Si el reloj cierra la estación, esa estación queda en cero.</li>'
      + '<li>2 intentos por código. Al segundo error se muestra la respuesta correcta: el foco es aprender.</li>'
      + '<li>Cada estación vale 20 puntos: 14 por respuestas y hasta 6 por agilidad. Total: 100 puntos.</li>'
      + '</ul></section>'
      + '<p class="suave centro" style="margin:24px 0;font-size:13px">Metodología y diseño del juego: Nathalia Velasco · Simoné</p>'
      + '</main>';
  }

  /* El Gran Tablero se diseña para 1600 × 900: se escala al ancho del marco. */
  function escalar() {
    const e = app.querySelector('.marco-pantalla .escala'); if (!e) return;
    const w = e.parentElement.clientWidth; e.style.transform = 'scale(' + (w / 1600) + ')';
    e.parentElement.style.height = (900 * w / 1600) + 'px';
  }
  window.addEventListener('resize', escalar);

  app.addEventListener('click', ev => {
    const b = ev.target.closest('[data-p]'); if (!b) return;
    sel = b.dataset.p; history.replaceState(null, '', '#' + sel);
    const y = window.scrollY; render(); escalar(); window.scrollTo(0, y);
  });
  render(); escalar();
})();
