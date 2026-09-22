'use client';

import { toast } from 'sonner';
import { Product, Category, Review, Order, WhatsAppSubscriber, EmailSubscriber, SizeGuide, VariantPreset } from '@/lib/types';
import { TrashedMedia } from '@/lib/services/media';
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
  bulkRestoreSizeGuides,
  bulkHardDeleteSizeGuides,
  bulkRestoreVariantPresets,
  bulkHardDeleteVariantPresets
} from '@/lib/services/trash';

interface UseTrashConsoleBulkActionsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  reviews: (Review & { productName?: string })[];
  setReviews: React.Dispatch<React.SetStateAction<(Review & { productName?: string })[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: any[];
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  media: TrashedMedia[];
  setMedia: React.Dispatch<React.SetStateAction<TrashedMedia[]>>;
  whatsappSubscribers: WhatsAppSubscriber[];
  setWhatsappSubscribers: React.Dispatch<React.SetStateAction<WhatsAppSubscriber[]>>;
  emailSubscribers: EmailSubscriber[];
  setEmailSubscribers: React.Dispatch<React.SetStateAction<EmailSubscriber[]>>;
  sizeGuides: SizeGuide[];
  setSizeGuides: React.Dispatch<React.SetStateAction<SizeGuide[]>>;
  variantPresets: VariantPreset[];
  setVariantPresets: React.Dispatch<React.SetStateAction<VariantPreset[]>>;
  filters: any;
  setConfirmBulkDelete: (val: boolean) => void;
  setConfirmEmptyTab: (val: boolean) => void;
  setConfirmEmptyCompleteTrash: (val: boolean) => void;
  startTransition: (callback: () => Promise<void>) => void;
}

