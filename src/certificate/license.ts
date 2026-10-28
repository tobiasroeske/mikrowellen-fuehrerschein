import { h, illustrationUrl } from '../ui';

export interface LicenseData {
  name: string;
  date: string;
  certificateId: string;
}

export function certificateId(seed: number): string {
  return `MW-${(seed >>> 0).toString(36).toUpperCase().padStart(7, '0')}`;
}

const star = (cx: number, cy: number, r: number): string => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  });
  return `<polygon points="${pts.join(' ')}" fill="#f5c400"/>`;
};

const euFieldSvg = (): string => {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (Math.PI / 6) * i;
    return star(50 + 28 * Math.cos(a), 56 + 28 * Math.sin(a), 6);
  }).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" aria-hidden="true">` +
    `<rect width="100" height="130" fill="#1f4e9c"/>${stars}` +
    `<text x="50" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" fill="#fff">D</text>` +
    `<text x="50" y="118" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="12" fill="#fff">EU</text></svg>`
  );
};

/** Fine guilloche-like wave pattern as an inline SVG data URI. */
const guillocheUrl = (): string => {
  const paths: string[] = [];
  for (let k = 0; k < 18; k++) {
    const amp = 6 + (k % 6) * 2;
    const phase = k * 0.7;
    const y0 = k * 8;
    let d = '';
    for (let x = 0; x <= 400; x += 8) {
      const y = y0 + amp * Math.sin(x / 22 + phase) + 4 * Math.sin(x / 9 + k);
      d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
    }
    const color = k % 3 === 0 ? '#d7262e' : k % 3 === 1 ? '#1f4e9c' : '#e8788a';
    paths.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width=".6" opacity=".22"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 140" preserveAspectRatio="none">${paths.join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const field = (label: string, value: string, extra = '') =>
  h('div', { class: `lf ${extra}`.trim() }, h('span', { class: 'lf-n' }, label), h('span', { class: 'lf-v' }, value));

/** On-screen EU-card-style licence. */
export function renderLicense(data: LicenseData): HTMLElement {
  const eu = h('div', { class: 'lic-eu' });
  eu.innerHTML = euFieldSvg();

  const card = h(
    'div',
    { class: 'license', role: 'img', 'aria-label': `Führerschein Klasse M für ${data.name}` },
    h('div', { class: 'lic-bg', style: `background-image:${guillocheUrl()}` }),
    eu,
    h('div', { class: 'lic-head' }, h('strong', null, 'FÜHRERSCHEIN'), h('span', null, 'Mikrowellen · Klasse M')),
    h('img', { class: 'lic-photo', src: illustrationUrl('microwave-mascot-square.svg'), alt: '', width: 300, height: 300 }),
    h(
      'div',
      { class: 'lic-fields', 'aria-hidden': 'true' },
      field('1./2.', data.name, 'lf-name'),
      field('3.', data.date),
      field('4a.', data.date),
      field('4b.', 'Popcorn-Ende', 'lf-wide'),
      field('4c.', 'Prüfstelle für Erhitzungswesen', 'lf-wide lf-small'),
      field('5.', data.certificateId),
      field('9.', 'M', 'lf-class'),
    ),
  );
  return card;
}
