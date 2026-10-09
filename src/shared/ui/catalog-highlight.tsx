import { highlightRanges } from "@/modules/catalog/search";

/** Resalta (sin distinguir acentos ni mayúsculas) los términos de búsqueda dentro de un texto. */
export function Highlight({ text, terms }: { text: string; terms: readonly string[] }) {
  const ranges = highlightRanges(text, terms);
  if (!ranges.length) return <>{text}</>;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([a, b], i) => {
    if (a > cursor) out.push(text.slice(cursor, a));
    out.push(
      <mark key={i} className="bg-primary-fixed text-on-primary-fixed rounded-sm">
        {text.slice(a, b)}
      </mark>,
    );
    cursor = b;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return <>{out}</>;
}
