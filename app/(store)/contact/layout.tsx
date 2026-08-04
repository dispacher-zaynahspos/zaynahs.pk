import { Metadata } from 'next';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getDomainBrand();
  return {
    title: `Contact Us - ${brand.name}`,
    description: `Get in touch with ${brand.name}. We'd love to hear from you.`,
    openGraph: {
      siteName: brand.name,
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
