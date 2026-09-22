'use client';

import React from 'react';
import { Product, Category } from '@/lib/types';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import MediaSelectorModal from './MediaSelectorModal';

import { ProductFormHeader } from './product-form/ProductFormHeader';
import { ProductFormBasicInfo } from './product-form/ProductFormBasicInfo';
import { ProductFormPricing } from './product-form/ProductFormPricing';
import { ProductFormMediaSection } from './product-form/ProductFormMediaSection';
import { ProductFormVariantsSection } from './product-form/ProductFormVariantsSection';
import { ProductFormFlashSaleSection } from './product-form/ProductFormFlashSaleSection';
import { ProductFormBoughtTogetherSection } from './product-form/ProductFormBoughtTogetherSection';
import { ProductFormBadgeSection } from './product-form/ProductFormBadgeSection';
import { useProductFormState } from './product-form/hooks/useProductFormState';
import { Plus, Trash2, Loader2 } from '@/components/common/Icons';

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
  aiEnabled?: boolean;
  storeUrl?: string;
}

export default function ProductForm({ categories, initialProduct, aiEnabled }: ProductFormProps) {
  const p = useProductFormState({ categories, initialProduct, aiEnabled });

  return (
    <>
      <form onSubmit={p.handleSubmit} className="space-y-4 w-full max-w-full pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

          {/* Left: Core Fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3 text-gray-900 dark:text-white transition-colors">
              <ProductFormHeader
                name={p.name}
                aiConfigured={p.aiConfigured}
                isAiGenerating={p.isAiGenerating}
                onAICopywrite={p.handleAICopywrite}
                onShowAiNotice={p.handleShowAiNotice}
              />

              <ProductFormBasicInfo
                name={p.name}
                setName={p.setName}
                slug={p.slug}
                setSlug={p.setSlug}
                sku={p.sku}
                setSku={p.setSku}
                categorySearchQuery={p.categorySearchQuery}
                setCategorySearchQuery={p.setCategorySearchQuery}
                flattenedCategories={p.flattenedCategories}
                selectedCategoryIds={p.selectedCategoryIds}
                setSelectedCategoryIds={p.setSelectedCategoryIds}
                visibleCategoryCount={p.visibleCategoryCount}
                setVisibleCategoryCount={p.setVisibleCategoryCount}
                sizeGuideId={p.sizeGuideId}
                setSizeGuideId={p.setSizeGuideId}
                sizeGuidesList={p.sizeGuidesList}
                tagInput={p.tagInput}
                setTagInput={p.setTagInput}
                shortDescription={p.shortDescription}
                setShortDescription={p.setShortDescription}
                description={p.description}
                setDescription={p.setDescription}
                isHtmlMode={p.isHtmlMode}
                setIsHtmlMode={p.setIsHtmlMode}
                editorRef={p.editorRef}
                execCommand={p.execCommand}
                aiConfigured={p.aiConfigured}
                isAiGenerating={p.isAiGenerating}
                onAICopywrite={p.handleAICopywrite}
                onShowAiNotice={p.handleShowAiNotice}
              />
            </div>

            <ProductFormPricing
              price={p.price}
              onPriceChange={p.handlePriceChange}
              comparePrice={p.comparePrice}
              onComparePriceChange={p.handleComparePriceChange}
              cost={p.cost}
              setCost={p.setCost}
              rating={p.rating}
              setRating={p.setRating}
              reviewsCount={p.reviewsCount}
              setReviewsCount={p.setReviewsCount}
              isService={p.isService}
              hasVariants={p.hasVariants}
              stock={p.stock}
              setStock={p.setStock}
              inventoryThreshold={p.inventoryThreshold}
              setInventoryThreshold={p.setInventoryThreshold}
              variants={p.variants}
            />

            <ProductFormVariantsSection
              hasVariants={p.hasVariants}
              setHasVariants={p.setHasVariants}
              variantsSectionCollapsed={p.variantsSectionCollapsed}
              setVariantsSectionCollapsed={p.setVariantsSectionCollapsed}
              enableSwatches={p.enableSwatches}
              setEnableSwatches={p.setEnableSwatches}
              showSwatchesOnArchive={p.showSwatchesOnArchive}
              setShowSwatchesOnArchive={p.setShowSwatchesOnArchive}
              variantAxes={p.variantAxes}
              setVariantAxes={p.setVariantAxes}
              collapsedAxes={p.collapsedAxes}
              setCollapsedAxes={p.setCollapsedAxes}
              axisInputs={p.axisInputs}
              setAxisInputs={p.setAxisInputs}
              presets={p.presets}
              axisOrderChanged={p.axisOrderChanged}
              setAxisOrderChanged={p.setAxisOrderChanged}
              variants={p.variants}
              setVariants={p.setVariants}
              selectedVariantIndices={p.selectedVariantIndices}
              setSelectedVariantIndices={p.setSelectedVariantIndices}
              variantSearchTerm={p.variantSearchTerm}
              setVariantSearchTerm={p.setVariantSearchTerm}
              filteredVariants={p.filteredVariants}
              price={p.price}
              comparePrice={p.comparePrice}
              images={p.images}
              activeImageSelector={p.activeImageSelector}
              setActiveImageSelector={p.setActiveImageSelector}
              handleMoveAxisUp={p.handleMoveAxisUp}
              handleMoveAxisDown={p.handleMoveAxisDown}
              handleReorderAxisValues={p.handleReorderAxisValues}
              handleGenerateVariants={p.handleGenerateVariants}
              handleUpdateVariant={p.handleUpdateVariant}
              handleRemoveVariant={p.handleRemoveVariant}
              handleBulkDelete={p.handleBulkDelete}
              handleBulkUpdatePrice={p.handleBulkUpdatePrice}
              handleBulkUpdateComparePrice={p.handleBulkUpdateComparePrice}
              handleBulkUpdateStock={p.handleBulkUpdateStock}
              handleBulkUpdateSku={p.handleBulkUpdateSku}
              handleBulkUpdateThreshold={p.handleBulkUpdateThreshold}
              handleBulkUpdateActive={p.handleBulkUpdateActive}
              confirm={p.confirm}
            />

            {/* Custom Modifiers (Add-ons) */}
            <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3 text-gray-900 dark:text-white transition-colors">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Custom Modifiers (Add-ons)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Gift Wrap, Custom printing etc"
                  value={p.modName}
                  onChange={(e) => p.setModName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white dark:border-gray-800 dark:bg-[#111124]"
                />
                <input
                  type="number"
                  placeholder="+ Rs."
                  value={p.modPrice}
                  onChange={(e) => p.setModPrice(e.target.value)}
                  className="w-24 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white dark:border-gray-800 dark:bg-[#111124]"
                />
                <button
                  type="button"
                  onClick={p.handleAddModifier}
                  className="bg-[#1a1a2e] dark:bg-[#e94560] text-white py-1.5 px-2.5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#e94560] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {p.modifiers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {p.modifiers.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/30 dark:bg-[#0f0f1b]/40">
                      <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {mod.name} <span className="text-[10px] font-bold text-gray-400 ml-1">(+ Rs. {mod.price})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => p.handleRemoveModifier(i)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Status & Images */}
          <div className="space-y-4">
            <ProductFormMediaSection
              images={p.images}
              setIsMediaModalOpen={p.setIsMediaModalOpen}
              sensors={p.sensors}
              handleDragStartImages={p.handleDragStartImages}
              handleDragCancelImages={p.handleDragCancelImages}
              handleDragEndImages={p.handleDragEndImages}
              handleRemoveImage={p.handleRemoveImage}
              setPreviewImageUrl={p.setPreviewImageUrl}
            />

            {/* Status Settings */}
            <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3.5 text-gray-900 dark:text-white transition-colors">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Status & Options</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Product Visibility</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs font-bold select-none ${
                      p.isActive === true
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs' 
                        : 'bg-gray-50 dark:bg-[#0f0f1b] border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="isActive"
                        checked={p.isActive === true}
                        onChange={() => p.setIsActive(true)}
                        className="sr-only"
                      />
                      <span className={`h-2 w-2 rounded-full ${p.isActive === true ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`} />
                      <span>Active</span>
                    </label>

                    <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs font-bold select-none ${
                      p.isActive === false
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 dark:text-red-400 shadow-2xs' 
                        : 'bg-gray-50 dark:bg-[#0f0f1b] border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="isActive"
                        checked={p.isActive === false}
                        onChange={() => p.setIsActive(false)}
                        className="sr-only"
                      />
                      <span className={`h-2 w-2 rounded-full ${p.isActive === false ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0f0f1b]/60 hover:bg-gray-100/60 dark:hover:bg-[#0f0f1b] cursor-pointer transition-all">
                  <span className="text-xs font-bold text-gray-750 dark:text-gray-200">Featured Product</span>
                  <input
                    type="checkbox"
                    checked={p.isFeatured}
                    onChange={(e) => p.setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0f0f1b]/60 hover:bg-gray-100/60 dark:hover:bg-[#0f0f1b] cursor-pointer transition-all">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-750 dark:text-gray-200">Service</span>
                    <span className="text-[10px] text-gray-400 font-medium">(No stock tracking)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={p.isService}
                    onChange={(e) => p.setIsService(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <ProductFormFlashSaleSection
              flashSaleEnabled={p.flashSaleEnabled}
              setFlashSaleEnabled={p.setFlashSaleEnabled}
              flashSaleStartDate={p.flashSaleStartDate}
              setFlashSaleStartDate={p.setFlashSaleStartDate}
              flashSaleEndDate={p.flashSaleEndDate}
              setFlashSaleEndDate={p.setFlashSaleEndDate}
              flashSaleDiscountType={p.flashSaleDiscountType}
              setFlashSaleDiscountType={p.setFlashSaleDiscountType}
              flashSaleDiscountValue={p.flashSaleDiscountValue}
              setFlashSaleDiscountValue={p.setFlashSaleDiscountValue}
            />

            <ProductFormBoughtTogetherSection
              frequentlyBoughtTogetherIds={p.frequentlyBoughtTogetherIds}
              setFrequentlyBoughtTogetherIds={p.setFrequentlyBoughtTogetherIds}
              productList={p.productList}
              productSearchQuery={p.productSearchQuery}
              setProductSearchQuery={p.setProductSearchQuery}
              visibleProductCount={p.visibleProductCount}
              setVisibleProductCount={p.setVisibleProductCount}
            />

            <ProductFormBadgeSection
              badgeEnabled={p.badgeEnabled}
              setBadgeEnabled={p.setBadgeEnabled}
              customBadgeId={p.customBadgeId}
              setCustomBadgeId={p.setCustomBadgeId}
              allBadges={p.allBadges}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => p.router.push('/admin/products')}
                className="flex-1 text-center border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#16162a] rounded-xl py-2.5 px-4 text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={p.isSubmitting}
                className={`relative overflow-hidden flex-1 flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#d8344e] text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md ${p.isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {p.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{p.isEdit ? 'Update Product' : 'Create Product'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={p.isMediaModalOpen}
        onClose={() => p.setIsMediaModalOpen(false)}
        multiple={true}
        onSelect={(selectedUrls: string[]) => {
          const newImages = selectedUrls.map((url: string, idx: number) => {
            const existing = p.images.find(img => img.url === url);
            if (existing) return existing;
            return {
              url,
              alt: '',
              sortOrder: p.images.length + idx + 1,
              isPrimary: p.images.length === 0 && idx === 0
            };
          });
          p.setImages(newImages);
          p.setIsMediaModalOpen(false);
        }}
      />

      {/* Image Preview Modal */}
      {p.previewImageUrl && (
        <ImagePreviewModal
          url={p.previewImageUrl}
          onClose={() => p.setPreviewImageUrl(null)}
        />
      )}
    </>
  );
}
