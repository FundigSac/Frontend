import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const ORIGIN = "https://fundigsac.com";
export const ALLOWED_HOSTS = new Set(["fundigsac.com", "www.fundigsac.com"]);

export function normalizeUrl(input: string, base = ORIGIN): string | null {
  try {
    const url = new URL(input, base);
    if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (/\/(wp-admin|wp-login\.php)(\/|$)/i.test(url.pathname)) return null;
    if (/\/(cart|checkout|my-account)(\/|$)/i.test(url.pathname)) return null;
    const blockedParams = ["add-to-cart", "remove_item", "undo_item", "wc-ajax", "logout"];
    if (blockedParams.some((key) => url.searchParams.has(key))) return null;
    url.protocol = "https:";
    url.hostname = "fundigsac.com";
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_.+|fbclid|gclid|_ga)$/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    if (url.pathname.endsWith("/index.html")) url.pathname = url.pathname.slice(0, -10) || "/";
    return url.toString();
  } catch {
    return null;
  }
}

export function safeStem(input: string): string {
  const url = new URL(input);
  const pathname = decodeURIComponent(url.pathname)
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[^\p{L}\p{N}._-]/gu, "-").slice(0, 70))
    .join("__") || "home";
  const query = url.search ? `__q-${createHash("sha1").update(url.search).digest("hex").slice(0, 8)}` : "";
  return `${pathname}${query}`.slice(0, 180);
}

export function mirrorPagePath(input: string): string {
  const url = new URL(input);
  const parts = url.pathname.split("/").filter(Boolean).map((part) => part.replace(/[^\p{L}\p{N}._-]/gu, "-"));
  if (url.search) parts.push(`__q-${createHash("sha1").update(url.search).digest("hex").slice(0, 8)}`);
  return path.join(...parts, "index.html");
}

export function mirrorAssetPath(input: string): string {
  const url = new URL(input);
  const parts = url.pathname.split("/").filter(Boolean).map((part) => {
    try {
      return decodeURIComponent(part).replace(/[^\p{L}\p{N}._-]/gu, "-");
    } catch {
      return part.replace(/[^\p{L}\p{N}._-]/gu, "-");
    }
  });
  return path.join(...parts);
}

export async function writeArtifact(base: string, relative: string, data: string | Uint8Array): Promise<void> {
  const destination = path.resolve(base, relative);
  if (!destination.startsWith(`${path.resolve(base)}${path.sep}`)) throw new Error("Artifact path escaped its output directory");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, data);
}

export function csvCell(value: unknown): string {
  const text = value == null ? "" : Array.isArray(value) ? value.join(" | ") : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
