import { certificateId, renderLicense } from '../certificate/license';
import type { ExamItem } from '../quiz/draw';
import { gradeExam, MAX_POINTS, type QuestionResult } from '../quiz/grade';
import { sheetOf, type Screen } from '../state';
import { formatDate, h, illustration, pluralPoints } from '../ui';

const KEYWORD_LABELS: Record<string, string[]> = {
  'm-maroni': ['Einritzen', 'Wasser / Feuchtigkeit', 'Abdecken', 'Leistung und Garzeit', 'Ruhezeit'],
};

function ownAnswer(item: ExamItem, answer: unknown): string[] {
  const q = item.question;
  if (q.type === 'open') {
    return typeof answer === 'string' && answer.trim() ? [answer.trim()] : [];
  }
  const ids = new Set(Array.isArray(answer) ? (answer as string[]) : []);
  return item.options.filter((o) => ids.has(o.id)).map((o) => o.text);
}

function correctAnswer(item: ExamItem): string[] {
  const q = item.question;
  return q.type === 'open' ? [q.sampleAnswer] : item.options.filter((o) => o.correct).map((o) => o.text);
}

const lines = (label: string, values: string[], empty: string, cls = '') =>
  h(
    'div',
    { class: `answer-block ${cls}`.trim() },
    h('p', { class: 'answer-label' }, label),
    values.length ? h('ul', null, ...values.map((v) => h('li', null, v))) : h('p', { class: 'muted' }, empty),
  );

function detail(item: ExamItem, index: number, res: QuestionResult, answer: unknown): HTMLElement {
  const q = item.question;
  const body: (HTMLElement | false)[] = [
    lines('Ihre Antwort', ownAnswer(item, answer), 'Keine Antwort'),
    lines(q.type === 'open' ? 'Musterlösung' : 'Richtige Antwort', correctAnswer(item), ''),
  ];
  if (q.type === 'open' && res.hits) {
    const labels = KEYWORD_LABELS[q.id] ?? [];
    body.push(
      h(
        'div',
        { class: 'answer-block' },
        h('p', { class: 'answer-label' }, `Erkannte Stichpunkte: ${res.hits.filter(Boolean).length} von ${res.hits.length} (mindestens ${q.minHits} nötig)`),
        h('ul', { class: 'hits' }, ...res.hits.map((hit, i) => h('li', { class: hit ? 'hit' : 'miss' }, `${hit ? '✔' : '✘'} ${labels[i] ?? `Stichpunkt ${i + 1}`}`))),
      ),
    );
  }
  body.push(h('div', { class: 'answer-block explanation' }, h('p', { class: 'answer-label' }, 'Erklärung'), h('p', null, q.explanation)));

  const penalty = q.category === 'spass' ? 'zählt nicht' : res.correct ? 'keine Fehlerpunkte' : pluralPoints(res.points);
  return h(
    'details',
    { class: `qdetail ${res.correct ? 'ok' : 'bad'}` },
    h(
      'summary',
      null,
      h('span', { class: 'mark', 'aria-hidden': 'true' }, res.correct ? '✔' : '✘'),
      h(
        'span',
        { class: 'summary-text' },
        h('span', { class: 'summary-head' }, `Frage ${index + 1} · ${res.correct ? 'richtig' : 'falsch'} · ${penalty}`),
        h('span', { class: 'summary-prompt' }, q.prompt),
      ),
    ),
    h('div', { class: 'detail-body' }, ...body),
  );
}

