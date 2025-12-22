'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface OrderDetails {
  id: string;
  status: string;
  customer_email: string;
  customer_name: string;
  shipping: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  amount_total: number;
  currency: string;
  line_items: Array<{
    description: string;
    quantity: number;
    amount_total: number;
  }>;
  metadata: Record<string, string>;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const cartCleared = useRef(false);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setOrder(data);
            // Clear cart after successful order (only once)
            if (!cartCleared.current) {
              clearCart();
              cartCleared.current = true;
            }
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Kunde inte hämta orderinformation');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Hämtar orderinformation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16">
        <div className="section-container max-w-2xl text-center">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-serif text-charcoal mb-4">
            Något gick fel
          </h1>
          <p className="text-gray-600 mb-8">
            {error || 'Vi kunde inte hitta din order. Kontakta oss om du har frågor.'}
          </p>
          <Link href="/" className="btn-primary">
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 animate-fade-in">
      <div className="section-container max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
            Tack för din beställning! 🧸
          </h1>
          <p className="text-gray-600">
            En orderbekräftelse har skickats till{' '}
            <span className="font-medium">{order.customer_email}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6">
            Orderdetaljer
          </h2>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order.line_items?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start py-4 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-charcoal">{item.description}</p>
                  <p className="text-sm text-gray-500">Antal: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {(item.amount_total / 100).toFixed(0)} kr
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold">Totalt</span>
            <span className="text-xl font-bold text-pink-500">
              {(order.amount_total / 100).toFixed(0)} {order.currency?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              Leveransadress
            </h2>
            <address className="not-italic text-gray-600">
              <p className="font-medium text-charcoal">{order.shipping.name}</p>
              <p>{order.shipping.address?.line1}</p>
              {order.shipping.address?.line2 && <p>{order.shipping.address.line2}</p>}
              <p>
                {order.shipping.address?.postal_code} {order.shipping.address?.city}
              </p>
              <p>{order.shipping.address?.country}</p>
            </address>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-pink-50 rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-xl font-semibold text-charcoal mb-4">
            Vad händer nu?
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>✉️ Du får en orderbekräftelse via e-post</p>
            <p>🧵 Vi börjar sy din beställning för hand</p>
            <p>📦 Du får ett meddelande när paketet skickas</p>
            <p>🎀 Snart har du din nya favorit hemma!</p>
          </div>
          <div className="mt-8">
            <Link href="/produkter" className="btn-primary">
              Fortsätt handla
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Laddar orderinformation...</p>
          </div>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
