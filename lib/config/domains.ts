export function getDomainConfig(hostOrUrl: string): { name: string; tagline: string } {
  return {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || '',
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || ''
  };
}

export function getDomainName(hostOrUrl: string): string {
  return getDomainConfig(hostOrUrl).name;
}
