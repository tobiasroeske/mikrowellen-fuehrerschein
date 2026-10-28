import type { OpenQuestion, Question } from '../data/types';

export const MAX_POINTS = 10;

/** Selected option ids (choice) or free text (open). */
export type Answer = string | string[] | undefined;

export interface QuestionResult {
  answered: boolean;
  correct: boolean;
  /** Penalty points incurred by this question. */
  points: number;
  /** Open questions: which keyword groups were hit. */
  hits?: boolean[];
}

export interface ExamResult {
  results: QuestionResult[];
  totalPoints: number;
  /** Number of wrongly answered 5-point questions. */
  fivePointMisses: number;
  twoFivePointMisses: boolean;
  passed: boolean;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function tokenMatches(token: string, kw: string): boolean {
  if (token.startsWith(kw)) return true;
  if (kw.length < 5) return false;
  // Tolerate one typo (substitution, insertion or deletion) in the token prefix.
  for (let len = kw.length - 1; len <= kw.length + 1; len++) {
    if (len <= token.length && levenshtein(token.slice(0, len), kw) <= 1) return true;
  }
  return false;
}

export function matchKeywordGroups(text: string, groups: string[][]): boolean[] {
  const norm = normalize(text);
  const tokens = norm.split(' ').filter(Boolean);
  return groups.map((group) =>
    group.some((raw) => {
      const kw = normalize(raw);
      if (!kw) return false;
      if (kw.includes(' ')) return norm.includes(kw);
      return tokens.some((t) => tokenMatches(t, kw));
    }),
  );
}

function gradeOpen(q: OpenQuestion, text: string): { correct: boolean; hits: boolean[] } {
  const hits = matchKeywordGroups(text, q.keywords);
  return { correct: hits.filter(Boolean).length >= q.minHits, hits };
}

export function gradeQuestion(q: Question, answer: Answer): QuestionResult {
  const penalty = q.category === 'spass' ? 0 : q.points;

  if (q.type === 'open') {
    const text = typeof answer === 'string' ? answer : '';
    const answered = text.trim().length > 0;
    const { correct, hits } = answered
      ? gradeOpen(q, text)
      : { correct: false, hits: q.keywords.map(() => false) };
    return { answered, correct, hits, points: correct ? 0 : penalty };
  }

  const selected = new Set(Array.isArray(answer) ? answer : []);
  const answered = selected.size > 0;
  const correct =
    answered &&
    q.options.every((o) => selected.has(o.id) === o.correct) &&
    selected.size === q.options.filter((o) => o.correct).length;
  return { answered, correct, points: correct ? 0 : penalty };
}

export function gradeExam(qs: readonly Question[], answers: Record<string, Answer>): ExamResult {
  const results = qs.map((q) => gradeQuestion(q, answers[q.id]));
  const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
  const fivePointMisses = qs.filter((q, i) => q.points === 5 && q.category !== 'spass' && !results[i].correct).length;
  const twoFivePointMisses = fivePointMisses >= 2;
  return {
    results,
    totalPoints,
    fivePointMisses,
    twoFivePointMisses,
    passed: totalPoints <= MAX_POINTS && !twoFivePointMisses,
  };
}
