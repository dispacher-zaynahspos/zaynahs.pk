'use client';

import { useTransition } from 'react';
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
import { useTrashConsoleBulkActions } from './useTrashConsoleBulkActions';
import { TabType } from '../TrashConsoleNavigation';

interface UseTrashConsoleActionsProps {
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
  confirmDelete: { id: string; type: TabType; name: string; extraInfo?: any } | null;
  setConfirmDelete: (val: any) => void;
  setConfirmBulkDelete: (val: boolean) => void;
  setConfirmEmptyTab: (val: boolean) => void;
  setConfirmEmptyCompleteTrash: (val: boolean) => void;
}

export function useTrashConsoleActions({
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
}: UseTrashConsoleActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = async (id: string, type: TabType, extraInfo?: any) => {
    startTransition(async () => {
      try {
        if (type === 'products') {
          await restoreProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          toast.success('Product restored successfully');
        } else if (type === 'categories') {
          await restoreCategory(id);
          setCategories(prev => prev.filter(c => c.id !== id));
          toast.success('Category restored successfully');
        } else if (type === 'reviews') {
          await restoreReview(id);
          setReviews(prev => prev.filter(r => r.id !== id));
          toast.success('Review restored successfully');
        } else if (type === 'orders') {
          await restoreOrder(id);
          setOrders(prev => prev.filter(o => o.id !== id));
          toast.success('Order restored successfully');
        } else if (type === 'customers') {
          await restoreCustomer(id);
          setCustomers(prev => prev.filter(c => c.id !== id));
          toast.success('Customer restored successfully');
        } else if (type === 'media') {
          await restoreMedia(id);
          setMedia(prev => prev.filter(m => m.id !== id));
          toast.success('Media file restored successfully');
        } else if (type === 'leads') {
          if (extraInfo?.leadType === 'whatsapp') {
            await restoreWhatsAppSubscriber(id);
            setWhatsappSubscribers(prev => prev.filter(s => s.id !== id));
          } else {
            await restoreEmailSubscriber(id);
            setEmailSubscribers(prev => prev.filter(s => s.id !== id));
          }
          toast.success('Lead restored successfully');
        } else if (type === 'size_guides') {
          await restoreSizeGuide(id);
          setSizeGuides(prev => prev.filter(x => x.id !== id));
          toast.success('Size guide restored successfully');
        } else if (type === 'variant_presets') {
          await restoreVariantPreset(id);
          setVariantPresets(prev => prev.filter(x => x.id !== id));
          toast.success('Variant preset restored successfully');
        }
        filters.setSelectedIds((prev: string[]) => prev.filter(x => x !== id));
      } catch (error) {
        console.error(`Restore failed for ${type}:`, error);
        toast.error(`Failed to restore ${type}`);
      }
    });
  };

  const handleHardDelete = async () => {
    if (!confirmDelete) return;
    const { id, type, extraInfo } = confirmDelete;

    startTransition(async () => {
      try {
        if (type === 'products') {
          await hardDeleteProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          toast.success('Product permanently deleted');
        } else if (type === 'categories') {
          await hardDeleteCategory(id);
          setCategories(prev => prev.filter(c => c.id !== id));
          toast.success('Category permanently deleted');
        } else if (type === 'reviews') {
          await hardDeleteReview(id);
          setReviews(prev => prev.filter(r => r.id !== id));
          toast.success('Review permanently deleted');
        } else if (type === 'orders') {
          await hardDeleteOrder(id);
          setOrders(prev => prev.filter(o => o.id !== id));
          toast.success('Order permanently deleted');
        } else if (type === 'customers') {
          await hardDeleteCustomer(id);
          setCustomers(prev => prev.filter(c => c.id !== id));
          toast.success('Customer permanently deleted');
        } else if (type === 'media') {
          await hardDeleteMedia(id, extraInfo?.fileUrl || '');
          setMedia(prev => prev.filter(m => m.id !== id));
          toast.success('Media permanently deleted');
        } else if (type === 'leads') {
          if (extraInfo?.leadType === 'whatsapp') {
            await hardDeleteWhatsAppSubscriber(id);
            setWhatsappSubscribers(prev => prev.filter(s => s.id !== id));
          } else {
            await hardDeleteEmailSubscriber(id);
            setEmailSubscribers(prev => prev.filter(s => s.id !== id));
          }
          toast.success('Lead permanently deleted');
        } else if (type === 'size_guides') {
          await hardDeleteSizeGuide(id);
          setSizeGuides(prev => prev.filter(x => x.id !== id));
          toast.success('Size guide permanently deleted');
        } else if (type === 'variant_presets') {
          await hardDeleteVariantPreset(id);
          setVariantPresets(prev => prev.filter(x => x.id !== id));
          toast.success('Variant preset permanently deleted');
        }
        filters.setSelectedIds((prev: string[]) => prev.filter(x => x !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error(`Permanent delete failed for ${type}:`, error);
        toast.error(`Failed to delete ${type}`);
      }
    });
  };

  const {
    handleBulkRestore,
    handleBulkHardDelete,
    handleEmptyTab,
    handleEmptyCompleteTrash,
  } = useTrashConsoleBulkActions({
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
  });

  return {
    isPending,
    handleRestore,
    handleHardDelete,
    handleBulkRestore,
    handleBulkHardDelete,
    handleEmptyTab,
    handleEmptyCompleteTrash,
  };
}
