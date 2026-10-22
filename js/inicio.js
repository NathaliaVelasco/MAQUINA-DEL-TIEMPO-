/* Página de inicio: acceso a las cuatro pantallas del ecosistema. */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego;
  document.getElementById('app').innerHTML =
    '<main class="pagina">'
    + M.logo('logo-portal')
    + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1>'
    + '<p class="subtitulo-juego">' + M.esc(J.subtitulo) + '</p>'
    + '<nav class="menu">'
    + '<a href="kit.html"><div class="hud"><b>Kit de tripulación</b><span>Cada participante, en su celular: registrarse y unirse a su grupo.</span></div></a>'
    + '<a href="consola.html"><div class="hud"><b>Consola del equipo</b><span>Comandante de Misión: bienvenida, 5 estaciones y códigos.</span></div></a>'
    + '<a href="portico.html"><div class="hud"><b>Pórtico</b><span>Pantalla grande: resultados de los 4 grupos en vivo.</span></div></a>'
    + '<a href="prevena.html"><div class="hud"><b>App Prevena™</b><span>Estación 5: se activa con el código de la Prueba 5.2.</span></div></a>'
    + '</nav>'
    + '<p class="suave centro" style="margin-top:24px;font-size:13px">Metodología y diseño del juego: Nathalia Velasco · Simoné</p>'
    + '</main>';
})();
