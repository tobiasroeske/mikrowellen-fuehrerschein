import { questions as pool } from '../data/questions';
import type { Category, Option, Question } from '../data/types';
import { mulberry32, shuffle } from './rng';

export interface ExamItem {
  question: Question;
  /** Fahrschul-style question number, e.g. "1.1.03-004". */
  number: string;
  /** Options in display order (empty for open questions). */
  options: Option[];
  /** True for the final fun question. */
  special: boolean;
}

export interface ExamSheet {
  seed: number;
  /** e.g. "Bogen 2.45-17" */
  sheetNumber: string;
  items: ExamItem[];
}

const PER_CATEGORY: Partial<Record<Category, number>> = { physik: 4, einstellungen: 4, sicherheit: 2 };
const GROUP: Record<Category, string> = {
  physik: '1.1',
  einstellungen: '1.2',
  sicherheit: '1.3',
  maroni: '1.4',
  spass: '9.9',
};

const pad = (n: number, len: number) => String(n).padStart(len, '0');

export function sheetNumber(seed: number): string {
  return `Bogen 2.45-${pad((seed >>> 0) % 99 + 1, 2)}`;
}

/** Deterministic number from the position of a question within its category. */
export function questionNumber(q: Question, all: readonly Question[] = pool): string {
  if (q.category === 'maroni') return '1.4.01-001';
  if (q.category === 'spass') return '9.9.99-999';
  const idx = all.filter((x) => x.category === q.category).indexOf(q);
  return `${GROUP[q.category]}.${pad((idx % 9) + 1, 2)}-${pad(idx + 1, 3)}`;
}

export function drawExam(seed: number, all: readonly Question[] = pool): ExamSheet {
  const rand = mulberry32(seed);
  const byCat = (c: Category) => all.filter((q) => q.category === c);

  const picked: Question[] = [];
  for (const [cat, count] of Object.entries(PER_CATEGORY) as [Category, number][]) {
    picked.push(...shuffle(byCat(cat), rand).slice(0, count));
  }
  const ordered = shuffle(picked, rand);
  const maroni = shuffle(byCat('maroni'), rand)[0];
  const fun = shuffle(byCat('spass'), rand)[0];
  ordered.push(maroni, fun);

  const items = ordered.map((question, i): ExamItem => ({
    question,
    number: questionNumber(question, all),
    options: question.type === 'open' ? [] : shuffle(question.options, rand),
    special: i === ordered.length - 1,
  }));

  return { seed, sheetNumber: sheetNumber(seed), items };
}
