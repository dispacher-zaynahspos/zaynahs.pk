import { Product } from '@/lib/types';
import { getSettings } from '../../settings';
import { isFeatureEnabled } from '@/lib/features/premium';

export const applyFlashSaleDiscounts = async (products: Product[]): Promise<Product[]> => {
  try {
    const settings = await getSettings();
    if (settings && !isFeatureEnabled(settings, 'flash_sale')) {
      return products;
    }
    const { getHomepageSections } = await import('../../sections');
    const allSections = await getHomepageSections(true);
    const sections = allSections.filter(sec => sec.section_type === 'flash_sale');

    const now = Date.now();

    let isGlobalFlashSaleActive = false;
    if (settings && settings.flash_sale_enabled) {
      const gStart = settings.flash_sale_start_date ? new Date(settings.flash_sale_start_date).getTime() : 0;
      const gEnd = settings.flash_sale_end_date ? new Date(settings.flash_sale_end_date).getTime() : 0;

      const isStarted = !settings.flash_sale_start_date || gStart <= now;
      const isEnded = gEnd && gEnd < now;
      if (isStarted && !isEnded) {
        isGlobalFlashSaleActive = true;
      }
    }

    const activeFlashSales = (sections || []).filter(sec => {
      const startStr = sec.settings?.startTime;
      const endStr = sec.settings?.endTime;

      if (!startStr && !endStr) {
        return true;
      }

      const start = startStr ? new Date(startStr).getTime() : 0;
      const end = endStr ? new Date(endStr).getTime() : 0;

      const isStarted = !startStr || start <= now;
      const isEnded = endStr && end < now;
      return isStarted && !isEnded;
    });

    return products.map(product => {
      if (isGlobalFlashSaleActive && settings) {
        const discountType = settings.global_flash_sale_discount_type || 'percentage';
        const discountVal = settings.global_flash_sale_discount_value || 0;

        if (discountVal > 0) {
          const currentPrice = product.price;
          const baseComparePrice = product.compare_price || product.price;
          let discountPrice = currentPrice;

          if (discountType === 'percentage') {
            discountPrice = Math.round(currentPrice * (1 - discountVal / 100));
          } else if (discountType === 'fixed') {
            discountPrice = Math.max(0, currentPrice - discountVal);
          }

          if (discountPrice < currentPrice) {
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varCurrentPrice = v.price;
                const varComparePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                let varDiscountPrice = varCurrentPrice;
                if (discountType === 'percentage') {
                  varDiscountPrice = Math.round(varCurrentPrice * (1 - discountVal / 100));
                } else if (discountType === 'fixed') {
                  varDiscountPrice = Math.max(0, varCurrentPrice - discountVal);
                }
                return {
                  ...v,
                  price: varDiscountPrice,
                  compare_price: varComparePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              compare_price: baseComparePrice,
              variants: updatedVariants,
              flash_sale_enabled: true,
              flash_sale_end_date: settings.flash_sale_end_date || undefined,
              flash_sale_start_date: settings.flash_sale_start_date || undefined
            };
          }
        }
      }

      for (const fs of activeFlashSales) {
        const fsProducts = fs.content_data?.products || [];
        const fsProd = fsProducts.find((p: any) => p?.productId === product.id);

        if (fsProd) {
          const currentPrice = product.price;
          const baseComparePrice = product.compare_price || product.price;
          const discountPrice = fsProd.discountValue ? parseFloat(fsProd.discountValue.toString()) : product.price;

          if (discountPrice < currentPrice) {
            const ratio = discountPrice / currentPrice;
            const updatedVariants = product.variants.map(v => {
              if (v.price) {
                const varCurrentPrice = v.price;
                const varComparePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                const newVarPrice = Math.round(varCurrentPrice * ratio);
                return {
                  ...v,
                  price: newVarPrice,
                  compare_price: varComparePrice
                };
              }
              return v;
            });

            return {
              ...product,
              price: discountPrice,
              compare_price: baseComparePrice,
              variants: updatedVariants,
              flash_sale_enabled: true,
              flash_sale_end_date: fs.settings?.endTime || undefined,
              flash_sale_start_date: fs.settings?.startTime || undefined
            };
          }
        }
      }

      if (product.flash_sale_enabled) {
        const pStartStr = product.flash_sale_start_date;
        const pEndStr = product.flash_sale_end_date;

        const isStarted = !pStartStr || new Date(pStartStr).getTime() <= now;
        const isEnded = pEndStr && new Date(pEndStr).getTime() < now;

        if (isStarted && !isEnded) {
          const discountType = product.flash_sale_discount_type || 'fixed';
          const discountVal = product.flash_sale_discount_value || 0;

          if (discountVal > 0) {
            const currentPrice = product.price;
            const baseComparePrice = product.compare_price || product.price;
            let discountPrice = currentPrice;

            if (discountType === 'percentage') {
              discountPrice = Math.round(currentPrice * (1 - discountVal / 100));
            } else if (discountType === 'fixed') {
              discountPrice = Math.max(0, currentPrice - discountVal);
            }

            if (discountPrice < currentPrice) {
              const updatedVariants = product.variants.map(v => {
                if (v.price) {
                  const varCurrentPrice = v.price;
                  const varComparePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                  let varDiscountPrice = varCurrentPrice;
                  if (discountType === 'percentage') {
                    varDiscountPrice = Math.round(varCurrentPrice * (1 - discountVal / 100));
                  } else if (discountType === 'fixed') {
                    varDiscountPrice = Math.max(0, varCurrentPrice - discountVal);
                  }
                  return {
                    ...v,
                    price: varDiscountPrice,
                    compare_price: varComparePrice
                  };
                }
                return v;
              });

              return {
                ...product,
                price: discountPrice,
                compare_price: baseComparePrice,
                variants: updatedVariants,
                flash_sale_enabled: true,
                flash_sale_end_date: product.flash_sale_end_date || undefined,
                flash_sale_start_date: product.flash_sale_start_date || undefined
              };
            }
          }
        }
      }

      for (const fs of activeFlashSales) {
        const categoryDiscounts = fs.content_data?.categoryDiscounts || [];
        const fsCat = categoryDiscounts.find((c: any) => c?.categoryId === product.category_id);

        if (fsCat) {
          const discountVal = parseFloat(fsCat.discountValue) || 0;
          if (discountVal > 0) {
            const currentPrice = product.price;
            const baseComparePrice = product.compare_price || product.price;
            let discountPrice = currentPrice;

            if (fsCat.discountType === 'percentage') {
              discountPrice = Math.round(currentPrice * (1 - discountVal / 100));
            } else if (fsCat.discountType === 'fixed') {
              discountPrice = Math.max(0, currentPrice - discountVal);
            }

            if (discountPrice < currentPrice) {
              const updatedVariants = product.variants.map(v => {
                if (v.price) {
                  const varCurrentPrice = v.price;
                  const varComparePrice = v.compare_price || (product.compare_price ? Math.round(product.compare_price * (v.price / product.price)) : v.price);
                  let varDiscountPrice = varCurrentPrice;
                  if (fsCat.discountType === 'percentage') {
                    varDiscountPrice = Math.round(varCurrentPrice * (1 - discountVal / 100));
                  } else if (fsCat.discountType === 'fixed') {
                    varDiscountPrice = Math.max(0, varCurrentPrice - discountVal);
                  }
                  return {
                    ...v,
                    price: varDiscountPrice,
                    compare_price: varComparePrice
                  };
                }
                return v;
              });

              return {
                ...product,
                price: discountPrice,
                compare_price: baseComparePrice,
                variants: updatedVariants,
                flash_sale_enabled: true,
                flash_sale_end_date: fs.settings?.endTime || undefined,
                flash_sale_start_date: fs.settings?.startTime || undefined
              };
            }
          }
        }
      }

      return product;
    });
  } catch (err) {
    console.error('Error applying flash sale discounts:', err);
    return products;
  }
};
