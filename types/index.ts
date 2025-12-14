// Product Types
export interface Fabric {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number; // in SEK
  currency: string;
  size: string;
  image: string;
  images?: string[]; // Multiple product images
  availableFabrics: string[]; // fabric IDs
  hasLiningOption: boolean;
  category: 'mini' | 'accessories' | 'storage';
  stripeProductId?: string; // Stripe product ID
  stripePriceId?: string; // Stripe price ID
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedFabric: string;
  selectedLining?: string;
  notes?: string; // Customer notes/extra information
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  fabricDetails: Fabric;
  liningDetails?: Fabric;
}

export interface OrderMetadata {
  productId: string;
  productName: string;
  fabric: string;
  lining?: string;
  quantity: number;
}
