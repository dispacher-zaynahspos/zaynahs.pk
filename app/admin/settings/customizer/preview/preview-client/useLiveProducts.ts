import React from 'react';
import { Product, StoreSettings, HomepageSection } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';

export function useLiveProducts(
  productsList: Product[],
  sections: HomepageSection[],
  settings: StoreSettings
): Product[] {
  return React.useMemo(() => {
    if (!isFeatureEnabled(settings, 'flash_sale')) {
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
          const basePrice = product.compare_price || product.price;
          const discountPrice = fsProd.discountValue ? parseFloat(fsProd.discountValue.toString()) : product.price;
          
          if (discountPrice < basePrice) {
            const ratio = discountPrice / basePrice;
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                const newVarPrice = Math.round(varBasePrice * ratio);
                return {
                  ...v,
                  price: newVarPrice,
                  compare_price: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              compare_price: basePrice,
              variants: updatedVariants,
              flash_sale_enabled: true,
              flash_sale_end_date: fsSection.settings?.endTime || undefined,
              flash_sale_start_date: fsSection.settings?.startTime || undefined
            };
          }
        }
      }

      // 2. Product-level Sale Settings (medium priority)
      if (product.flash_sale_enabled) {
        const pStartStr = product.flash_sale_start_date;
        const pEndStr = product.flash_sale_end_date;
        const isStarted = !pStartStr || new Date(pStartStr).getTime() <= now;
        const isEnded = pEndStr && new Date(pEndStr).getTime() < now;
        
        if (isStarted && !isEnded) {
          const discountType = product.flash_sale_discount_type || 'fixed';
          const discountVal = product.flash_sale_discount_value || 0;
          
          const basePrice = product.compare_price || product.price;
          let discountPrice = product.price;

          if (discountType === 'percentage') {
            discountPrice = Math.round(basePrice * (1 - discountVal / 100));
          } else if (discountType === 'fixed') {
            discountPrice = Math.max(0, basePrice - discountVal);
          }

          if (discountPrice < basePrice) {
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varBasePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                let varDiscountPrice = v.price;
                if (discountType === 'percentage') {
                  varDiscountPrice = Math.round(varBasePrice * (1 - discountVal / 100));
                } else if (discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varBasePrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  compare_price: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              compare_price: basePrice,
              variants: updatedVariants,
              flash_sale_enabled: true,
              flash_sale_end_date: product.flash_sale_end_date || undefined,
              flash_sale_start_date: product.flash_sale_start_date || undefined
            };
          }
        }
      }

      // 3. Homepage Category Discounts (lowest priority)
      if (isFsActive && fsSection) {
        const categoryDiscounts = fsSection.content_data?.categoryDiscounts || [];
        const fsCat = categoryDiscounts.find((c: any) => c?.categoryId === product.category_id);

        if (fsCat) {
          const basePrice = product.compare_price || product.price;
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
                const varBasePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                let varDiscountPrice = v.price;
                if (fsCat.discountType === 'percentage') {
                  varDiscountPrice = Math.round(varBasePrice * (1 - discountVal / 100));
                } else if (fsCat.discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varBasePrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  compare_price: varBasePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              compare_price: basePrice,
              variants: updatedVariants,
              flash_sale_enabled: true,
              flash_sale_end_date: fsSection.settings?.endTime || undefined,
              flash_sale_start_date: fsSection.settings?.startTime || undefined
            };
          }
        }
      }

      return product;
    });
  }, [productsList, sections, settings]);
}
