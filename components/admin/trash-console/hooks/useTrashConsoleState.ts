'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Product, Category, Review, Order, WhatsAppSubscriber, EmailSubscriber, SizeGuide, VariantPreset } from '@/lib/types';
import { restoreProduct, hardDeleteProduct } from '@/lib/services/products';
import { restoreCategory, hardDeleteCategory } from '@/lib/services/categories';
import { restoreReview, hardDeleteReview } from '@/lib/services/reviews';
import { restoreOrder, hardDeleteOrder } from '@/lib/services/orders';
import { restoreCustomer, hardDeleteCustomer } from '@/lib/services/customers';
import { restoreMedia, hardDeleteMedia, TrashedMedia } from '@/lib/services/media';
import {
  restoreWhatsAppSubscriber,
  hardDeleteWhatsAppSubscriber,
  restoreEmailSubscriber,
  hardDeleteEmailSubscriber
} from '@/lib/services/sections';
import { restoreSizeGuide, hardDeleteSizeGuide } from '@/lib/services/sizeGuides';
import { restoreVariantPreset, hardDeleteVariantPreset } from '@/lib/services/variantPresets';
import {
  bulkRestoreProducts,
  bulkHardDeleteProducts,
  bulkRestoreCategories,
  bulkHardDeleteCategories,
  bulkRestoreReviews,
  bulkHardDeleteReviews,
  bulkRestoreOrders,
  bulkHardDeleteOrders,
  bulkRestoreCustomers,
  bulkHardDeleteCustomers,
  bulkRestoreMedia,
  bulkHardDeleteMedia,
  bulkRestoreLeads,
  bulkHardDeleteLeads,
  bulkRestoreSizeGuides, bulkHardDeleteSizeGuides,
  bulkRestoreVariantPresets, bulkHardDeleteVariantPresets
} from '@/lib/services/trash';

import { TabType } from '../TrashConsoleNavigation';
import { useTrashConsoleFilters } from './useTrashConsoleFilters';

interface UseTrashConsoleStateProps {
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

import { useTrashConsoleActions } from './useTrashConsoleActions';

export function useTrashConsoleState({
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
}: UseTrashConsoleStateProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [reviews, setReviews] = useState<(Review & { productName?: string })[]>(initialReviews);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [media, setMedia] = useState<TrashedMedia[]>(initialMedia);
  const [whatsappSubscribers, setWhatsappSubscribers] = useState<WhatsAppSubscriber[]>(initialWhatsAppSubscribers);
  const [emailSubscribers, setEmailSubscribers] = useState<EmailSubscriber[]>(initialEmailSubscribers);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>(initialSizeGuides);
  const [variantPresets, setVariantPresets] = useState<VariantPreset[]>(initialVariantPresets);

  const filters = useTrashConsoleFilters({
    products,
    categories,
    reviews,
    orders,
    customers,
    media,
    whatsappSubscribers,
    emailSubscribers,
    sizeGuides,
    variantPresets,
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: TabType;
    name: string;
    extraInfo?: any;
  } | null>(null);

  const [confirmBulkDelete, setConfirmBulkDelete] = useState<boolean>(false);
  const [confirmEmptyTab, setConfirmEmptyTab] = useState<boolean>(false);
  const [confirmEmptyCompleteTrash, setConfirmEmptyCompleteTrash] = useState<boolean>(false);

  const {
    isPending,
    handleRestore,
    handleHardDelete,
    handleBulkRestore,
    handleBulkHardDelete,
    handleEmptyTab,
    handleEmptyCompleteTrash,
  } = useTrashConsoleActions({
    products,
    setProducts,
    categories,
    setCategories,
    reviews,
    setReviews,
    orders,
    setOrders,
    customers,
    setCustomers,
    media,
    setMedia,
    whatsappSubscribers,
    setWhatsappSubscribers,
    emailSubscribers,
    setEmailSubscribers,
    sizeGuides,
    setSizeGuides,
    variantPresets,
    setVariantPresets,
    filters,
    confirmDelete,
    setConfirmDelete,
    setConfirmBulkDelete,
    setConfirmEmptyTab,
    setConfirmEmptyCompleteTrash,
  });

  return {
    products,
    categories,
    reviews,
    orders,
    customers,
    media,
    whatsappSubscribers,
    emailSubscribers,
    sizeGuides,
    variantPresets,
    activeTab: filters.activeTab,
    setActiveTab: filters.setActiveTab,
    searchTerm: filters.searchTerm,
    setSearchTerm: filters.setSearchTerm,
    selectedIds: filters.selectedIds,
    setSelectedIds: filters.setSelectedIds,
    isPending,
    confirmDelete,
    setConfirmDelete,
    confirmBulkDelete,
    setConfirmBulkDelete,
    confirmEmptyTab,
    setConfirmEmptyTab,
    confirmEmptyCompleteTrash,
    setConfirmEmptyCompleteTrash,
    handleTabChange: filters.handleTabChange,
    toggleSelect: filters.toggleSelect,
    filteredProducts: filters.filteredProducts,
    filteredCategories: filters.filteredCategories,
    filteredReviews: filters.filteredReviews,
    filteredOrders: filters.filteredOrders,
    filteredCustomers: filters.filteredCustomers,
    filteredMedia: filters.filteredMedia,
    combinedLeads: filters.combinedLeads,
    filteredLeads: filters.filteredLeads,
    filteredSizeGuides: filters.filteredSizeGuides,
    filteredVariantPresets: filters.filteredVariantPresets,
    counts: filters.counts,
    totalTrashCount: filters.totalTrashCount,
    getActiveTabItems: filters.getActiveTabItems,
    handleRestore,
    handleHardDelete,
    handleBulkRestore,
    handleBulkHardDelete,
    handleEmptyTab,
    handleEmptyCompleteTrash,
  };
}
