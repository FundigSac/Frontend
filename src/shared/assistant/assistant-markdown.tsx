import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Markdown mínimo y seguro para las respuestas del asistente: párrafos, listas, tablas simples, **negritas**,
 * `código` y enlaces. No interpreta HTML; los enlaces externos solo se aceptan hacia dominios de la empresa.
 */

const SAFE_HOSTS = new Set(["wa.me", "api.whatsapp.com", "www.instagram.com", "instagram.com", "www.google.com", "maps.google.com"]);
const SITE_HOSTS = new Set(["fundigsac.com", "www.fundigsac.com", "fundigsac-web.vercel.app"]);

type SafeLink = { kind: "internal" | "external" | "app"; href: string };

export function safeHref(raw: string): SafeLink | null {
  const href = raw.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return { kind: "internal", href };
  if (/^(mailto|tel):[^\s]+$/i.test(href)) return { kind: "app", href };
  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return null;
    if (SITE_HOSTS.has(url.hostname)) return { kind: "internal", href: `${url.pathname}${url.search}${url.hash}` || "/" };
    if (SAFE_HOSTS.has(url.hostname)) return { kind: "external", href: url.toString() };
  } catch {
    /* no es una URL válida: se muestra como texto */
  }
  return null;
}

const INLINE = /\*\*([^*\n]+?)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\s]+)\)|(https:\/\/wa\.me\/[^\s)]+)/g;

function renderLink(label: string, target: string, key: string, onNavigate?: () => void): ReactNode {
  const link = safeHref(target);
  if (!link) return label;
  if (link.kind === "internal") {
    return (
      <Link key={key} href={link.href} onClick={onNavigate}>
        {label}
      </Link>
    );
  }
  if (link.kind === "app") return <a key={key} href={link.href}>{label}</a>;
  return (
    <a key={key} href={link.href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function inline(text: string, key: string, onNavigate?: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(INLINE.source, "g");
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const k = `${key}-${i++}`;
    if (match[1] !== undefined) out.push(<strong key={k}>{inline(match[1], k, onNavigate)}</strong>);
    else if (match[2] !== undefined) out.push(<code key={k}>{match[2]}</code>);
    else if (match[3] !== undefined) out.push(renderLink(match[3], match[4], k, onNavigate));
    else if (match[5] !== undefined) out.push(renderLink("WhatsApp", match[5], k, onNavigate));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const BULLET = /^(\s*)[-*•]\s+(.*)$/;
const ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;
const TABLE = /^\s*\|.*\|\s*$/;
const RULE = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function isBlockStart(line: string): boolean {
  return BULLET.test(line) || ORDERED.test(line) || HEADING.test(line) || TABLE.test(line) || RULE.test(line);
}

function cells(row: string): string[] {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

export function AssistantMarkdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${b++}`;
    if (!line.trim()) {
      i++;
      continue;
    }

    if (TABLE.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && TABLE.test(lines[i])) {
        if (!TABLE_DIVIDER.test(lines[i])) rows.push(cells(lines[i]));
        i++;
      }
      if (!rows.length) continue;
      const [head, ...body] = rows;
      blocks.push(
        <div key={key} className="ai-md__table">
          <table>
            <thead>
              <tr>{head.map((c, j) => <th key={j}>{inline(c, `${key}h${j}`, onNavigate)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `${key}r${ri}c${j}`, onNavigate)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const ordered = ORDERED.exec(line);
    if (BULLET.test(line) || ordered) {
      const pattern = ordered ? ORDERED : BULLET;
      const items: { text: string; sub: boolean }[] = [];
      while (i < lines.length) {
        const m = pattern.exec(lines[i]) ?? (ordered ? BULLET.exec(lines[i]) : null);
        if (m) {
          const indent = m[1].length;
          items.push({ text: m[m.length - 1], sub: indent >= 2 || (ordered !== null && pattern.exec(lines[i]) === null) });
          i++;
        } else if (lines[i].trim() && /^\s{2,}\S/.test(lines[i]) && items.length) {
          items[items.length - 1].text += ` ${lines[i].trim()}`;
          i++;
        } else break;
      }
      const list = items.map((it, j) => (
        <li key={j} className={it.sub ? "ai-md__sub" : undefined}>
          {inline(it.text, `${key}i${j}`, onNavigate)}
        </li>
      ));
      blocks.push(ordered ? <ol key={key} start={Number(ordered[2]) || 1}>{list}</ol> : <ul key={key}>{list}</ul>);
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push(
        <p key={key} className="ai-md__h">
          {inline(heading[1].replace(/\*\*/g, ""), key, onNavigate)}
        </p>,
      );
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push(<hr key={key} />);
      i++;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i]))) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key}>
        {para.flatMap((l, j) => (j ? [<br key={`br${j}`} />, ...inline(l, `${key}l${j}`, onNavigate)] : inline(l, `${key}l${j}`, onNavigate)))}
      </p>,
    );
  }

  return <div className="ai-md">{blocks}</div>;
}
