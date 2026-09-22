export interface SEOEntityItem {
  id: string;
  name: string;
  slug: string;
  seo_meta: {
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
    faq_schema: any[];
    pinterest_description: string;
    is_optimized: boolean;
  } | null;
}