export const resultScreen: Screen = (root, ctx) => {
  const { state } = ctx;
  const sheet = sheetOf(state);
  const result = gradeExam(sheet.items.map((i) => i.question), state.answers);
  const issued = state.issuedAt ? new Date(state.issuedAt) : new Date();

  const licenseSlot = h('div', { class: 'license-slot' });
  const status = h('p', { class: 'muted', role: 'status', 'aria-live': 'polite' });

  const showLicense = () => {
    const data = { name: state.name, date: formatDate(issued), certificateId: certificateId(sheet.seed) };
    const pdfButton = h('button', { class: 'btn btn-primary btn-block', type: 'button' }, 'Zertifikat als PDF speichern');
    pdfButton.addEventListener('click', async () => {
      pdfButton.disabled = true;
      status.textContent = 'PDF wird erstellt …';
      try {
        const { saveCertificatePdf } = await import('../certificate/pdf');
        await saveCertificatePdf({ ...data, sheetNumber: sheet.sheetNumber, points: result.totalPoints, maxPoints: MAX_POINTS });
        status.textContent = '';
      } catch (err) {
        console.error(err);
        status.textContent = 'Das PDF konnte nicht erstellt werden. Bitte erneut versuchen.';
      } finally {
        pdfButton.disabled = false;
      }
    });
    licenseSlot.replaceChildren(renderLicense(data), pdfButton, status);
  };

  const nameInput = h('input', {
    class: 'input',
    id: 'holder-name',
    type: 'text',
    name: 'name',
    autocomplete: 'name',
    maxlength: 40,
    value: state.name,
    placeholder: 'Vor- und Nachname',
  });
  const issueButton = h('button', { class: 'btn btn-primary btn-block', type: 'button', disabled: !state.name.trim() }, 'Führerschein ausstellen');
  nameInput.addEventListener('input', () => {
    issueButton.disabled = !nameInput.value.trim();
  });
  const issue = () => {
    const name = nameInput.value.trim();
    if (!name) return;
    state.name = name;
    ctx.save();
    showLicense();
    licenseSlot.querySelector('.license')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  issueButton.addEventListener('click', issue);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') issue();
  });

  if (result.passed && state.name.trim()) showLicense();

  const reason = result.passed
    ? 'Herzlichen Glückwunsch, Sie dürfen ab sofort mit Mikrowellen umgehen.'
    : result.totalPoints <= MAX_POINTS && result.twoFivePointMisses
      ? 'Zwei Vorfahrtsfehler: Zwei falsch beantwortete 5-Punkte-Fragen führen zum Nichtbestehen.'
      : `Mehr als ${MAX_POINTS} Fehlerpunkte. Bitte Lernkarten wiederholen und es erneut versuchen.`;

  root.append(
    h(
      'div',
      { class: 'screen' },
      h('header', { class: 'topbar' }, h('span', { class: 'topbar-title' }, sheet.sheetNumber), h('span', { class: 'topbar-meta' }, 'Auswertung')),
      h(
        'main',
        { class: 'page fade' },
        h(
          'section',
          { class: `verdict ${result.passed ? 'verdict-pass' : 'verdict-fail'}`, 'aria-live': 'polite' },
          illustration(result.passed ? 'bestanden.svg' : 'fehler.svg'),
          h('h1', { class: 'verdict-title' }, result.passed ? 'Bestanden' : 'Nicht bestanden'),
          h('p', { class: 'verdict-points' }, `Fehlerpunkte: `, h('strong', null, String(result.totalPoints)), ` von max. ${MAX_POINTS}`),
          h('p', null, reason),
          state.timedOut && h('p', { class: 'notice' }, 'Die Zeit ist abgelaufen. Der Bogen wurde automatisch abgegeben.'),
        ),
        result.passed &&
          h(
            'section',
            { class: 'card', 'aria-labelledby': 'license-title' },
            h('h2', { id: 'license-title' }, 'Ihr Führerschein'),
            h('label', { class: 'label', for: 'holder-name' }, 'Name des Inhabers'),
            nameInput,
            issueButton,
            licenseSlot,
          ),
        h(
          'section',
          { 'aria-labelledby': 'review-title' },
          h('h2', { id: 'review-title' }, 'Auswertung der Fragen'),
          h('div', { class: 'details-list' }, ...sheet.items.map((item, i) => detail(item, i, result.results[i], state.answers[item.question.id]))),
        ),
        h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => ctx.newSheet() }, 'Neuer Prüfungsbogen'),
      ),
    ),
  );
};
