import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getOuterFabrics, getInnerFabrics } from '@/lib/db/products';
import ProductDetailClient from './ProductDetailClient';

// Force dynamic rendering to always fetch fresh data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nonito.se';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Produkt hittades inte',
    };
  }

  const productUrl = `${siteUrl}/produkter/${product.slug}`;

  return {
    title: product.name,
    description: product.shortDescription || product.description.substring(0, 160),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description.substring(0, 160),
      url: productUrl,
      type: 'website',
      images: product.images && product.images.length > 0 ? [{ url: product.images[0], alt: product.name }] : [],
    },
  };
}

// Generate JSON-LD structured data for SEO
function generateProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  images?: string[];
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || [],
    url: `${siteUrl}/produkter/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Nonito',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'Nonito',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Get product from database
  const [product, outerFabrics, innerFabrics] = await Promise.all([
    getProductBySlug(slug),
    getOuterFabrics(),
    getInnerFabrics(),
  ]);

  if (!product) {
    notFound();
  }

  // Get available fabrics for this product
  const availableFabrics = outerFabrics.filter(f => product.availableFabrics.includes(f.id));
  
  // Filter inner fabrics: only show inner fabrics that are specifically assigned to this product
  const availableInnerFabrics = product.availableInnerFabrics && product.availableInnerFabrics.length > 0
    ? innerFabrics.filter(f => product.availableInnerFabrics!.includes(f.id))
    : [];
  
  const jsonLd = generateProductJsonLd(product);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        availableFabrics={availableFabrics}
        outerFabrics={outerFabrics}
        innerFabrics={availableInnerFabrics}
      />
    </>
  );
}
