'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, StatusLogItem } from '@/lib/types';
import { updateOrderDetailsSafe, deleteOrderSafe, setPaymentStatusSafe, setFulfillmentStatusSafe } from '@/lib/services/orders';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { toast } from 'sonner';

export function useOrderActions(
  order: Order,
  setOrder: React.Dispatch<React.SetStateAction<Order>>,
  setIsUpdating: (updating: boolean) => void,
  setIsDropdownOpen: (open: boolean) => void
) {
  const router = useRouter();
  const { confirm } = useConfirm();

  const [staffNoteInput, setStaffNoteInput] = useState(order.staff_notes || '');
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [courierName, setCourierName] = useState(order.courier_name || '');
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '');

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const handleStatusChange = async (newStatus: Order['status']) => {
    try {
      setIsUpdating(true);
      const newLog: StatusLogItem = {
        id: crypto.randomUUID(),
        type: 'status_change',
        message: `Order status updated to ${newStatus}`,
        notes: `Status changed from ${order.status} to ${newStatus}`,
        created_at: new Date().toISOString(),
      };
      const newLogs = [...(order.status_logs || []), newLog];
      const result = await updateOrderDetailsSafe(order.id, {
        status: newStatus,
        statusLogs: newLogs,
      });
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      toast.success(`Order status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
      setIsDropdownOpen(false);
    }
  };

  const handleSetPayment = async (paymentStatus: 'unpaid' | 'paid' | 'refunded') => {
    try {
      setIsUpdating(true);
      const result = await setPaymentStatusSafe(order.id, paymentStatus);
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      toast.success(`Payment marked ${paymentStatus}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetFulfillment = async (fulfillmentStatus: 'unfulfilled' | 'fulfilled') => {
    try {
      setIsUpdating(true);
      const result = await setFulfillmentStatusSafe(order.id, fulfillmentStatus);
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      toast.success(`Order marked ${fulfillmentStatus}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update fulfillment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveToTrash = async () => {
    const confirmed = await confirm({
      title: 'Move to Trash',
      message: 'Are you sure you want to move this order to trash?',
      variant: 'danger',
      confirmText: 'Move to Trash',
    });
    if (!confirmed) return;
    try {
      setIsUpdating(true);
      const result = await deleteOrderSafe(order.id);
      if (!result.success) throw new Error(result.error);
      toast.success('Order moved to trash');
      router.push('/admin/orders');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelShipment = async () => {
    const tn = order.tracking_number;
    if (!tn) return;
    const confirmed = await confirm({
      title: 'Cancel Shipment',
      message: `Are you sure you want to cancel shipment ${tn} on PostEx and revert order to Pending?`,
      variant: 'danger',
      confirmText: 'Cancel Shipment',
    });
    if (!confirmed) return;
    try {
      setIsUpdating(true);
      const res = await fetch('/api/courier/postex/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        const cancelLog: StatusLogItem = {
          id: Math.random().toString(36).substring(7),
          type: 'status_change',
          message: `Shipment cancelled with PostEx`,
          notes: `Tracking ${tn} cancelled, order reverted to Pending`,
          created_at: new Date().toISOString(),
        };
        const updatedLogs = [...(order.status_logs || []), cancelLog];
        const result = await updateOrderDetailsSafe(order.id, {
          status: 'pending',
          trackingNumber: '',
          courierName: '',
          trackingUrl: '',
          statusLogs: updatedLogs,
        });
        if (!result.success) throw new Error(result.error);
        setOrder(result.data);
        toast.success(`Shipment cancelled: ${data.message}`);
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to cancel shipment');
      }
    } catch (err) {
      toast.error('Failed to cancel shipment');
    } finally {
      setIsUpdating(false);
      setIsDropdownOpen(false);
    }
  };

  const handleSaveStaffNote = async () => {
    if (!staffNoteInput.trim()) return;
    try {
      setIsUpdating(true);
      const newLog = {
        id: Math.random().toString(36).substring(7),
        type: 'staff_note' as const,
        message: 'Admin commented',
        notes: staffNoteInput,
        created_at: new Date().toISOString(),
      };
      const updatedLogs = [...(order.status_logs || []), newLog];

      const result = await updateOrderDetailsSafe(order.id, {
        statusLogs: updatedLogs,
        staffNotes: staffNoteInput,
      });

      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      setStaffNoteInput('');
      toast.success('Comment added to timeline');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    try {
      setIsUpdating(true);
      const result = await updateOrderDetailsSafe(order.id, {
        trackingNumber,
        courierName,
        trackingUrl,
      });
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      setIsEditingTracking(false);
      toast.success('Tracking details updated');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update tracking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTimelineComment = async (logId: string) => {
    if (!order.status_logs) return;
    const confirmed = await confirm({
      title: 'Delete Comment',
      message: 'Delete this comment?',
      variant: 'danger',
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    const newLogs = order.status_logs.filter((l) => l.id !== logId);
    try {
      setIsUpdating(true);
      const result = await updateOrderDetailsSafe(order.id, { statusLogs: newLogs });
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      toast.success('Comment deleted');
    } catch (e) {
      toast.error('Failed to delete comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTimelineComment = async (logId: string) => {
    if (!order.status_logs) return;
    const newLogs = order.status_logs.map((l) =>
      l.id === logId ? { ...l, notes: editingCommentText } : l
    );
    try {
      setIsUpdating(true);
      const result = await updateOrderDetailsSafe(order.id, { statusLogs: newLogs });
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (e) {
      toast.error('Failed to update comment');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    staffNoteInput,
    setStaffNoteInput,
    isEditingTracking,
    setIsEditingTracking,
    trackingNumber,
    setTrackingNumber,
    courierName,
    setCourierName,
    trackingUrl,
    setTrackingUrl,
    editingCommentId,
    setEditingCommentId,
    editingCommentText,
    setEditingCommentText,
    handleStatusChange,
    handleSetPayment,
    handleSetFulfillment,
    handleMoveToTrash,
    handleCancelShipment,
    handleSaveStaffNote,
    handleUpdateTracking,
    handleDeleteTimelineComment,
    handleUpdateTimelineComment,
  };
}
