type Child = Node | string | null | false | undefined;
type Props = Record<string, unknown>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props | null = null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === 'class') {
      el.className = String(value);
    } else if (key === 'value' || key === 'checked') {
      (el as unknown as Record<string, unknown>)[key] = value;
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  }
  for (const child of children) {
    if (child === null || child === false || child === undefined) continue;
    el.append(child);
  }
  return el;
}

const ALT: Record<string, string> = {
  'microwave-mascot.svg': 'Maskottchen: eine freundliche Mikrowelle mit Fahrschul-Schild',
  'microwave-mascot-square.svg': 'Passfoto der Mikrowelle',
  'magnetron-waves.svg': 'Magnetron sendet Mikrowellen in den Garraum',
  'water-dipoles.svg': 'Wassermoleküle richten sich im Wechselfeld aus',
  'hotspots.svg': 'Heiße und kalte Zonen im Garraum',
  'alufolie-funken.svg': 'Alufolie in der Mikrowelle sprüht Funken',
  'faraday-door.svg': 'Gitter der Mikrowellentür als Faradayscher Käfig',
  'egg-explosion.svg': 'Ein Ei platzt in der Mikrowelle',
  'siedeverzug.svg': 'Siedeverzug: überhitztes Wasser in einer Tasse',
  'wattage-dial.svg': 'Leistungsregler einer Mikrowelle',
  'auftauen.svg': 'Gefrorenes Lebensmittel beim Auftauen',
  'abdecken.svg': 'Abgedeckte Schüssel in der Mikrowelle',
  'maroni.svg': 'Eingeritzte Maroni',
  'stromausfall-uhr.svg': 'Blinkende Uhr nach einem Stromausfall',
  'fehler.svg': 'Prüfung nicht bestanden',
  'bestanden.svg': 'Prüfung bestanden',
};

export function illustrationUrl(name: string): string {
  return `${import.meta.env.BASE_URL}illustrations/${name}`;
}

/** Image with reserved space (viewBox 400x300); removes itself if the file is missing. */
export function illustration(name: string, className = 'illustration'): HTMLImageElement {
  const img = h('img', {
    class: className,
    src: illustrationUrl(name),
    alt: ALT[name] ?? '',
    width: 400,
    height: 300,
    decoding: 'async',
  });
  img.addEventListener('error', () => img.remove());
  return img;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function pluralPoints(n: number): string {
  return n === 1 ? '1 Punkt' : `${n} Punkte`;
}
