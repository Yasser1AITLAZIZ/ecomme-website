'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { apiClient } from '@/lib/api/client';
import type { Product } from '@/types';
import { useI18n } from '@/lib/i18n/context';

export default function AdminProductEditPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isNew = productId === 'new';

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'iphone',
    brand: '',
    featured: false,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; image_url: string; is_primary: boolean; order: number }>>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadProduct();
    }
  }, [productId]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getById(productId);
      if (data) {
        setProduct(data);
        
        // Load existing product images
        try {
          const imagesResponse = await apiClient.get(`/images/product/${productId}`);
          const sortedImages = (imagesResponse.data || []).sort((a: any, b: any) => {
            // Primary images first, then by order
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.order || 0) - (b.order || 0);
          });
          setExistingImages(sortedImages);
        } catch (imageError: any) {
          console.error('Failed to load product images:', imageError);
          // Don't fail the whole load if images fail
        }
      } else {
        alert('Product not found');
        router.push('/admin/products');
      }
    } catch (error: any) {
      alert('Failed to load product: ' + error.message);
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    setImages((prev) => {
      const newFiles = [...prev, ...files];
      // Create preview URLs for new files
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      return newFiles;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        handleFiles(files);
      }
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        handleFiles(files);
      }
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeImage = (index: number) => {
    // Revoke the preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error: any) {
      alert('Failed to delete image: ' + error.message);
    }
  };

  // Generate SKU from product name
  const generateSKU = (name: string): string => {
    const timestamp = Date.now().toString().slice(-6);
    const namePart = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    return `${namePart}-${timestamp}`;
  };

  // Generate slug from product name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const uploadImage = async (productId: string, imageFile: File, index: number): Promise<void> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('is_primary', (index === 0).toString());
    formData.append('order', index.toString());

    await apiClient.post(`/images/upload?product_id=${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Generate SKU and slug if not provided
      const sku = generateSKU(product.name || 'PROD');
      const slug = generateSlug(product.name || 'product');
      
      // Remove images field and map frontend fields to backend schema
      // ProductUpdate schema does NOT include: id, sku, slug (these are immutable)
      const { images: _images, category, featured, originalPrice, id: _id, sku: _sku, slug: _slug, ...restProduct } = product;
      
      // Map frontend field names to backend schema
      const productData: any = {
        ...restProduct,
      };
      
      // Map originalPrice to compare_at_price (backend expects compare_at_price)
      if (originalPrice !== undefined) {
        productData.compare_at_price = originalPrice;
      }
      
      // Map featured to is_featured (backend expects is_featured, not featured)
      if (featured !== undefined) {
        productData.is_featured = featured;
      }
      
      // Note: category field is not sent - backend uses category_id (UUID)
      // If you need to set category_id, fetch it from categories API first
      // For now, we'll only send it if it's already in the product object as category_id
      
      // Add sku and slug for new products (required by ProductCreate schema)
      if (isNew) {
        productData.sku = sku;
        productData.slug = slug;
      }
      
      let savedProductId: string;
      
      if (isNew) {
        const createdProduct = await productsApi.create(productData as any);
        savedProductId = createdProduct.id;
      } else {
        const updatedProduct = await productsApi.update(productId, productData as any);
        savedProductId = updatedProduct.id;
      }
      
      // Upload images after product is created/updated
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            await uploadImage(savedProductId, images[i], i);
          } catch (error: any) {
            console.error(`Failed to upload image ${i + 1}:`, error);
            // Continue with other images even if one fails
          }
        }
      }
      
      router.push('/admin/products');
    } catch (error: any) {
      alert('Failed to save product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-black-50 hover:bg-black-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Create Product' : 'Edit Product'}
          </h1>
        </div>
      </div>

      <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
          <input
            type="text"
            value={product.name || ''}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
          <textarea
            value={product.description || ''}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Product Images</label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">Existing Images</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gold-600/20 bg-black-50"
                  >
                    <img
                      src={img.image_url}
                      alt={`Product image ${img.order + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.is_primary && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gold-600/90 text-black text-xs font-semibold rounded">
                        Primary
                      </div>
                    )}
                    <button
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload New Images */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-gold-600 bg-gold-600/10'
                : 'border-gold-600/30 bg-black-50/30 hover:border-gold-600/50'
            }`}
          >
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {images.length === 0 && existingImages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-gold-600/10 border border-gold-600/20">
                      <Upload className="w-8 h-8 text-gold-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">
                      Drag and drop images here, or click to select
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supports multiple images (PNG, JPG, GIF, WebP)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {images.length > 0 && (
                    <>
                      <p className="text-sm text-gray-400 mb-3">New Images to Upload</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => {
                          const imageFile = images[index];
                          return (
                            <div
                              key={index}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-gold-600/20 bg-black-50"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {imageFile && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                  <p className="text-xs text-white truncate">
                                    {imageFile.name}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <ImageIcon className="w-5 h-5 text-gold-600" />
                    <p className="text-gray-400 text-sm">
                      {existingImages.length + images.length} total image{(existingImages.length + images.length) !== 1 ? 's' : ''}
                      {images.length > 0 && ` (${images.length} new)`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      document.getElementById('image-upload')?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black-50 hover:bg-black-100 border border-gold-600/30 text-gold-600 rounded-lg transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Add More Images
                  </button>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Price (MAD)</label>
            <input
              type="number"
              value={product.price || 0}
              onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Stock</label>
            <input
              type="number"
              value={product.stock || 0}
              onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select
              value={product.category || 'iphone'}
              onChange={(e) => setProduct({ ...product, category: e.target.value as any })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            >
              <option value="iphone">iPhone</option>
              <option value="android">Android</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Brand</label>
            <input
              type="text"
              value={product.brand || ''}
              onChange={(e) => setProduct({ ...product, brand: e.target.value })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={product.featured || false}
            onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
            className="w-4 h-4 rounded border-gold-600/30 bg-black-50 text-gold-600 focus:ring-gold-600"
          />
          <label htmlFor="featured" className="text-sm text-gray-400">
            {t.admin.products.featuredProduct}
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gold-600/30 text-gray-400 rounded-lg hover:bg-black-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
