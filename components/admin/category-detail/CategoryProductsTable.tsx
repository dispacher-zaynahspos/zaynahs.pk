'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getSwatchStyle } from '@/lib/utils/swatch';
import { useLongPress } from '@/lib/hooks/useLongPress';
import { ReorderMoveModal } from '@/components/common/reorder';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit,
  GripVertical,
  Trash2,
  PackageOpen,
  MoreVertical,
} from '@/components/common/Icons';

interface CategoryProductsTableProps {
  products: Product[];
  paginatedProducts: Product[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  sortBy: string;
  expandedProducts: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  /** reorder a single product to a GLOBAL 1-based position (pagination aware) */
  moveToPosition: (id: string, position1Based: number) => void;
  moveProduct: (id: string, dir: 'up' | 'down') => void;
  reorderByDrag: (fromId: string, toId: string) => void;
  handleEditProduct: (id: string, filtered: Product[]) => void;
  handleRemoveProduct: (id: string) => void;
  handleUpdateProduct: (id: string, fields: Partial<Product>) => void;
  handleUpdateVariant: (prodId: string, varId: string, fields: Partial<ProductVariant>) => void;
  updatingIds: Record<string, boolean>;
  setPreviewImageUrl: (url: string | null) => void;
  /** index of the first visible row within the full list (for global rank) */
  rankOffset: number;
}

export function CategoryProductsTable({
  products,
  paginatedProducts,
  selectedProductIds,
  setSelectedProductIds,
  sortBy,
  expandedProducts,
  toggleExpand,
  moveToPosition,
  moveProduct,
  reorderByDrag,
  handleEditProduct,
  handleRemoveProduct,
  setPreviewImageUrl,
  rankOffset,
}: CategoryProductsTableProps) {
  const isManual = sortBy === 'manual';
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 520, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const pageIds = useMemo(() => paginatedProducts.map((p) => p.id), [paginatedProducts]);
  const globalIndexOf = (id: string) => products.findIndex((p) => p.id === id);
  const moveTargetGlobalIdx = moveTargetId ? globalIndexOf(moveTargetId) : -1;

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    reorderByDrag(active.id as string, over.id as string);
  };

