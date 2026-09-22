'use client';

import { useState } from 'react';
import { Coupon } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { createCoupon, updateCoupon, deleteCoupon } from '@/lib/services/coupons';
import { toast } from 'sonner';

export function useCouponSettings() {
  const { confirm } = useConfirm();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState<number>(0);
  const [couponMinCartAmount, setCouponMinCartAmount] = useState<number>(0);
  const [couponActive, setCouponActive] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return toast.error('Coupon Code is required');
    if (couponValue <= 0) return toast.error('Coupon Value must be greater than 0');

    try {
      if (editingCouponId) {
        const updated = await updateCoupon(editingCouponId, {
          code: couponCode,
          discountType: couponDiscountType,
          value: couponValue,
          minCartAmount: couponMinCartAmount,
          active: couponActive
        });
        setCoupons(prev => prev.map(c => c.id === editingCouponId ? updated : c));
        toast.success('Coupon updated successfully!');
      } else {
        const created = await createCoupon({
          code: couponCode,
          discountType: couponDiscountType,
          value: couponValue,
          minCartAmount: couponMinCartAmount,
          active: couponActive
        });
        setCoupons(prev => [created, ...prev]);
        toast.success('Coupon created successfully!');
      }
      setCouponCode('');
      setCouponDiscountType('percentage');
      setCouponValue(0);
      setCouponMinCartAmount(0);
      setCouponActive(true);
      setEditingCouponId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save coupon');
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponCode(coupon.code);
    setCouponDiscountType(coupon.discountType);
    setCouponValue(coupon.value);
    setCouponMinCartAmount(coupon.minCartAmount || 0);
    setCouponActive(coupon.active);
  };

  const handleDeleteCoupon = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Coupon',
      message: 'Are you sure you want to delete this coupon?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return {
    coupons,
    setCoupons,
    loadingCoupons,
    setLoadingCoupons,
    couponCode,
    setCouponCode,
    couponDiscountType,
    setCouponDiscountType,
    couponValue,
    setCouponValue,
    couponMinCartAmount,
    setCouponMinCartAmount,
    couponActive,
    setCouponActive,
    editingCouponId,
    setEditingCouponId,
    handleSaveCoupon,
    handleEditCoupon,
    handleDeleteCoupon
  };
}
