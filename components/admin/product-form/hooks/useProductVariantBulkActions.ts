import { ProductVariant } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';

interface UseProductVariantBulkActionsProps {
  setVariants: React.Dispatch<React.SetStateAction<Omit<ProductVariant, 'id' | 'productId'>[]>>;
  selectedVariantIndices: number[];
  setSelectedVariantIndices: React.Dispatch<React.SetStateAction<number[]>>;
}

export function useProductVariantBulkActions({
  setVariants,
  selectedVariantIndices,
  setSelectedVariantIndices,
}: UseProductVariantBulkActionsProps) {
  const { confirm } = useConfirm();

  const handleBulkDelete = async () => {
    if (selectedVariantIndices.length === 0) return;
    const confirmed = await confirm({
      title: 'Delete Selected Variants',
      message: `Delete ${selectedVariantIndices.length} selected variant(s)?`,
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;

    setVariants(prev => prev.filter((_, idx) => !selectedVariantIndices.includes(idx)));
    setSelectedVariantIndices([]);
    toast.success('Deleted selected variants');
  };

  const handleBulkUpdatePrice = (val: number) => {
    if (selectedVariantIndices.length === 0) return;
    setVariants(prev => prev.map((v, idx) => selectedVariantIndices.includes(idx) ? { ...v, price: val } : v));
    toast.success(`Updated price for ${selectedVariantIndices.length} variant(s)`);
  };

  const handleBulkUpdateComparePrice = (val: number) => {
    if (selectedVariantIndices.length === 0) return;
    setVariants(prev => prev.map((v, idx) => selectedVariantIndices.includes(idx) ? { ...v, comparePrice: val } : v));
    toast.success(`Updated compare price for ${selectedVariantIndices.length} variant(s)`);
  };

  const handleBulkUpdateStock = (val: number) => {
    if (selectedVariantIndices.length === 0) return;
    setVariants(prev => prev.map((v, idx) => selectedVariantIndices.includes(idx) ? { ...v, stock: val } : v));
    toast.success(`Updated stock for ${selectedVariantIndices.length} variant(s)`);
  };

  const handleBulkUpdateSku = (prefix: string) => {
    if (selectedVariantIndices.length === 0) return;
    setVariants(prev => prev.map((v, idx) => {
      if (!selectedVariantIndices.includes(idx)) return v;
      const parts = [v.color, v.size, v.material, v.customValue].filter(Boolean);
      const suffix = parts.join('-').toUpperCase().replace(/\s+/g, '');
      const newSku = prefix ? `${prefix}-${suffix}` : suffix;
      return { ...v, sku: newSku };
    }));
    toast.success(`Updated SKU for ${selectedVariantIndices.length} variant(s)`);
  };

  const handleBulkUpdateThreshold = (val: number) => {
    if (selectedVariantIndices.length === 0) return;
    setVariants(prev => prev.map((v, idx) => selectedVariantIndices.includes(idx) ? { ...v, inventoryThreshold: val } : v));
    toast.success(`Updated threshold for ${selectedVariantIndices.length} variant(s)`);
  };

  const handleBulkUpdateActive = (activeState: boolean) => {
    if (selectedVariantIndices.length === 0) return;
    setVariants(prev => prev.map((v, idx) => selectedVariantIndices.includes(idx) ? { ...v, active: activeState } : v));
    toast.success(`Updated status for ${selectedVariantIndices.length} variant(s)`);
  };

  return {
    handleBulkDelete,
    handleBulkUpdatePrice,
    handleBulkUpdateComparePrice,
    handleBulkUpdateStock,
    handleBulkUpdateSku,
    handleBulkUpdateThreshold,
    handleBulkUpdateActive,
  };
}
