// Verschlüsselt PDFs für lesen/index.html.
// Aufruf:  LESEN_CODE='…' node verschluesseln.mjs <quellordner> <zielordner lesen/d>
// Der Code kommt nur aus der Umgebungsvariable LESEN_CODE (nie als Argument, nie ins Log).
//
// Dateiformat (.bin, alle Zahlen big-endian):
//   Byte  0      Version = 1
//   Byte  1..4   PBKDF2-Iterationen (uint32)
//   Byte  5..20  Salt (16 Byte, zufällig pro Datei)
//   Byte 21..32  IV (12 Byte, zufällig pro Datei)
//   Byte 33..    AES-256-GCM-Chiffretext + 16 Byte Tag (wie WebCrypto)
// Schlüssel: PBKDF2-HMAC-SHA-256(Code, Salt, Iterationen) -> 256 Bit.
// Der Kopf (Byte 0..32) ist zusätzlich als AAD authentifiziert.
// index.bin enthält JSON: {"v":1,"gruppen":[{"name":"…","eintraege":[{"titel":"…","datei":"<id>.bin","name":"….pdf"}]}]}
//
// Quellordner: je Klasse/Gruppe ein Unterordner mit PDFs. Titel = Dateiname ohne Endung;
// optional titel.json im Quellordner: {"<Gruppe>/<Dateiname ohne Endung>": "Anderer Titel"}.
import { webcrypto, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync, statSync } from 'node:fs';
import { join, basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const subtle = webcrypto.subtle;
// BEGIN CRYPTO (identisch mit lesen/index.html)
const ITER_MIN = 600000;
async function schluessel(code, salt, iter) {
  const roh = await subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, roh,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function entschluesseln(code, buf) {
  const b = new Uint8Array(buf);
  if (b.length < 49 || b[0] !== 1) throw new Error('format');
  const iter = new DataView(b.buffer, b.byteOffset + 1, 4).getUint32(0);
  if (iter < ITER_MIN || iter > 5000000) throw new Error('format');
  const kopf = b.slice(0, 33);
  const key = await schluessel(code, b.slice(5, 21), iter);
  return new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: b.slice(21, 33), additionalData: kopf }, key, b.slice(33)));
}
// END CRYPTO
export async function verschluesseln(code, daten, iter = ITER_MIN) {
  const kopf = new Uint8Array(33);
  kopf[0] = 1;
  new DataView(kopf.buffer).setUint32(1, iter);
  kopf.set(randomBytes(16), 5);
  kopf.set(randomBytes(12), 21);
  const key = await schluessel(code, kopf.slice(5, 21), iter);
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv: kopf.slice(21, 33), additionalData: kopf }, key, daten));
  const out = new Uint8Array(33 + ct.length);
  out.set(kopf); out.set(ct, 33);
  return out;
}
export { entschluesseln };

function sauber(s) { return s.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim(); }

async function main() {
  const [quelle, ziel] = process.argv.slice(2);
  const code = process.env.LESEN_CODE;
  if (!quelle || !ziel) { console.error('Aufruf: LESEN_CODE=… node verschluesseln.mjs <quellordner> <zielordner>'); process.exit(2); }
  if (!code) { console.error('Umgebungsvariable LESEN_CODE fehlt.'); process.exit(2); }
  const titelDatei = join(quelle, 'titel.json');
  const titel = existsSync(titelDatei) ? JSON.parse(readFileSync(titelDatei, 'utf8')) : {};
  mkdirSync(ziel, { recursive: true });
  const alt = readdirSync(ziel).filter(f => f.endsWith('.bin'));
  const gruppen = [];
  let n = 0;
  const ordner = readdirSync(quelle).filter(f => statSync(join(quelle, f)).isDirectory()).sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
  for (const g of ordner) {
    const eintraege = [];
    const pdfs = readdirSync(join(quelle, g)).filter(f => extname(f).toLowerCase() === '.pdf').sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
    for (const f of pdfs) {
      const stamm = basename(f, extname(f));
      const t = titel[`${g}/${stamm}`] || stamm;
      const id = randomBytes(12).toString('hex') + '.bin';
      writeFileSync(join(ziel, id), await verschluesseln(code, readFileSync(join(quelle, g, f))));
      eintraege.push({ titel: t, datei: id, name: sauber(t) + '.pdf' });
      n++;
    }
    if (eintraege.length) gruppen.push({ name: g, eintraege });
  }
  const idx = new TextEncoder().encode(JSON.stringify({ v: 1, gruppen }));
  writeFileSync(join(ziel, 'index.bin'), await verschluesseln(code, idx));
  const neu = new Set(['index.bin', ...gruppen.flatMap(g => g.eintraege.map(e => e.datei))]);
  for (const f of alt) if (!neu.has(f)) unlinkSync(join(ziel, f));
  console.log(`${n} Datei(en) in ${gruppen.length} Gruppe(n) verschlüsselt.`);
}
if (resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) main().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