  if (products.length === 0) {
    return (
      <div className="p-16 text-center">
        <PackageOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Products Found</h3>
        <p className="text-sm text-gray-400 mt-1">There are no products in this category matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isManual && (
        <div className="px-4 pt-3 -mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          Switch to Manual Order to reorder products.
        </div>
      )}
      <div className="hidden md:block overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-[#0f0f1b] border-b border-gray-200 dark:border-gray-800 font-bold uppercase text-[10px] tracking-wider text-gray-500">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds(paginatedProducts.map(p => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                    className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                  />
                </th>
                {isManual && (
                  <>
                    <th className="py-3.5 px-2 w-10 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">Rank</th>
                    <th className="py-3.5 px-2 w-24 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">Sort</th>
                  </>
                )}
                <th className="py-3.5 px-4 w-10"></th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Price</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Compare Price</th>
                <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Stock</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedProducts.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    globalRank={rankOffset + index + 1}
                    isManual={isManual}
                    isFirstGlobal={globalIndexOf(product.id) === 0}
                    isLastGlobal={globalIndexOf(product.id) === products.length - 1}
                    isExpanded={expandedProducts[product.id] ?? false}
                    selected={selectedProductIds.includes(product.id)}
                    onToggleSelect={(checked) =>
                      setSelectedProductIds(prev =>
                        checked ? [...prev, product.id] : prev.filter(id => id !== product.id)
                      )
                    }
                    toggleExpand={toggleExpand}
                    moveProduct={moveProduct}
                    onOpenMove={() => setMoveTargetId(product.id)}
                    handleEditProduct={() => handleEditProduct(product.id, products)}
                    handleRemoveProduct={() => handleRemoveProduct(product.id)}
                    setPreviewImageUrl={setPreviewImageUrl}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>

      {/* Mobile card view (shared reorder controls) */}
      <div className="md:hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 p-3">
              {paginatedProducts.map((product, index) => (
                <ProductCardMobile
                  key={product.id}
                  product={product}
                  globalRank={rankOffset + index + 1}
                  isManual={isManual}
                  isFirstGlobal={globalIndexOf(product.id) === 0}
                  isLastGlobal={globalIndexOf(product.id) === products.length - 1}
                  selected={selectedProductIds.includes(product.id)}
                  onToggleSelect={(checked) =>
                    setSelectedProductIds(prev =>
                      checked ? [...prev, product.id] : prev.filter(id => id !== product.id)
                    )
                  }
                  moveProduct={moveProduct}
                  onOpenMove={() => setMoveTargetId(product.id)}
                  handleEditProduct={() => handleEditProduct(product.id, products)}
                  handleRemoveProduct={() => handleRemoveProduct(product.id)}
                  setPreviewImageUrl={setPreviewImageUrl}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <ReorderMoveModal
        open={moveTargetGlobalIdx !== -1}
        title="Move product"
        currentPosition={moveTargetGlobalIdx + 1}
        totalCount={products.length}
        isFirst={moveTargetGlobalIdx === 0}
        isLast={moveTargetGlobalIdx === products.length - 1}
        onClose={() => setMoveTargetId(null)}
        onMoveTop={() => moveTargetId && moveToPosition(moveTargetId, 1)}
        onMoveUp={() => moveTargetId && moveProduct(moveTargetId, 'up')}
        onMoveDown={() => moveTargetId && moveProduct(moveTargetId, 'down')}
        onMoveBottom={() => moveTargetId && moveToPosition(moveTargetId, products.length)}
        onMoveToPosition={(pos: number) => moveTargetId && moveToPosition(moveTargetId, pos)}
      />
    </div>
  );
}

interface ProductRowProps {
  product: Product;
  globalRank: number;
  isManual: boolean;
  isFirstGlobal: boolean;
  isLastGlobal: boolean;
  isExpanded: boolean;
  selected: boolean;
  onToggleSelect: (checked: boolean) => void;
  toggleExpand: (id: string) => void;
  moveProduct: (id: string, dir: 'up' | 'down') => void;
  onOpenMove: () => void;
  handleEditProduct: () => void;
  handleRemoveProduct: () => void;
  setPreviewImageUrl: (url: string | null) => void;
}

function ProductRow({
  product,
  globalRank,
  isManual,
  isFirstGlobal,
  isLastGlobal,
  isExpanded,
  selected,
  onToggleSelect,
  toggleExpand,
  moveProduct,
  onOpenMove,
  handleEditProduct,
  handleRemoveProduct,
  setPreviewImageUrl,
}: ProductRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled: !isManual });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const longPress = useLongPress({
    onLongPress: onOpenMove,
    delay: 500,
    moveTolerance: 10,
    disabled: !isManual,
  });

  return (
    <React.Fragment>
      <tr
        ref={setNodeRef}
        style={style}
        {...(isManual ? longPress : {})}
        className={`transition-all duration-200 ease-in-out [-webkit-touch-callout:none] ${isDragging ? 'opacity-50 bg-orange-50/50 dark:bg-orange-950/20' : 'hover:bg-gray-50/50 dark:hover:bg-[#1d1d36]/30'}`}
      >
        <td className="py-4 px-4 text-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onToggleSelect(e.target.checked)}
            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </td>
        {isManual && (
          <td className="py-4 px-2 w-10 text-center">
            <span className="text-xs font-semibold text-slate-400">#{globalRank}</span>
          </td>
        )}
        {isManual && (
          <td className="py-4 px-2 w-24 align-middle">
            <div className="flex items-center justify-center gap-0.5">
              <button
                type="button"
                aria-label="Move up"
                onClick={() => moveProduct(product.id, 'up')}
                disabled={isFirstGlobal}
                className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                onClick={() => moveProduct(product.id, 'down')}
                disabled={isLastGlobal}
                className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <span
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
                style={{ touchAction: 'none' }}
                className="h-6 w-6 flex items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing select-none"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </span>
              <button
                type="button"
                aria-label="Move options"
                onClick={onOpenMove}
                className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        )}
        <td className="py-4 px-4 text-center">
          {product.has_variants ? (
            <button
              type="button"
              onClick={() => toggleExpand(product.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#252542] transition-all"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null}
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div
              className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 flex-shrink-0"
              onClick={() => product.images?.[0] && setPreviewImageUrl(product.images[0].url)}
            >
              {product.images?.[0] ? (
                <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold">NO IMG</div>
              )}
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer" onClick={handleEditProduct}>
                {product.name}
              </div>
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                <span>SKU: {product.sku || 'N/A'}</span>
                {product.has_variants && (
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {product.variants?.length || 0} variants
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          {formatPrice(product.price)}
        </td>
        <td className="py-4 px-4 font-mono text-gray-400 whitespace-nowrap">
          {product.compare_price ? formatPrice(product.compare_price) : '-'}
        </td>
        <td className="py-4 px-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 leading-none ${
            product.stock > 10 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
            product.stock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
            'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>
            {product.stock} in stock
          </span>
        </td>
        <td className="py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleEditProduct}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[#252542] rounded-lg transition-all"
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemoveProduct}
              className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-[#252542] rounded-lg transition-all"
              title="Remove from category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && product.has_variants && product.variants && product.variants.length > 0 && (
        <tr className="bg-gray-50/70 dark:bg-[#121225]/50">
          <td colSpan={isManual ? 9 : 7} className="p-4 pl-12">
            <div className="space-y-2 border-l-2 border-primary/30 pl-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Variants</div>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#18182f] border border-gray-200 dark:border-gray-800 text-xs">
                    <div className="flex items-center gap-3">
                      {v.color && (
                        <div
                          className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                          style={getSwatchStyle(v.color)}
                        />
                      )}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {[v.color, v.size, v.material, v.custom_value].filter(Boolean).join(' / ') || 'Default'}
                      </span>
                      {v.sku && <span className="font-mono text-gray-400 text-[11px]">{v.sku}</span>}
                    </div>
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">{formatPrice(v.price)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap flex-shrink-0 leading-none ${
                        v.stock > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                      }`}>
                        {v.stock} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

interface ProductCardMobileProps {
  product: Product;
  globalRank: number;
  isManual: boolean;
  isFirstGlobal: boolean;
  isLastGlobal: boolean;
  selected: boolean;
  onToggleSelect: (checked: boolean) => void;
  moveProduct: (id: string, dir: 'up' | 'down') => void;
  onOpenMove: () => void;
  handleEditProduct: () => void;
  handleRemoveProduct: () => void;
  setPreviewImageUrl: (url: string | null) => void;
}

function ProductCardMobile({
  product,
  globalRank,
  isManual,
  isFirstGlobal,
  isLastGlobal,
  selected,
  onToggleSelect,
  moveProduct,
  onOpenMove,
  handleEditProduct,
  handleRemoveProduct,
  setPreviewImageUrl,
}: ProductCardMobileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled: !isManual });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const longPress = useLongPress({
    onLongPress: onOpenMove,
    delay: 500,
    moveTolerance: 10,
    disabled: !isManual,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isManual ? longPress : {})}
      className="[-webkit-touch-callout:none] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-3"
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onToggleSelect(e.target.checked)}
          className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer shrink-0"
        />
        {isManual && (
          <span className="text-xs font-semibold text-slate-400 w-7 text-center shrink-0">#{globalRank}</span>
        )}
        <div
          className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0"
          onClick={() => product.images?.[0] && setPreviewImageUrl(product.images[0].url)}
        >
          {product.images?.[0] ? (
            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold">NO IMG</div>
          )}
        </div>
        <div className="flex-1 min-w-0" onClick={handleEditProduct}>
          <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{product.name}</div>
          <div className="text-[11px] text-gray-400 font-mono truncate">
            {formatPrice(product.price)} · {product.stock} in stock
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800">
        {isManual ? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Move up"
              onClick={() => moveProduct(product.id, 'up')}
              disabled={isFirstGlobal}
              className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-lg"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Move down"
              onClick={() => moveProduct(product.id, 'down')}
              disabled={isLastGlobal}
              className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer rounded-lg"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <span
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              style={{ touchAction: 'none' }}
              className="h-9 w-9 flex items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing select-none"
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <button
              type="button"
              aria-label="Move options"
              onClick={onOpenMove}
              className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer rounded-lg"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Manual Order to reorder</span>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleEditProduct}
            className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer rounded-lg"
            title="Edit product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRemoveProduct}
            className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer rounded-lg"
            title="Remove from category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
