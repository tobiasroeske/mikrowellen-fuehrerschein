import './styles.css';
import { loadState, saveState, startNewSheet, type Ctx, type Screen, type ScreenName } from './state';
import { startScreen } from './screens/start';
import { lessonsScreen } from './screens/lessons';
import { examScreen } from './screens/exam';
import { resultScreen } from './screens/result';

const screens: Record<ScreenName, Screen> = {
  start: startScreen,
  lessons: lessonsScreen,
  exam: examScreen,
  result: resultScreen,
};

const root = document.getElementById('app') as HTMLElement;
const state = loadState();
let cleanup: void | (() => void);

const ctx: Ctx = {
  state,
  save: () => saveState(state),
  go(screen) {
    state.screen = screen;
    ctx.save();
    show();
    window.scrollTo(0, 0);
  },
  newSheet() {
    startNewSheet(state);
    ctx.go('exam');
  },
};

function show(): void {
  if (typeof cleanup === 'function') cleanup();
  root.replaceChildren();
  cleanup = screens[state.screen](root, ctx);
  const heading = root.querySelector<HTMLElement>('h1, h2');
  heading?.setAttribute('tabindex', '-1');
  heading?.focus({ preventScroll: true });
}

show();
