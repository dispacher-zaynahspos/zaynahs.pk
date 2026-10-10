/**
 * Search synonyms + Roman-Urdu expansion (SSOT, easy to extend).
 *
 * Maps a search token to extra equivalent tokens so "sardi" also matches
 * "winter", "larkay" matches "boys", etc. Used by the client shop search and
 * can be imported by any other search surface. Bidirectional entries are added
 * both ways automatically.
 */

// base groups — every term in a group matches every other term in the group
const SYNONYM_GROUPS: string[][] = [
  ['winter', 'sardi', 'sardiyan', 'warm', 'woolen', 'woollen'],
  ['summer', 'garmi', 'garmiyan', 'cotton', 'lawn'],
  ['boys', 'boy', 'larkay', 'larka', 'ladka', 'ladkay'],
  ['girls', 'girl', 'larki', 'larkiyan', 'ladki', 'ladkiyan'],
  ['kids', 'kid', 'bachay', 'bachon', 'baccha', 'children', 'child', 'baby'],
  ['frock', 'frocks', 'girls frock', 'dress'],
  ['shirt', 'shirts', 'kameez', 'qameez'],
  ['trouser', 'trousers', 'pant', 'pants', 'shalwar', 'pajama', 'pyjama'],
  ['shoes', 'shoe', 'joota', 'jootay', 'footwear'],
  ['coat', 'coats', 'jacket', 'jackets', 'upper'],
  ['sale', 'discount', 'offer', 'cheap', 'sasta'],
  ['set', 'sets', 'co-ord', 'coord', 'joda', 'jora'],
];

// Build a lookup: token -> Set of all equivalent tokens (incl. itself)
const SYNONYM_MAP: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>();
  for (const group of SYNONYM_GROUPS) {
    const all = new Set(group.map((t) => t.toLowerCase()));
    for (const term of all) {
      const existing = map.get(term) || new Set<string>();
      all.forEach((t) => existing.add(t));
      map.set(term, existing);
    }
  }
  return map;
})();

/**
 * Expand a single search token into itself + all synonyms.
 * Single-word synonyms are returned as separate tokens; multi-word synonyms
 * (e.g. "co-ord") are returned as-is for substring matching.
 */
export function expandSynonyms(token: string): string[] {
  const t = token.toLowerCase().trim();
  if (!t) return [];
  const set = SYNONYM_MAP.get(t);
  if (!set) return [t];
  return Array.from(set);
}
