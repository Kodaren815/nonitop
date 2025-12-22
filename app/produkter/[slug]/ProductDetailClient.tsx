'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, Fabric } from '@/types';
import { useCart } from '@/context/CartContext';
import FabricSelector from '@/components/FabricSelector';

interface ProductDetailClientProps {
  product: Product;
  availableFabrics: Fabric[];
  outerFabrics: Fabric[];
  innerFabrics: Fabric[];
}

export default function ProductDetailClient({
  product,
  availableFabrics,
  outerFabrics,
  innerFabrics,
}: ProductDetailClientProps) {
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(availableFabrics[0]?.id || '');
  const [selectedLining, setSelectedLining] = useState(
    product.hasLiningOption ? innerFabrics[0]?.id : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem, setCartOpen } = useCart();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      quantity,
      selectedFabric,
      selectedLining: product.hasLiningOption ? selectedLining : undefined,
      notes: notes.trim() || undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      quantity,
      selectedFabric,
      selectedLining: product.hasLiningOption ? selectedLining : undefined,
      notes: notes.trim() || undefined,
    });
    setCartOpen(true);
  };

  return (
    <div className="py-12 md:py-16 animate-fade-in">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-50 group">
              <Image
                src={productImages[selectedImageIndex]}
                alt={`${product.name} - Bild ${selectedImageIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                quality={90}
              />
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-pink-500 ring-2 ring-pink-500 ring-offset-2'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 15vw"
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">
                {product.name}
              </h1>
              <p className="text-gray-500">{product.size}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-pink-500">
                {product.price} kr
              </span>
              {product.stock > 0 ? (
                <span className={`text-sm px-3 py-1 rounded-full ${product.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {product.stock <= 5 ? `Endast ${product.stock} kvar` : `${product.stock} i lager`}
                </span>
              ) : (
                <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700">
                  Slut i lager
                </span>
              )}
            </div>

            <div className="prose prose-gray">
              {product.description.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600">
                  {paragraph}
                </p>
              ))}
            </div>

            <hr className="border-pink-100" />

            {/* Fabric Selection */}
            <FabricSelector
              fabrics={availableFabrics}
              selectedFabric={selectedFabric}
              onSelect={setSelectedFabric}
              label="Välj yttertyg"
            />

            {/* Lining Selection (if applicable) */}
            {product.hasLiningOption && (
              <FabricSelector
                fabrics={innerFabrics}
                selectedFabric={selectedLining}
                onSelect={setSelectedLining}
                label="Välj innertyg"
              />
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal">
                Antal
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Minska antal"
                  disabled={quantity <= 1 || product.stock === 0}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Öka antal"
                  disabled={quantity >= product.stock || product.stock === 0}
                >
                  +
                </button>
                {quantity >= product.stock && product.stock > 0 && (
                  <span className="text-xs text-orange-600">Max antal</span>
                )}
              </div>
            </div>

            {/* Customer Notes */}
            <div className="space-y-3">
              <label htmlFor="notes" className="block text-sm font-medium text-charcoal">
                Särskilda önskemål (valfritt)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="T.ex. extra stark söm, specifik färgnyans, eller annan information..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-500">
                {notes.length}/500 tecken
              </p>
            </div>

            {/* Add to Cart Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className={`btn-secondary flex-1 ${
                  addedToCart ? 'bg-green-50 border-green-500 text-green-600' : ''
                } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={addedToCart || product.stock === 0}
              >
                {product.stock === 0 ? 'Slut i lager' : addedToCart ? '✓ Tillagd i varukorgen' : 'Lägg i varukorg'}
              </button>
              <button
                onClick={handleBuyNow}
                className={`btn-primary flex-1 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Slut i lager' : 'Köp nu'}
              </button>
            </div>

            {/* Extra Info */}
            <div className="bg-pink-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-gray-600">
                🧸 Handgjord med kärlek i Sverige
              </p>
              <p className="text-sm text-gray-600">
                📦 Frakt beräknas i kassan
              </p>
              <p className="text-sm text-gray-600">
                💕 Perfekt som present - babyshower favorit!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
