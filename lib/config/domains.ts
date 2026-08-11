export function getDomainConfig(hostOrUrl: string): { name: string; tagline: string } {
  let fallbackName = process.env.NEXT_PUBLIC_BRAND_NAME || '';
  
  if (!fallbackName && hostOrUrl) {
    const cleanHost = hostOrUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split(':')[0];
    if (cleanHost && cleanHost !== 'localhost' && cleanHost !== '127.0.0.1') {
      fallbackName = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);
    } else {
      fallbackName = 'Online Store';
    }
  }

  return {
    name: fallbackName || 'Online Store',
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || ''
  };
}

export function getDomainName(hostOrUrl: string): string {
  return getDomainConfig(hostOrUrl).name;
}
