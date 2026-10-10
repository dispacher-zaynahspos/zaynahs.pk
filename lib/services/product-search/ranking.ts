import { ProductSearchResult, SearchRankWeights, DEFAULT_SEARCH_WEIGHTS, ParsedAgeQuery } from './types';
import { parseAgeQuery, ageMatchesQuery, extractProductAgeRange, tokenizeQuery, normalizeQuery } from './normalization';

export function calculateSearchScore(
  product: ProductSearchResult,
  query: string,
  parsedAge: ParsedAgeQuery,
  weights: SearchRankWeights = DEFAULT_SEARCH_WEIGHTS
): { score: number; matchedFields: string[] } {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return { score: 0, matchedFields: [] };

  const name = product.name.toLowerCase();
  const shortDesc = (product.shortDescription || '').toLowerCase();
  const longDesc = (product.description || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const tags = product.tags.map(t => t.toLowerCase());
  const categoryName = product.category?.name.toLowerCase() || '';
  
  const variantText = product.variants
    .filter(v => v.active)
    .map(v => [
      v.color, v.size, v.material, v.customValue, v.sku
    ].filter(Boolean).join(' ')).join(' ').toLowerCase();

  let score = 0;
  const matchedFields: string[] = [];

  for (const token of tokens) {
    if (token.length < 2) continue;

    // 1. Exact title match
    if (name === token) {
      score += weights.titleExact;
      matchedFields.push('title:exact');
      continue;
    }

    // 2. Title prefix match
    if (name.startsWith(token)) {
      score += weights.titlePrefix;
      matchedFields.push('title:prefix');
      continue;
    }

    // 3. Strong title keyword match (word boundary)
    if (new RegExp(`\\b${escapeRegExp(token)}\\b`).test(name)) {
      score += weights.titleKeyword;
      matchedFields.push('title:keyword');
      continue;
    }

    // 4. Title partial match
    if (name.includes(token)) {
      score += weights.titlePartial;
      matchedFields.push('title:partial');
    }

    // 5. Variant exact match
    if (new RegExp(`\\b${escapeRegExp(token)}\\b`).test(variantText)) {
      score += weights.variantExact;
      matchedFields.push('variant:exact');
      continue;
    }

    // 6. Variant partial match
    if (variantText.includes(token)) {
      score += weights.variantPartial;
      matchedFields.push('variant:partial');
    }

    // 7. SKU exact match (high priority for exact SKU searches)
    if (sku === token || sku.includes(token)) {
      score += weights.sku;
      matchedFields.push('sku');
    }

    // 8. Short description match
    if (shortDesc.includes(token)) {
      score += weights.shortDescription;
      matchedFields.push('short_desc');
    }

    // 9. Tags match
    if (tags.some(t => t.includes(token))) {
      score += weights.tags;
      matchedFields.push('tags');
    }

    // 10. Category match
    if (categoryName.includes(token)) {
      score += weights.category;
      matchedFields.push('category');
    }

    // 11. Long description match (lowest weight)
    if (longDesc.includes(token)) {
      score += weights.longDescription;
      matchedFields.push('long_desc');
    }
  }

  // Age matching bonus
  const productAge = extractProductAgeRange(product as any);
  if (productAge) {
    const ageMatch = ageMatchesQuery(productAge.min, productAge.max, parsedAge);
    if (ageMatch.exact) {
      score += weights.ageExact;
      matchedFields.push('age:exact');
    } else if (ageMatch.compatible) {
      score += weights.ageCompatible;
      matchedFields.push('age:compatible');
    }
  }

  // Deduplicate matched fields
  const uniqueMatchedFields = [...new Set(matchedFields)];

  return { score, matchedFields: uniqueMatchedFields };
}

export function rankSearchResults(
  products: ProductSearchResult[],
  query: string,
  weights?: SearchRankWeights
): ProductSearchResult[] {
  const parsedAge = parseAgeQuery(query);
  const normalizedQuery = normalizeQuery(query);

  return products
    .map(product => {
      const { score, matchedFields } = calculateSearchScore(product, normalizedQuery, parsedAge, weights);
      return { ...product, score, matchedFields };
    })
    .sort((a, b) => {
      // Primary: score descending
      if (b.score !== a.score) return b.score - a.score;
      // Tie-breaker: featured first
      if (b.isFeatured !== a.isFeatured) return b.isFeatured ? 1 : -1;
      // Tie-breaker: in stock first
      if ((b.stock > 0) !== (a.stock > 0)) return b.stock > 0 ? 1 : -1;
      // Tie-breaker: newer first
      return 0;
    });
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildSearchTsVector(product: any): string {
  const parts: string[] = [];
  
  if (product.name) parts.push(product.name);
  if (product.short_description) parts.push(product.short_description);
  if (product.description) parts.push(product.description);
  if (product.sku) parts.push(product.sku);
  if (product.tags?.length) parts.push(product.tags.join(' '));
  if (product.category?.name) parts.push(product.category.name);
  
  if (product.variants?.length) {
    const variantParts = product.variants
      .filter((v: any) => v.active)
      .map((v: any) => [v.color, v.size, v.material, v.custom_value, v.sku].filter(Boolean).join(' '))
      .join(' ');
    if (variantParts) parts.push(variantParts);
  }

  return parts.join(' ');
}