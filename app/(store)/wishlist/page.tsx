import React from 'react';
import { Metadata } from 'next';
import WishlistContainer from '@/components/store/WishlistContainer';
import { getProducts } from '@/lib/services/products';
import { getSettings } from '@/lib/services/settings';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export const revalidate = 2592000; // 30 days ISR — webhooks purge on admin save (RULE QUOTA1)

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getDomainBrand();
  return {
    title: `My Wishlist - ${brand.name}`,
    description: `Your saved items at ${brand.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function WishlistPage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings()
  ]);

  return (
    <WishlistContainer
      products={products}
      settings={settings}
    />
  );
}
