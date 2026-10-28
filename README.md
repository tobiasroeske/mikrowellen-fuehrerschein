# Mikrowellen-Führerschein

Humorvolles E-Learning im Look einer Fahrschul-Theorieprüfung: 5 Lernkarten, 12 Prüfungsfragen, höchstens 10 Fehlerpunkte. Bei Bestehen gibt es einen Führerschein auf dem Bildschirm und ein Zertifikat als PDF.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Vitest
npm run build    # Typprüfung + Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Inhalte

- Lernkarten: `src/data/lessons.ts`
- Fragenpool: `src/data/questions.ts` (Typen in `src/data/types.ts`)
- Illustrationen: `public/illustrations/`

Der Prüfungsbogen besteht aus 4 Physik-, 4 Einstellungs- und 2 Sicherheitsfragen, der Maroni-Freitextfrage und einer Sonderfrage. Ein Bogen ergibt sich deterministisch aus einem Seed. Zwei falsch beantwortete 5-Punkte-Fragen bedeuten Nichtbestehen.

## QR-Code und Aushang

```bash
npm run qr                                   # erzeugt public/qr.svg und public/qr-print.html
APP_URL=https://example.org/pfad/ npm run qr # andere Ziel-URL
```

`public/qr-print.html` ist eine druckfertige A4-Seite.

## Deployment

Push auf `main` startet `.github/workflows/deploy.yml` (Tests, Build, GitHub Pages). In den Repository-Einstellungen unter Pages die Quelle „GitHub Actions“ wählen. Die URL ist in `src/config.ts` und `vite.config.ts` (`base`) hinterlegt.
