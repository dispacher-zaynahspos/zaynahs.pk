'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { updateSettingsSafe } from '@/lib/services/settings';
import { getCategories } from '@/lib/services/categories';
import { getAllProductsAdmin } from '@/lib/services/products';
import { getShippingMethods } from '@/lib/services/shipping';
import { getPaymentMethods } from '@/lib/services/paymentMethods';
import { getCoupons } from '@/lib/services/coupons';
import { useAdminTab } from '@/lib/hooks/useAdminTab';
import { toast } from 'sonner';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { TabId } from '../index';

import { useSettingsShippingPayment } from './useSettingsShippingPayment';
import { useSettingsCoupons } from './useSettingsCoupons';
import { useSettingsNavigation } from './useSettingsNavigation';
import { useSettingsSocialFeed } from './useSettingsSocialFeed';
import { useSettingsMediaUploads } from './useSettingsMediaUploads';
import { useSettingsAIAndEmails } from './useSettingsAIAndEmails';
import { useSettingsHeaderFooter } from './useSettingsHeaderFooter';
import { useSettingsPopupsAndPixels } from './useSettingsPopupsAndPixels';
import { useSettingsTrustAndProducts } from './useSettingsTrustAndProducts';
import { buildSettingsPayload } from './buildSettingsPayload';

interface UseSettingsFormStateProps {
  initialSettings: StoreSettings;
}

