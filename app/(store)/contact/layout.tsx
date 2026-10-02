import { Metadata } from 'next';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getDomainBrand();
  const siteUrl = `${brand.protocol}://${brand.domain}`;
  return {
    title: `Contact Us - ${brand.name}`,
    description: `Get in touch with ${brand.name}. We'd love to hear from you.`,
    alternates: { canonical: `${siteUrl}/contact` },
    openGraph: {
      siteName: brand.name,
      url: `${siteUrl}/contact`,
      title: `Contact Us - ${brand.name}`,
      description: `Get in touch with ${brand.name}. We'd love to hear from you.`,
    },
    twitter: {
      title: `Contact Us - ${brand.name}`,
      description: `Get in touch with ${brand.name}. We'd love to hear from you.`,
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
