import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import type { MultipleChoiceQuestion, OpenQuestion, Question, SingleChoiceQuestion } from '../data/types';
import { gradeExam, gradeQuestion, normalize } from './grade';

const opt = (id: string, correct = false) => ({ id, text: id, correct });
const single = (points = 3, category: Question['category'] = 'physik'): SingleChoiceQuestion => ({
  id: `s${points}${category}`,
  category,
  type: 'single',
  points,
  prompt: '?',
  explanation: '',
  options: [opt('a', true), opt('b'), opt('c')],
});
const multiple: MultipleChoiceQuestion = {
  id: 'm',
  category: 'physik',
  type: 'multiple',
  points: 3,
  prompt: '?',
  explanation: '',
  options: [opt('a', true), opt('b', true), opt('c'), opt('d')],
};
const maroni = questions.find((q) => q.type === 'open') as OpenQuestion;

describe('normalize', () => {
  it('maps umlauts and strips punctuation', () => {
    expect(normalize('Größe, Äpfel & Übung!')).toBe('groesse aepfel uebung');
  });
});

describe('single / multiple', () => {
  it('accepts the correct single option only', () => {
    expect(gradeQuestion(single(), ['a']).correct).toBe(true);
    expect(gradeQuestion(single(), ['b'])).toMatchObject({ correct: false, points: 3 });
    expect(gradeQuestion(single(), undefined)).toMatchObject({ answered: false, correct: false, points: 3 });
  });

  it('requires exactly the correct set for multiple choice', () => {
    expect(gradeQuestion(multiple, ['b', 'a']).correct).toBe(true);
    expect(gradeQuestion(multiple, ['a']).correct).toBe(false);
    expect(gradeQuestion(multiple, ['a', 'b', 'c']).correct).toBe(false);
    expect(gradeQuestion(multiple, []).correct).toBe(false);
  });

  it('never counts penalty points for spass questions', () => {
    const r = gradeQuestion(single(0, 'spass'), ['b']);
    expect(r).toMatchObject({ correct: false, points: 0 });
  });
});

describe('open question (maroni)', () => {
  it('accepts a good answer with umlauts', () => {
    const r = gradeQuestion(maroni, 'Maroni einritzen, mit Wasser abdecken, bei 800 Watt 4 Minuten garen und dann ruhen lassen.');
    expect(r.correct).toBe(true);
    expect(r.hits?.filter(Boolean).length).toBeGreaterThanOrEqual(3);
  });

  it('matches umlaut keywords', () => {
    const r = gradeQuestion(maroni, 'Kreuzweise einschneiden, Wasser dazu, Deckel drauf, danach abkühlen lassen');
    expect(r.hits).toEqual([true, true, true, false, true]);
    expect(r.correct).toBe(true);
  });

  it('tolerates a typo like "einrizen"', () => {
    const r = gradeQuestion(maroni, 'einrizen, wasser dazu, abdecken');
    expect(r.hits?.[0]).toBe(true);
    expect(r.correct).toBe(true);
  });

  it('fails with too few hits', () => {
    const r = gradeQuestion(maroni, 'Einfach reinlegen und Wasser dazu');
    expect(r.correct).toBe(false);
    expect(r.points).toBe(5);
  });

  it('treats empty text as unanswered', () => {
    expect(gradeQuestion(maroni, '   ')).toMatchObject({ answered: false, correct: false });
  });
});

describe('gradeExam', () => {
  const qs = [single(3), single(4, 'einstellungen'), single(5, 'sicherheit'), { ...single(5, 'sicherheit'), id: 'x5' }];

  it('passes at exactly 10 points', () => {
    const list = [single(5, 'physik'), single(5, 'einstellungen'), single(0, 'spass')];
    // two 5-point misses would fail, so only one is wrong here
    const r = gradeExam(list, { [list[0].id]: ['b'], [list[1].id]: ['a'], [list[2].id]: ['b'] });
    expect(r.totalPoints).toBe(5);
    expect(r.passed).toBe(true);
    const ten = [single(4), { ...single(3), id: 'y' }, { ...single(3), id: 'z' }];
    expect(gradeExam(ten, {}).totalPoints).toBe(10);
    expect(gradeExam(ten, {}).passed).toBe(true);
  });

  it('fails above 10 points', () => {
    const list = [single(4), { ...single(4), id: 'b' }, { ...single(3), id: 'c' }];
    const r = gradeExam(list, {});
    expect(r.totalPoints).toBe(11);
    expect(r.passed).toBe(false);
  });

  it('fails with two wrong 5-point questions even at <= 10 points', () => {
    const r = gradeExam([qs[2], qs[3]], {});
    expect(r.totalPoints).toBe(10);
    expect(r.twoFivePointMisses).toBe(true);
    expect(r.passed).toBe(false);
  });

  it('passes a perfect sheet', () => {
    const r = gradeExam(qs, { [qs[0].id]: ['a'], [qs[1].id]: ['a'], [qs[2].id]: ['a'], x5: ['a'] });
    expect(r).toMatchObject({ totalPoints: 0, passed: true });
  });
});
