import type { BibleVersionId } from "./constants";

const BASE = "https://www.abibliadigital.com.br/api";

function apiHeaders(init?: HeadersInit) {
  const h = new Headers(init);
  h.set("Accept", "application/json");
  const token = process.env.ABIBLIA_DIGITAL_TOKEN?.trim();
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

export type BibleBookListItem = {
  abbrev: { pt: string; en: string };
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: string;
};

export type BibleVerse = { number: number; text: string };

export type BibleChapterResponse = {
  book: {
    abbrev: { pt: string; en: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: { number: number; verses: number };
  verses: BibleVerse[];
};

export type BibleSearchVerse = {
  book: BibleBookListItem;
  chapter: number;
  number: number;
  text: string;
};

export type BibleSearchResponse = {
  occurrence: number;
  version: string;
  verses: BibleSearchVerse[];
};

export type BibleBookDetail = BibleBookListItem & {
  comment?: string;
};

export async function fetchBook(abbrevPt: string): Promise<BibleBookDetail> {
  const enc = encodeURIComponent(abbrevPt);
  const res = await fetch(`${BASE}/books/${enc}`, {
    headers: apiHeaders(),
    next: { revalidate: 86_400 },
  });
  if (!res.ok) {
    throw new Error(`ABibliaDigital book: ${res.status}`);
  }
  return res.json() as Promise<BibleBookDetail>;
}

export async function fetchBibleBooks(): Promise<BibleBookListItem[]> {
  const res = await fetch(`${BASE}/books`, {
    headers: apiHeaders(),
    next: { revalidate: 86_400 },
  });
  if (!res.ok) {
    throw new Error(`ABibliaDigital books: ${res.status}`);
  }
  return res.json() as Promise<BibleBookListItem[]>;
}

export async function fetchChapter(
  version: BibleVersionId,
  abbrevPt: string,
  chapter: number
): Promise<BibleChapterResponse> {
  const enc = encodeURIComponent(abbrevPt);
  const res = await fetch(`${BASE}/verses/${version}/${enc}/${chapter}`, {
    headers: apiHeaders(),
    next: { revalidate: 86_400 },
  });
  if (!res.ok) {
    throw new Error(`ABibliaDigital chapter: ${res.status}`);
  }
  return res.json() as Promise<BibleChapterResponse>;
}

export async function searchBibleVerses(
  version: BibleVersionId,
  search: string
): Promise<BibleSearchResponse> {
  const res = await fetch(`${BASE}/verses/search`, {
    method: "POST",
    headers: apiHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      version,
      search: search.trim(),
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ABibliaDigital search: ${res.status}`);
  }
  return res.json() as Promise<BibleSearchResponse>;
}
