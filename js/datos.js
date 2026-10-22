/* ==========================================================================
   MÁQUINA DEL TIEMPO · Capa de datos
   Dos modos con la misma interfaz:
     - Supabase: celulares y consola comparten los datos por internet.
     - Demo: todo vive en este navegador (localStorage). Para probar en un
       solo computador abriendo varias pestañas.
   ========================================================================== */
(function () {
  'use strict';
  const CFG = window.CONFIG || {};
  const GRUPOS = ['G1', 'G2', 'G3', 'G4'];

  /* ------------------------------------------------------------ Supabase */
  function supabase(url, key) {
    const base = url.replace(/\/+$/, '') + '/rest/v1/';
    const cab = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
    async function pedir(ruta, opc) {
      const o = opc || {};
      const r = await fetch(base + ruta, { method: o.method || 'GET', headers: Object.assign({}, cab, o.headers || {}), body: o.body, cache: 'no-store' });
      const t = await r.text();
      let d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
      if (!r.ok) {
        const msg = (d && (d.message || d.details || d.hint)) || ('Error ' + r.status);
        const err = new Error(msg); err.codigo = d && d.code; throw err;
      }
      return d;
    }
    return {
      modo: 'supabase',
      async ahora() {
        const t0 = Date.now();
        const d = await pedir('rpc/ahora', { method: 'POST', body: '{}' });
        const t1 = Date.now();
        return new Date(d).getTime() + (t1 - t0) / 2 - t1 + Date.now();
      },
      async participantes() { return pedir('participantes?select=*&order=creado.asc'); },
      async registrar(p) {
        const d = await pedir('participantes', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(p) });
        return d[0];
      },
      async grupos() {
        const filas = await pedir('grupos?select=id,estado,actualizado');
        const o = {}; filas.forEach(f => { o[f.id] = f.estado || {}; }); return o;
      },
      async grupo(id) {
        const filas = await pedir('grupos?select=estado&id=eq.' + encodeURIComponent(id));
        return (filas[0] && filas[0].estado) || {};
      },
      async guardarGrupo(id, estado) {
        await pedir('grupos?id=eq.' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ estado: estado, actualizado: new Date().toISOString() }) });
      },
      async reiniciar(pin) {
        const ok = await pedir('rpc/reiniciar_sesion', { method: 'POST', body: JSON.stringify({ p_pin: pin }) });
        if (!ok) throw new Error('PIN incorrecto.');
      }
    };
  }

  /* ---------------------------------------------------------------- Demo */
  function demo() {
    const CLAVE = 'mdt-demo-db';
    function leer() {
      let db = null;
      try { db = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { db = null; }
      if (!db) { db = { participantes: [], grupos: {} }; GRUPOS.forEach(g => { db.grupos[g] = {}; }); }
      return db;
    }
    function escribir(db) { try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) {} }
    return {
      modo: 'demo',
      async ahora() { return Date.now(); },
      async participantes() { return leer().participantes; },
      async registrar(p) {
        const db = leer();
        const delGrupo = db.participantes.filter(x => x.grupo === p.grupo);
        if (delGrupo.length >= 7) throw new Error('Este grupo ya tiene sus 7 integrantes.');
        if (p.rol !== 'TRIPULANTE' && delGrupo.some(x => x.rol === p.rol)) throw new Error('Ese rol ya fue tomado en este grupo.');
        if (p.rol === 'TRIPULANTE' && delGrupo.filter(x => x.rol === 'TRIPULANTE').length >= 4) throw new Error('Ya hay 4 Tripulantes de Élite en este grupo.');
        const fila = Object.assign({ id: 'p' + Date.now() + Math.random().toString(16).slice(2, 6), creado: new Date().toISOString() }, p);
        db.participantes.push(fila); escribir(db); return fila;
      },
      async grupos() { return leer().grupos; },
      async grupo(id) { return leer().grupos[id] || {}; },
      async guardarGrupo(id, estado) { const db = leer(); db.grupos[id] = estado; escribir(db); },
      async reiniciar(pin) {
        if (pin !== '0000') throw new Error('PIN incorrecto. En modo demo el PIN es 0000.');
        try { localStorage.removeItem(CLAVE); } catch (e) {}
      }
    };
  }

  window.DATOS = (CFG.supabaseUrl && CFG.supabaseKey) ? supabase(CFG.supabaseUrl, CFG.supabaseKey) : demo();
  window.DATOS.GRUPOS = GRUPOS;

  /* Traduce los errores de la base de datos a mensajes para el jugador. */
  window.DATOS.mensaje = function (e) {
    const m = String((e && e.message) || e || '');
    if (/rol_unico|duplicate key/i.test(m)) return 'Ese rol ya fue tomado en este grupo. Elijan otro.';
    if (/grupo_lleno/i.test(m)) return 'Este grupo ya tiene sus 7 integrantes.';
    if (/tripulantes_llenos/i.test(m)) return 'Ya hay 4 Tripulantes de Élite en este grupo.';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sin conexión. Revisen el wifi o los datos del celular e intenten de nuevo.';
    return m;
  };
})();
