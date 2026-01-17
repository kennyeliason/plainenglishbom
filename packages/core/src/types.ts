export interface Verse {
  number: number;
  text: string;
  plainText?: string;
}

export interface Chapter {
  number: number;
  verses: Verse[];
  summary?: string;
}

export interface Book {
  name: string;
  shortName: string;
  chapters: Chapter[];
}

export interface BookOfMormon {
  books: Book[];
}
