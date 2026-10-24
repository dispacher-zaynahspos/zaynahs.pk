'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/common/Modal';
import StarRating from '@/components/store/StarRating';
import { submitReview } from '@/lib/services/reviews';
import { uploadReviewImage } from '@/lib/uploadImage';
import { toast } from 'sonner';
import { Send, Upload, X } from '@/components/common/Icons';
import ProductSearchPicker, { ProductPickerItem } from '@/components/common/ProductSearchPicker';

interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  products: ProductPickerItem[];
  onSubmitted?: () => void;
}

export default function WriteReviewModal({
  open,
  onClose,
  products,
  onSubmitted,
}: WriteReviewModalProps) {
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    if (selectedFiles.length + filesArray.length > 5) {
      toast.error('You can upload a maximum of 5 photos per review.');
      return;
    }

    const updatedFiles = [...selectedFiles, ...filesArray].slice(0, 5);
    setSelectedFiles(updatedFiles);

    const newPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error('Please select a product to review.');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!contact.trim()) {
      toast.error('Please enter your phone or email.');
      return;
    }

    try {
      setSubmitting(true);
      const uploadedImageUrls: string[] = [];

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadStatus(`Uploading photo ${i + 1}/${selectedFiles.length}...`);
          const file = selectedFiles[i];
          const url = await uploadReviewImage(file);
          uploadedImageUrls.push(url);
        }
      }

      setUploadStatus('Submitting review...');

      await submitReview({
        productId,
        customerName: customerName.trim(),
        contact: contact.trim(),
        rating,
        comment: comment.trim() || undefined,
        images: uploadedImageUrls,
      });

      toast.success('Review submitted! It will appear after approval.');

      // Reset
      setCustomerName('');
      setContact('');
      setRating(5);
      setComment('');
      setSelectedFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);

      onClose();
      if (onSubmitted) onSubmitted();
    } catch (err: unknown) {
      console.error('Failed to submit review:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      size="md"
      title="Write a Customer Review"
      ariaLabel="Write a Customer Review modal"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {/* Product selection with search & image */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Select Product <span className="text-red-500">*</span>
          </label>
          <ProductSearchPicker
            value={productId}
            onChange={(id) => setProductId(id)}
            initialProducts={products}
            placeholder="Search product by name or keyword..."
            required
          />
        </div>

        {/* Rating selection */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="pt-1">
            <StarRating
              rating={rating}
              interactive={true}
              onChange={setRating}
              starSize={28}
              showText={false}
            />
          </div>
        </div>

        {/* Name and Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ayesha"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Phone or Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 03001234567"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Your Feedback
          </label>
          <textarea
            placeholder="Share details about product quality, fit, and delivery..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Attach Photos <span className="font-normal text-gray-400">(Max 5)</span>
            </label>
            <span className="text-xs font-bold text-gray-400">{selectedFiles.length}/5</span>
          </div>

          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                >
                  <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length < 5 && (
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-[#e94560]/50 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/30 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {selectedFiles.length === 0 ? 'Click to upload photos' : 'Add another photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !customerName.trim() || !contact.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-[#e94560] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white h-11 text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? uploadStatus || 'Submitting...' : 'Submit Review'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
