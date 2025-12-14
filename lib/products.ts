import { Product, Fabric } from '@/types';

/**
 * Hardcoded product data
 * All products are defined here - no external data sources
 * Images are stored locally in /public/images/
 */

// Fabric definitions for outer fabrics
export const outerFabrics: Fabric[] = [
  { id: 'blomster', name: 'Blomster', image: '/images/fabrics/Blomster.jpg' },
  { id: 'noel', name: 'Noel', image: '/images/fabrics/Joel.jpg' },
  { id: 'olivia', name: 'Olivia', image: '/images/fabrics/Olivia.jpg' },
  { id: 'anki', name: 'Anki', image: '/images/fabrics/Anki.jpg' },
  { id: 'jennifer', name: 'Jennifer', image: '/images/fabrics/Jennifer.jpg' },
  { id: 'bernie', name: 'Bernie', image: '/images/fabrics/Bernie.jpg' },
  { id: 'sonia', name: 'Sonia', image: '/images/fabrics/Sonia.jpg' },
];

// Fabric definitions for inner fabrics (lining)
export const innerFabrics: Fabric[] = [
  { id: 'vit', name: 'Vit', image: '/images/fabrics/vit.webp' },
  { id: 'sand', name: 'Sand', image: '/images/fabrics/sand.webp' },
  { id: 'rosa', name: 'Rosa', image: '/images/fabrics/rosa.webp' },
  { id: 'brun', name: 'Brun', image: '/images/fabrics/brun.webp' },
  { id: 'blå', name: 'Blå', image: '/images/fabrics/blå.webp' },
];

