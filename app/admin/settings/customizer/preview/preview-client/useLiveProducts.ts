import React from 'react';
import { Product, StoreSettings, HomepageSection } from '@/lib/types';

export function useLiveProducts(
  productsList: Product[],
  sections: HomepageSection[],
  settings: StoreSettings
): Product[] {
  return React.useMemo(() => {
    if (settings.flash_sale_enabled === false) {
      return productsList;
    }
    const now = Date.now();
    const fsSection = sections.find(s => s.section_type === 'flash_sale' && s.active);
    const isFsActive = fsSection ? (() => {
      const startStr = fsSection.settings?.startTime;
      const endStr = fsSection.settings?.endTime;
      if (!startStr && !endStr) return true;
      const start = startStr ? new Date(startStr).getTime() : 0;
      const end = endStr ? new Date(endStr).getTime() : 0;
      const isStarted = !startStr || start <= now;
      const isEnded = endStr && end < now;
      return isStarted && !isEnded;
    })() : false;

    return productsList.map(product => {
      // 1. Homepage manual products overrides (highest priority)
      if (isFsActive && fsSection) {
        const fsProducts = fsSection.content_data?.products || [];
        const fsProd = fsProducts.find((p: any) => p?.productId === product.id);
        
        if (fsProd) {
          const basePrice = product.comparePrice || product.price;
          const discountPrice = fsProd.discountValue ? parseFloat(fsProd.discountValue.toString()) : product.price;
          
          if (discountPrice < basePrice) {
            const ratio = discountPrice / basePrice;
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.comparePrice || (product.comparePrice ? Math.round(product.comparePrice * (v.price / product.price)) : v.price);
                const newVarPrice = Math.round(varBasePrice * ratio);
                return {
                  ...v,
                  price: newVarPrice,
                  comparePrice: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              comparePrice: basePrice,
              variants: updatedVariants,
              flashSaleEnabled: true,
              flashSaleEndDate: fsSection.settings?.endTime || undefined,
              flashSaleStartDate: fsSection.settings?.startTime || undefined
            };
          }
        }
      }

      // 2. Product-level Sale Settings (medium priority)
      if (product.flashSaleEnabled) {
        const pStartStr = product.flashSaleStartDate;
        const pEndStr = product.flashSaleEndDate;
        const isStarted = !pStartStr || new Date(pStartStr).getTime() <= now;
        const isEnded = pEndStr && new Date(pEndStr).getTime() < now;
        
        if (isStarted && !isEnded) {
          const discountType = product.flashSaleDiscountType || 'fixed';
          const discountVal = product.flashSaleDiscountValue || 0;
          
          const basePrice = product.comparePrice || product.price;
          let discountPrice = product.price;

          if (discountType === 'percentage') {
            discountPrice = Math.round(basePrice * (1 - discountVal / 100));
          } else if (discountType === 'fixed') {
            discountPrice = Math.max(0, basePrice - discountVal);
          }

          if (discountPrice < basePrice) {
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.comparePrice || (product.comparePrice ? Math.round(product.comparePrice * (v.price / product.price)) : v.price);
                let varDiscountPrice = v.price;
                if (discountType === 'percentage') {
                  varDiscountPrice = Math.round(varBasePrice * (1 - discountVal / 100));
                } else if (discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varBasePrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  comparePrice: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              comparePrice: basePrice,
              variants: updatedVariants,
              flashSaleEnabled: true,
              flashSaleEndDate: product.flashSaleEndDate || undefined,
              flashSaleStartDate: product.flashSaleStartDate || undefined
            };
          }
        }
      }

      // 3. Homepage Category Discounts (lowest priority)
      if (isFsActive && fsSection) {
        const categoryDiscounts = fsSection.content_data?.categoryDiscounts || [];
        const fsCat = categoryDiscounts.find((c: any) => c?.categoryId === product.categoryId);

        if (fsCat) {
          const basePrice = product.comparePrice || product.price;
          const discountVal = parseFloat(fsCat.discountValue) || 0;
          let discountPrice = product.price;

          if (fsCat.discountType === 'percentage') {
            discountPrice = Math.round(basePrice * (1 - discountVal / 100));
          } else if (fsCat.discountType === 'fixed') {
            discountPrice = Math.max(0, basePrice - discountVal);
          }

          if (discountPrice < basePrice) {
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.comparePrice || (product.comparePrice ? Math.round(product.comparePrice * (v.price / product.price)) : v.price);
                let varDiscountPrice = v.price;
                if (fsCat.discountType === 'percentage') {
                  varDiscountPrice = Math.round(varBasePrice * (1 - discountVal / 100));
                } else if (fsCat.discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varBasePrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  comparePrice: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              comparePrice: basePrice,
              variants: updatedVariants,
              flashSaleEnabled: true,
              flashSaleEndDate: fsSection.settings?.endTime || undefined,
              flashSaleStartDate: fsSection.settings?.startTime || undefined
            };
          }
        }
      }

      return product;
    });
  }, [productsList, sections, settings]);
}
