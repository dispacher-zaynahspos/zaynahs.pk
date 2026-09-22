'use client';

import { useState } from 'react';
import { useAdminTab } from '@/lib/hooks/useAdminTab';
import { Product, Category, Review, Order, WhatsAppSubscriber, EmailSubscriber, SizeGuide, VariantPreset } from '@/lib/types';
import { TrashedMedia } from '@/lib/services/media';
import { TabType } from '../TrashConsoleNavigation';

interface UseTrashConsoleFiltersProps {
  products: Product[];
  categories: Category[];
  reviews: (Review & { productName?: string })[];
  orders: Order[];
  customers: any[];
  media: TrashedMedia[];
  whatsappSubscribers: WhatsAppSubscriber[];
  emailSubscribers: EmailSubscriber[];
  sizeGuides: SizeGuide[];
  variantPresets: VariantPreset[];
}

export function useTrashConsoleFilters({
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
}: UseTrashConsoleFiltersProps) {
  const [activeTab, setActiveTab] = useAdminTab<TabType>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    return (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term);
  });

  const filteredCategories = categories.filter(c => {
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || (c.slug || '').toLowerCase().includes(term);
  });

  const filteredReviews = reviews.filter(r => {
    const term = searchTerm.toLowerCase();
    return (r.customerName || '').toLowerCase().includes(term) || (r.comment || '').toLowerCase().includes(term) || (r.productName || '').toLowerCase().includes(term);
  });

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return (o.orderNumber || '').toLowerCase().includes(term) || (o.customerName || '').toLowerCase().includes(term) || (o.customerPhone || '').toLowerCase().includes(term);
  });

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || (c.email || '').toLowerCase().includes(term) || (c.phone || '').toLowerCase().includes(term);
  });

  const filteredMedia = media.filter(m => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return true;
    const filename = (m.original_filename || m.seo_filename || 'untitled').toLowerCase();
    const title = (m.title || '').toLowerCase();
    const url = (m.file_url || '').toLowerCase();
    return filename.includes(term) || title.includes(term) || url.includes(term);
  });

  const combinedLeads = [
    ...whatsappSubscribers.map(w => ({
      id: w.id,
      type: 'whatsapp' as const,
      name: w.name || 'WhatsApp Subscriber',
      contact: w.phone,
      source: w.source_type || 'WhatsApp Popup',
      createdAt: w.created_at,
    })),
    ...emailSubscribers.map(e => ({
      id: e.id,
      type: 'email' as const,
      name: 'Newsletter Subscriber',
      contact: e.email,
      source: e.source || 'Newsletter Form',
      createdAt: e.created_at,
    }))
  ].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const filteredLeads = combinedLeads.filter(lead => {
    const term = searchTerm.toLowerCase();
    return (lead.name || '').toLowerCase().includes(term) || (lead.contact || '').toLowerCase().includes(term) || (lead.source || '').toLowerCase().includes(term);
  });

  const filteredSizeGuides = sizeGuides.filter(sg => (sg.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVariantPresets = variantPresets.filter(vp => (vp.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const counts: Record<TabType, number> = {
    products: products.length,
    categories: categories.length,
    reviews: reviews.length,
    orders: orders.length,
    customers: customers.length,
    media: media.length,
    leads: combinedLeads.length,
    size_guides: sizeGuides.length,
    variant_presets: variantPresets.length,
  };

  const totalTrashCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const getActiveTabItems = () => {
    switch (activeTab) {
      case 'products': return filteredProducts;
      case 'categories': return filteredCategories;
      case 'reviews': return filteredReviews;
      case 'orders': return filteredOrders;
      case 'customers': return filteredCustomers;
      case 'media': return filteredMedia;
      case 'leads': return filteredLeads;
      case 'size_guides': return filteredSizeGuides;
      case 'variant_presets': return filteredVariantPresets;
      default: return [];
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedIds,
    setSelectedIds,
    handleTabChange,
    toggleSelect,
    filteredProducts,
    filteredCategories,
    filteredReviews,
    filteredOrders,
    filteredCustomers,
    filteredMedia,
    combinedLeads,
    filteredLeads,
    filteredSizeGuides,
    filteredVariantPresets,
    counts,
    totalTrashCount,
    getActiveTabItems,
  };
}
