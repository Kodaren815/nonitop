'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  fabricIds: number[];
}

interface Fabric {
  id: number;
  slug: string;
  name: string;
  imageUrl: string;
  type: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    try {
      // Check authentication
      const authRes = await fetch('/api/admin/auth');
      if (!authRes.ok) {
        router.replace('/admin');
        return;
      }
      const authData = await authRes.json();
      if (!authData.authenticated) {
        router.replace('/admin');
        return;
      }

      // Load products
      await loadProducts();
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/products?fabrics=true');
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || []);
      setFabrics(data.fabrics || []);
    } else {
      throw new Error('Failed to load products');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin');
  }

  async function toggleProductStatus(product: Product) {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        await loadProducts();
      }
    } catch (err) {
      setError('Failed to update product');
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/products/${id}?hard=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteConfirm(null);
        await loadProducts();
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Nonito Admin</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Active Products</h3>
            <p className="text-3xl font-bold text-green-600">
              {products.filter(p => p.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Low Stock (&lt;5)</h3>
            <p className="text-3xl font-bold text-orange-500">
              {products.filter(p => p.stock < 5).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Out of Stock</h3>
            <p className="text-3xl font-bold text-red-500">
              {products.filter(p => p.stock === 0).length}
            </p>
          </div>
        </div>

        {/* Products Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <Link
            href="/admin/products/new"
            className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            + Add Product
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={!product.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 relative rounded overflow-hidden bg-gray-100">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.price} SEK</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock === 0 
                        ? 'bg-red-100 text-red-800'
                        : product.stock < 5
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.images.length} images
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-pink-600 hover:text-pink-900 mr-4"
                    >
                      Edit
                    </Link>
                    {deleteConfirm === product.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 mr-2"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products yet.</p>
              <Link
                href="/admin/products/new"
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Add your first product
              </Link>
            </div>
          )}
        </div>

        {/* Fabrics Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Fabrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {fabrics.map((fabric) => (
              <div key={fabric.id} className="bg-white rounded-lg shadow p-3">
                <div className="aspect-square relative rounded overflow-hidden bg-gray-100 mb-2">
                  <Image
                    src={fabric.imageUrl}
                    alt={fabric.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">{fabric.name}</p>
                <p className="text-xs text-gray-500 capitalize">{fabric.type}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
