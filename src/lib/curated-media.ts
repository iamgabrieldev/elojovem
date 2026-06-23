import type { Tradition } from "@/lib/types/domain";

export type CuratedItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: "youtube" | "site" | "audio";
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
