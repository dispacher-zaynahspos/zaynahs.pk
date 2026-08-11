'use client';

import React, { useState } from 'react';
import { submitReview } from '@/lib/services/reviews';
import { uploadReviewImage } from '@/lib/uploadImage';
import StarRating from './StarRating';
import { toast } from 'sonner';
import { Send, Upload, X, Image as ImageIcon } from '@/components/common/Icons';
import Image from 'next/image';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
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

    // Create preview URLs
    const newPreviews = updatedFiles.map(file => URL.createObjectURL(file));
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

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!contact.trim()) {
      toast.error('Please enter your phone number or email address');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating');
      return;
    }

    try {
      setSubmitting(true);
      const uploadedImageUrls: string[] = [];

      // Compress and upload images if attached
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadStatus(`Compressing & Uploading Photo ${i + 1}/${selectedFiles.length}...`);
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
        images: uploadedImageUrls
      });

      toast.success('Review submitted! It will appear after approval.');

      // Reset form
      setCustomerName('');
      setContact('');
      setRating(5);
      setComment('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-gray-900 dark:text-white space-y-4 transition-colors duration-200 bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-200 dark:border-gray-800/80 shadow-sm"
    >
      {/* Interactive Rating */}
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Your Rating <span className="text-red-500">*</span></label>
        <StarRating
          rating={rating}
          interactive={true}
          onChange={setRating}
          starSize={28}
          showText={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter your name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        {/* Unified Contact: Phone or Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Phone or Email <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 03001234567 or name@example.com"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Your Review</label>
        <textarea
          placeholder="What did you like or dislike about this product?"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Photo Upload Section (Up to 5 images max) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Attach Photos <span className="text-gray-400 font-normal normal-case">(Optional, max 5, auto WebP compressed)</span>
          </label>
          <span className="text-[11px] font-bold text-gray-400">{selectedFiles.length}/5</span>
        </div>

        {/* Thumbnail Preview Grid */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group">
                <Image src={url} alt={`Upload preview ${idx + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove photo"
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
              {selectedFiles.length === 0 ? 'Click to add product photos' : 'Add another photo'}
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

      {/* Privacy Notice */}
      <p className="text-xs text-gray-400 leading-relaxed">
        Your contact details will only be used to verify your review. We will never share them or send marketing messages.
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !customerName.trim() || !contact.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] active:scale-98 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-5 py-3 text-sm font-bold transition-all duration-200 shadow-md cursor-pointer"
      >
        <Send className="h-4 w-4" />
        <span>{submitting ? uploadStatus || 'Submitting...' : 'Submit Review'}</span>
      </button>
    </form>
  );
}
