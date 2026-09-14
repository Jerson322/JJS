export interface ShortcutEntry {
  id: string;
  brandLabel: string;
  label: string;
  url: string;
  keywords: string[];
  sortOrder: number;
}

export interface RankedShortcut extends ShortcutEntry {
  score: number;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreAgainst(query: string, candidate: string): number {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return 0;
  if (c === q) return 100;

  // Containment is scored asymmetrically on purpose:
  //  - When the QUERY is the shorter side and it's fully inside the
  //    candidate (e.g. "zapatillas" inside "zapatillas air force"), the
  //    user's whole (broad) query matched a real keyword phrase -- that's
  //    a strong, near-exact hit, so a flat high score.
  //  - When the CANDIDATE is the shorter side and it's found inside a
  //    longer, more specific query (e.g. "zapatos" inside "zapatos air
  //    force one"), it's often just one generic word buried in a more
  //    specific query. Scale the score by the matched keyword's length so
  //    a long, specific keyword ("air force one") clearly outranks a
  //    short, generic one ("zapatos") even though both technically match.
  if (q.length < c.length && c.includes(q)) {
    return 85;
  }
  if (c.length < q.length && q.includes(c)) {
    return Math.min(80, 40 + c.length * 2);
  }

  const qWords = new Set(q.split(" ").filter(Boolean));
  const cWords = c.split(" ").filter(Boolean);
  const shared = cWords.filter((w) => qWords.has(w)).length;
  return shared > 0 ? 20 + shared * 15 : 0;
}

function scoreEntry(query: string, entry: ShortcutEntry): number {
  const texts = [entry.label, entry.brandLabel, ...entry.keywords];
  return texts.reduce((best, text) => Math.max(best, scoreAgainst(query, text)), 0);
}

// Broad queries (e.g. "zapatillas") tend to tie near the top score across
// many entries tagged with that generic keyword, so they all survive the
// threshold. Specific queries (e.g. "air force one") score much higher on
// one entry than the rest, so only that (small) cluster survives.
const RELATIVE_THRESHOLD = 20;

export function rankShortcuts(
  query: string,
  entries: ShortcutEntry[],
  limit = 8,
): RankedShortcut[] {
  const scored = entries
    .map((entry) => ({ ...entry, score: scoreEntry(query, entry) }))
    .filter((entry) => entry.score > 0);

  if (scored.length === 0) return [];

  const topScore = Math.max(...scored.map((e) => e.score));

  return scored
    .filter((entry) => entry.score >= topScore - RELATIVE_THRESHOLD)
    .sort((a, b) => b.score - a.score || a.sortOrder - b.sortOrder)
    .slice(0, limit);
}
