import { Metadata } from 'next';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getDomainBrand();
  return {
    title: `Login - ${brand.name}`,
    description: `Sign in to your ${brand.name} account.`,
    robots: { index: false, follow: false },
    openGraph: {
      siteName: brand.name,
      title: `Login - ${brand.name}`,
      description: `Sign in to your ${brand.name} account.`,
    },
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
