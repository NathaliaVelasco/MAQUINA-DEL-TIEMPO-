/* ==========================================================================
   FONDO ESPACIAL · BITÁCORA DE TRÁNSITO TEMPORAL
   Nebulosa verde, estrellas en tres profundidades, cometas con estela verde,
   un planeta en el horizonte y una nave que cruza lentamente con sus
   propulsores encendidos. La nebulosa y el planeta se dibujan una vez;
   solo se animan estrellas, cometas y nave. Se pausa con la pantalla oculta
   y respeta "reducir movimiento".
   Metodología y diseño: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'fondo-dinamico fondo-espacio'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  const ctx = cv.getContext('2d');
  const fondo = document.createElement('canvas'), fc = fondo.getContext('2d');
  let W = 0, H = 0, R = 1, estrellas = [], cometas = [], nave = null, ultimo = 0, scrollY = 0;
  const azar = (a, b) => a + Math.random() * (b - a);

  function medir() {
    R = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    [cv, fondo].forEach(c => { c.width = Math.round(W * R); c.height = Math.round(H * R); });
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(R, 0, 0, R, 0, 0); fc.setTransform(R, 0, 0, R, 0, 0);
    pintarFondo();
    const n = Math.round(Math.min(260, W * H / 5200));
    estrellas = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, z: Math.random() < 0.6 ? 1 : Math.random() < 0.7 ? 2 : 3,
      f: azar(0, Math.PI * 2), v: azar(0.6, 2.2)
    }));
    cometas = [];
    nave = nuevaNave(true);
  }

  /* ---------------- nebulosa + planeta (una sola vez) */
  function nube(x, y, r, color, alfa) {
    const g = fc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + color + ',' + alfa + ')');
    g.addColorStop(0.5, 'rgba(' + color + ',' + alfa * 0.45 + ')');
    g.addColorStop(1, 'rgba(' + color + ',0)');
    fc.fillStyle = g; fc.beginPath(); fc.arc(x, y, r, 0, Math.PI * 2); fc.fill();
  }
  function pintarFondo() {
    fc.fillStyle = '#020604'; fc.fillRect(0, 0, W, H);
    const M = Math.max(W, H);
    fc.globalCompositeOperation = 'lighter';
    // capas de nebulosa: verde profundo, verde lima y destellos amarillos
    for (let i = 0; i < 26; i++) {
      const t = i / 26;
      const x = W * (0.15 + 0.75 * Math.sin(t * 5.1 + 1.3) * 0.5 + 0.35) , y = H * (0.1 + 0.8 * t);
      nube(x + azar(-W * 0.15, W * 0.15), y, M * azar(0.18, 0.42), Math.random() < 0.6 ? '20, 120, 45' : '90, 170, 40', azar(0.05, 0.12));
    }
    for (let i = 0; i < 6; i++) nube(W * azar(0.35, 0.8), H * azar(0.15, 0.6), M * azar(0.08, 0.2), '190, 220, 70', azar(0.05, 0.1));
    for (let i = 0; i < 4; i++) nube(W * azar(0.05, 0.95), H * azar(0.05, 0.95), M * azar(0.1, 0.22), '60, 40, 90', azar(0.04, 0.08));
    // filamentos de polvo
    fc.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      fc.fillStyle = 'rgba(0, 0, 0,' + azar(0.02, 0.08) + ')';
      fc.beginPath(); fc.arc(x, y, azar(8, 40), 0, Math.PI * 2); fc.fill();
    }
    // planeta en la esquina inferior derecha
    const pr = Math.max(W, H) * (W < 700 ? 0.55 : 0.42);
    const px = W * (W < 700 ? 0.95 : 0.9), py = H + pr * 0.42;
    const halo = fc.createRadialGradient(px, py, pr * 0.95, px, py, pr * 1.12);
    halo.addColorStop(0, 'rgba(120, 220, 90, .35)'); halo.addColorStop(1, 'rgba(120, 220, 90, 0)');
    fc.fillStyle = halo; fc.beginPath(); fc.arc(px, py, pr * 1.12, 0, Math.PI * 2); fc.fill();
    const cuerpo = fc.createRadialGradient(px - pr * 0.45, py - pr * 0.55, pr * 0.1, px, py, pr);
    cuerpo.addColorStop(0, '#4f8a2e'); cuerpo.addColorStop(0.45, '#1f4a1a'); cuerpo.addColorStop(1, '#030a04');
    fc.fillStyle = cuerpo; fc.beginPath(); fc.arc(px, py, pr, 0, Math.PI * 2); fc.fill();
    // textura de continentes
    fc.save(); fc.beginPath(); fc.arc(px, py, pr, 0, Math.PI * 2); fc.clip();
    for (let i = 0; i < 90; i++) {
      const a = azar(Math.PI * 1.05, Math.PI * 1.95), d = azar(0.2, 0.98) * pr;
      fc.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '10, 30, 8' : '110, 160, 60') + ',' + azar(0.06, 0.16) + ')';
      fc.beginPath(); fc.ellipse(px + Math.cos(a) * d, py + Math.sin(a) * d, azar(10, 60), azar(4, 18), azar(0, 3), 0, Math.PI * 2); fc.fill();
    }
    fc.restore();
    fc.strokeStyle = 'rgba(170, 255, 140, .35)'; fc.lineWidth = 1.5;
    fc.beginPath(); fc.arc(px, py, pr, Math.PI * 1.08, Math.PI * 1.62); fc.stroke();
  }

  /* ---------------- nave */
  function nuevaNave(enPantalla) {
    const esc = W < 700 ? 0.55 : 0.9;
    return { x: enPantalla ? W * 0.25 : -260 * esc, y: H * azar(0.18, 0.4), e: esc, v: azar(9, 14), osc: azar(0, 6) };
  }
  function dibujarNave(n, t) {
    ctx.save();
    ctx.translate(n.x, n.y + Math.sin(t * 0.6 + n.osc) * 6);
    ctx.rotate(-0.12); ctx.scale(n.e, n.e);
    // propulsores
    [[-112, 18], [-104, 44], [-118, -6]].forEach(([x, y], i) => {
      const p = 0.75 + 0.25 * Math.sin(t * 18 + i * 2);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 34 * p);
      g.addColorStop(0, 'rgba(255, 235, 190, .95)'); g.addColorStop(0.3, 'rgba(255, 150, 70, .65)'); g.addColorStop(1, 'rgba(255, 110, 40, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 34 * p, 0, Math.PI * 2); ctx.fill();
      const e = ctx.createLinearGradient(x, y, x - 140, y);
      e.addColorStop(0, 'rgba(200, 255, 180, .22)'); e.addColorStop(1, 'rgba(200, 255, 180, 0)');
      ctx.fillStyle = e; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x - 150, y - 2); ctx.lineTo(x - 150, y + 2); ctx.lineTo(x, y + 9); ctx.fill();
    });
    // casco
    const casco = ctx.createLinearGradient(0, -40, 0, 60);
    casco.addColorStop(0, '#2c4a22'); casco.addColorStop(0.5, '#122312'); casco.addColorStop(1, '#050b05');
    ctx.fillStyle = casco; ctx.strokeStyle = 'rgba(150, 230, 110, .55)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-110, -14); ctx.lineTo(-20, -30); ctx.lineTo(70, -40); ctx.lineTo(125, -30); ctx.lineTo(150, -16);
    ctx.lineTo(132, 4); ctx.lineTo(60, 30); ctx.lineTo(-30, 52); ctx.lineTo(-100, 54); ctx.lineTo(-112, 30); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // módulos y torres
    ctx.fillStyle = '#1b3317';
    [[-60, -40, 40, 14], [-10, -48, 34, 18], [40, -54, 50, 16], [96, -46, 26, 10]].forEach(([x, y, w, h]) => { ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); });
    ctx.beginPath(); ctx.moveTo(62, -54); ctx.lineTo(62, -86); ctx.moveTo(74, -54); ctx.lineTo(74, -74); ctx.stroke();
    // cápsulas de motor
    ctx.fillStyle = '#0e1c0d';
    [[-118, -14], [-110, 10], [-102, 36]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x + 30, y + 6, 32, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    // luces de navegación
    const luz = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.fillStyle = 'rgba(5, 221, 77,' + (0.4 + luz * 0.6) + ')';
    ctx.beginPath(); ctx.arc(148, -16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 90, 82,' + (1 - luz * 0.7) + ')';
    ctx.beginPath(); ctx.arc(-96, 52, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ---------------- cometas */
  function nuevoCometa() {
    const desdeArriba = Math.random() < 0.5;
    return { x: desdeArriba ? azar(0, W) : W + 20, y: desdeArriba ? -20 : azar(0, H * 0.6), vx: -azar(60, 140), vy: azar(30, 90), vida: 0, max: azar(4, 8), r: azar(1.5, 3) };
  }

  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - (ultimo || ahora)) / 1000); ultimo = ahora;
    const t = ahora / 1000;
    const par = scrollY * 0.04;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(fondo, 0, -par * 0.5, W, H + par * 0.5);
    // estrellas con parpadeo y paralaje por profundidad
    estrellas.forEach(s => {
      const brillo = 0.45 + 0.55 * Math.abs(Math.sin(t * s.v + s.f));
      const y = ((s.y - par * s.z) % H + H) % H;
      ctx.fillStyle = 'rgba(' + (s.z === 3 ? '255, 245, 210' : '210, 255, 220') + ',' + (brillo * (0.35 + s.z * 0.2)).toFixed(2) + ')';
      ctx.fillRect(s.x, y, s.z * 0.8, s.z * 0.8);
      if (s.z === 3 && brillo > 0.9) { ctx.fillRect(s.x - 3, y + 1, 7, 0.6); ctx.fillRect(s.x + 1, y - 3, 0.6, 7); }
    });
    // cometas
    if (cometas.length < 3 && Math.random() < dt * 0.25) cometas.push(nuevoCometa());
    cometas = cometas.filter(c => (c.vida += dt) < c.max && c.x > -60 && c.y < H + 60);
    cometas.forEach(c => {
      c.x += c.vx * dt; c.y += c.vy * dt;
      const k = Math.sin(Math.PI * c.vida / c.max);
      const g = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 0.6, c.y - c.vy * 0.6);
      g.addColorStop(0, 'rgba(190, 255, 150,' + 0.8 * k + ')'); g.addColorStop(1, 'rgba(60, 200, 80, 0)');
      ctx.strokeStyle = g; ctx.lineWidth = c.r * 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - c.vx * 0.6, c.y - c.vy * 0.6); ctx.stroke();
      ctx.fillStyle = 'rgba(240, 255, 230,' + k + ')'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
    });
    // nave
    nave.x += nave.v * dt;
    if (nave.x > W + 300 * nave.e) nave = nuevaNave(false);
    dibujarNave(nave, t);
    if (!reducido && !document.hidden) requestAnimationFrame(cuadro);
  }

  let espera;
  window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { medir(); if (reducido) cuadro(performance.now()); }, 150); });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; if (reducido) cuadro(performance.now()); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reducido) { ultimo = 0; requestAnimationFrame(cuadro); } });
  medir();
  requestAnimationFrame(cuadro);
})();
