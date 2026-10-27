import type { LinkIndex } from "./types";

export type ResolvedLink =
  | { kind: "external"; href: string }
  | { kind: "anchor"; hash: string }
  | { kind: "lesson"; courseId: string; lessonId: string; hash?: string | undefined }
  | { kind: "unknown"; href: string };

function normalize(parts: string[]) {
  const out: string[] = [];
  for (const p of parts) {
    if (!p || p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return out.join("/");
}

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Resolve a markdown href written inside `fromPath` (root-relative .md path). */
export function resolveLink(href: string, fromPath: string, index: LinkIndex): ResolvedLink {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return { kind: "external", href };
  const [rawPath, rawHash] = href.split("#", 2) as [string, string | undefined];
  const hash = rawHash ? decode(rawHash) : undefined;
  if (!rawPath) return { kind: "anchor", hash: hash ?? "" };

  const base = rawPath.startsWith("/") ? [] : fromPath.split("/").slice(0, -1);
  const target = normalize([...base, ...decode(rawPath).split("/")]).normalize("NFC");
  const hit = index[target];
  if (hit) return { kind: "lesson", ...hit, hash };
  return { kind: "unknown", href };
}
