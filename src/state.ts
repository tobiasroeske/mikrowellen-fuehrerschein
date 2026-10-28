import { drawExam, type ExamSheet } from './quiz/draw';
import type { Answer } from './quiz/grade';
import { randomSeed } from './quiz/rng';

export type ScreenName = 'start' | 'lessons' | 'exam' | 'result';

export interface State {
  screen: ScreenName;
  lesson: number;
  seed: number | null;
  current: number;
  answers: Record<string, Answer>;
  /** Epoch ms at which the exam ends. */
  deadline: number | null;
  submitted: boolean;
  timedOut: boolean;
  name: string;
  /** ISO date (yyyy-mm-dd) from the date input. */
  birthDate: string;
  /** ISO timestamp of submission. */
  issuedAt: string | null;
}

const KEY = 'mwf-state-v1';

export const initialState = (): State => ({
  screen: 'start',
  lesson: 0,
  seed: null,
  current: 0,
  answers: {},
  deadline: null,
  submitted: false,
  timedOut: false,
  name: '',
  birthDate: '',
  issuedAt: null,
});

export function loadState(): State {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = { ...initialState(), ...JSON.parse(raw) } as State;
      if (parsed.screen === 'result' && !parsed.submitted) parsed.screen = 'start';
      if (parsed.screen === 'exam' && parsed.seed === null) parsed.screen = 'start';
      return parsed;
    }
  } catch {
    /* storage unavailable or corrupt */
  }
  return initialState();
}

export function saveState(state: State): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

/** Resets exam-related fields and draws a fresh seed. */
export function startNewSheet(state: State): void {
  state.seed = randomSeed();
  state.current = 0;
  state.answers = {};
  state.deadline = null;
  state.submitted = false;
  state.timedOut = false;
  state.issuedAt = null;
}

export function sheetOf(state: State): ExamSheet {
  if (state.seed === null) startNewSheet(state);
  return drawExam(state.seed as number);
}

export interface Ctx {
  state: State;
  save(): void;
  go(screen: ScreenName): void;
  newSheet(): void;
}

/** A screen renders into root and may return a cleanup function. */
export type Screen = (root: HTMLElement, ctx: Ctx) => void | (() => void);
