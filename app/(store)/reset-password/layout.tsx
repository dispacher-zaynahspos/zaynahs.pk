import { Metadata } from 'next';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getDomainBrand();
  return {
    title: `Reset Password - ${brand.name}`,
    description: `Reset your ${brand.name} account password.`,
    robots: { index: false, follow: false },
  };
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
