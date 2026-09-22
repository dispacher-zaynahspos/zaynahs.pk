'use client';

import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useOrderLogBulkActions(
  selectedOrderIds: string[],
  setSelectedOrderIds: (ids: string[]) => void,
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  setIsRefreshing: (refreshing: boolean) => void
) {
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleBulkFulfil = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      for (const id of selectedOrderIds) {
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('status, status_logs')
          .eq('id', id)
          .single();
        const currentLogs = currentOrder?.status_logs || [];
        const newLog = {
          id: crypto.randomUUID(),
          type: 'status_change',
          message: `Order status updated to shipped (Bulk Fulfillment)`,
          notes: `Status changed from ${currentOrder?.status} to shipped`,
          createdAt: new Date().toISOString(),
        };
        await supabase
          .from('orders')
          .update({
            status: 'shipped',
            status_logs: [...currentLogs, newLog],
          })
          .eq('id', id);
      }
      toast.success(`Successfully marked ${selectedOrderIds.length} orders as fulfilled`);
      setSelectedOrderIds([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkUnfulfil = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      for (const id of selectedOrderIds) {
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('status, status_logs')
          .eq('id', id)
          .single();
        const currentLogs = currentOrder?.status_logs || [];
        const newLog = {
          id: crypto.randomUUID(),
          type: 'status_change',
          message: `Order status updated to pending (Bulk Unfulfillment)`,
          notes: `Status changed from ${currentOrder?.status} to pending`,
          createdAt: new Date().toISOString(),
        };
        await supabase
          .from('orders')
          .update({
            status: 'pending',
            status_logs: [...currentLogs, newLog],
          })
          .eq('id', id);
      }
      toast.success(`Successfully marked ${selectedOrderIds.length} orders as unfulfilled`);
      setSelectedOrderIds([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedOrderIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Cancel Orders',
      message: `Are you sure you want to cancel these ${selectedOrderIds.length} orders?`,
      variant: 'warning',
      confirmText: 'Cancel Orders',
    });
    if (!confirmed) return;
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      for (const id of selectedOrderIds) {
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('status, status_logs')
          .eq('id', id)
          .single();
        const currentLogs = currentOrder?.status_logs || [];
        const newLog = {
          id: crypto.randomUUID(),
          type: 'status_change',
          message: `Order cancelled (Bulk Cancellation)`,
          notes: `Status changed from ${currentOrder?.status} to cancelled`,
          createdAt: new Date().toISOString(),
        };
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            status_logs: [...currentLogs, newLog],
          })
          .eq('id', id);
      }
      toast.success(`Successfully cancelled ${selectedOrderIds.length} orders`);
      setSelectedOrderIds([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Delete Orders',
      message: `Are you sure you want to move ${selectedOrderIds.length} order(s) to trash?`,
      variant: 'danger',
      confirmText: 'Move to Trash',
    });
    if (!confirmed) return;
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: nowIso })
        .in('id', selectedOrderIds);

      if (error) throw error;

      toast.success(`Moved ${selectedOrderIds.length} orders to trash`);
      setOrders((prev) => prev.filter((o) => !selectedOrderIds.includes(o.id)));
      setSelectedOrderIds([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to move orders to trash');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    handleBulkFulfil,
    handleBulkUnfulfil,
    handleBulkCancel,
    handleBulkDelete,
  };
}
