'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/uploadImage';
import { toast } from 'sonner';

interface UseSettingsMediaUploadsProps {
  initialLogoUrl?: string;
  initialFaviconUrl?: string;
  initialBannerUrl?: string;
  initialExitIntentImageUrl?: string;
}

export function useSettingsMediaUploads({
  initialLogoUrl = '',
  initialFaviconUrl = '',
  initialBannerUrl = '',
  initialExitIntentImageUrl = '',
}: UseSettingsMediaUploadsProps = {}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl);
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
  const [exitIntentImageUrl, setExitIntentImageUrl] = useState(initialExitIntentImageUrl);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingExitIntent, setUploadingExitIntent] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'favicon' | 'banner' | 'exit_intent'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'logo') setUploadingLogo(true);
      if (type === 'favicon') setUploadingFavicon(true);
      if (type === 'banner') setUploadingBanner(true);
      if (type === 'exit_intent') setUploadingExitIntent(true);

      const url = await uploadImage(file, 'product-images');

      if (type === 'logo') setLogoUrl(url);
      if (type === 'favicon') setFaviconUrl(url);
      if (type === 'banner') setBannerUrl(url);
      if (type === 'exit_intent') setExitIntentImageUrl(url);

      toast.success(`${type.toUpperCase().replace('_', ' ')} uploaded and optimized successfully!`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : `Failed to upload ${type}`;
      toast.error(msg);
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'favicon') setUploadingFavicon(false);
      if (type === 'banner') setUploadingBanner(false);
      if (type === 'exit_intent') setUploadingExitIntent(false);
    }
  };

  const handleRemoveImage = (type: 'logo' | 'favicon' | 'banner' | 'exit_intent') => {
    if (type === 'logo') setLogoUrl('');
    if (type === 'favicon') setFaviconUrl('');
    if (type === 'banner') setBannerUrl('');
    if (type === 'exit_intent') setExitIntentImageUrl('');
    toast.success(`${type.toUpperCase().replace('_', ' ')} reference removed`);
  };

  return {
    logoUrl,
    setLogoUrl,
    bannerUrl,
    setBannerUrl,
    faviconUrl,
    setFaviconUrl,
    exitIntentImageUrl,
    setExitIntentImageUrl,
    uploadingLogo,
    uploadingFavicon,
    uploadingBanner,
    uploadingExitIntent,
    handleFileUpload,
    handleRemoveImage,
  };
}
