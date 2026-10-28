export type Category = 'physik' | 'einstellungen' | 'sicherheit' | 'maroni' | 'spass';

export interface Option {
  id: string;
  text: string;
  correct: boolean;
}

interface BaseQuestion {
  id: string;
  category: Category;
  prompt: string;
  /** Penalty points when answered wrong (2–5, 5 = "Vorfahrtsfrage"). */
  points: number;
  /** Filename in public/illustrations, optional. */
  illustration?: string;
  /** Shown in the evaluation after the exam. */
  explanation: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: Option[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: Option[];
}

/** A group of synonyms; matching any one of them counts the group as hit. */
export type KeywordGroup = string[];

export interface OpenQuestion extends BaseQuestion {
  type: 'open';
  keywords: KeywordGroup[];
  /** Number of keyword groups that must be hit to pass. */
  minHits: number;
  sampleAnswer: string;
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | OpenQuestion;

export interface Lesson {
  id: string;
  title: string;
  illustration: string;
  /** Short paragraphs, rendered in order. */
  body: string[];
  /** Key facts rendered as a "Merke" box. */
  remember: string[];
}
