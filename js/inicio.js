/* Página de inicio: acceso a las pantallas del ecosistema. */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego;
  document.getElementById('app').innerHTML =
    '<main class="pagina">'
    + M.logo('logo-portal')
    + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1>'
    + '<p class="subtitulo-juego">' + M.esc(J.subtitulo) + '</p>'
    + '<nav class="menu">'
    + '<a href="demo.html"><div class="hud"><b>▶ Demo del ecosistema</b><span>Recorrido guiado: la ruta completa, las 6 pantallas funcionando, el diagnóstico y los roles.</span></div></a>'
    + '<a href="entrada.html"><div class="hud"><b>Pórtico de Entrada</b><span>Cada participante, en su celular: registro, diagnóstico inicial y final.</span></div></a>'
    + '<a href="sala.html"><div class="hud"><b>Sala de Escape</b><span>Comandante de Misión: bienvenida, 5 estaciones y códigos.</span></div></a>'
    + '<a href="tablero.html"><div class="hud"><b>El Gran Tablero</b><span>Pantalla grande: resultados de los 4 grupos en vivo.</span></div></a>'
    + '<a href="bitacora.html"><div class="hud"><b>Bitácora de Tránsito Temporal</b><span>Expectativa (3 días antes): 4 fases y 20 puntos del consenso para completar.</span></div></a>'
    + '<a href="cierre-de-ruta.html"><div class="hud"><b>Cierre de Ruta</b><span>Las 5 postales en digital: del minuto cero a la reconstrucción.</span></div></a>'
    + '<a href="guia.html"><div class="hud"><b>Guía Especialista</b><span>Administrador del juego (con PIN): códigos de acceso, QR, grupos, nueva sesión y resultados.</span></div></a>'
    + '</nav>'
    + '<p class="suave centro" style="margin-top:24px;font-size:13px">Metodología y diseño del juego: Nathalia Velasco · Simoné</p>'
    + '</main>';
})();
