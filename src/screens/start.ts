import type { Screen } from '../state';
import { h, illustration } from '../ui';
import { MAX_POINTS } from '../quiz/grade';
import { EXAM_SECONDS } from '../config';

export const startScreen: Screen = (root, ctx) => {
  const start = () => {
    ctx.state.lesson = 0;
    ctx.go('lessons');
  };

  root.append(
    h(
      'div',
      { class: 'screen' },
      h(
        'header',
        { class: 'authority' },
        h('p', { class: 'authority-line' }, 'Prüfstelle für Erhitzungswesen'),
        h('p', { class: 'authority-sub' }, 'Theoretische Prüfung Klasse M'),
      ),
      h(
        'main',
        { class: 'page' },
        h('h1', { class: 'title' }, 'Mikrowellen-Führerschein'),
        illustration('microwave-mascot.svg', 'illustration illustration-hero'),
        h(
          'section',
          { class: 'info-sheet', 'aria-label': 'Prüfungsinformationen' },
          h('p', null, 'Willkommen zur theoretischen Prüfung. Bitte Aufgaben sorgfältig lesen und nicht vor Ablauf der Standzeit öffnen.'),
          h(
            'dl',
            { class: 'facts' },
            h('dt', null, 'Dauer'),
            h('dd', null, `ca. 10 Minuten (Prüfung: ${EXAM_SECONDS / 60} Minuten)`),
            h('dt', null, 'Inhalt'),
            h('dd', null, '5 Lernkarten + 12 Prüfungsfragen'),
            h('dt', null, 'Bestehen'),
            h('dd', null, `max. ${MAX_POINTS} Fehlerpunkte`),
          ),
        ),
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: start }, 'Lernen & Prüfung starten'),
        h('button', { class: 'btn btn-link btn-block', type: 'button', onclick: () => ctx.newSheet() }, 'Direkt zur Prüfung'),
      ),
    ),
  );
};
