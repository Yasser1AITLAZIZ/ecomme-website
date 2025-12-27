'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { uploadTradeInPhoto } from '@/lib/utils/supabase';
import { useI18n } from '@/lib/i18n/context';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  error?: string;
}

export function PhotoUploader({ photos, onPhotosChange, maxPhotos = 5, error }: PhotoUploaderProps) {
  const { t, isRTL } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      return;
    }

    const filesToUpload = imageFiles.slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map((file) => uploadTradeInPhoto(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...uploadedUrls]);
    } catch (error: any) {
      console.error('Failed to upload photos:', error);
      alert(error.message || 'Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [photos, maxPhotos, onPhotosChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(Array.from(e.target.files));
      }
      e.target.value = '';
    },
    [handleFiles]
  );

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gold-600 mb-2">
        {(t as any).tradeIn?.form?.photos || 'Photos'} ({photos.length}/{maxPhotos})
      </label>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <AnimatePresence>
            {photos.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden border border-gold-600/20 bg-black-100">
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-all',
            dragActive
              ? 'border-gold-600 bg-gold-600/10'
              : 'border-gold-600/30 hover:border-gold-600/50',
            error && 'border-red-500'
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
              <p className="text-sm text-gray-400">{(t as any).tradeIn?.form?.uploading || 'Uploading...'}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-gold-600/10 rounded-full">
                <Upload className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  {(t as any).tradeIn?.form?.dragDrop || 'Drag and drop photos here'}
                </p>
                <p className="text-xs text-gray-400">
                  {(t as any).tradeIn?.form?.clickToUpload || 'or click to select'} ({maxPhotos - photos.length} {(t as any).tradeIn?.form?.remaining || 'remaining'})
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {!canAddMore && (
        <p className="mt-2 text-sm text-gray-400">
          {(t as any).tradeIn?.form?.maxPhotosReached || 'Maximum number of photos reached'}
        </p>
      )}
    </div>
  );
}

