export function getDomainConfig(hostOrUrl: string): { name: string; tagline: string } {
  return {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Zaynahs E-Store',
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Pakistan Premium Fashion & Jewelry Store — Express COD Nationwide'
  };
}

export function getDomainName(hostOrUrl: string): string {
  return getDomainConfig(hostOrUrl).name;
}
