# Stripe Product Management Guide

## Overview
All products are now managed **100% from Stripe**. The website fetches:
- Product names
- Descriptions  
- Prices
- Images
- Fabric availability
- All metadata

## How to Add/Update Product Images

### Option 1: Stripe Dashboard (Recommended)
1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click on a product
3. Click "Edit product"
4. Under "Images", upload your product images
5. Click "Save product"

The images will automatically appear on your website within 60 seconds (revalidation time).

### Option 2: Via API (for bulk updates)
You can update products via the sync endpoint by providing image URLs:

```bash
curl -X POST http://localhost:3000/api/sync-products \
  -H "Content-Type: application/json" \
  -d '{
    "products": {
      "prod_TZxLKroKIYrdog": {
        "images": [
          "https://your-domain.com/images/miniskotvaska-1.jpg",
          "https://your-domain.com/images/miniskotvaska-2.jpg"
        ]
      }
    }
  }'
```

**Important**: Images must be publicly accessible URLs. Stripe will copy them to their CDN.

## Product IDs Reference

| Product | Stripe ID | Slug |
|---------|-----------|------|
| Miniskötväska | `prod_TZxLKroKIYrdog` | `miniskotvaska` |
| Mini Pouch | `prod_TZxLfQpExfurac` | `mini-pouch` |
| Necessär | `prod_TZxLmbjXkQwz5H` | `necessar` |
| Puffkorg | `prod_TZxLGGfvSZZT8J` | `puffkorg` |

## Required Metadata Fields

Each product in Stripe must have these metadata fields:

| Field | Description | Example |
|-------|-------------|---------|
| `slug` | URL-friendly identifier | `mini-pouch` |
| `size` | Product dimensions | `ca 11 x 8 cm` |
| `category` | Product category | `mini`, `accessories`, or `storage` |
| `availableFabrics` | Comma-separated fabric IDs | `blomster,noel,olivia` |
| `hasLiningOption` | Whether product has lining | `true` or `false` |
| `shortDescription` | Brief product description | `Perfekt för nappar...` |

## How Fabric Images Work

Fabric images are still stored locally in `/public/images/fabrics/` because:
1. They're not products (no Stripe representation)
2. They're used for the fabric selector UI
3. They change rarely

To add new fabrics, update `/lib/stripe-products.ts`:
```typescript
const DEFAULT_OUTER_FABRICS: Fabric[] = [
  { id: 'new-fabric', name: 'New Fabric', image: '/images/fabrics/new-fabric.jpg' },
  // ...
];
```

## Caching

- **Server-side**: Products are cached for 60 seconds (Next.js `revalidate`)
- **Client-side**: Products are cached for 5 minutes in localStorage
- **Stripe API**: Called on every server render, with fallback to cache on errors

## Security

- Stripe Secret Key is only used server-side
- Client only receives public product data
- No sensitive information exposed to frontend
- All API routes validate data before processing
