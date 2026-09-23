import { useState, useEffect } from 'react';
import { Product, ProductVariant, ProductModifier, VariantPreset } from '@/lib/types';
import { getVariantPresets } from '@/lib/services/variantPresets';
import { toast } from 'sonner';
import { extractColorsFromName } from '@/lib/utils/swatch';
import { VariantAxis, AxisValue } from '../variants-section';
import { useProductVariantBulkActions } from './useProductVariantBulkActions';

interface UseProductVariantsStateProps {
  initialProduct?: Product | null;
  price: string;
  comparePrice: string;
  sku: string;
  stock: string;
  inventoryThreshold: string;
}

export function useProductVariantsState({
  initialProduct,
  price,
  comparePrice,
  sku,
  stock,
  inventoryThreshold,
}: UseProductVariantsStateProps) {
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'productId'>[]>(
    initialProduct?.variants.map(v => ({
      color: v.color,
      size: v.size,
      material: v.material,
      customOption: v.customOption,
      customValue: v.customValue,
      colorHex: v.colorHex,
      price: v.price,
      comparePrice: v.comparePrice,
      stock: v.stock,
      sku: v.sku,
      imageUrl: v.imageUrl,
      showImageSwatch: v.showImageSwatch ?? false,
      active: v.active,
      sortOrder: v.sortOrder,
      inventoryThreshold: v.inventoryThreshold || 0
    })) || []
  );

  const [selectedVariantIndices, setSelectedVariantIndices] = useState<number[]>([]);
  const [variantSearchTerm, setVariantSearchTerm] = useState('');

  const bulkActions = useProductVariantBulkActions({
    setVariants,
    selectedVariantIndices,
    setSelectedVariantIndices,
  });

  const filteredVariants = variantSearchTerm
    ? variants.filter(v => {
      const term = variantSearchTerm.toLowerCase();
      const label = [v.color, v.size, v.material, v.customValue].filter(Boolean).join(' / ').toLowerCase();
      return label.includes(term)
        || (v.sku?.toLowerCase() || '').includes(term)
        || (v.price?.toString() || '').includes(term)
        || (v.comparePrice?.toString() || '').includes(term)
        || (v.colorHex?.toLowerCase() || '').includes(term)
        || (v.stock?.toString() || '').includes(term)
        || (v.inventoryThreshold?.toString() || '').includes(term);
    })
    : variants;

  const handlePriceChange = (val: string) => {
    const newPrice = parseFloat(val) || 0;
    setVariants(prev => prev.map(v => ({ ...v, price: newPrice })));
  };

  const handleComparePriceChange = (val: string) => {
    const newCompare = val.trim() ? parseFloat(val) : undefined;
    setVariants(prev => prev.map(v => ({ ...v, comparePrice: newCompare })));
  };

  const initAxes = (): VariantAxis[] => {
    if (!initialProduct?.variants?.length) {
      return [
        { name: 'Color', type: 'color', values: [] },
        { name: 'Size', type: 'size', values: [] }
      ];
    }
    const colorValues = Array.from(new Set(initialProduct.variants.filter(v => v.color).map(v => v.color!)));
    const sizeValues = Array.from(new Set(initialProduct.variants.filter(v => v.size).map(v => v.size!)));
    const materialValues = Array.from(new Set(initialProduct.variants.filter(v => v.material).map(v => v.material!)));
    const customOptionName = initialProduct.variants.find(v => v.customOption)?.customOption || 'Custom';
    const customValues = Array.from(new Set(initialProduct.variants.filter(v => v.customValue).map(v => v.customValue!)));

    const axes: VariantAxis[] = [];
    if (colorValues.length > 0) {
      axes.push({
        name: 'Color', type: 'color',
        values: colorValues.map(label => {
          const match = initialProduct.variants.find(v => v.color === label);
          return { label, hex: match?.colorHex, imageUrl: match?.imageUrl, showImageSwatch: match?.showImageSwatch };
        })
      });
    }
    if (sizeValues.length > 0) {
      axes.push({ name: 'Size', type: 'size', values: sizeValues.map(label => ({ label })) });
    }
    if (materialValues.length > 0) {
      axes.push({ name: 'Material', type: 'material', values: materialValues.map(label => ({ label })) });
    }
    if (customValues.length > 0) {
      axes.push({ name: customOptionName, type: 'custom', values: customValues.map(label => ({ label })) });
    }

    if (axes.length === 0) {
      axes.push({ name: 'Color', type: 'color', values: [] }, { name: 'Size', type: 'size', values: [] });
    }

    if (initialProduct.variationOrder && initialProduct.variationOrder.length > 0) {
      axes.sort((a, b) => {
        const aIdx = initialProduct.variationOrder!.indexOf(a.type);
        const bIdx = initialProduct.variationOrder!.indexOf(b.type);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }

    return axes;
  };

  const [variantAxes, setVariantAxes] = useState<VariantAxis[]>(initAxes);
  const [axisInputs, setAxisInputs] = useState<string[]>(() => initAxes().map(() => ''));
  const [presets, setPresets] = useState<VariantPreset[]>([]);
  const [collapsedAxes, setCollapsedAxes] = useState<boolean[]>(() => initAxes().map(() => false));
  const [variantsSectionCollapsed, setVariantsSectionCollapsed] = useState(true);
  const [axisOrderChanged, setAxisOrderChanged] = useState(false);

  useEffect(() => {
    setCollapsedAxes(prev => {
      const len = variantAxes.length;
      if (prev.length === len) return prev;
      return Array.from({ length: len }, (_, i) => prev[i] ?? false);
    });
  }, [variantAxes.length]);

  const handleMoveAxisUp = (idx: number) => {
    if (idx === 0) return;
    setVariantAxes(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
    setAxisInputs(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
  };

  const handleMoveAxisDown = (idx: number) => {
    if (idx === variantAxes.length - 1) return;
    setVariantAxes(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
    setAxisInputs(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
  };

  const handleReorderAxisValues = (axisIdx: number, reorderedValues: AxisValue[]) => {
    setVariantAxes(prev =>
      prev.map((a, i) => (i === axisIdx ? { ...a, values: reorderedValues } : a))
    );
    setAxisOrderChanged(true);
  };

  useEffect(() => {
    getVariantPresets().then(setPresets).catch(() => { });
  }, []);

  // Modifiers List
  const [modifiers, setModifiers] = useState<Omit<ProductModifier, 'id' | 'productId'>[]>(
    initialProduct?.modifiers.map(m => ({
      name: m.name,
      price: m.price,
      active: m.active,
      sortOrder: m.sortOrder
    })) || []
  );
  const [modName, setModName] = useState('');
  const [modPrice, setModPrice] = useState('');

  const handleAddModifier = () => {
    if (!modName.trim()) return;
    setModifiers(prev => [
      ...prev,
      {
        name: modName.trim(),
        price: parseFloat(modPrice) || 0,
        active: true,
        sortOrder: prev.length + 1
      }
    ]);
    setModName('');
    setModPrice('');
  };

  const handleRemoveModifier = (index: number) => {
    setModifiers(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateVariants = () => {
    const validAxes = variantAxes.filter(a => a.values.length > 0);
    if (validAxes.length === 0) {
      toast.error('Add at least one attribute value to generate combinations');
      return;
    }

    const newVariants = buildVariantCombinations(
      variantAxes,
      parseFloat(price) || 0,
      comparePrice.trim() ? parseFloat(comparePrice) : undefined,
      parseInt(stock) || 0,
      sku.trim(),
      parseInt(inventoryThreshold) || 0,
      variants
    );

    setVariants(newVariants);
    setAxisOrderChanged(false);
    toast.success(`Generated ${newVariants.length} variant combinations!`);
  };

  const handleUpdateVariant = (index: number, updates: Partial<Omit<ProductVariant, 'id' | 'productId'>>) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, ...updates } : v));
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    setSelectedVariantIndices(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  return {
    variants,
    setVariants,
    selectedVariantIndices,
    setSelectedVariantIndices,
    variantSearchTerm,
    setVariantSearchTerm,
    filteredVariants,
    handlePriceChange,
    handleComparePriceChange,
    variantAxes,
    setVariantAxes,
    axisInputs,
    setAxisInputs,
    presets,
    collapsedAxes,
    setCollapsedAxes,
    variantsSectionCollapsed,
    setVariantsSectionCollapsed,
    axisOrderChanged,
    setAxisOrderChanged,
    handleMoveAxisUp,
    handleMoveAxisDown,
    handleReorderAxisValues,
    modifiers,
    modName,
    setModName,
    modPrice,
    setModPrice,
    handleAddModifier,
    handleRemoveModifier,
    handleGenerateVariants,
    handleUpdateVariant,
    handleRemoveVariant,
    ...bulkActions,
  };
}

export function buildVariantCombinations(
  variantAxes: VariantAxis[],
  basePrice: number,
  baseComparePrice?: number,
  baseStock: number = 0,
  baseSku: string = '',
  baseThreshold: number = 0,
  existingVariants: Omit<ProductVariant, 'id' | 'productId'>[] = []
): Omit<ProductVariant, 'id' | 'productId'>[] {
  const validAxes = variantAxes.filter(a => a.values && a.values.length > 0);
  if (validAxes.length === 0) return [];

  const combinations: Record<string, AxisValue>[] = [{}];
  for (const axis of validAxes) {
    const temp: Record<string, AxisValue>[] = [];
    for (const comb of combinations) {
      for (const val of axis.values) {
        temp.push({ ...comb, [axis.type]: val });
      }
    }
    combinations.length = 0;
    combinations.push(...temp);
  }

  return combinations.map((comb, idx) => {
    const colorVal = comb['color'];
    const sizeVal = comb['size'];
    const matVal = comb['material'];
    const custVal = comb['custom'];

    const parts = [colorVal?.label, sizeVal?.label, matVal?.label, custVal?.label].filter(Boolean);
    const varSku = baseSku ? `${baseSku}-${parts.join('-').toUpperCase().replace(/\s+/g, '')}` : undefined;

    const existing = existingVariants.find(v =>
      (colorVal ? v.color === colorVal.label : !v.color) &&
      (sizeVal ? v.size === sizeVal.label : !v.size) &&
      (matVal ? v.material === matVal.label : !v.material) &&
      (custVal ? v.customValue === custVal.label : !v.customValue)
    );

    if (existing) {
      return {
        ...existing,
        colorHex: colorVal?.hex || existing.colorHex,
        imageUrl: colorVal?.imageUrl || existing.imageUrl,
        showImageSwatch: colorVal?.showImageSwatch ?? existing.showImageSwatch ?? false,
        sortOrder: idx + 1
      };
    }

    return {
      color: colorVal?.label,
      size: sizeVal?.label,
      material: matVal?.label,
      customOption: custVal ? (validAxes.find(a => a.type === 'custom')?.name || 'Custom') : undefined,
      customValue: custVal?.label,
      colorHex: colorVal?.hex || (colorVal ? extractColorsFromName(colorVal.label) || '#888888' : undefined),
      imageUrl: colorVal?.imageUrl,
      showImageSwatch: colorVal?.showImageSwatch ?? false,
      price: basePrice,
      comparePrice: baseComparePrice,
      stock: baseStock,
      sku: varSku,
      active: true,
      sortOrder: idx + 1,
      inventoryThreshold: baseThreshold
    };
  });
}

