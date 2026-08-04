import { Metadata } from 'next';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getDomainBrand();
  return {
    title: `Create Account - ${brand.name}`,
    description: `Join ${brand.name} and start shopping today.`,
    robots: { index: false, follow: false },
    openGraph: {
      siteName: brand.name,
      title: `Create Account - ${brand.name}`,
      description: `Join ${brand.name} and start shopping today.`,
    },
  };
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
