import { MetaCatalogItem, mapProductToMeta } from '@/lib/meta/mapProduct';
import { Product, StoreSettings } from '@/lib/types';

/**
 * Strips XML-invalid characters to produce well-formed XML.
 */
function sanitizeXmlText(str: string): string {
  if (!str) return '';
  // Remove control characters (except newline, tab, carriage return)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Wraps text in CDATA safely, escaping any nested CDATA closing sequences.
 */
function cdata(str: string): string {
  const sanitized = sanitizeXmlText(str);
  return `<![CDATA[${sanitized.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * Converts a MetaCatalogItem into standard Meta / Google RSS 2.0 item XML tags.
 * Follows Meta Commerce Catalog XML feed specifications:
 * - Standalone products have id and NO item_group_id.
 * - Product variants have id = variant.id and item_group_id = parent.id.
 */
function itemToXml(item: MetaCatalogItem): string {
  const lines: string[] = ['    <item>'];

  lines.push(`      <g:id>${item.id}</g:id>`);
  lines.push(`      <g:title>${cdata(item.title)}</g:title>`);
  lines.push(`      <g:description>${cdata(item.description)}</g:description>`);
  lines.push(`      <g:link>${sanitizeXmlText(item.link)}</g:link>`);
  lines.push(`      <g:image_link>${sanitizeXmlText(item.image_link)}</g:image_link>`);

  // Multiple additional images are output as individual tags
  if (item.additional_image_link) {
    const additionalUrls = item.additional_image_link.split(',').map((u) => u.trim()).filter(Boolean);
    additionalUrls.slice(0, 10).forEach((url) => {
      lines.push(`      <g:additional_image_link>${sanitizeXmlText(url)}</g:additional_image_link>`);
    });
  }

  lines.push(`      <g:availability>${item.availability}</g:availability>`);
  lines.push(`      <g:price>${item.price}</g:price>`);
  if (item.sale_price) {
    lines.push(`      <g:sale_price>${item.sale_price}</g:sale_price>`);
  }

  lines.push(`      <g:condition>${item.condition}</g:condition>`);
  lines.push(`      <g:brand>${cdata(item.brand)}</g:brand>`);

  if (item.category) {
    lines.push(`      <g:product_type>${cdata(item.category)}</g:product_type>`);
  }
  if (item.google_product_category) {
    lines.push(`      <g:google_product_category>${cdata(item.google_product_category)}</g:google_product_category>`);
  }

  // Variant grouping: ONLY present on variants, NEVER on standalone products (RULE E2)
  if (item.item_group_id) {
    lines.push(`      <g:item_group_id>${item.item_group_id}</g:item_group_id>`);
  }

  if (item.color) {
    lines.push(`      <g:color>${cdata(item.color)}</g:color>`);
  }
  if (item.size) {
    lines.push(`      <g:size>${cdata(item.size)}</g:size>`);
  }
  if (item.material) {
    lines.push(`      <g:material>${cdata(item.material)}</g:material>`);
  }
  if (item.gender) {
    lines.push(`      <g:gender>${item.gender}</g:gender>`);
  }
  if (item.age_group) {
    lines.push(`      <g:age_group>${item.age_group}</g:age_group>`);
  }

  lines.push('    </item>');
  return lines.join('\n');
}

/**
 * Generates a full standard RSS 2.0 XML catalog feed for Meta Commerce Manager / Google Merchant.
 */
export function generateMetaCatalogXml(
  products: Product[],
  settings: StoreSettings,
  categoryMap: Record<string, string>,
  siteUrl: string
): string {
  const brandName = settings.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store';

  const allItems: MetaCatalogItem[] = [];

  for (const product of products) {
    try {
      const items = mapProductToMeta(product, settings, categoryMap);
      allItems.push(...items);
    } catch (err) {
      console.warn(`[MetaCatalogXml] Skipping product "${product.name}" (${product.id}) due to mapping error:`, err);
    }
  }

  const itemsXml = allItems.map((item) => itemToXml(item)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${cdata(brandName)}</title>
    <link>${sanitizeXmlText(siteUrl)}</link>
    <description>${cdata(`${brandName} Product Catalog Data Feed`)}</description>
${itemsXml}
  </channel>
</rss>`;
}
