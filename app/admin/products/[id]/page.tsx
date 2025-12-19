'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Fabric {
  id: number;
  slug: string;
  name: string;
  imageUrl: string;
  type: string;
}

interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  size: string;
  stock: number;
  category: string;
  hasLiningOption: boolean;
  isActive: boolean;
  images: ProductImage[];
  fabricIds: number[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    size: '',
    stock: '0',
    category: 'mini',
    hasLiningOption: true,
    isActive: true,
    images: [''],
    fabricIds: [] as number[],
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, [id]);

  async function checkAuthAndLoad() {
    try {
      const authRes = await fetch('/api/admin/auth');
      if (!authRes.ok) {
        router.replace('/admin');
        return;
      }

      // Load fabrics
      const fabricsRes = await fetch('/api/admin/products?fabrics=true');
      if (fabricsRes.ok) {
        const fabricsData = await fabricsRes.json();
        setFabrics(fabricsData.fabrics || []);
      }

      // Load product
      const productRes = await fetch(`/api/admin/products/${id}`);
      if (productRes.ok) {
        const productData = await productRes.json();
        const product: Product = productData.product;
        
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: String(product.price),
          size: product.size || '',
          stock: String(product.stock),
          category: product.category,
          hasLiningOption: product.hasLiningOption,
          isActive: product.isActive,
          images: product.images.length > 0 ? product.images.map(img => img.url) : [''],
          fabricIds: product.fabricIds,
        });
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function addImageField() {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  }

  function removeImageField(index: number) {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function updateImage(index: number, value: string) {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));
  }

  function toggleFabric(fabricId: number) {
    setFormData(prev => ({
      ...prev,
      fabricIds: prev.fabricIds.includes(fabricId)
        ? prev.fabricIds.filter(id => id !== fabricId)
        : [...prev.fabricIds, fabricId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price, 10),
          stock: parseInt(formData.stock, 10),
          images: formData.images.filter(img => img.trim() !== ''),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setError('Failed to update product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const outerFabrics = fabrics.filter(f => f.type === 'outer');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (SEK) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="mini">Mini</option>
                  <option value="accessories">Accessories</option>
                  <option value="storage">Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="e.g., ca 28 x 17 cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasLiningOption}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasLiningOption: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Has lining option</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Active (visible on site)</span>
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descriptions</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
              <button
                type="button"
                onClick={addImageField}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                + Add Image
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              First image is the primary image.
            </p>

            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => updateImage(index, e.target.value)}
                      placeholder={index === 0 ? "Primary image URL" : "Additional image URL"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  {image && (
                    <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fabrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Fabrics</h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {outerFabrics.map((fabric) => (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() => toggleFabric(fabric.id)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    formData.fabricIds.includes(fabric.id)
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={fabric.imageUrl}
                      alt={fabric.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2 text-center">
                    <span className="text-xs font-medium text-gray-700">{fabric.name}</span>
                  </div>
                  {formData.fabricIds.includes(fabric.id) && (
                    <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
