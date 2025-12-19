import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

// Default placeholder image for products without images
const DEFAULT_PRODUCT_IMAGE = '/images/products/placeholder.svg';

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image || DEFAULT_PRODUCT_IMAGE;
  
  return (
    <Link href={`/produkter/${product.slug}`} className="group">
      <div className="card overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-pink-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2ZmZjVmNSIvPjwvc3ZnPg=="
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-charcoal group-hover:text-pink-500 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {product.shortDescription}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-pink-500">
              {product.price} kr
            </span>
            <span className="text-sm text-gray-400">
              {product.size}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
