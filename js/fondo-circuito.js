/* ==========================================================================
   FONDO DE CIRCUITO · exclusivo de CIERRE DE RUTA
   Pistas de circuito impreso que corren de izquierda a derecha hacia un
   núcleo óptico con anillos que giran. Pulsos de luz viajan por las pistas.
   Liviano: las pistas se dibujan una sola vez; solo se animan los pulsos y
   el núcleo. Se pausa con la pantalla oculta y respeta "reducir movimiento".
   Metodología y diseño: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = '5, 221, 77';
  const cv = document.createElement('canvas');
  cv.className = 'fondo-dinamico fondo-circuito'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  const ctx = cv.getContext('2d');
  const capa = document.createElement('canvas');   // pistas estáticas
  const cc = capa.getContext('2d');

  let W = 0, H = 0, R = 1, pistas = [], pulsos = [], nucleo = { x: 0, y: 0, r: 0 }, rayos = [], ultimo = 0, t0 = performance.now();
  const azar = (a, b) => a + Math.random() * (b - a);

  /* ---------------------------------------------------------- geometría */
  function medir() {
    R = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    [cv, capa].forEach(c => { c.width = Math.round(W * R); c.height = Math.round(H * R); });
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(R, 0, 0, R, 0, 0); cc.setTransform(R, 0, 0, R, 0, 0);

    const movil = W < 700;
    nucleo.r = movil ? Math.min(W, H) * 0.34 : Math.min(W, H) * 0.26;
    nucleo.x = movil ? W * 0.88 : W * 0.8;
    nucleo.y = movil ? H * 0.3 : H * 0.5;

    // pistas: salen del borde izquierdo y avanzan hacia el núcleo con quiebres a 45°
    pistas = [];
    const paso = movil ? 16 : 17;
    for (let y = paso; y < H; y += paso) {
      if (Math.random() < 0.1) continue;
      const pts = [{ x: -10, y: y }];
      let x = azar(W * 0.05, W * 0.3), cy = y;
      const fin = azar(W * 0.35, nucleo.x - nucleo.r * 1.15);
      pts.push({ x: x, y: cy });
      while (x < fin) {
        // quiebre diagonal acercándose al núcleo
        const dir = Math.sign(nucleo.y - cy) * (Math.random() < 0.7 ? 1 : -1);
        const d = Math.random() < 0.55 ? azar(8, 34) * dir : 0;
        x += Math.abs(d); cy += d; pts.push({ x: x, y: cy });
        x += azar(40, 180); pts.push({ x: Math.min(x, fin), y: cy });
      }
      pistas.push({ pts: pts, largo: largo(pts), pad: Math.random() < 0.85, grosor: Math.random() < 0.2 ? 1.6 : 1 });
    }
    // rayos alrededor del núcleo (como un sol de circuitos)
    rayos = [];
    const n = movil ? 120 : 180;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + azar(-0.01, 0.01);
      const r0 = nucleo.r * 1.05, r1 = nucleo.r * azar(1.18, 1.62);
      const quiebre = Math.random() < 0.5 ? azar(-0.06, 0.06) : 0;
      rayos.push({ a: a, r0: r0, r1: r1, q: quiebre, pad: Math.random() < 0.4 });
    }
    dibujarCapa();
    pulsos = [];
    const np = Math.round(Math.min(40, Math.max(14, pistas.length * 0.4)));
    for (let i = 0; i < np; i++) pulsos.push(nuevoPulso(true));
  }
  function largo(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return L; }
  function punto(p, d) {
    let acc = 0;
    for (let i = 1; i < p.pts.length; i++) {
      const a = p.pts[i - 1], b = p.pts[i], s = Math.hypot(b.x - a.x, b.y - a.y);
      if (acc + s >= d) { const k = (d - acc) / (s || 1); return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
      acc += s;
    }
    return p.pts[p.pts.length - 1];
  }

  /* ---------------------------------------------------------- capa fija */
  function dibujarCapa() {
    cc.clearRect(0, 0, W, H);
    cc.lineCap = 'round'; cc.lineJoin = 'round';
    pistas.forEach(p => {
      const g = cc.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(' + V + ',.22)'); g.addColorStop(0.35, 'rgba(' + V + ',.42)'); g.addColorStop(1, 'rgba(' + V + ',.26)');
      cc.strokeStyle = g; cc.lineWidth = p.grosor;
      cc.beginPath(); p.pts.forEach((q, i) => i ? cc.lineTo(q.x, q.y) : cc.moveTo(q.x, q.y)); cc.stroke();
      if (p.pad) {
        const f = p.pts[p.pts.length - 1];
        cc.beginPath(); cc.arc(f.x, f.y, 3.6, 0, Math.PI * 2);
        cc.strokeStyle = 'rgba(' + V + ',.45)'; cc.lineWidth = 1.2; cc.stroke();
        cc.beginPath(); cc.arc(f.x, f.y, 1.2, 0, Math.PI * 2); cc.fillStyle = 'rgba(' + V + ',.6)'; cc.fill();
      }
    });
    // rayos del núcleo
    rayos.forEach(r => {
      const a2 = r.a + r.q;
      const xm = nucleo.x + Math.cos(r.a) * (r.r0 + (r.r1 - r.r0) * 0.5), ym = nucleo.y + Math.sin(r.a) * (r.r0 + (r.r1 - r.r0) * 0.5);
      const x1 = nucleo.x + Math.cos(a2) * r.r1, y1 = nucleo.y + Math.sin(a2) * r.r1;
      cc.strokeStyle = 'rgba(' + V + ',.22)'; cc.lineWidth = 0.8;
      cc.beginPath(); cc.moveTo(nucleo.x + Math.cos(r.a) * r.r0, nucleo.y + Math.sin(r.a) * r.r0); cc.lineTo(xm, ym); cc.lineTo(x1, y1); cc.stroke();
      if (r.pad) { cc.beginPath(); cc.arc(x1, y1, 1.8, 0, Math.PI * 2); cc.fillStyle = 'rgba(' + V + ',.45)'; cc.fill(); }
    });
    // mosaico de píxeles junto al núcleo
    for (let i = 0; i < 46; i++) {
      const s = azar(5, 12), x = nucleo.x + nucleo.r * azar(0.9, 1.7), y = nucleo.y + nucleo.r * azar(-0.6, 0.6);
      cc.fillStyle = 'rgba(' + V + ',' + azar(0.05, 0.22).toFixed(2) + ')'; cc.fillRect(x, y, s, s);
    }
  }

  /* ---------------------------------------------------------- pulsos */
  function nuevoPulso(enCualquierLugar) {
    const p = pistas[Math.floor(Math.random() * pistas.length)];
    return { p: p, d: enCualquierLugar ? Math.random() * p.largo : 0, v: azar(60, 170), cola: azar(40, 90) };
  }

  /* ---------------------------------------------------------- núcleo */
  function dibujarNucleo(t) {
    const { x, y, r } = nucleo;
    // halo
    const h = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.5);
    h.addColorStop(0, 'rgba(' + V + ',.10)'); h.addColorStop(0.6, 'rgba(' + V + ',.05)'); h.addColorStop(1, 'rgba(' + V + ',0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.fill();
    // fondo del ojo
    const f = ctx.createRadialGradient(x, y, 0, x, y, r);
    f.addColorStop(0, 'rgba(3, 40, 24, .95)'); f.addColorStop(1, 'rgba(0, 8, 5, .95)');
    ctx.fillStyle = f; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    // aro metálico exterior
    const lat = 0.5 + 0.5 * Math.sin(t * 1.4);
    ctx.lineWidth = Math.max(4, r * 0.06);
    const aro = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    aro.addColorStop(0, 'rgba(160, 255, 190, .9)'); aro.addColorStop(0.45, 'rgba(' + V + ',.55)'); aro.addColorStop(1, 'rgba(1, 80, 40, .9)');
    ctx.strokeStyle = aro; ctx.shadowColor = 'rgba(' + V + ',' + (0.4 + lat * 0.4) + ')'; ctx.shadowBlur = 18 + lat * 16;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    // anillos internos que giran en sentidos opuestos
    anillo(x, y, r * 0.78, t * 0.25, 6, 0.32, 0.55, r * 0.05);
    anillo(x, y, r * 0.58, -t * 0.4, 4, 0.5, 0.45, r * 0.07);
    anillo(x, y, r * 0.38, t * 0.7, 3, 0.7, 0.5, r * 0.04);
    // retícula central
    ctx.strokeStyle = 'rgba(' + V + ',.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r * 0.2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 0.3, y); ctx.lineTo(x + r * 0.3, y); ctx.moveTo(x, y - r * 0.3); ctx.lineTo(x, y + r * 0.3); ctx.stroke();
    ctx.fillStyle = 'rgba(' + V + ',' + (0.5 + lat * 0.5) + ')';
    ctx.beginPath(); ctx.arc(x, y, 3 + lat * 2, 0, Math.PI * 2); ctx.fill();
    // barrido de escaneo dentro del ojo
    const a = t * 0.9;
    const s = ctx.createRadialGradient(x, y, 0, x, y, r * 0.95);
    s.addColorStop(0, 'rgba(' + V + ',.0)'); s.addColorStop(1, 'rgba(' + V + ',.16)');
    ctx.fillStyle = s; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r * 0.95, a, a + 0.5); ctx.closePath(); ctx.fill();
  }
  function anillo(x, y, r, giro, segmentos, hueco, alfa, grosor) {
    ctx.lineWidth = grosor; ctx.strokeStyle = 'rgba(' + V + ',' + alfa + ')';
    const arco = (Math.PI * 2) / segmentos;
    for (let i = 0; i < segmentos; i++) {
      const a = giro + i * arco;
      ctx.beginPath(); ctx.arc(x, y, r, a, a + arco * (1 - hueco)); ctx.stroke();
    }
  }

  /* ---------------------------------------------------------- bucle */
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - (ultimo || ahora)) / 1000); ultimo = ahora;
    const t = (ahora - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(capa, 0, 0, W, H);
    // pulsos de luz
    ctx.lineCap = 'round';
    pulsos.forEach((u, i) => {
      u.d += u.v * dt;
      if (u.d - u.cola > u.p.largo) { pulsos[i] = nuevoPulso(false); return; }
      const cabeza = punto(u.p, Math.min(u.d, u.p.largo));
      const pasos = 6;
      for (let k = 0; k < pasos; k++) {
        const d0 = u.d - (u.cola * k) / pasos, d1 = u.d - (u.cola * (k + 1)) / pasos;
        if (d0 < 0) break;
        const a = punto(u.p, Math.min(d0, u.p.largo)), b = punto(u.p, Math.max(0, Math.min(d1, u.p.largo)));
        ctx.strokeStyle = 'rgba(160, 255, 190,' + (0.75 * (1 - k / pasos)).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (u.d <= u.p.largo) {
        ctx.fillStyle = 'rgba(220, 255, 230, .95)'; ctx.shadowColor = 'rgba(' + V + ',.9)'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(cabeza.x, cabeza.y, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
    });
    dibujarNucleo(t);
    if (!reducido && !document.hidden) requestAnimationFrame(cuadro);
  }

  let espera;
  window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { medir(); if (reducido) cuadro(performance.now()); }, 150); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reducido) { ultimo = 0; requestAnimationFrame(cuadro); } });
  medir();
  requestAnimationFrame(cuadro);
})();
