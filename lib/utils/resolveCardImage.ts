/**
 * SSOT — AUTO/CUSTOM card image resolution for customizer grid cards
 * (Category Grid, Collections Grid, Round Categories, Category Filter).
 *
 * Card shape (backward compatible):
 *   {
 *     title, link, imageUrl,          // imageUrl = last-saved image (fallback)
 *     ref_type?: 'category' | 'collection',
 *     ref_id?: string,                // linked entity id
 *     image_mode?: 'auto' | 'custom', // absent/undefined on OLD cards → treated as CUSTOM
 *   }
 *
 * AUTO  → image follows the linked entity's current image_url (live).
 * CUSTOM → fixed imageUrl chosen by admin (or any legacy card with no ref/mode).
 */

export interface GridCardLike {
  title?: string;
  link?: string;
  imageUrl?: string;
  ref_type?: 'category' | 'collection';
  ref_id?: string;
  image_mode?: 'auto' | 'custom';
}

export interface RefEntity {
  id: string;
  name?: string;
  slug?: string;
  image_url?: string | null;
}

/** True when the card should follow its linked entity's image. */
export function isAutoCard(card: GridCardLike): boolean {
  return card.image_mode === 'auto' && !!card.ref_id;
}

/**
 * Resolve the image a card should display.
 * AUTO: linked entity image → fallback to the card's last-saved imageUrl.
 * CUSTOM / legacy: the card's own imageUrl.
 */
export function resolveCardImage(
  card: GridCardLike,
  lookup?: Map<string, RefEntity> | Record<string, RefEntity>
): string {
  if (isAutoCard(card) && lookup) {
    const entity =
      lookup instanceof Map ? lookup.get(card.ref_id as string) : lookup[card.ref_id as string];
    const entityImage = entity?.image_url || '';
    return entityImage || card.imageUrl || '';
  }
  return card.imageUrl || '';
}

/** Build an id→entity lookup from a list of categories/collections. */
export function buildRefLookup(entities: RefEntity[] = []): Map<string, RefEntity> {
  const m = new Map<string, RefEntity>();
  for (const e of entities) if (e?.id) m.set(e.id, e);
  return m;
}
