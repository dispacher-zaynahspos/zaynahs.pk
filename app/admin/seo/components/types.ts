export interface SEOFaqItem {
  question: string;
  answer: string;
}

export interface SEOMetaData {
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  secondary_keywords: string;
  lsi_tags: string;
  og_title: string;
  og_description: string;
  twitter_title: string;
  twitter_description: string;
  image_alt: string;
  long_description: string;
  faq_schema: SEOFaqItem[];
  pinterest_description: string;
  is_optimized: boolean;
}

export interface SEOEntityItem {
  id: string;
  name: string;
  slug: string;
  seo_meta: SEOMetaData | null;
}
