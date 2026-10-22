/* ==========================================================================
   APP PREVENA™ · Estación 5 (Prueba 5.3)
   Se activa con el código del candado de la Prueba 5.2 (validado en el servidor).
   Pasos de colocación: BORRADOR para validación de Solventum.
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MDT, P = M.C.prevena, app = document.getElementById('app');
  let datos = M.leer('prevena', null), paso = M.leer('prevena-paso', 0);

  function cab() { return '<header class="cabecera">' + M.logo() + '<div class="titulo-cab"><b>PREVENA™</b><small>Manejo de incisiones cerradas</small></div>'
    + '<button class="btn-sonido" data-a="sonido">' + (M.sonido ? 'SONIDO ON' : 'SONIDO OFF') + '</button></header>'; }

  /* Ilustración por capas: cada paso agrega una capa sobre la incisión. */
  function ilustracion(n) {
    const capa = (k, svg) => n >= k ? svg : '';
    return '<svg class="prevena-ilustracion" viewBox="0 0 400 240" role="img" aria-label="Incisión de laparotomía con el sistema Prevena">'
      + '<defs><linearGradient id="piel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a78a"/><stop offset="1" stop-color="#c48f73"/></linearGradient></defs>'
      + '<rect x="20" y="20" width="360" height="200" rx="18" fill="url(#piel)"/>'
      + '<line x1="200" y1="45" x2="200" y2="195" stroke="#7a2f2a" stroke-width="4" stroke-linecap="round"/>'
      + Array.from({ length: 9 }, (_, i) => '<line x1="190" y1="' + (55 + i * 17) + '" x2="210" y2="' + (55 + i * 17) + '" stroke="#3a1a18" stroke-width="2"/>').join('')
      + capa(1, '<rect x="30" y="30" width="340" height="180" rx="14" fill="none" stroke="#05dd4d" stroke-width="2" stroke-dasharray="6 6"/>')
      + capa(2, '<rect x="176" y="40" width="48" height="160" rx="10" fill="#9aa3a6" stroke="#5d676a"/>')
      + capa(3, '<rect x="150" y="32" width="100" height="176" rx="16" fill="rgba(244,248,246,.35)" stroke="#f4f8f6" stroke-width="2"/>')
      + capa(4, '<path d="M200 40 C 200 10, 300 10, 330 24" fill="none" stroke="#f4f8f6" stroke-width="6" stroke-linecap="round"/><rect x="318" y="8" width="56" height="34" rx="6" fill="#01332b" stroke="#05dd4d" stroke-width="2"/>')
      + capa(5, '<text x="346" y="31" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#05dd4d">-125</text>')
      + capa(6, '<g stroke="#5d676a" stroke-width="1.5">' + Array.from({ length: 8 }, (_, i) => '<path d="M178 ' + (52 + i * 18) + ' q11 6 22 0 t22 0" fill="none"/>').join('') + '</g><circle cx="356" cy="210" r="10" fill="#05dd4d"/>')
      + '</svg>';
  }

  function pAcceso(err) {
    app.innerHTML = cab() + '<main class="pagina"><section class="hud">' + M.logo('logo-portal')
      + '<h1 class="titulo-juego" style="font-size:clamp(26px,8vw,40px)">PREVENA™</h1><p class="subtitulo-juego">Algoritmo interactivo · Prueba 5.3</p>'
      + ilustracion(0)
      + '<form id="f" style="margin-top:16px"><label class="campo"><span>Código de activación</span><input type="text" id="cod" class="mayus" inputmode="numeric" autocomplete="off" placeholder="El código del candado de la Prueba 5.2"></label>'
      + '<p class="error">' + M.esc(err || '') + '</p><button class="btn primario ancho grande" type="submit">ACTIVAR →</button></form></section></main>';
    document.getElementById('f').onsubmit = async ev => {
      ev.preventDefault(); M.audio(); M.decir('Verificando.');
      try { datos = await M.rpc('mdt_prevena', { p_clave: document.getElementById('cod').value }); M.guardar('prevena', datos); paso = 0; M.guardar('prevena-paso', 0); M.SFX.candado(); pPaso(); }
      catch (e) { M.SFX.error(); pAcceso(M.mensajeError(e)); }
    };
  }

  function pPaso() {
    if (paso >= P.pasos.length) return pVentajas();
    const p = P.pasos[paso];
    app.innerHTML = cab() + '<main class="pagina"><section class="hud paso-prevena">'
      + '<p class="sobretitulo">Paso ' + (paso + 1) + ' de ' + P.pasos.length + '</p>'
      + '<div class="puntos-pasos">' + P.pasos.map((_, i) => '<i class="' + (i <= paso ? 'on' : '') + '"></i>').join('') + '</div>'
      + ilustracion(paso + 1)
      + '<h3>' + M.esc(p.titulo) + '</h3><p>' + M.esc(p.texto) + '</p>'
      + '<div class="acciones"><button class="btn fantasma" data-a="atras" ' + (paso ? '' : 'disabled') + '>← ATRÁS</button><button class="btn primario grande" data-a="hecho">HECHO →</button></div>'
      + '</section></main>';
    M.decir(p.titulo + '. ' + p.texto);
  }

  function pVentajas() {
    const v = (datos && datos.ventajas) || [];
    app.innerHTML = cab() + '<main class="pagina">'
      + '<section class="hud centro">' + ilustracion(6) + '<p class="sobretitulo" style="margin-top:10px">Terapia activa</p><h2 class="seccion">-125 mmHg continuos</h2><p class="suave">Sellado verificado. La incisión de alta tensión está protegida.</p></section>'
      + '<section class="hud bloque"><p class="sobretitulo">Ventajas de Prevena™ en la incisión de laparotomía</p><div class="ventajas">'
      + v.map((x, i) => '<div class="ventaja" style="animation-delay:' + (i * 0.25) + 's"><span class="sim">' + M.esc(x.simbolo) + '</span><span>' + M.esc(x.texto) + '</span></div>').join('')
      + '</div>'
      + '<div class="sello"><small>Hito histórico · Sello de la línea de tiempo</small><div class="simbolos">' + v.map(x => '<span>' + M.esc(x.simbolo) + '</span>').join('') + '</div></div>'
      + '<p class="suave" style="font-size:13px;margin-top:14px">Copiloto: registren en la bitácora cuántas ventajas verificaron y sus símbolos, en orden. El Comandante los digita en la consola.</p>'
      + '</section><div class="acciones"><button class="btn fantasma pequeno" data-a="repetir">Repetir el paso a paso</button></div></main>';
    M.SFX.ok();
    M.decir('Terapia activa a menos ciento veinticinco milímetros de mercurio. Estas son las ventajas de Prevena en la incisión de laparotomía. ' + v.map(x => x.texto).join(' '));
  }

  app.addEventListener('click', ev => {
    const b = ev.target.closest('[data-a]'); if (!b) return;
    M.audio();
    const a = b.dataset.a;
    if (a === 'sonido') { b.textContent = M.alternarSonido() ? 'SONIDO ON' : 'SONIDO OFF'; return; }
    if (a === 'hecho') { paso++; M.guardar('prevena-paso', paso); M.SFX.paso(); return pPaso(); }
    if (a === 'atras') { paso = Math.max(0, paso - 1); M.guardar('prevena-paso', paso); return pPaso(); }
    if (a === 'repetir') { paso = 0; M.guardar('prevena-paso', 0); return pPaso(); }
  });

  if (datos && datos.ventajas) pPaso(); else pAcceso();
})();
