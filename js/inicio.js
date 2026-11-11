/* Portada de la Máquina del Tiempo: lo que ven los participantes, sin administración ni instructivos. */
(function () {
  'use strict';
  const M = window.MDT, J = M.C.juego;

  const RUTA = [
    { momento: 'Antes', titulo: 'Bitácora de Tránsito Temporal', texto: 'Llega 3 días antes: 4 fases y 20 puntos del consenso internacional, para llegar preparado.' },
    { momento: 'Durante', titulo: 'Pórtico y Sala de Escape', texto: 'Regístrate, toma tu rol y entra a la línea de tiempo: 5 estaciones y el cierre.' },
    { momento: 'Después', titulo: 'Memoria de la Ruta', texto: 'Revisa las 5 postales de la experiencia, del minuto cero a la reconstrucción.' }
  ];

  const ACCESOS = [
    { href: 'bitacora.html', titulo: 'Bitácora de Tránsito Temporal', texto: 'Expectativa previa: 4 fases y 20 puntos del consenso para completar.', boton: 'ABRIR LA BITÁCORA' },
    { href: 'entrada.html', titulo: 'Pórtico de Entrada y diagnóstico', texto: 'Tu registro en el celular, tu rol, tu credencial y tu diagnóstico inicial y final.', boton: 'IR AL PÓRTICO' },
    { href: 'sala.html', titulo: 'Sala de Escape', texto: 'Para el Comandante de Misión: bienvenida, las 5 estaciones y tu puntaje en el cierre.', boton: 'ENTRAR A LA SALA' },
    { href: 'memoria-de-la-ruta.html', titulo: 'Memoria de la Ruta', texto: 'Las 5 postales en digital: frente con ilustración y texto, reverso con el mensaje clave.', boton: 'VER LAS POSTALES' }
  ];

  document.getElementById('app').innerHTML =
    '<main class="pagina portada">'
    + '<header class="portada-hero">'
    + M.logo('logo-portal')
    + '<p class="sobretitulo">Escape room médica híbrida · Manejo de abdomen abierto</p>'
    + '<h1 class="titulo-juego">' + M.esc(J.titulo) + '</h1>'
    + '<p class="subtitulo-juego">' + M.esc(J.subtitulo) + '</p>'
    + '<p class="portada-intro">Un caso clínico en 5 estaciones y un cierre. Tu equipo de 7 llega a la línea de tiempo quirúrgica y cada decisión cuenta.</p>'
    + '</header>'
    + '<section class="portada-ruta">' + RUTA.map(r => '<div class="hud"><p class="sobretitulo">' + M.esc(r.momento) + '</p><b>' + M.esc(r.titulo) + '</b><span>' + M.esc(r.texto) + '</span></div>').join('') + '</section>'
    + '<section class="portada-accesos">' + ACCESOS.map(a => '<a class="hud portada-tarjeta" href="' + a.href + '" target="_blank" rel="noopener"><b>' + M.esc(a.titulo) + '</b><span>' + M.esc(a.texto) + '</span><em>' + a.boton + ' →</em></a>').join('') + '</section>'
    + '<p class="suave centro" style="margin-top:24px;font-size:13px">Metodología y diseño del juego: Nathalia Velasco · Simoné</p>'
    + '</main>';
})();
