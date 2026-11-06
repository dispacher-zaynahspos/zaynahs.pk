/**
 * Brand config types.
 *
 * A brand is data, never a code branch. Everything public about a brand lives in
 * a `BrandConfig`; secrets and IDs stay in env (brand-neutral names).
 */

export interface BrandConfig {
  /** Stable identifier, kebab-case (worker/bucket names derive from it). */
  slug: string;
  /** Apex + www hosts that belong to this brand. */
  hosts: string[];
  /** Admin host, e.g. admin.<apex>. */
  adminHost: string;
  /** Image host, e.g. img.<apex>. */
  imageHost: string;
  /** Display name, DB settings win over this. */
  name: string;
  tagline: string;
  twitterHandle: string;
  locale: string;
  currency: string;
  whatsapp: string;
  supportEmail: string;
  socialLinks: Record<string, string>;
}

export interface BrandResolution {
  brand: BrandConfig;
  /** true when the request host matched a configured brand host. */
  matched: boolean;
  /** normalised request host (no protocol, no www, no port). */
  host: string;
}
