/* ==========================================================================
   MÁQUINA DEL TIEMPO · utilidades compartidas
   Servidor, voz del Guardián, sonidos, almacenamiento y textos.
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   ========================================================================== */
(function () {
  'use strict';
  const C = window.CONTENIDO;

  /* ------------------------------------------------------------- servidor */
  async function rpc(fn, args) {
    const S = window.SERVIDOR || {};
    if (!S.url || !S.clave) throw new Error('SIN_SERVIDOR');
    let r;
    try {
      r = await fetch(S.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, {
        method: 'POST',
        headers: { apikey: S.clave, Authorization: 'Bearer ' + S.clave, 'Content-Type': 'application/json' },
        body: JSON.stringify(args || {})
      });
    } catch (e) { throw new Error('SIN_RED'); }
    const txt = await r.text();
    let d = null; try { d = txt ? JSON.parse(txt) : null; } catch (e) { d = txt; }
    if (!r.ok) throw new Error((d && (d.message || d.details)) || ('Error ' + r.status));
    return d;
  }
  function mensajeError(e) {
    const m = (e && e.message) || String(e);
    if (m === 'SIN_SERVIDOR') return 'La plataforma aún no está conectada a su base de datos. Avisen al Guía Especialista.';
    if (m === 'SIN_RED') return 'Sin conexión. Revisen el wifi o los datos del celular e inténtenlo de nuevo.';
    return m.replace(/^(OCUPADA|CERRADA):/, '');
  }

  /* -------------------------------------------------------- almacenamiento */
  const guardar = (k, v) => { try { localStorage.setItem('mdt-' + k, JSON.stringify(v)); } catch (e) {} };
  const leer = (k, def) => { try { const t = localStorage.getItem('mdt-' + k); return t ? JSON.parse(t) : def; } catch (e) { return def; } };
  function dispositivo() {
    let d = leer('dispositivo', null);
    if (!d) { d = 'd-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); guardar('dispositivo', d); }
    return d;
  }

  /* ------------------------------------------------------------ utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mmss = seg => { const n = Math.max(0, Math.ceil(seg)); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
  const grupo = id => C.juego.grupos.find(g => g.id === id) || { id: id, nombre: id, color: '#05dd4d', simbolo: '◆' };
  const estacion = id => C.estaciones.find(e => e.id === id);
  const rol = id => C.juego.roles[id] || { nombre: id, subtitulo: '', mision: [] };
  const logo = (clase) => '<img class="' + (clase || 'logo') + '" src="img/solventum-logo.png" alt="Solventum">';
  function urlDe(pagina, params) {
    const u = new URL(pagina, location.href);
    Object.keys(params || {}).forEach(k => u.searchParams.set(k, params[k]));
    return u.toString();
  }

  /* --------------------------------------------- reloj sincronizado al servidor */
  let desfase = 0;   // ms: hora del servidor - hora del celular
  function sincronizar(ahoraServidor) { if (ahoraServidor) desfase = new Date(ahoraServidor).getTime() - Date.now(); }
  const ahora = () => Date.now() + desfase;

  /* ----------------------------------------------------------------- audio */
  let ctx = null, sonido = leer('sonido', true);
  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tono(f, d, tipo, vol, ret) {
    const a = audio(); if (!a || !sonido) return;
    const t0 = a.currentTime + (ret || 0), o = a.createOscillator(), g = a.createGain();
    o.type = tipo || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + d + 0.05);
  }
  const SFX = {
    ok() { tono(660, 0.18, 'triangle', 0.18); tono(990, 0.3, 'triangle', 0.16, 0.12); },
    error() { tono(150, 0.35, 'sawtooth', 0.12); tono(110, 0.4, 'sawtooth', 0.1, 0.08); },
    paso() { tono(520, 0.12, 'sine', 0.1); },
    tic() { tono(1400, 0.04, 'square', 0.04); },
    candado() { tono(300, 0.08, 'square', 0.12); tono(420, 0.08, 'square', 0.12, 0.09); tono(880, 0.4, 'triangle', 0.16, 0.2); },
    monitor(n) { for (let i = 0; i < n; i++) tono(1046, 0.09, 'sine', 0.09, i * (60 / 130)); },
    impacto() { tono(55, 0.9, 'sine', 0.3); tono(110, 0.5, 'triangle', 0.12, 0.02); tono(880, 0.25, 'sine', 0.05, 0.05); },
    portal() { tono(220, 0.6, 'sine', 0.12); tono(330, 0.6, 'sine', 0.1, 0.15); tono(440, 0.9, 'triangle', 0.12, 0.3); }
  };

  /* ------------------------------------------------------ voz del Guardián
     Voz masculina en español latinoamericano cuando el dispositivo la tenga.
     Cada celular trae voces distintas: se elige la mejor disponible y el
     Comandante puede cambiarla a mano en Ajustes de voz. */
  const MASCULINAS = /(jorge|juan|diego|carlos|pablo|ra[uú]l|gerardo|enrique|andr[eé]s|alonso|jos[eé]|miguel|antonio|[aá]lvaro|dar[ií]o|tom[aá]s|federico|lucas|mateo|alberto|eddy|reed|rocko|grandpa|male|hombre|masculin|x-esd|x-eed|x-esb)/i;
  const LATAM = /^es[-_](MX|US|419|CO|AR|CL|PE|VE|EC|UY|PY|BO|CR|PA|DO|GT|HN|NI|SV|PR|CU)/i;
  let voces = [], vozElegida = null;
  function puntaje(v) {
    if (!/^es/i.test(v.lang)) return -1;
    let p = 0;
    if (MASCULINAS.test(v.name) || MASCULINAS.test(v.voiceURI || '')) p += 100;
    if (LATAM.test(v.lang)) p += 30; else if (/^es[-_]ES/i.test(v.lang)) p += 10;
    if (/natural|neural|online|premium|enhanced|mejorada/i.test(v.name)) p += 8;
    if (v.localService) p += 2;
    return p;
  }
  function cargarVoces() {
    if (!('speechSynthesis' in window)) return;
    voces = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => puntaje(b) - puntaje(a));
    const preferida = leer('voz', null);
    vozElegida = voces.find(v => v.voiceURI === preferida) || voces[0] || null;
  }
  if ('speechSynthesis' in window) { cargarVoces(); speechSynthesis.onvoiceschanged = cargarVoces; }
  const esMasculina = v => !!v && (MASCULINAS.test(v.name) || MASCULINAS.test(v.voiceURI || ''));
  let colaVoz = 0;
  /* Velocidad de la voz: el Comandante la cambia en Ajustes de voz. */
  const VELOCIDADES = { normal: 1.0, agil: 1.15, rapida: 1.3 };
  let velocidad = leer('velocidad', 'agil');
  /* Une las frases en bloques largos: cada bloque nuevo es una pausa del
     motor de voz, y muchas pausas hacen que el Guardián suene lento. */
  function bloques(texto) {
    const frases = String(texto).replace(/™/g, '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*/g) || [String(texto)];
    const out = []; let actual = '';
    frases.forEach(f => {
      if ((actual + ' ' + f).length > 220 && actual) { out.push(actual.trim()); actual = f; }
      else actual += ' ' + f;
    });
    if (actual.trim()) out.push(actual.trim());
    return out;
  }
  function decir(texto, alTerminar) {
    if (!sonido || !('speechSynthesis' in window) || !texto) { if (alTerminar) alTerminar(); return; }
    speechSynthesis.cancel();
    const id = ++colaVoz, partes = bloques(texto);
    partes.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.lang = vozElegida ? vozElegida.lang : 'es-MX';
      if (vozElegida) u.voice = vozElegida;
      u.rate = VELOCIDADES[velocidad] || 1.15;
      u.pitch = esMasculina(vozElegida) ? 0.9 : 0.78;   // sin voz masculina: tono más grave
      u.volume = 1;
      if (i === partes.length - 1 && alTerminar) u.onend = () => { if (id === colaVoz) alTerminar(); };
      speechSynthesis.speak(u);
    });
  }
  function elegirVelocidad(v) { if (VELOCIDADES[v]) { velocidad = v; guardar('velocidad', v); } }
  function callar() { colaVoz++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function alternarSonido() { sonido = !sonido; guardar('sonido', sonido); if (!sonido) callar(); return sonido; }
  function elegirVoz(uri) { guardar('voz', uri); cargarVoces(); }

  window.MDT = {
    C, rpc, mensajeError, guardar, leer, dispositivo, esc, mmss, grupo, estacion, rol, logo, urlDe,
    sincronizar, ahora, audio, SFX, decir, callar, alternarSonido, elegirVoz, elegirVelocidad, esMasculina,
    get sonido() { return sonido; }, get velocidad() { return velocidad; }, get voces() { return voces; }, get vozElegida() { return vozElegida; }
  };
})();
