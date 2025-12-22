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
  type: 'outer' | 'inner';
  isActive: boolean;
  sortOrder: number;
}

export default function FabricsPage() {
  const router = useRouter();
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  // New fabric form
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFabric, setNewFabric] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    type: 'outer' as 'outer' | 'inner',
  });

  // Edit fabric
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);

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

      await loadFabrics();
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadFabrics() {
    const res = await fetch('/api/admin/products?fabrics=true', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setFabrics(data.fabrics || []);
    } else {
      throw new Error('Failed to load fabrics');
    }
  }

  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-åäö]/g, '')
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setNewFabric(prev => ({ ...prev, name, slug }));
  }

  async function handleImageUpload(file: File, isEdit: boolean = false) {
    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'fabrics');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (isEdit && editingFabric) {
          setEditingFabric(prev => prev ? { ...prev, imageUrl: data.url } : null);
        } else {
          setNewFabric(prev => ({ ...prev, imageUrl: data.url }));
        }
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateFabric(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/fabrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newFabric),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowNewForm(false);
        setNewFabric({ name: '', slug: '', imageUrl: '', type: 'outer' });
        await loadFabrics();
      } else {
        setError(data.error || 'Failed to create fabric');
      }
    } catch (err) {
      setError('Failed to create fabric');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateFabric(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFabric) return;
    
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/fabrics/${editingFabric.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editingFabric.name,
          slug: editingFabric.slug,
          imageUrl: editingFabric.imageUrl,
          type: editingFabric.type,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEditingFabric(null);
        await loadFabrics();
      } else {
        setError(data.error || 'Failed to update fabric');
      }
    } catch (err) {
      setError('Failed to update fabric');
    } finally {
      setSaving(false);
    }
  }

  async function toggleFabricStatus(fabric: Fabric) {
    try {
      const res = await fetch(`/api/admin/fabrics/${fabric.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !fabric.isActive }),
      });
      if (res.ok) {
        await loadFabrics();
      }
    } catch (err) {
      setError('Failed to update fabric');
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/fabrics/${id}?hard=true`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setDeleteConfirm(null);
        await loadFabrics();
      } else {
        setError(data.error || 'Failed to delete fabric');
      }
    } catch (err) {
      setError('Failed to delete fabric');
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Tillbaka
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Hantera Tyger</h1>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            + Lägg till Tyg
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* New Fabric Form Modal */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Nytt Tyg</h2>
              <form onSubmit={handleCreateFabric} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Namn *
                  </label>
                  <input
                    type="text"
                    value={newFabric.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={newFabric.slug}
                    onChange={(e) => setNewFabric(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ *
                  </label>
                  <select
                    value={newFabric.type}
                    onChange={(e) => setNewFabric(prev => ({ ...prev, type: e.target.value as 'outer' | 'inner' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="outer">Yttertyg</option>
                    <option value="inner">Innertyg (foder)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bild
                  </label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploading}
                      />
                      {uploading ? 'Laddar upp...' : '📷 Ladda upp'}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newFabric.imageUrl}
                    onChange={(e) => setNewFabric(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Bild URL"
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                  {newFabric.imageUrl && (
                    <div className="mt-2 relative w-20 h-20 rounded overflow-hidden">
                      <Image src={newFabric.imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewForm(false);
                      setNewFabric({ name: '', slug: '', imageUrl: '', type: 'outer' });
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sparar...' : 'Skapa Tyg'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Fabric Form Modal */}
        {editingFabric && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Redigera Tyg</h2>
              <form onSubmit={handleUpdateFabric} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Namn *
                  </label>
                  <input
                    type="text"
                    value={editingFabric.name}
                    onChange={(e) => setEditingFabric(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={editingFabric.slug}
                    onChange={(e) => setEditingFabric(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ *
                  </label>
                  <select
                    value={editingFabric.type}
                    onChange={(e) => setEditingFabric(prev => prev ? { ...prev, type: e.target.value as 'outer' | 'inner' } : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="outer">Yttertyg</option>
                    <option value="inner">Innertyg (foder)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bild
                  </label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, true);
                        }}
                        disabled={uploading}
                      />
                      {uploading ? 'Laddar upp...' : '📷 Ladda upp'}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingFabric.imageUrl}
                    onChange={(e) => setEditingFabric(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                    placeholder="Bild URL"
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                  {editingFabric.imageUrl && (
                    <div className="mt-2 relative w-20 h-20 rounded overflow-hidden">
                      <Image src={editingFabric.imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingFabric(null)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sparar...' : 'Spara'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Outer Fabrics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Yttertyger ({outerFabrics.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {outerFabrics.map((fabric) => (
              <div 
                key={fabric.id} 
                className={`bg-white rounded-lg shadow p-3 ${!fabric.isActive ? 'opacity-50' : ''}`}
              >
                <div className="aspect-square relative rounded overflow-hidden bg-gray-100 mb-2">
                  {fabric.imageUrl ? (
                    <Image
                      src={fabric.imageUrl}
                      alt={fabric.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Ingen bild
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{fabric.name}</p>
                <p className="text-xs text-gray-500 mb-2">{fabric.slug}</p>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setEditingFabric(fabric)}
                    className="text-xs text-pink-600 hover:text-pink-800"
                  >
                    Redigera
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => toggleFabricStatus(fabric)}
                    className={`text-xs ${fabric.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {fabric.isActive ? 'Inaktivera' : 'Aktivera'}
                  </button>
                  <span className="text-gray-300">|</span>
                  {deleteConfirm === fabric.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(fabric.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Bekräfta
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-600 hover:text-gray-800 ml-1"
                      >
                        Avbryt
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(fabric.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Radera
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inner Fabrics */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Innertyger / Foder ({innerFabrics.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {innerFabrics.map((fabric) => (
              <div 
                key={fabric.id} 
                className={`bg-white rounded-lg shadow p-3 ${!fabric.isActive ? 'opacity-50' : ''}`}
              >
                <div className="aspect-square relative rounded overflow-hidden bg-gray-100 mb-2">
                  {fabric.imageUrl ? (
                    <Image
                      src={fabric.imageUrl}
                      alt={fabric.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Ingen bild
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{fabric.name}</p>
                <p className="text-xs text-gray-500 mb-2">{fabric.slug}</p>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setEditingFabric(fabric)}
                    className="text-xs text-pink-600 hover:text-pink-800"
                  >
                    Redigera
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => toggleFabricStatus(fabric)}
                    className={`text-xs ${fabric.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {fabric.isActive ? 'Inaktivera' : 'Aktivera'}
                  </button>
                  <span className="text-gray-300">|</span>
                  {deleteConfirm === fabric.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(fabric.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Bekräfta
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-600 hover:text-gray-800 ml-1"
                      >
                        Avbryt
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(fabric.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Radera
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {fabrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Inga tyger ännu.</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="text-pink-500 hover:text-pink-600 font-medium mt-2"
            >
              Lägg till ditt första tyg
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
