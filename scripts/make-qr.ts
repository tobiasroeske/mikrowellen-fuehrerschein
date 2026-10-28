import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const APP_URL = process.env.APP_URL ?? 'https://tobiasroeske.github.io/mikrowellen-fuehrerschein/';
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

const svg = await QRCode.toString(APP_URL, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
writeFileSync(publicDir + 'qr.svg', svg);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mikrowellen-Führerschein – Aushang</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #e5e7eb; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; }
  .sheet { width: 210mm; height: 297mm; margin: 0 auto; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
  .band { background: #1f4e9c; color: #fff; padding: 12mm 14mm 8mm; text-align: center; }
  .band small { display: block; font-size: 4.5mm; letter-spacing: .08em; text-transform: uppercase; opacity: .9; }
  .band h1 { margin: 3mm 0 0; font-size: 11mm; line-height: 1.1; }
  .stripe { height: 4mm; background: repeating-linear-gradient(135deg, #f5c400 0 6mm, #1a1a1a 6mm 12mm); }
  .body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-around; padding: 8mm 14mm; text-align: center; }
  .call { font-size: 9mm; font-weight: 800; color: #d7262e; margin: 0; line-height: 1.15; }
  .qr { width: 100mm; height: 100mm; border: 1.2mm solid #1f4e9c; padding: 3mm; background: #fff; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .mascot { height: 52mm; width: auto; }
  ol { margin: 0; padding: 0; list-style: none; display: grid; gap: 3mm; text-align: left; font-size: 5mm; }
  ol li { display: flex; align-items: center; gap: 4mm; }
  ol b { flex: none; width: 9mm; height: 9mm; border-radius: 50%; background: #1f4e9c; color: #fff; display: grid; place-items: center; font-size: 5mm; }
  .url { font-size: 4mm; color: #555; word-break: break-all; }
  footer { background: #f3f4f6; border-top: .5mm solid #1f4e9c; padding: 4mm 14mm; text-align: center; font-size: 3.6mm; color: #555; }
  @media print { html, body { background: #fff; } .sheet { margin: 0; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="sheet">
  <div class="band"><small>Prüfstelle für Erhitzungswesen</small><h1>Mikrowellen-Führerschein</h1></div>
  <div class="stripe"></div>
  <div class="body">
    <p class="call">Jetzt Theorieprüfung ablegen!</p>
    <img class="mascot" src="illustrations/microwave-mascot.svg" alt="Maskottchen Mikrowelle" width="400" height="300">
    <div class="qr">${svg}</div>
    <ol>
      <li><b>1</b><span>QR-Code mit dem Handy scannen</span></li>
      <li><b>2</b><span>5 Lernkarten lesen, 12 Fragen beantworten</span></li>
      <li><b>3</b><span>Höchstens 10 Fehlerpunkte – Führerschein sichern</span></li>
    </ol>
    <p class="url">${esc(APP_URL)}</p>
  </div>
  <footer>Dauer ca. 10 Minuten · Kein Anspruch auf Mikrowellen-Fachkunde im Sinne der StVZO</footer>
</div>
</body>
</html>
`;
writeFileSync(publicDir + 'qr-print.html', html);
console.log(`QR written for ${APP_URL}`);
