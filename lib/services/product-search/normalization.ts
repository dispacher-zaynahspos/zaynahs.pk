import { ParsedAgeQuery, AgeRange } from './types';

const AGE_UNITS: Record<string, number> = {
  'month': 1, 'months': 1, 'm': 1, 'mo': 1,
  'year': 12, 'years': 12, 'yr': 12, 'yrs': 12, 'y': 12,
};

const GENDER_KEYWORDS = {
  boy: ['boy', 'boys', 'lad', 'lads', 'son', 'he', 'him'],
  girl: ['girl', 'girls', 'lass', 'daughter', 'she', 'her'],
  unisex: ['unisex', 'kids', 'children', 'child', 'baby', 'infant', 'toddler', 'youth'],
};

const AGE_RANGE_PATTERNS = [
  /(\d+)\s*[-–—]\s*(\d+)\s*(month|months|year|years|yr|yrs|m|mo|y)/gi,
  /(\d+)\s*to\s*(\d+)\s*(month|months|year|years|yr|yrs|m|mo|y)/gi,
  /age\s*(\d+)\s*[-–—]\s*(\d+)/gi,
  /(\d+)\s*[-–—]\s*(\d+)\s*[ym]/gi,
];

const SINGLE_AGE_PATTERNS = [
  /(\d+)\s*(month|months|m|mo)/gi,
  /(\d+)\s*(year|years|yr|yrs|y)(?!\w)/gi,
  /age\s*(\d+)/gi,
  /\b(\d+)[ym]\b/gi,
];

export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s\-]/gu, ' ')
    .replace(/\s+/g, ' ');
}

export function tokenizeQuery(query: string): string[] {
  return normalizeQuery(query)
    .split(/\s+/)
    .filter(t => t.length > 0);
}

export function parseAgeQuery(query: string): ParsedAgeQuery {
  const normalized = normalizeQuery(query);
  const result: ParsedAgeQuery = {
    original: query,
    keywords: tokenizeQuery(query),
  };

  let matchedAge = false;

  for (const pattern of AGE_RANGE_PATTERNS) {
    const matches = [...normalized.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      const min = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      const unit = match[3]?.toLowerCase() || 'year';
      const multiplier = AGE_UNITS[unit] || 12;
      
      result.ageRange = {
        minMonths: min * multiplier,
        maxMonths: max * multiplier,
        label: `${min}-${max} ${unit}`,
      };
      matchedAge = true;
      break;
    }
  }

  if (!matchedAge) {
    for (const pattern of SINGLE_AGE_PATTERNS) {
      const matches = [...normalized.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        const value = parseInt(match[1], 10);
        const unit = match[2]?.toLowerCase() || 'year';
        const multiplier = AGE_UNITS[unit] || 12;
        
        result.ageInMonths = value * multiplier;
        matchedAge = true;
        break;
      }
    }
  }

  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (keywords.some(k => normalized.includes(k))) {
      result.gender = gender as 'boy' | 'girl' | 'unisex';
      break;
    }
  }

  if (matchedAge) {
    result.keywords = result.keywords.filter(k => {
      const isAgeKeyword = /\d/.test(k) || 
        ['month', 'months', 'year', 'years', 'yr', 'yrs', 'age', 'old'].includes(k);
      const isGenderKeyword = Object.values(GENDER_KEYWORDS).flat().includes(k);
      return !isAgeKeyword && !isGenderKeyword;
    });
  }

  return result;
}

export function ageMatchesQuery(
  productAgeMin?: number,
  productAgeMax?: number,
  queryAge?: ParsedAgeQuery
): { exact: boolean; compatible: boolean; score: number } {
  if (!queryAge || (!queryAge.ageInMonths && !queryAge.ageRange)) {
    return { exact: false, compatible: false, score: 0 };
  }

  if (!productAgeMin && !productAgeMax) {
    return { exact: false, compatible: false, score: 0 };
  }

  const pMin = productAgeMin || 0;
  const pMax = productAgeMax || pMin;

  if (queryAge.ageInMonths) {
    const qAge = queryAge.ageInMonths;
    if (qAge >= pMin && qAge <= pMax) {
      return { exact: true, compatible: true, score: 100 };
    }
    const distance = Math.min(Math.abs(qAge - pMin), Math.abs(qAge - pMax));
    if (distance <= 6) {
      return { exact: false, compatible: true, score: Math.max(0, 50 - distance * 5) };
    }
    return { exact: false, compatible: false, score: 0 };
  }

  if (queryAge.ageRange) {
    const qMin = queryAge.ageRange.minMonths;
    const qMax = queryAge.ageRange.maxMonths;
    
    const overlapStart = Math.max(pMin, qMin);
    const overlapEnd = Math.min(pMax, qMax);
    
    if (overlapStart <= overlapEnd) {
      const overlap = overlapEnd - overlapStart;
      const querySpan = qMax - qMin;
      const productSpan = pMax - pMin;
      
      if (overlap === querySpan && overlap === productSpan) {
        return { exact: true, compatible: true, score: 100 };
      }
      return { exact: false, compatible: true, score: Math.min(80, 40 + overlap) };
    }
    
    const distance = Math.min(
      Math.abs(pMin - qMax),
      Math.abs(pMax - qMin)
    );
    if (distance <= 12) {
      return { exact: false, compatible: true, score: Math.max(0, 30 - distance * 2) };
    }
    return { exact: false, compatible: false, score: 0 };
  }

  return { exact: false, compatible: false, score: 0 };
}

export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const tokens = tokenizeQuery(query);
  let result = text;
  for (const token of tokens) {
    if (token.length < 2) continue;
    const regex = new RegExp(`(${escapeRegExp(token)})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }
  return result;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractProductAgeRange(product: any): { min?: number; max?: number } | null {
  if (product.recommended_age_min_months != null || product.recommended_age_max_months != null) {
    return {
      min: product.recommended_age_min_months,
      max: product.recommended_age_max_months,
    };
  }
  if (product.age_group) {
    const parsed = parseAgeQuery(product.age_group);
    if (parsed.ageInMonths) {
      return { min: parsed.ageInMonths, max: parsed.ageInMonths };
    }
    if (parsed.ageRange) {
      return { min: parsed.ageRange.minMonths, max: parsed.ageRange.maxMonths };
    }
  }
  return null;
}