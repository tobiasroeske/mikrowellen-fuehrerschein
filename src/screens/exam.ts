import { EXAM_SECONDS } from '../config';
import type { ExamItem } from '../quiz/draw';
import { sheetOf, type Screen } from '../state';
import { h, illustration, pluralPoints } from '../ui';

const MAX_LENGTH = 600;

const formatClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const examScreen: Screen = (root, ctx) => {
  const { state } = ctx;
  const sheet = sheetOf(state);
  const items = sheet.items;
  const total = items.length;

  if (state.deadline === null) state.deadline = Date.now() + EXAM_SECONDS * 1000;
  ctx.save();

  const frame = h('div', { class: 'screen' });
  const announcer = h('div', { class: 'sr-only', 'aria-live': 'assertive', role: 'status' });
  root.append(frame, announcer);

  let timerEl: HTMLElement | null = null;
  let overviewButtons: HTMLButtonElement[] = [];
  let finished = false;

  const isAnswered = (item: ExamItem) => {
    const a = state.answers[item.question.id];
    return Array.isArray(a) ? a.length > 0 : typeof a === 'string' && a.trim().length > 0;
  };

  const submit = (timedOut: boolean) => {
    if (finished) return;
    finished = true;
    state.submitted = true;
    state.timedOut = timedOut;
    state.issuedAt = new Date().toISOString();
    ctx.go('result');
  };

  const tick = () => {
    const remaining = (state.deadline as number) - Date.now();
    if (timerEl) {
      timerEl.textContent = formatClock(remaining);
      timerEl.classList.toggle('timer-low', remaining <= 60_000);
    }
    if (remaining <= 0 && !finished) {
      announcer.textContent = 'Die Zeit ist abgelaufen. Der Prüfungsbogen wird abgegeben.';
      document.querySelector('dialog')?.close();
      submit(true);
    }
  };
  const interval = window.setInterval(tick, 500);

  const refreshOverview = () => {
    overviewButtons.forEach((b, i) => {
      b.classList.toggle('answered', isAnswered(items[i]));
      const label = `Frage ${i + 1}, ${isAnswered(items[i]) ? 'beantwortet' : 'unbeantwortet'}`;
      b.setAttribute('aria-label', label);
    });
  };

  const setCurrent = (i: number) => {
    state.current = Math.min(Math.max(i, 0), total - 1);
    ctx.save();
    render();
    window.scrollTo(0, 0);
    frame.querySelector<HTMLElement>('.question-text')?.focus({ preventScroll: true });
  };

  const confirmSubmit = () => {
    const answered = items.filter(isAnswered).length;
    const dialog = h(
      'dialog',
      { class: 'modal', 'aria-labelledby': 'modal-title' },
      h('h2', { id: 'modal-title' }, 'Prüfung abgeben?'),
      h(
        'p',
        null,
        `Sie haben ${answered} von ${total} Fragen beantwortet.`,
        answered < total ? ' Unbeantwortete Fragen zählen als falsch.' : '',
      ),
      h(
        'div',
        { class: 'modal-actions' },
        h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => dialog.close() }, 'Zurück zur Prüfung'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { dialog.close(); submit(false); } }, 'Jetzt abgeben'),
      ),
    );
    dialog.addEventListener('close', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    document.body.append(dialog);
    dialog.showModal();
  };

  const choiceBody = (item: ExamItem) => {
    const q = item.question;
    if (q.type === 'open') return null;
    const single = q.type === 'single';
    const selected = new Set(Array.isArray(state.answers[q.id]) ? (state.answers[q.id] as string[]) : []);
    const list = h('div', { class: 'options', role: 'group', 'aria-labelledby': 'q-prompt' });

    for (const opt of item.options) {
      const input = h('input', { type: 'checkbox', value: opt.id, checked: selected.has(opt.id) });
      input.addEventListener('change', () => {
        if (single && input.checked) {
          list.querySelectorAll<HTMLInputElement>('input').forEach((o) => {
            if (o !== input) o.checked = false;
          });
        }
        const chosen = [...list.querySelectorAll<HTMLInputElement>('input:checked')].map((o) => o.value);
        state.answers[q.id] = chosen;
        ctx.save();
        refreshOverview();
      });
      list.append(
        h('label', { class: 'option' }, input, h('span', { class: 'box', 'aria-hidden': 'true' }), h('span', { class: 'option-text' }, opt.text)),
      );
    }
    return [h('p', { class: 'hint' }, single ? 'Eine Antwort ist richtig.' : 'Mehrere Antworten können richtig sein.'), list];
  };

  const openBody = (item: ExamItem) => {
    const q = item.question;
    if (q.type !== 'open') return null;
    const current = typeof state.answers[q.id] === 'string' ? (state.answers[q.id] as string) : '';
    const counter = h('span', { class: 'counter', 'aria-hidden': 'true' }, `${current.length} / ${MAX_LENGTH}`);
    const area = h('textarea', {
      class: 'textarea',
      rows: 7,
      maxlength: MAX_LENGTH,
      'aria-labelledby': 'q-prompt',
      placeholder: 'Ihre Antwort in eigenen Worten …',
      value: current,
    });
    area.addEventListener('input', () => {
      state.answers[q.id] = area.value;
      counter.textContent = `${area.value.length} / ${MAX_LENGTH}`;
      ctx.save();
      refreshOverview();
    });
    return [h('p', { class: 'hint' }, 'Freitext: Beschreiben Sie das Vorgehen.'), area, h('div', { class: 'counter-row' }, counter)];
  };

  const render = () => {
    const i = state.current;
    const item = items[i];
    const q = item.question;
    const last = i === total - 1;
    const five = q.points === 5;

    timerEl = h('span', { class: 'timer', role: 'timer' }, formatClock((state.deadline as number) - Date.now()));
    overviewButtons = items.map((_, idx) =>
      h(
        'button',
        {
          class: `cell${idx === i ? ' current' : ''}`,
          type: 'button',
          'aria-current': idx === i ? 'step' : null,
          onclick: () => setCurrent(idx),
        },
        String(idx + 1),
      ),
    );

    frame.replaceChildren(
      h(
        'header',
        { class: 'topbar' },
        h('span', { class: 'topbar-title' }, sheet.sheetNumber),
        h('span', { class: 'topbar-meta' }, 'Zeit ', timerEl),
        h(
          'div',
          { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': i + 1, 'aria-label': 'Prüfungsfortschritt' },
          h('div', { class: 'progress-fill', style: `width:${((i + 1) / total) * 100}%` }),
        ),
      ),
      h(
        'main',
        { class: 'page has-bottom-bar fade' },
        h(
          'div',
          { class: 'qhead' },
          h('span', { class: 'qcount', 'aria-live': 'polite' }, `Frage ${i + 1} von ${total}`),
          h(
            'span',
            { class: 'badges' },
            item.special && h('span', { class: 'badge badge-special' }, 'Sonderfrage'),
            h('span', { class: `badge${five ? ' badge-five' : ''}` }, five ? '5 Punkte · Vorfahrtsfrage' : q.category === 'spass' ? 'zählt nicht' : pluralPoints(q.points)),
          ),
        ),
        h('p', { class: 'qnumber' }, `Frage-Nr. ${item.number}`),
        q.illustration && illustration(q.illustration),
        h('h2', { class: 'question-text', id: 'q-prompt', tabindex: -1 }, q.prompt),
        ...(choiceBody(item) ?? openBody(item) ?? []),
        h(
          'nav',
          { class: 'overview', 'aria-label': 'Fragenübersicht' },
          h('p', { class: 'overview-title' }, 'Fragenübersicht'),
          h('div', { class: 'cells' }, ...overviewButtons),
        ),
      ),
      h(
        'div',
        { class: 'bottom-bar' },
        h('button', { class: 'btn btn-secondary', type: 'button', disabled: i === 0, onclick: () => setCurrent(i - 1) }, 'Zurück'),
        last
          ? h('button', { class: 'btn btn-danger', type: 'button', onclick: confirmSubmit }, 'Prüfung abgeben')
          : h('button', { class: 'btn btn-primary', type: 'button', onclick: () => setCurrent(i + 1) }, 'Weiter'),
      ),
    );
    refreshOverview();
  };

  render();
  tick();

  return () => {
    window.clearInterval(interval);
    document.querySelector('dialog')?.remove();
  };
};
