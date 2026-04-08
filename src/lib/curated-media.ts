import type { Tradition } from "@/lib/types/domain";

export type CuratedItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  /** "youtube" | "site" | "audio" */
  kind: "youtube" | "site" | "audio";
  /** Quem vê: mesma tradição ou todos */
  forTradition: Tradition | "ALL";
};

const ITEMS: CuratedItem[] = [
  {
    id: "frei-gilson",
    title: "Frei Gilson",
    subtitle: "Canal no YouTube — música e palavra",
    href: "https://www.youtube.com/@FreiGilsonOficial",
    kind: "youtube",
    forTradition: "CATHOLIC",
  },
  {
    id: "pe-marcelo-rossi",
    title: "Pe. Marcelo Rossi",
    subtitle: "Canal no YouTube — missas e reflexões",
    href: "https://www.youtube.com/@padremarcelorossi",
    kind: "youtube",
    forTradition: "CATHOLIC",
  },
  {
    id: "vatican-news-pt",
    title: "Vatican News em português",
    subtitle: "Notícias e texto do Papa",
    href: "https://www.vaticannews.va/pt.html",
    kind: "site",
    forTradition: "CATHOLIC",
  },
  {
    id: "bible-project",
    title: "The Bible Project",
    subtitle: "Vídeos que explicam os livros da Bíblia (inglês; legendas)",
    href: "https://www.youtube.com/@bibleproject",
    kind: "youtube",
    forTradition: "PROTESTANT",
  },
  {
    id: "hillsong-pt",
    title: "Hillsong em Português",
    subtitle: "Canal no YouTube — louvor",
    href: "https://www.youtube.com/@HillsongEmPortugues",
    kind: "youtube",
    forTradition: "PROTESTANT",
  },
  {
    id: "jesuscopy",
    title: "JesusCopy",
    subtitle: "Conteúdo cristão em vídeo",
    href: "https://www.youtube.com/@JesusCopy",
    kind: "youtube",
    forTradition: "ALL",
  },
];

export function listCuratedForTradition(tradition: Tradition | null): CuratedItem[] {
  if (!tradition) {
    return ITEMS.filter((i) => i.forTradition === "ALL");
  }
  return ITEMS.filter(
    (i) => i.forTradition === "ALL" || i.forTradition === tradition
  );
}
