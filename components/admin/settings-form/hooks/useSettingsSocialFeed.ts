'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/uploadImage';
import { toast } from 'sonner';

interface UseSettingsSocialFeedProps {
  initialItems?: any[];
}

export function useSettingsSocialFeed({ initialItems = [] }: UseSettingsSocialFeedProps = {}) {
  const [socialFeedsItems, setSocialFeedsItems] = useState<any[]>(initialItems);

  // Social feed temp items
  const [tempFeedUsername, setTempFeedUsername] = useState('');
  const [tempFeedLink, setTempFeedLink] = useState('');
  const [tempFeedImageUrl, setTempFeedImageUrl] = useState('');
  const [tempFeedCaption, setTempFeedCaption] = useState('');
  const [tempFeedVideoUrl, setTempFeedVideoUrl] = useState('');
  const [tempFeedVideoAutoplay, setTempFeedVideoAutoplay] = useState(false);
  const [uploadingFeedImage, setUploadingFeedImage] = useState(false);

  const handleUploadSocialFeedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFeedImage(true);
      const url = await uploadImage(file, 'product-images');
      setTempFeedImageUrl(url);
      toast.success('Social post image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingFeedImage(false);
    }
  };

  const handleAddSocialFeedItem = () => {
    if (!tempFeedImageUrl) return toast.error('Image is required');
    if (!tempFeedUsername.trim()) return toast.error('Username is required');
    if (!tempFeedLink.trim()) return toast.error('Link is required');

    const newItem = {
      id: Date.now().toString(),
      imageUrl: tempFeedImageUrl,
      username: tempFeedUsername.trim(),
      link: tempFeedLink.trim(),
      caption: tempFeedCaption.trim(),
      videoUrl: tempFeedVideoUrl.trim() || undefined,
      videoAutoplay: tempFeedVideoAutoplay,
    };

    setSocialFeedsItems((prev) => [...prev, newItem]);
    setTempFeedImageUrl('');
    setTempFeedUsername('');
    setTempFeedLink('');
    setTempFeedCaption('');
    setTempFeedVideoUrl('');
    setTempFeedVideoAutoplay(false);
    toast.success('Social post item added!');
  };

  const handleDeleteSocialFeedItem = (id: string) => {
    setSocialFeedsItems((prev) => prev.filter((item: any) => (item.id || item.imageUrl) !== id));
    toast.success('Social post item removed!');
  };

  return {
    socialFeedsItems,
    setSocialFeedsItems,
    tempFeedUsername,
    setTempFeedUsername,
    tempFeedLink,
    setTempFeedLink,
    tempFeedImageUrl,
    setTempFeedImageUrl,
    tempFeedCaption,
    setTempFeedCaption,
    tempFeedVideoUrl,
    setTempFeedVideoUrl,
    tempFeedVideoAutoplay,
    setTempFeedVideoAutoplay,
    uploadingFeedImage,
    handleUploadSocialFeedImage,
    handleAddSocialFeedItem,
    handleDeleteSocialFeedItem,
  };
}
