// Construye Instructivo-Maleta/index.html (instructivo del Guía Especialista para la maleta didáctica): toma el instructivo en HTML (generado con pandoc desde el Markdown),
// lo cifra con la clave de acceso (AES-GCM 256 + PBKDF2-SHA256) y lo inserta en la plantilla.
// El texto del instructivo NUNCA se sube al repositorio en claro.
//
// Uso:  node herramientas/construir-instructivo.mjs <cuerpo.html> "<CLAVE>" "<fecha legible>"
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [cuerpoPath, claveCruda, fecha] = process.argv.slice(2);
if (!cuerpoPath || !claveCruda || !fecha) { console.error('Uso: node construir-instructivo.mjs <cuerpo.html> "<CLAVE>" "<fecha>"'); process.exit(1); }

const clave = claveCruda.trim().toUpperCase().replace(/\s+/g, '');
const iteraciones = 310000;
const sal = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveKey']);
const llave = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: iteraciones, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, new TextEncoder().encode(readFileSync(cuerpoPath, 'utf8'))));
const b64 = (u) => Buffer.from(u).toString('base64');

const url = new URL('.', import.meta.url);
const plantilla = readFileSync(new URL('plantilla-instructivo.html', url), 'utf8');
const salida = plantilla
  .replace('__PAYLOAD__', JSON.stringify({ sal: b64(sal), iv: b64(iv), iteraciones, datos: b64(datos) }))
  .replace('__FECHA__', fecha);
mkdirSync(new URL('../Instructivo-Maleta/', url), { recursive: true });
writeFileSync(new URL('../Instructivo-Maleta/index.html', url), salida);
console.log('Instructivo-Maleta/index.html generado (' + salida.length + ' bytes)');
