/** Versões suportadas pela API ABibliaDigital (ver documentação). */
export const BIBLE_VERSIONS = [
  { id: "nvi", label: "NVI" },
  { id: "acf", label: "ACF" },
  { id: "ra", label: "RA" },
  { id: "aa", label: "AA" },
] as const;

export type BibleVersionId = (typeof BIBLE_VERSIONS)[number]["id"];

export const DEFAULT_BIBLE_VERSION: BibleVersionId = "nvi";
