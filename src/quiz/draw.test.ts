import { describe, expect, it } from 'vitest';
import { drawExam, sheetNumber } from './draw';

const ids = (seed: number) => drawExam(seed).items.map((i) => i.question.id);

describe('drawExam', () => {
  it('composes 12 questions: 4 physik, 4 einstellungen, 2 sicherheit, maroni, spass', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { items } = drawExam(seed);
      const count = (c: string) => items.filter((i) => i.question.category === c).length;
      expect(items).toHaveLength(12);
      expect(count('physik')).toBe(4);
      expect(count('einstellungen')).toBe(4);
      expect(count('sicherheit')).toBe(2);
      expect(count('maroni')).toBe(1);
      expect(count('spass')).toBe(1);
    }
  });

  it('places maroni second to last and the fun question last', () => {
    const { items } = drawExam(42);
    expect(items[10].question.category).toBe('maroni');
    expect(items[11].question.category).toBe('spass');
    expect(items[11].special).toBe(true);
    expect(items.filter((i) => i.special)).toHaveLength(1);
  });

  it('has no duplicate questions', () => {
    for (let seed = 0; seed < 50; seed++) expect(new Set(ids(seed)).size).toBe(12);
  });

  it('is deterministic for the same seed', () => {
    const a = drawExam(1234567);
    const b = drawExam(1234567);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('mostly differs for different seeds', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) seen.add(ids(seed).join(','));
    expect(seen.size).toBeGreaterThan(15);
  });

  it('keeps all options when shuffling', () => {
    for (const item of drawExam(7).items) {
      if (item.question.type !== 'open') {
        expect(item.options.map((o) => o.id).sort()).toEqual(item.question.options.map((o) => o.id).sort());
      }
    }
  });

  it('formats sheet and question numbers', () => {
    expect(sheetNumber(0)).toBe('Bogen 2.45-01');
    expect(sheetNumber(98)).toBe('Bogen 2.45-99');
    const { items } = drawExam(5);
    expect(items[10].number).toBe('1.4.01-001');
    expect(items[11].number).toBe('9.9.99-999');
    expect(items[0].number).toMatch(/^1\.[123]\.0\d-\d{3}$/);
  });
});
