/* ==========================================================================
   SONIDO · CIERRE DE RUTA
   Ambiente suave en bucle + un destello sonoro al girar o cambiar de postal.
   Usa los audios de ElevenLabs si están en la carpeta audio/:
     audio/cierre-ambiente.mp3  (bucle de ambiente)
     audio/cierre-giro.mp3      (giro de postal)
   Si no están, genera un ambiente equivalente con el propio navegador.
   Apagado por defecto (los navegadores no permiten sonido sin un toque).
   Metodología y diseño: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const ARCHIVO_AMBIENTE = 'audio/cierre-ambiente.mp3';
  const ARCHIVO_GIRO = 'audio/cierre-giro.mp3';
  const VOL_AMBIENTE = 0.2, VOL_GIRO = 0.3;

  let ctx = null, maestro = null, activo = false, sinte = null, campanas = null;
  let audioAmb = null, usaArchivo = null, bajado = false;
  const leer = () => { try { return localStorage.getItem('mdt-cdr-sonido') === '1'; } catch (e) { return false; } };
  const guardar = v => { try { localStorage.setItem('mdt-cdr-sonido', v ? '1' : '0'); } catch (e) {} };

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      maestro = ctx.createGain(); maestro.gain.value = 0; maestro.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ------------------------------------------- ambiente desde archivo (bucle sin cortes) */
  let bufAmb = null, fuenteAmb = null, gananciaAmb = null;
  async function probarArchivo() {
    if (usaArchivo !== null) return usaArchivo;
    const c = contexto();
    try {
      if (!c) throw new Error('sin audio');
      const r = await fetch(ARCHIVO_AMBIENTE);
      if (!r.ok) throw new Error('sin archivo');
      const datos = await r.arrayBuffer();
      bufAmb = await new Promise((ok, mal) => c.decodeAudioData(datos, ok, mal));
      usaArchivo = true;
    } catch (e) { usaArchivo = false; }
    return usaArchivo;
  }
  function sonarArchivo() {
    const c = contexto(); if (!c || !bufAmb || fuenteAmb) return;
    gananciaAmb = c.createGain(); gananciaAmb.gain.value = 0;
    gananciaAmb.connect(maestro);
    fuenteAmb = c.createBufferSource(); fuenteAmb.buffer = bufAmb; fuenteAmb.loop = true;
    fuenteAmb.connect(gananciaAmb); fuenteAmb.start();
    gananciaAmb.gain.setTargetAtTime(VOL_AMBIENTE, c.currentTime, 0.6);
  }
  function callarArchivo() {
    if (!fuenteAmb || !ctx) return;
    const f = fuenteAmb, g = gananciaAmb; fuenteAmb = null; gananciaAmb = null;
    g.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => { try { f.stop(); } catch (e) {} }, 900);
  }

  /* ------------------------------------------- ambiente sintetizado */
  function iniciarSinte() {
    const c = contexto(); if (!c || sinte) return;
    const filtro = c.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 700; filtro.Q.value = 0.6;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.05;
    const lfoG = c.createGain(); lfoG.gain.value = 260; lfo.connect(lfoG); lfoG.connect(filtro.frequency);
    const bus = c.createGain(); bus.gain.value = 0.9;
    filtro.connect(bus); bus.connect(maestro);
    // acorde suave (La menor con novena), voces ligeramente desafinadas
    const notas = [110, 164.81, 220, 246.94, 329.63];
    const osc = [];
    notas.forEach((f, i) => {
      [-4, 4].forEach(cents => {
        const o = c.createOscillator(); o.type = i < 2 ? 'sine' : 'triangle';
        o.frequency.value = f; o.detune.value = cents;
        const g = c.createGain(); g.gain.value = (i < 2 ? 0.05 : 0.018);
        // respiración lenta de cada voz
        const l = c.createOscillator(); l.frequency.value = 0.03 + Math.random() * 0.05;
        const lg = c.createGain(); lg.gain.value = g.gain.value * 0.6; l.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(filtro); o.start(); l.start(); osc.push(o, l);
      });
    });
    // zumbido de datos muy tenue (ruido filtrado)
    const ruido = c.createBufferSource(); ruido.buffer = bufferRuido(c, 2); ruido.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8;
    const rg = c.createGain(); rg.gain.value = 0.006;
    ruido.connect(bp); bp.connect(rg); rg.connect(maestro); ruido.start();
    lfo.start();
    sinte = { parar: () => { osc.concat([lfo, ruido]).forEach(o => { try { o.stop(); } catch (e) {} }); } };
    // destellos cristalinos ocasionales
    campanas = setInterval(() => { if (activo && Math.random() < 0.55) campana(c, [880, 987.77, 1318.5, 1760][Math.floor(Math.random() * 4)], 0.012, 3.5); }, 3200);
  }
  function bufferRuido(c, seg) {
    const b = c.createBuffer(1, c.sampleRate * seg, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function campana(c, f, vol, dur) {
    const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(maestro); o.start(t); o.stop(t + dur + 0.1);
  }

  /* ------------------------------------------- giro de postal */
  let audioGiro = null, giroArchivo = null;
  (function precargarGiro() {
    const a = new Audio(); a.preload = 'auto';
    a.addEventListener('canplaythrough', () => { audioGiro = a; giroArchivo = true; }, { once: true });
    a.addEventListener('error', () => { giroArchivo = false; }, { once: true });
    a.src = ARCHIVO_GIRO;
  })();
  function giro() {
    if (!activo) return;
    if (giroArchivo && audioGiro) {
      const a = audioGiro.cloneNode(); a.volume = VOL_GIRO; a.play().catch(() => {}); return;
    }
    const c = contexto(); if (!c) return;
    const t = c.currentTime;
    // barrido de aire
    const r = c.createBufferSource(); r.buffer = bufferRuido(c, 0.5);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3800, t + 0.28);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    r.connect(f); f.connect(g); g.connect(maestro); r.start(t); r.stop(t + 0.5);
    // destello
    setTimeout(() => { campana(c, 1318.5, 0.03, 1.2); campana(c, 1975.5, 0.015, 0.9); }, 120);
  }

  /* ------------------------------------------- encender / apagar */
  async function encender() {
    activo = true; guardar(true); actualizarBoton();
    const c = contexto();
    if (c) maestro.gain.setTargetAtTime(1, c.currentTime, 0.4);
    const hayArchivo = await probarArchivo();
    if (!activo) return;
    if (hayArchivo) sonarArchivo();
    else iniciarSinte();
  }
  function apagar() {
    activo = false; guardar(false); actualizarBoton();
    callarArchivo();
    if (ctx) maestro.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  }
  function alternar() { activo ? apagar() : encender(); }
  // baja el ambiente mientras habla la voz
  function bajar(si) {
    bajado = si;
    if (ctx && activo) maestro.gain.setTargetAtTime(si ? 0.3 : 1, ctx.currentTime, 0.2);
  }

  let boton = null;
  function actualizarBoton() {
    if (!boton) return;
    boton.innerHTML = '♪<span class="txt-largo"> Sonido: ' + (activo ? 'sí' : 'no') + '</span>';
    boton.setAttribute('aria-label', activo ? 'Apagar sonido' : 'Encender sonido');
    boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
    boton.classList.toggle('encendido', activo);
  }
  function enlazar(el) { boton = el; el.addEventListener('click', alternar); actualizarBoton(); }

  document.addEventListener('visibilitychange', () => {
    if (!activo) return;
    if (document.hidden) { if (ctx) ctx.suspend(); }
    else { if (ctx) ctx.resume(); }
  });

  window.SONIDO_RUTA = { enlazar: enlazar, encender: encender, apagar: apagar, giro: giro, bajar: bajar, preferido: leer, get activo() { return activo; } };
})();