export function useTrashConsoleBulkActions({
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
  setConfirmBulkDelete,
  setConfirmEmptyTab,
  setConfirmEmptyCompleteTrash,
  startTransition,
}: UseTrashConsoleBulkActionsProps) {
  const handleBulkRestore = async () => {
    if (filters.selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        const idsToRestore = [...filters.selectedIds];
        if (filters.activeTab === 'products') {
          await bulkRestoreProducts(idsToRestore);
          setProducts(prev => prev.filter(p => !idsToRestore.includes(p.id)));
        } else if (filters.activeTab === 'categories') {
          await bulkRestoreCategories(idsToRestore);
          setCategories(prev => prev.filter(c => !idsToRestore.includes(c.id)));
        } else if (filters.activeTab === 'reviews') {
          await bulkRestoreReviews(idsToRestore);
          setReviews(prev => prev.filter(r => !idsToRestore.includes(r.id)));
        } else if (filters.activeTab === 'orders') {
          await bulkRestoreOrders(idsToRestore);
          setOrders(prev => prev.filter(o => !idsToRestore.includes(o.id)));
        } else if (filters.activeTab === 'customers') {
          await bulkRestoreCustomers(idsToRestore);
          setCustomers(prev => prev.filter(c => !idsToRestore.includes(c.id)));
        } else if (filters.activeTab === 'media') {
          await bulkRestoreMedia(idsToRestore);
          setMedia(prev => prev.filter(m => !idsToRestore.includes(m.id)));
        } else if (filters.activeTab === 'leads') {
          const whatsappIds = idsToRestore.filter(id => filters.combinedLeads.find((l: any) => l.id === id)?.type === 'whatsapp');
          const emailIds = idsToRestore.filter(id => filters.combinedLeads.find((l: any) => l.id === id)?.type === 'email');
          await bulkRestoreLeads(whatsappIds, emailIds);
          setWhatsappSubscribers(prev => prev.filter(s => !whatsappIds.includes(s.id)));
          setEmailSubscribers(prev => prev.filter(s => !emailIds.includes(s.id)));
        } else if (filters.activeTab === 'size_guides') {
          await bulkRestoreSizeGuides(idsToRestore);
          setSizeGuides(prev => prev.filter(sg => !idsToRestore.includes(sg.id)));
        } else if (filters.activeTab === 'variant_presets') {
          await bulkRestoreVariantPresets(idsToRestore);
          setVariantPresets(prev => prev.filter(vp => !idsToRestore.includes(vp.id)));
        }
        filters.setSelectedIds([]);
        toast.success(`Restored ${idsToRestore.length} item(s) successfully`);
      } catch (error) {
        console.error('Bulk restore failed:', error);
        toast.error('Failed to restore selected items');
      }
    });
  };

  const handleBulkHardDelete = async () => {
    if (filters.selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        const idsToDelete = [...filters.selectedIds];
        if (filters.activeTab === 'products') {
          await bulkHardDeleteProducts(idsToDelete);
          setProducts(prev => prev.filter(p => !idsToDelete.includes(p.id)));
        } else if (filters.activeTab === 'categories') {
          await bulkHardDeleteCategories(idsToDelete);
          setCategories(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        } else if (filters.activeTab === 'reviews') {
          await bulkHardDeleteReviews(idsToDelete);
          setReviews(prev => prev.filter(r => !idsToDelete.includes(r.id)));
        } else if (filters.activeTab === 'orders') {
          await bulkHardDeleteOrders(idsToDelete);
          setOrders(prev => prev.filter(o => !idsToDelete.includes(o.id)));
        } else if (filters.activeTab === 'customers') {
          await bulkHardDeleteCustomers(idsToDelete);
          setCustomers(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        } else if (filters.activeTab === 'media') {
          const mediaItems = idsToDelete.map(id => {
            const m = media.find(item => item.id === id);
            return { id, url: m?.file_url || '' };
          });
          await bulkHardDeleteMedia(mediaItems);
          setMedia(prev => prev.filter(m => !idsToDelete.includes(m.id)));
        } else if (filters.activeTab === 'leads') {
          const whatsappIds = idsToDelete.filter(id => filters.combinedLeads.find((l: any) => l.id === id)?.type === 'whatsapp');
          const emailIds = idsToDelete.filter(id => filters.combinedLeads.find((l: any) => l.id === id)?.type === 'email');
          await bulkHardDeleteLeads(whatsappIds, emailIds);
          setWhatsappSubscribers(prev => prev.filter(s => !whatsappIds.includes(s.id)));
          setEmailSubscribers(prev => prev.filter(s => !emailIds.includes(s.id)));
        } else if (filters.activeTab === 'size_guides') {
          await bulkHardDeleteSizeGuides(idsToDelete);
          setSizeGuides(prev => prev.filter(sg => !idsToDelete.includes(sg.id)));
        } else if (filters.activeTab === 'variant_presets') {
          await bulkHardDeleteVariantPresets(idsToDelete);
          setVariantPresets(prev => prev.filter(vp => !idsToDelete.includes(vp.id)));
        }
        filters.setSelectedIds([]);
        setConfirmBulkDelete(false);
        toast.success(`Permanently deleted ${idsToDelete.length} item(s)`);
      } catch (error) {
        console.error('Bulk permanent delete failed:', error);
        toast.error('Failed to permanently delete selected items');
      }
    });
  };

  const handleEmptyTab = async () => {
    const items = filters.getActiveTabItems();
    if (items.length === 0) return;
    startTransition(async () => {
      try {
        const idsToDelete = items.map((x: any) => x.id);
        if (filters.activeTab === 'products') {
          await bulkHardDeleteProducts(idsToDelete);
          setProducts(prev => prev.filter(p => !idsToDelete.includes(p.id)));
        } else if (filters.activeTab === 'categories') {
          await bulkHardDeleteCategories(idsToDelete);
          setCategories(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        } else if (filters.activeTab === 'reviews') {
          await bulkHardDeleteReviews(idsToDelete);
          setReviews(prev => prev.filter(r => !idsToDelete.includes(r.id)));
        } else if (filters.activeTab === 'orders') {
          await bulkHardDeleteOrders(idsToDelete);
          setOrders(prev => prev.filter(o => !idsToDelete.includes(o.id)));
        } else if (filters.activeTab === 'customers') {
          await bulkHardDeleteCustomers(idsToDelete);
          setCustomers(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        } else if (filters.activeTab === 'media') {
          const mediaItems = idsToDelete.map((id: string) => {
            const m = media.find(item => item.id === id);
            return { id, url: m?.file_url || '' };
          });
          await bulkHardDeleteMedia(mediaItems);
          setMedia(prev => prev.filter(m => !idsToDelete.includes(m.id)));
        } else if (filters.activeTab === 'leads') {
          const whatsappIds = idsToDelete.filter((id: string) => filters.combinedLeads.find((l: any) => l.id === id)?.type === 'whatsapp');
          const emailIds = idsToDelete.filter((id: string) => filters.combinedLeads.find((l: any) => l.id === id)?.type === 'email');
          await bulkHardDeleteLeads(whatsappIds, emailIds);
          setWhatsappSubscribers(prev => prev.filter(s => !whatsappIds.includes(s.id)));
          setEmailSubscribers(prev => prev.filter(s => !emailIds.includes(s.id)));
        } else if (filters.activeTab === 'size_guides') {
          await bulkHardDeleteSizeGuides(idsToDelete);
          setSizeGuides(prev => prev.filter(sg => !idsToDelete.includes(sg.id)));
        } else if (filters.activeTab === 'variant_presets') {
          await bulkHardDeleteVariantPresets(idsToDelete);
          setVariantPresets(prev => prev.filter(vp => !idsToDelete.includes(vp.id)));
        }
        filters.setSelectedIds((prev: string[]) => prev.filter(id => !idsToDelete.includes(id)));
        setConfirmEmptyTab(false);
        toast.success(`Emptied all items in ${filters.activeTab.replace('_', ' ')}`);
      } catch (error) {
        console.error('Empty tab failed:', error);
        toast.error('Failed to empty tab');
      }
    });
  };

  const handleEmptyCompleteTrash = async () => {
    if (filters.totalTrashCount === 0) return;
    startTransition(async () => {
      try {
        if (products.length > 0) await bulkHardDeleteProducts(products.map(x => x.id));
        if (categories.length > 0) await bulkHardDeleteCategories(categories.map(x => x.id));
        if (reviews.length > 0) await bulkHardDeleteReviews(reviews.map(x => x.id));
        if (orders.length > 0) await bulkHardDeleteOrders(orders.map(x => x.id));
        if (customers.length > 0) await bulkHardDeleteCustomers(customers.map(x => x.id));
        if (media.length > 0) await bulkHardDeleteMedia(media.map(m => ({ id: m.id, url: m.file_url || '' })));
        if (whatsappSubscribers.length > 0 || emailSubscribers.length > 0) {
          await bulkHardDeleteLeads(whatsappSubscribers.map(x => x.id), emailSubscribers.map(x => x.id));
        }
        if (sizeGuides.length > 0) await bulkHardDeleteSizeGuides(sizeGuides.map(x => x.id));
        if (variantPresets.length > 0) await bulkHardDeleteVariantPresets(variantPresets.map(x => x.id));

        setProducts([]);
        setCategories([]);
        setReviews([]);
        setOrders([]);
        setCustomers([]);
        setMedia([]);
        setWhatsappSubscribers([]);
        setEmailSubscribers([]);
        setSizeGuides([]);
        setVariantPresets([]);
        filters.setSelectedIds([]);
        setConfirmEmptyCompleteTrash(false);
        toast.success('Emptied complete trash console');
      } catch (error) {
        console.error('Empty complete trash failed:', error);
        toast.error('Failed to empty trash');
      }
    });
  };

  return {
    handleBulkRestore,
    handleBulkHardDelete,
    handleEmptyTab,
    handleEmptyCompleteTrash,
  };
}