// All available products
export const products: Product[] = [
  {
    id: 'miniskotvaska',
    slug: 'miniskotvaska',
    name: 'Miniskötväska',
    description: `Den här lilla skötväskan är designad av en mamma - för alla som vill slippa tunga, otympliga skötväskor. Perfekt för små äventyr, snabba ärenden och dagar då du bara vill ha med det viktigaste.

Miniskötväskan rymmer ett fullpack våtservetter, 3-4 blöjor och ombyte. Den har en smidig öppning för våtservetter, och ett handtag så du lätt kan bära med dig den när du är på språng.

Perfekt för nyblivna föräldrar eller som en babyshower-present.`,
    shortDescription: 'Perfekt för nyblivna föräldrar. Rymmer våtservetter, blöjor och ombyte.',
    price: 500,
    currency: 'SEK',
    size: 'ca 28 x 17 cm',
    image: '/images/products/miniskotvaska.jpeg',
    images: [
      '/images/products/miniskotvaska.jpeg',
      '/images/products/miniskotvaska-wipes.jpg',
      '/images/products/collection-lifestyle.jpg',
    ],
    availableFabrics: ['blomster', 'noel', 'olivia', 'anki', 'jennifer', 'bernie', 'sonia'],
    hasLiningOption: true,
    category: 'mini',
  },
  {
    id: 'mini-pouch',
    slug: 'mini-pouch',
    name: 'Mini Pouch',
    description: `Mini pouchen är handgjord och perfekt för nappar och småsaker när du är ute med din mini. Men är lika fin för dina egna småsaker, som läppbalsam, hörlurar eller annat smått du vill ha nära.

Fäst den på miniskötväskan eller dina nycklar för att alltid ha det viktigaste till hands. Och välj själv yttertyg och innetyg för att göra den helt din egen!

Storlek: ca 11 x 8 cm. Mini pouchen sys för hand och mindre avvikelser i storlek kan förekomma.`,
    shortDescription: 'Perfekt för nappar och småsaker. Fäst den på väskan eller nycklarna!',
    price: 150,
    currency: 'SEK',
    size: 'ca 11 x 8 cm',
    image: '/images/products/mini-pouch.jpeg',
    images: [
      '/images/products/mini-pouch.jpeg',
      '/images/products/mini-pouch-clips.jpg',
      '/images/products/collection-lifestyle.jpg',
    ],
    availableFabrics: ['blomster', 'noel', 'olivia', 'anki', 'jennifer', 'bernie', 'sonia'],
    hasLiningOption: true,
    category: 'mini',
  },
  {
    id: 'necessar',
    slug: 'necessar',
    name: 'Necessär',
    description: `Varje necessär är handgjord och perfekt för hudvård, smink och allt smått du vill ha samlat — men lika fin för nappar, krämer och minisaker till din lilla.

Du kan designa den helt själv: välj tyg, insida och matcha den med miniskötväskan, mini pouch eller puffkorgen för ett riktigt Nonito-set 🧸🤎

Storlek: Ca 24 x 19 cm. Alla mina necessärer sys för hand och mindre avvikelser i storlek kan förekomma.`,
    shortDescription: 'Handgjord necessär för smink, hudvård eller barnens småsaker.',
    price: 350,
    currency: 'SEK',
    size: 'ca 24 x 19 cm',
    image: '/images/products/necessar.jpeg',
    images: [
      '/images/products/necessar.jpeg',
      '/images/products/necessar-interior.jpg',
      '/images/products/necessar-collection.jpg',
    ],
    availableFabrics: ['blomster', 'noel', 'olivia', 'anki', 'jennifer', 'bernie', 'sonia'],
    hasLiningOption: true,
    category: 'accessories',
  },
  {
    id: 'puffkorg',
    slug: 'puffkorg',
    name: 'Puffkorg',
    description: `Den här söta lilla puff är handgjord och perfekt förvaring för alla dina små favoriter. Fyll den med din hudvård, smink, eller barnens blöjor och krämer. Lagom puffig för att passa i badrummet, sminkbordet och på skötbordet.

Puffkorgen är mjukt formad med vadd och vackert bomullstyg, välj din favorit.

Alla puffkorgar är handgjorda och mindre avvikelser i storlek kan förekomma.`,
    shortDescription: 'Söt och praktisk förvaring för smink, hudvård eller barnens saker.',
    price: 250,
    currency: 'SEK',
    size: 'ca 15 x 10 cm',
    image: '/images/products/puffkorg.jpeg',
    images: [
      '/images/products/puffkorg.jpeg',
      '/images/products/puffkorg-inside.jpg',
      '/images/products/puffkorg-lifestyle.jpg',
    ],
    availableFabrics: ['blomster', 'noel', 'olivia', 'anki', 'jennifer', 'bernie', 'sonia'],
    hasLiningOption: false,
    category: 'storage',
  },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFabricById(id: string): Fabric | undefined {
  return [...outerFabrics, ...innerFabrics].find((f) => f.id === id);
}

export function getOuterFabricById(id: string): Fabric | undefined {
  return outerFabrics.find((f) => f.id === id);
}

export function getInnerFabricById(id: string): Fabric | undefined {
  return innerFabrics.find((f) => f.id === id);
}

export function getAvailableFabricsForProduct(product: Product): Fabric[] {
  return outerFabrics.filter((f) => product.availableFabrics.includes(f.id));
}

// Validate product exists (for security - prevents checkout with non-existent products)
export function validateProduct(productId: string): Product | null {
  const product = getProductById(productId);
  if (!product) {
    console.warn(`Invalid product ID attempted: ${productId}`);
    return null;
  }
  return product;
}

// Validate fabric exists and is available for product
export function validateFabric(fabricId: string, product: Product): Fabric | null {
  const fabric = getFabricById(fabricId);
  if (!fabric) {
    console.warn(`Invalid fabric ID attempted: ${fabricId}`);
    return null;
  }
  
  // Check if fabric is available for this product
  const isOuter = outerFabrics.some(f => f.id === fabricId);
  if (isOuter && !product.availableFabrics.includes(fabricId)) {
    console.warn(`Fabric ${fabricId} not available for product ${product.id}`);
    return null;
  }
  
  return fabric;
}
