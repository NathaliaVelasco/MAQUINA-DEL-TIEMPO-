/* ==========================================================================
   FONDO DINÁMICO · radar HUD de la Máquina del Tiempo
   Barrido de radar, pulsos que nacen del centro, partículas conectadas y
   una línea de escaneo. Liviano para celulares: se pausa cuando la pantalla
   no está visible y respeta "reducir movimiento" del sistema.
   ========================================================================== */
(function () {
  'use strict';
  const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'fondo-dinamico'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  const ctx = cv.getContext('2d');
  const VERDE = '5, 221, 77';
  let W = 0, H = 0, R = 1, cx = 0, cy = 0, radio = 0, puntos = [], pulsos = [], t0 = performance.now(), ultimo = 0, proxPulso = 0;

  function medir() {
    R = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * R); cv.height = Math.round(H * R);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(R, 0, 0, R, 0, 0);
    cx = W / 2; cy = H * 0.42; radio = Math.hypot(W, H) * 0.62;
    const n = Math.round(Math.min(70, Math.max(26, W * H / 26000)));
    puntos = Array.from({ length: n }, () => nuevoPunto(true));
  }
  function nuevoPunto(enCualquierLugar) {
    return {
      x: Math.random() * W, y: enCualquierLugar ? Math.random() * H : H + 10,
      vy: -(0.08 + Math.random() * 0.32), vx: (Math.random() - 0.5) * 0.12,
      r: 0.6 + Math.random() * 1.6, a: 0.25 + Math.random() * 0.55, f: Math.random() * Math.PI * 2
    };
  }

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (document.hidden || ahora - ultimo < 33) return;   // ~30 cuadros por segundo
    ultimo = ahora;
    dibujar((ahora - t0) / 1000);
  }
  function dibujar(t) {
    ctx.clearRect(0, 0, W, H);

    /* 1. Barrido de radar: haz que gira con estela */
    const ang = (t * 0.55) % (Math.PI * 2);
    if (ctx.createConicGradient) {
      const g = ctx.createConicGradient(ang - 0.9, cx, cy);
      g.addColorStop(0, 'rgba(' + VERDE + ',0)');
      g.addColorStop(0.13, 'rgba(' + VERDE + ',0.10)');
      g.addColorStop(0.145, 'rgba(' + VERDE + ',0.28)');
      g.addColorStop(0.15, 'rgba(' + VERDE + ',0)');
      g.addColorStop(1, 'rgba(' + VERDE + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, radio, 0, Math.PI * 2); ctx.fill();
    }

    /* 2. Anillos fijos tenues */
    ctx.lineWidth = 1;
    for (let k = 1; k <= 5; k++) {
      ctx.strokeStyle = 'rgba(' + VERDE + ',' + (0.07 - k * 0.008) + ')';
      ctx.beginPath(); ctx.arc(cx, cy, k * Math.min(W, H) * 0.17, 0, Math.PI * 2); ctx.stroke();
    }

    /* 3. Pulsos que nacen del centro (latido temporal) */
    if (t > proxPulso) { pulsos.push({ t: t }); proxPulso = t + 3.2; }
    pulsos = pulsos.filter(p => t - p.t < 4);
    pulsos.forEach(p => {
      const e = (t - p.t) / 4, rr = e * radio * 0.8;
      ctx.strokeStyle = 'rgba(' + VERDE + ',' + (0.35 * (1 - e)) + ')';
      ctx.lineWidth = 2 * (1 - e) + 0.5;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
    });

    /* 4. Partículas que suben y se conectan */
    for (let i = 0; i < puntos.length; i++) {
      const p = puntos[i];
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10 || p.x < -10 || p.x > W + 10) puntos[i] = nuevoPunto(false);
      /* se iluminan cuando pasa el haz del radar */
      const ap = Math.atan2(p.y - cy, p.x - cx), d = ((ang - ap) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const brillo = d < 0.5 ? 1 - d / 0.5 : 0;
      const a = p.a * (0.55 + 0.45 * Math.sin(t * 2 + p.f)) + brillo * 0.6;
      ctx.fillStyle = 'rgba(' + VERDE + ',' + Math.min(1, a) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r + brillo * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineWidth = 0.6;
    for (let i = 0; i < puntos.length; i++) {
      for (let j = i + 1; j < puntos.length; j++) {
        const a = puntos[i], b = puntos[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 11000) {
          ctx.strokeStyle = 'rgba(' + VERDE + ',' + (0.16 * (1 - d2 / 11000)) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    /* 5. Línea de escaneo que recorre la pantalla */
    const ys = ((t * 70) % (H + 160)) - 80;
    const gs = ctx.createLinearGradient(0, ys - 60, 0, ys);
    gs.addColorStop(0, 'rgba(' + VERDE + ',0)'); gs.addColorStop(1, 'rgba(' + VERDE + ',0.07)');
    ctx.fillStyle = gs; ctx.fillRect(0, ys - 60, W, 60);
    ctx.fillStyle = 'rgba(' + VERDE + ',0.18)'; ctx.fillRect(0, ys, W, 1);
  }

  medir();
  window.addEventListener('resize', medir);
  if (reducido) { dibujar(1.2); window.addEventListener('resize', () => dibujar(1.2)); return; }   // un cuadro estático
  requestAnimationFrame(cuadro);
})();
