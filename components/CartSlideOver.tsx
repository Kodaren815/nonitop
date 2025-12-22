'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { CartItemWithProduct } from '@/types';

export default function CartSlideOver() {
  const {
    itemsWithProducts,
    isOpen,
    totalPrice,
    totalItems,
    setCartOpen,
    removeItem,
    updateQuantity,
  } = useCart();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsWithProducts.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedFabric: item.selectedFabric,
            selectedLining: item.selectedLining,
            notes: item.notes,
          })),
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-100">
          <h2 className="text-xl font-semibold text-charcoal">
            Varukorg ({totalItems})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-pink-50 rounded-full transition-colors"
            aria-label="Stäng varukorg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {itemsWithProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500">Din varukorg är tom</p>
              <button
                onClick={() => setCartOpen(false)}
                className="btn-primary mt-4"
              >
                Fortsätt handla
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {itemsWithProducts.map((item: CartItemWithProduct) => (
                <li
                  key={`${item.productId}-${item.selectedFabric}-${item.selectedLining}`}
                  className="flex gap-4 bg-pink-50/50 rounded-xl p-3"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.image || item.product.images?.[0] || item.fabricDetails.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-charcoal truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tyg: {item.fabricDetails.name}
                    </p>
                    {item.liningDetails && (
                      <p className="text-sm text-gray-500">
                        Foder: {item.liningDetails.name}
                      </p>
                    )}
                    <p className="text-pink-500 font-semibold mt-1">
                      {item.product.price} kr
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedFabric,
                            item.selectedLining,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-pink-500 transition-colors"
                        aria-label="Minska antal"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedFabric,
                            item.selectedLining,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-pink-500 transition-colors"
                        aria-label="Öka antal"
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          removeItem(
                            item.productId,
                            item.selectedFabric,
                            item.selectedLining
                          )
                        }
                        className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Ta bort"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {itemsWithProducts.length > 0 && (
          <div className="border-t border-pink-100 p-4 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Totalt</span>
              <span className="font-bold text-pink-500">{totalPrice} kr</span>
            </div>
            <p className="text-sm text-gray-500">
              Frakt beräknas i kassan
            </p>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full"
            >
              Gå till kassan
            </button>
          </div>
        )}
      </div>
    </>
  );
}
