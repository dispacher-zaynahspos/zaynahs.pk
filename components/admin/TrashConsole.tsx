'use client';

import React from 'react';
import { Product, Category, Review, Order, WhatsAppSubscriber, EmailSubscriber, SizeGuide, VariantPreset } from '@/lib/types';
import { TrashedMedia } from '@/lib/services/media';

import { TrashConsoleNavigation } from './trash-console/TrashConsoleNavigation';
import { TrashConfirmModals } from './trash-console/TrashConfirmModals';
import { TrashProductsTable } from './trash-console/TrashProductsTable';
import { TrashCategoriesTable } from './trash-console/TrashCategoriesTable';
import { TrashReviewsTable } from './trash-console/TrashReviewsTable';
import { TrashOrdersTable } from './trash-console/TrashOrdersTable';
import { TrashCustomersTable } from './trash-console/TrashCustomersTable';
import { TrashMediaTable } from './trash-console/TrashMediaTable';
import { TrashLeadsTable } from './trash-console/TrashLeadsTable';
import { TrashSizeGuidesTable } from './trash-console/TrashSizeGuidesTable';
import { TrashPresetsTable } from './trash-console/TrashPresetsTable';
import { useTrashConsoleState } from './trash-console/hooks/useTrashConsoleState';

interface TrashConsoleProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialReviews: (Review & { productName?: string })[];
  initialOrders: Order[];
  initialCustomers: any[];
  initialMedia: TrashedMedia[];
  initialWhatsAppSubscribers: WhatsAppSubscriber[];
  initialEmailSubscribers: EmailSubscriber[];
  initialSizeGuides: SizeGuide[];
  initialVariantPresets: VariantPreset[];
}

export default function TrashConsole({
  initialProducts,
  initialCategories,
  initialReviews,
  initialOrders,
  initialCustomers,
  initialMedia,
  initialWhatsAppSubscribers,
  initialEmailSubscribers,
  initialSizeGuides,
  initialVariantPresets
}: TrashConsoleProps) {
  const t = useTrashConsoleState({
    initialProducts,
    initialCategories,
    initialReviews,
    initialOrders,
    initialCustomers,
    initialMedia,
    initialWhatsAppSubscribers,
    initialEmailSubscribers,
    initialSizeGuides,
    initialVariantPresets
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 font-sans">
      <TrashConsoleNavigation
        activeTab={t.activeTab}
        handleTabChange={t.handleTabChange}
        counts={t.counts}
        totalTrashCount={t.totalTrashCount}
        searchTerm={t.searchTerm}
        setSearchTerm={t.setSearchTerm}
        selectedIds={t.selectedIds}
        activeTabCount={t.getActiveTabItems().length}
        handleBulkRestore={t.handleBulkRestore}
        setConfirmBulkDelete={t.setConfirmBulkDelete}
        setConfirmEmptyTab={t.setConfirmEmptyTab}
        setConfirmEmptyCompleteTrash={t.setConfirmEmptyCompleteTrash}
        isPending={t.isPending}
      />

      {t.activeTab === 'products' && (
        <TrashProductsTable
          products={t.filteredProducts}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'categories' && (
        <TrashCategoriesTable
          categories={t.filteredCategories}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'reviews' && (
        <TrashReviewsTable
          reviews={t.filteredReviews}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'orders' && (
        <TrashOrdersTable
          orders={t.filteredOrders}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'customers' && (
        <TrashCustomersTable
          customers={t.filteredCustomers}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'media' && (
        <TrashMediaTable
          media={t.filteredMedia}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'leads' && (
        <TrashLeadsTable
          leads={t.filteredLeads}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'size_guides' && (
        <TrashSizeGuidesTable
          sizeGuides={t.filteredSizeGuides}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      {t.activeTab === 'variant_presets' && (
        <TrashPresetsTable
          variantPresets={t.filteredVariantPresets}
          searchTerm={t.searchTerm}
          selectedIds={t.selectedIds}
          toggleSelect={t.toggleSelect}
          handleRestore={t.handleRestore}
          setConfirmDelete={t.setConfirmDelete}
          isPending={t.isPending}
        />
      )}

      <TrashConfirmModals
        confirmDelete={t.confirmDelete}
        setConfirmDelete={t.setConfirmDelete}
        confirmBulkDelete={t.confirmBulkDelete}
        setConfirmBulkDelete={t.setConfirmBulkDelete}
        confirmEmptyTab={t.confirmEmptyTab}
        setConfirmEmptyTab={t.setConfirmEmptyTab}
        confirmEmptyCompleteTrash={t.confirmEmptyCompleteTrash}
        setConfirmEmptyCompleteTrash={t.setConfirmEmptyCompleteTrash}
        activeTab={t.activeTab}
        selectedCount={t.selectedIds.length}
        totalTrashCount={t.totalTrashCount}
        handleHardDelete={t.handleHardDelete}
        handleBulkHardDelete={t.handleBulkHardDelete}
        handleEmptyTab={t.handleEmptyTab}
        handleEmptyCompleteTrash={t.handleEmptyCompleteTrash}
        isPending={t.isPending}
      />
    </div>
  );
}