export function useSettingsFormState({ initialSettings }: UseSettingsFormStateProps) {
  const router = useRouter();

  // Sub-hooks
  const shippingPayment = useSettingsShippingPayment();
  const couponsHook = useSettingsCoupons();
  const navigation = useSettingsNavigation({ initialNavigationMenu: initialSettings.navigationMenu ?? [] });
  const socialFeed = useSettingsSocialFeed({
    initialItems: Array.isArray(initialSettings.social_feeds_items)
      ? initialSettings.social_feeds_items
      : typeof initialSettings.social_feeds_items === 'string'
      ? JSON.parse(initialSettings.social_feeds_items)
      : [],
  });
  const mediaUploads = useSettingsMediaUploads({
    initialLogoUrl: initialSettings.logoUrl || '',
    initialFaviconUrl: initialSettings.faviconUrl || '',
    initialBannerUrl: initialSettings.bannerUrl || '',
    initialExitIntentImageUrl: initialSettings.exit_intent_image_url || '',
  });
  const aiEmails = useSettingsAIAndEmails({ initialSettings });
  const headerFooter = useSettingsHeaderFooter({ initialSettings });
  const popupsPixels = useSettingsPopupsAndPixels({ initialSettings });
  const trustProducts = useSettingsTrustAndProducts({ initialSettings });

  // Core General States
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [storeUrl, setStoreUrl] = useState(initialSettings.storeUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber);
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(initialSettings.currencySymbol);
  const [orderPrefix, setOrderPrefix] = useState(initialSettings.orderPrefix);
  const [nextOrderSequence, setNextOrderSequence] = useState(initialSettings.nextOrderSequence ?? 1);
  const [nextOrderSequenceDirty, setNextOrderSequenceDirty] = useState(false);
  const [logoWidth, setLogoWidth] = useState(initialSettings.logoWidth ?? 120);
  const [tagline, setTagline] = useState(initialSettings.tagline || '');
  const [address, setAddress] = useState(initialSettings.address || '');

  const [showStock, setShowStock] = useState(initialSettings.showStock);
  const [showComparePrice, setShowComparePrice] = useState(initialSettings.showComparePrice);
  const [enableSearch, setEnableSearch] = useState(initialSettings.enableSearch);
  const [enableCategoryFilter, setEnableCategoryFilter] = useState(initialSettings.enableCategoryFilter);
  const [popularSearches, setPopularSearches] = useState(
    initialSettings.popularSearches ?? 'Co-ord Sets, Sonic, Graphic Tee, T-shirt, Kids'
  );

  const [whatsappGreeting, setWhatsappGreeting] = useState(initialSettings.whatsappGreeting);
  const [whatsappFooter, setWhatsappFooter] = useState(initialSettings.whatsappFooter);

  // Footer & Social States
  const [footerText, setFooterText] = useState(initialSettings.footerText || '');
  const [socialFacebook, setSocialFacebook] = useState(initialSettings.socialFacebook || '');
  const [socialInstagram, setSocialInstagram] = useState(initialSettings.socialInstagram || '');
  const [socialWhatsapp, setSocialWhatsapp] = useState(initialSettings.socialWhatsapp || '');
  const [socialYoutube, setSocialYoutube] = useState(initialSettings.socialYoutube || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    async function loadLists() {
      try {
        const [shipList, payList, catList, prodList, couponList] = await Promise.all([
          getShippingMethods(),
          getPaymentMethods(),
          getCategories(),
          getAllProductsAdmin(),
          getCoupons(),
        ]);
        shippingPayment.setShippingMethods(shipList);
        shippingPayment.setPaymentMethods(payList);
        navigation.setCategoriesList(catList || []);
        navigation.setProductsList(prodList || []);
        couponsHook.setCoupons(couponList || []);
      } catch (err) {
        console.error('Failed to load settings lists:', err);
        toast.error('Failed to load shipping, payment, categories, products, or coupons lists');
      } finally {
        setLoadingLists(false);
        couponsHook.setLoadingCoupons(false);
      }
    }
    loadLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return toast.error('Store Name is required');
    if (!whatsappNumber.trim()) return toast.error('WhatsApp Number is required');

    const cleanPhone = cleanWhatsAppPhone(whatsappNumber);

    setIsSubmitting(true);
    try {
      const payload = buildSettingsPayload({
        storeName,
        storeUrl,
        orderPrefix,
        nextOrderSequenceDirty,
        nextOrderSequence,
        cleanPhone,
        currency,
        currencySymbol,
        logoUrl: mediaUploads.logoUrl,
        logoWidth: Number(logoWidth),
        bannerUrl: mediaUploads.bannerUrl,
        faviconUrl: mediaUploads.faviconUrl,
        tagline,
        address,
        showStock,
        showComparePrice,
        enableSearch,
        enableCategoryFilter,
        whatsappGreeting,
        whatsappFooter,
        popularSearches,
        footerText,
        socialFacebook,
        socialInstagram,
        socialWhatsapp,
        socialYoutube,
        trustProducts,
        headerFooter,
        navigation,
        popupsPixels,
        mediaUploads,
        socialFeed,
        aiEmails,
      });

      const result = await updateSettingsSafe(payload);
      if (result && 'error' in result) {
        toast.error(`Save failed: ${result.error}`);
        return;
      }
      toast.success('Settings saved successfully!');
      setNextOrderSequenceDirty(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(`Save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: 'settings' }),
      });
      if (res.ok) {
        toast.success('Cache purged successfully!');
        router.refresh();
      } else {
        toast.error('Failed to purge cache');
      }
    } catch {
      toast.error('Error purging cache');
    } finally {
      setIsPurging(false);
    }
  };

  const [activeTab, setActiveTab] = useAdminTab<TabId>('general');

  return {
    activeTab,
    setActiveTab,
    isSubmitting,
    isPurging,
    handlePurgeCache,
    loadingLists,
    storeName,
    setStoreName,
    storeUrl,
    setStoreUrl,
    whatsappNumber,
    setWhatsappNumber,
    currency,
    setCurrency,
    currencySymbol,
    setCurrencySymbol,
    orderPrefix,
    setOrderPrefix,
    nextOrderSequence,
    setNextOrderSequence,
    setNextOrderSequenceDirty,
    logoWidth,
    setLogoWidth,
    tagline,
    setTagline,
    address,
    setAddress,
    showStock,
    setShowStock,
    showComparePrice,
    setShowComparePrice,
    enableSearch,
    setEnableSearch,
    enableCategoryFilter,
    setEnableCategoryFilter,
    popularSearches,
    setPopularSearches,
    whatsappGreeting,
    setWhatsappGreeting,
    whatsappFooter,
    setWhatsappFooter,
    footerText,
    setFooterText,
    socialFacebook,
    setSocialFacebook,
    socialInstagram,
    setSocialInstagram,
    socialWhatsapp,
    setSocialWhatsapp,
    socialYoutube,
    setSocialYoutube,
    // Trust and Products states
    ...trustProducts,
    // Shipping Payment states
    ...shippingPayment,
    // Coupons states
    ...couponsHook,
    // Navigation states
    ...navigation,
    // Social feed states
    ...socialFeed,
    // Media upload states
    ...mediaUploads,
    // AI and Emails states
    ...aiEmails,
    // Header Footer states
    ...headerFooter,
    // Popups Pixels states
    ...popupsPixels,
    initialSettings,
    handleSubmit,
    handleRemoveImage: mediaUploads.handleRemoveImage,
  };
}
