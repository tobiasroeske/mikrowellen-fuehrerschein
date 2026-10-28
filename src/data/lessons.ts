import type { Lesson } from './types';

export const lessons: Lesson[] = [
  {
    id: 'funktionsweise',
    title: 'Funktionsweise: Was passiert im Garraum?',
    illustration: 'magnetron-waves.svg',
    body: [
      'Herzstück jeder Mikrowelle ist das Magnetron. Es erzeugt elektromagnetische Wellen mit einer Frequenz von 2,45 GHz, die über einen Hohlleiter in den Garraum geleitet werden.',
      'Wassermoleküle sind Dipole: Sie haben ein positives und ein negatives Ende. Im elektrischen Wechselfeld versuchen sie, sich 2,45 Milliarden Mal pro Sekunde neu auszurichten. Diese Drehbewegung und die Reibung mit Nachbarmolekülen erzeugen Wärme – direkt im Lebensmittel.',
      'Mikrowellen sind nicht-ionisierende Strahlung. Das Essen wird dadurch weder radioaktiv noch „verstrahlt“. Ist die Mikrowelle aus, ist auch die Strahlung weg.',
    ],
    remember: [
      'Frequenz: 2,45 GHz (Wellenlänge ca. 12 cm)',
      'Erwärmt wird vor allem Wasser – durch Rotation der Dipole',
      'Keine Radioaktivität, kein „Nachstrahlen“',
    ],
  },
  {
    id: 'hotspots',
    title: 'Eindringtiefe und Hotspots',
    illustration: 'hotspots.svg',
    body: [
      'Mikrowellen dringen nur wenige Zentimeter tief in Lebensmittel ein. Der Kern wird anschließend durch Wärmeleitung von außen nach innen erwärmt.',
      'Im Garraum überlagern sich die Wellen zu stehenden Wellen. So entstehen heiße und kalte Zonen. Der Drehteller bewegt das Gargut durch diese Zonen.',
      'Nach dem Erhitzen gleicht sich die Temperatur im Lebensmittel aus. Diese Ausgleichszeit (Standzeit) von 1–2 Minuten gehört zum Garvorgang dazu.',
    ],
    remember: [
      'Eindringtiefe: wenige Zentimeter',
      'Drehteller, Umrühren und Standzeit gegen kalte Stellen',
      'Dicke Teile nach außen, dünne nach innen legen',
    ],
  },
  {
    id: 'sicherheit',
    title: 'Sicherheit: Metall, Eier, Siedeverzug',
    illustration: 'alufolie-funken.svg',
    body: [
      'Metall reflektiert Mikrowellen. An dünnen Kanten und Spitzen (Gabel, zerknüllte Alufolie, Goldrand) konzentriert sich das Feld so stark, dass Funken überschlagen können.',
      'Die Tür ist ein Faradayscher Käfig: Die Löcher im Gitter sind viel kleiner als die Wellenlänge von 12 cm. Licht kommt durch, Mikrowellen nicht.',
      'Eier in der Schale, ganze Würstchen oder Kartoffeln bauen innen Dampfdruck auf und können platzen – vorher einstechen. Wasser in glatten Gefäßen kann über 100 °C heiß werden, ohne zu kochen (Siedeverzug), und beim Herausnehmen schlagartig aufschäumen.',
    ],
    remember: [
      'Kein Metall mit Kanten oder Goldrand',
      'Eier nie in der Schale erhitzen',
      'Gegen Siedeverzug: mikrowellengeeigneten Löffel oder Holzstab ins Wasser',
      'Nie leer betreiben – das schadet dem Magnetron',
    ],
  },
  {
    id: 'wattzahlen',
    title: 'Leistungsstufen richtig wählen',
    illustration: 'wattage-dial.svg',
    body: [
      'Je nach Aufgabe wird eine andere Leistung gewählt. Viele Geräte erreichen niedrige Stufen, indem sie das Magnetron im Takt ein- und ausschalten. Die Pausen geben der Wärme Zeit, sich zu verteilen.',
      'Faustregel für die Umrechnung: Leistung × Zeit bleibt etwa gleich. 3 Minuten bei 600 W entsprechen rund 2 Minuten bei 900 W.',
      'Doppelte Menge braucht nicht doppelte Zeit, sondern etwa 1,5-mal so lange.',
    ],
    remember: [
      'Auftauen: 150–250 W, mit Pausen und Wenden',
      'Schmelzen (Butter, Schokolade) und Schonen: 300–450 W',
      'Aufwärmen von Speisen: 600–800 W',
      'Getränke und Wasser: 800–1000 W',
    ],
  },
  {
    id: 'lebensmittel',
    title: 'Lebensmittel-Spezialfälle',
    illustration: 'maroni.svg',
    body: [
      'Fett und Zucker erhitzen sich schneller als Wasser. Die Marmelade im Krapfen ist deshalb oft deutlich heißer als der Teig.',
      'Abdecken hält die Feuchtigkeit im Essen und den Garraum sauber. Die Abdeckung sollte Dampf entweichen lassen.',
      'Esskastanien (Maroni) stehen unter Druck wie Eier: Die Schale muss vorher kreuzweise eingeritzt werden. Mit etwas Wasser in der Schüssel und abgedeckt garen sie im eigenen Dampf.',
    ],
    remember: [
      'Fett und Zucker werden schneller heiß',
      'Abdecken, aber Dampf entweichen lassen',
      'Lebensmittel mit Schale oder Haut einritzen bzw. einstechen',
    ],
  },
];
