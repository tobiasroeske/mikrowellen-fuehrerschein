import { APP_URL } from '../config';
import { illustrationUrl } from '../ui';

export interface CertificateData {
  name: string;
  birthDate: string;
  date: string;
  validUntil: string;
  certificateId: string;
  sheetNumber: string;
  points: number;
  maxPoints: number;
}

const BLUE: [number, number, number] = [31, 78, 156];
const RED: [number, number, number] = [215, 38, 46];
const GREY: [number, number, number] = [90, 90, 90];

/** Rasterises an SVG to a 2x PNG data URL; returns null if it cannot be loaded. */
async function svgToPng(url: string, width: number, height: number): Promise<string | null> {
  try {
    const img = new Image();
    img.width = width;
    img.height = height;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image load failed'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

const safeFileName = (name: string) =>
  name
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Teilnehmer';

export async function buildCertificate(data: CertificateData) {
  const [{ jsPDF }, QRCode] = await Promise.all([import('jspdf'), import('qrcode')]);
  const [mascot, qr] = await Promise.all([
    svgToPng(illustrationUrl('microwave-mascot.svg'), 400, 300),
    QRCode.toDataURL(APP_URL, { margin: 1, width: 300, errorCorrectionLevel: 'M' }),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const W = 297;
  const H = 210;
  const cx = W / 2;

  // Double frame
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.6);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24);

  doc.setTextColor(...GREY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('PRÜFSTELLE FÜR ERHITZUNGSWESEN', cx, 26, { align: 'center', charSpace: 0.8 });

  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text('Mikrowellen-Führerschein · Klasse M', cx, 44, { align: 'center' });
  doc.setDrawColor(245, 196, 0);
  doc.setLineWidth(1);
  doc.line(cx - 50, 50, cx + 50, 50);

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Hiermit wird bescheinigt, dass', cx, 68, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(data.name, cx, 84, { align: 'center', maxWidth: W - 60 });
  doc.setLineWidth(0.4);
  doc.setDrawColor(...GREY);
  doc.line(cx - 80, 88, cx + 80, 88);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GREY);
  doc.text(`geboren am ${data.birthDate}`, cx, 95, { align: 'center' });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.text('die theoretische Prüfung zur sachkundigen Bedienung von Mikrowellengeräten', cx, 104, { align: 'center' });
  doc.text('bestanden hat.', cx, 111, { align: 'center' });

  // Details
  doc.setFontSize(11);
  const rows: [string, string][] = [
    ['Datum', data.date],
    ['Gültig bis', data.validUntil],
    ['Prüfungsbogen', data.sheetNumber.replace(/^Bogen /, '')],
    ['Fehlerpunkte', `${data.points} von max. ${data.maxPoints}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 122 + i * 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text(`${label}:`, 40, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(value, 75, y);
  });

  // Mascot
  if (mascot) doc.addImage(mascot, 'PNG', W - 40 - 62, 112, 62, 46.5, undefined, 'FAST');

  // Stamp
  const stampX = 156;
  const stampY = 142;
  const angle = 12;
  const rad = (angle * Math.PI) / 180;
  // Point `d` mm below the stamp centre, measured along the rotated text normal.
  const below = (d: number): [number, number] => [stampX + d * Math.sin(rad), stampY + d * Math.cos(rad)];
  doc.setDrawColor(...RED);
  doc.setTextColor(...RED);
  doc.setLineWidth(1.4);
  doc.circle(stampX, stampY, 19);
  doc.setLineWidth(0.5);
  doc.circle(stampX, stampY, 16.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BESTANDEN', ...below(2), { align: 'center', angle });
  doc.setFontSize(7);
  doc.text('GEPRÜFT · KLASSE M', ...below(8), { align: 'center', angle });

  // Signature line
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.4);
  doc.line(40, 183, 120, 183);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text('Prüfstelle für Erhitzungswesen (Michael Weichelt)', 80, 188, { align: 'center' });

  // Certificate ID and QR
  doc.text(`Zertifikats-ID: ${data.certificateId}`, cx + 10, 188);
  doc.addImage(qr, 'PNG', W - 40 - 22, 164, 22, 22, undefined, 'FAST');
  doc.setFontSize(7);
  doc.text('Selbst prüfen', W - 40 - 11, 188.5, { align: 'center' });

  return doc;
}

export async function saveCertificatePdf(data: CertificateData): Promise<void> {
  const doc = await buildCertificate(data);
  const fileName = `Mikrowellen-Fuehrerschein_${safeFileName(data.name)}.pdf`;

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch && typeof navigator.canShare === 'function') {
    const file = new File([doc.output('blob')], fileName, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Mikrowellen-Führerschein' });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
  }
  doc.save(fileName);
}
