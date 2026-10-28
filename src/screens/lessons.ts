import { lessons } from '../data/lessons';
import type { Screen } from '../state';
import { h, illustration } from '../ui';

export const lessonsScreen: Screen = (root, ctx) => {
  const { state } = ctx;
  const total = lessons.length;
  const frame = h('div', { class: 'screen' });
  root.append(frame);

  const render = () => {
    const i = Math.min(Math.max(state.lesson, 0), total - 1);
    const lesson = lessons[i];
    const last = i === total - 1;

    const go = (delta: number) => {
      if (i + delta < 0) return ctx.go('start');
      if (i + delta >= total) return ctx.newSheet();
      state.lesson = i + delta;
      ctx.save();
      render();
      window.scrollTo(0, 0);
      frame.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    };

    frame.replaceChildren(
      h(
        'header',
        { class: 'topbar' },
        h('span', { class: 'topbar-title' }, 'Lernkarten'),
        h('span', { class: 'topbar-meta', 'aria-live': 'polite' }, `Lektion ${i + 1} von ${total}`),
        h(
          'div',
          { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': i + 1, 'aria-label': 'Lernfortschritt' },
          h('div', { class: 'progress-fill', style: `width:${((i + 1) / total) * 100}%` }),
        ),
      ),
      h(
        'main',
        { class: 'page has-bottom-bar fade' },
        illustration(lesson.illustration),
        h('h2', { class: 'lesson-title', tabindex: -1 }, lesson.title),
        ...lesson.body.map((p) => h('p', null, p)),
        h(
          'aside',
          { class: 'remember', 'aria-label': 'Merke' },
          h('strong', { class: 'remember-label' }, 'Merke'),
          h('ul', null, ...lesson.remember.map((r) => h('li', null, r))),
        ),
      ),
      h(
        'div',
        { class: 'bottom-bar' },
        h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => go(-1) }, 'Zurück'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => go(1) }, last ? 'Zur Prüfung' : 'Weiter'),
      ),
    );
  };

  render();
};
