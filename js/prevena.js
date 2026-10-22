/* ==========================================================================
   Aplicación Prevena™ (Prueba 5.3) · se abre en el celular de cada integrante
   Contenido de los pasos: BORRADOR para validación de Solventum.
   ========================================================================== */
(function () {
  'use strict';
  const P = window.CONTENIDO.prevena, H = window.HUELLAS;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, '');
  let el = null, etapa = 'bloqueo', paso = 0, desbloqueada = false;
  try { desbloqueada = sessionStorage.getItem('mdt-prevena') === '1'; } catch (e) {}

  async function huella(texto) {
    const datos = new TextEncoder().encode('MDT|5.2|' + norm(texto));
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', datos);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return window.sha256Respaldo(datos);
  }

  /* Ilustración: incisión cerrada y capas del apósito según el paso. */
  function dibujo(n) {
    const piel = '<rect x="10" y="10" width="300" height="160" rx="18" fill="#2a1f1a"/><rect x="10" y="10" width="300" height="160" rx="18" fill="url(#pielG)"/>';
    const incision = '<path d="M60 90 L260 90" stroke="#7a2e2a" stroke-width="5" stroke-linecap="round"/>' +
      Array.from({ length: 11 }, (_, k) => '<path d="M' + (70 + k * 18) + ' 80 L' + (70 + k * 18) + ' 100" stroke="#d9d2c5" stroke-width="2"/>').join('');
    let capas = '';
    if (n >= 1) capas += '<rect x="22" y="22" width="276" height="136" rx="14" fill="none" stroke="#05DD4D" stroke-width="2" stroke-dasharray="6 6" opacity=".7"/>';
    if (n >= 2) capas += '<rect x="40" y="66" width="240" height="48" rx="10" fill="none" stroke="#7cf0a0" stroke-width="2" stroke-dasharray="4 4"/>';
    if (n >= 3) capas += '<rect x="40" y="66" width="240" height="48" rx="10" fill="' + (n >= 6 ? '#06622f' : '#0aa64a') + '" opacity=".92"/>' +
      '<rect x="30" y="56" width="260" height="68" rx="14" fill="none" stroke="#e8f0ec" stroke-width="2" opacity=".55"/>';
    if (n >= 4) capas += '<rect x="26" y="52" width="268" height="76" rx="16" fill="none" stroke="#05DD4D" stroke-width="4"/>';
    if (n >= 5) capas += '<path d="M280 90 C300 90 300 140 318 150" stroke="#e8f0ec" stroke-width="5" fill="none"/><rect x="300" y="138" width="16" height="24" rx="4" fill="#05DD4D"/>';
    if (n >= 6) capas += '<text x="160" y="96" text-anchor="middle" fill="#e8f0ec" font-family="IBM Plex Mono, monospace" font-size="16" font-weight="600">−125 mmHg</text>';
    return '<svg viewBox="0 0 330 180" class="prevena-dibujo" role="img" aria-label="Ilustración del paso">'
      + '<defs><linearGradient id="pielG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c99a7c" stop-opacity=".55"/><stop offset="1" stop-color="#8e6450" stop-opacity=".55"/></linearGradient></defs>'
      + piel + incision + capas + '</svg>';
  }

  function pinta() {
    let h = '<div class="prevena-app" role="dialog" aria-modal="true" aria-label="Aplicación Prevena">'
      + '<header class="prevena-cab"><div><b>Prevena™</b><small>Sistema de manejo de incisiones</small></div><button class="btn-icono" data-p="cerrar" aria-label="Cerrar la aplicación">CERRAR ✕</button></header>';
    if (etapa === 'bloqueo') {
      h += '<section class="prevena-cuerpo centro"><p class="sobretitulo">Acceso restringido</p><h2>Ingresen el código de activación</h2>'
        + '<p>Es el mismo código que abrió la caja de la unidad Prevena™ (Prueba 5.2).</p>'
        + '<form data-p-form="1" class="form-codigo"><input id="prevenaCod" class="entrada-codigo" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="_ _ _ _"><p class="mensaje-error" id="prevenaErr"></p>'
        + '<div class="acciones centro"><button class="btn primario" type="submit">ACTIVAR</button></div></form></section>';
    } else if (etapa === 'pasos') {
      const s = P.pasos[paso];
      h += '<section class="prevena-cuerpo"><div class="progreso">' + P.pasos.map((_, k) => '<i class="' + (k < paso ? 'ok' : k === paso ? 'hoy' : '') + '"></i>').join('') + '</div>'
        + '<p class="sobretitulo">Paso ' + (paso + 1) + ' de ' + P.pasos.length + '</p><h2>' + esc(s.t) + '</h2>'
        + dibujo(paso + 1) + '<p class="prevena-texto">' + esc(s.d) + '</p>'
        + '<div class="acciones"><button class="btn fantasma" data-p="atras" ' + (paso === 0 ? 'disabled' : '') + '>← ANTERIOR</button>'
        + '<button class="btn primario" data-p="sig">' + (paso === P.pasos.length - 1 ? 'VER LA EVIDENCIA →' : 'SIGUIENTE →') + '</button></div>'
        + '<p class="nota">Contenido de referencia: verifiquen siempre las instrucciones de uso oficiales del producto.</p></section>';
    } else {
      h += '<section class="prevena-cuerpo"><p class="sobretitulo">Evidencia clínica</p><h2>Ventajas de Prevena™ en la incisión de laparotomía</h2>'
        + '<div class="ventajas">' + P.ventajas.map((v, k) => '<article class="ventaja"><span class="ventaja-n">' + (k + 1) + '</span><p>' + esc(v[0]) + '</p><b class="ventaja-c">' + esc(v[1]) + '</b></article>').join('') + '</div>'
        + '<p class="nota">Cuenten las ventajas y lean los caracteres en orden: ahí está el hito histórico.</p>'
        + '<div class="acciones"><button class="btn fantasma" data-p="repetir">VER LOS PASOS DE NUEVO</button><button class="btn primario" data-p="cerrar">VOLVER A LA MISIÓN</button></div></section>';
    }
    el.innerHTML = h + '</div>';
  }

  function abrir() {
    if (!el) {
      el = document.createElement('div'); el.className = 'prevena-capa'; document.body.appendChild(el);
      el.addEventListener('click', function (ev) {
        const b = ev.target.closest('[data-p]'); if (!b) return;
        const a = b.getAttribute('data-p');
        if (a === 'cerrar') { el.classList.remove('on'); document.body.classList.remove('sin-scroll'); return; }
        if (a === 'atras' && paso > 0) paso--;
        if (a === 'sig') { if (paso < P.pasos.length - 1) paso++; else etapa = 'ventajas'; }
        if (a === 'repetir') { etapa = 'pasos'; paso = 0; }
        pinta(); el.scrollTop = 0;
      });
      el.addEventListener('submit', async function (ev) {
        ev.preventDefault();
        const v = document.getElementById('prevenaCod').value;
        if (H['5.2'] && (await huella(v)) === H['5.2'].h) {
          desbloqueada = true; try { sessionStorage.setItem('mdt-prevena', '1'); } catch (e) {}
          etapa = 'pasos'; paso = 0; pinta();
        } else {
          document.getElementById('prevenaErr').textContent = 'Código de activación incorrecto. Revisen la Prueba 5.2.';
        }
      });
    }
    etapa = desbloqueada ? (etapa === 'bloqueo' ? 'pasos' : etapa) : 'bloqueo';
    pinta(); el.classList.add('on'); document.body.classList.add('sin-scroll'); el.scrollTop = 0;
  }
  window.PREVENA = { abrir: abrir };
})();
