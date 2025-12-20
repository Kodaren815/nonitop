'use client';

import { useState, useEffect } from 'react';
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

export default function NewProductPage() {
  const router = useRouter();
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    images: [''],
    outerFabricIds: [] as number[],
    innerFabricIds: [] as number[],
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    try {
      const authRes = await fetch('/api/admin/auth', { credentials: 'include' });
      if (!authRes.ok) {
        router.replace('/admin');
        return;
      }

      // Load fabrics
      const res = await fetch('/api/admin/products?fabrics=true', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFabrics(data.fabrics || []);
        // Select all outer fabrics by default
        const outerFabricIds = (data.fabrics || [])
          .filter((f: Fabric) => f.type === 'outer')
          .map((f: Fabric) => f.id);
        // Select all inner fabrics by default
        const innerFabricIds = (data.fabrics || [])
          .filter((f: Fabric) => f.type === 'inner')
          .map((f: Fabric) => f.id);
        setFormData(prev => ({ ...prev, outerFabricIds, innerFabricIds }));
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, name, slug }));
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

  async function handleImageUpload(index: number, file: File) {
    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'products');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        updateImage(index, data.url);
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  function toggleOuterFabric(fabricId: number) {
    setFormData(prev => ({
      ...prev,
      outerFabricIds: prev.outerFabricIds.includes(fabricId)
        ? prev.outerFabricIds.filter(id => id !== fabricId)
        : [...prev.outerFabricIds, fabricId],
    }));
  }

  function toggleInnerFabric(fabricId: number) {
    setFormData(prev => ({
      ...prev,
      innerFabricIds: prev.innerFabricIds.includes(fabricId)
        ? prev.innerFabricIds.filter(id => id !== fabricId)
        : [...prev.innerFabricIds, fabricId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Failed to create product');
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
  const innerFabrics = fabrics.filter(f => f.type === 'inner');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Tillbaka
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Ny Produkt</h1>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grundinformation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produktnamn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL-slug *
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
                  Pris (SEK) *
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
                  Lagerkvantitet *
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
                  Kategori *
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
                  Storlek
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="t.ex. ca 28 x 17 cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasLiningOption}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasLiningOption: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Har föderalternativ</span>
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Beskrivningar</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kort Beskrivning *
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  required
                  placeholder="Kort beskrivning för produktkort"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fullständig Beskrivning *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={6}
                  placeholder="Detaljerad produktbeskrivning"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Produktbilder</h2>
              <button
                type="button"
                onClick={addImageField}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                + Lägg till Bild
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Första bilden är huvudbilden. Klicka på &quot;Ladda upp&quot; för att lägga till en bild eller klistra in en URL direkt.
            </p>

            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 space-y-3">
                    {/* Upload button */}
                    <div className="flex gap-2">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(index, file);
                          }}
                          disabled={uploading}
                        />
                        {uploading ? 'Laddar upp...' : '📷 Ladda upp Bild'}
                      </label>
                      <span className="text-sm text-gray-500 self-center">eller klistra in URL nedan</span>
                    </div>
                    
                    {/* URL input */}
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => updateImage(index, e.target.value)}
                      placeholder={index === 0 ? "Huvudbild URL" : "Extra bild URL"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  {/* Preview */}
                  {image && (
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
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
                  
                  {/* Remove button */}
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Outer Fabrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tillgängliga Yttertyger</h2>
            <p className="text-sm text-gray-500 mb-4">
              Välj vilka yttertyger som är tillgängliga för denna produkt.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {outerFabrics.map((fabric) => (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() => toggleOuterFabric(fabric.id)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    formData.outerFabricIds.includes(fabric.id)
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
                  {formData.outerFabricIds.includes(fabric.id) && (
                    <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Inner Fabrics */}
          {formData.hasLiningOption && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tillgängliga Innertyger (Föder)</h2>
              <p className="text-sm text-gray-500 mb-4">
                Välj vilka innertyger som är tillgängliga som föder för denna produkt.
              </p>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {innerFabrics.map((fabric) => (
                  <button
                    key={fabric.id}
                    type="button"
                    onClick={() => toggleInnerFabric(fabric.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      formData.innerFabricIds.includes(fabric.id)
                        ? 'border-blue-500 ring-2 ring-blue-200'
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
                    {formData.innerFabricIds.includes(fabric.id) && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Skapar...' : 'Skapa Produkt'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
