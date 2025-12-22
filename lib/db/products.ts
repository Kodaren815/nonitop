/**
 * Database Products Library
 * Fetches products from Netlify Neon database
 */

import 'server-only';
import type { Product, Fabric } from '@/types';
import { neon } from '@neondatabase/serverless';

// Type for the neon query function that returns arrays
type SqlFunction = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

/**
 * Get SQL instance with error handling
 */
function getSql(): SqlFunction | null {
  // Get database URL from environment - check both standard and Netlify env vars
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  
  // Skip if no valid URL - covers build time when URL might not be set or is invalid
  if (!dbUrl || !dbUrl.startsWith('postgres')) {
    console.log('No valid database URL configured, returning empty results');
    return null;
  }
  
  try {
    return neon(dbUrl) as SqlFunction;
  } catch (error) {
    console.warn('Database not available, returning empty results:', error);
    return null;
  }
}

/**
 * Get all active products with their images
 */
export async function getAllProducts(): Promise<Product[]> {
  const sql = getSql();
  if (!sql) return [];
  
  try {
    const products = await sql`
      SELECT 
        p.id,
        p.slug,
        p.name,
        p.description,
        p.short_description as "shortDescription",
        p.price,
        p.currency,
        p.size,
        p.stock,
        p.category,
        p.has_lining_option as "hasLiningOption",
        p.is_active as "isActive",
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1)
        ) as image,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY sort_order) FROM product_images WHERE product_id = p.id),
          '[]'::json
        ) as images,
        COALESCE(
          (SELECT json_agg(f.slug) FROM product_fabrics pf JOIN fabrics f ON pf.fabric_id = f.id WHERE pf.product_id = p.id AND (pf.fabric_role = 'outer' OR pf.fabric_role IS NULL)),
          '[]'::json
        ) as "availableFabrics",
        COALESCE(
          (SELECT json_agg(f.slug) FROM product_fabrics pf JOIN fabrics f ON pf.fabric_id = f.id WHERE pf.product_id = p.id AND pf.fabric_role = 'inner'),
          '[]'::json
        ) as "availableInnerFabrics"
      FROM products p
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `;
    
    return products.map((p: any) => ({
      ...p,
      id: p.slug, // Use slug as ID for compatibility
      images: p.images || [],
      availableFabrics: p.availableFabrics || [],
      availableInnerFabrics: p.availableInnerFabrics || [],
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sql = getSql();
  if (!sql) return null;
  
  try {
    const products = await sql`
      SELECT 
        p.id,
        p.slug,
        p.name,
        p.description,
        p.short_description as "shortDescription",
        p.price,
        p.currency,
        p.size,
        p.stock,
        p.category,
        p.has_lining_option as "hasLiningOption",
        p.is_active as "isActive",
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1)
        ) as image,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY sort_order) FROM product_images WHERE product_id = p.id),
          '[]'::json
        ) as images,
        COALESCE(
          (SELECT json_agg(f.slug) FROM product_fabrics pf JOIN fabrics f ON pf.fabric_id = f.id WHERE pf.product_id = p.id AND (pf.fabric_role = 'outer' OR pf.fabric_role IS NULL)),
          '[]'::json
        ) as "availableFabrics",
        COALESCE(
          (SELECT json_agg(f.slug) FROM product_fabrics pf JOIN fabrics f ON pf.fabric_id = f.id WHERE pf.product_id = p.id AND pf.fabric_role = 'inner'),
          '[]'::json
        ) as "availableInnerFabrics"
      FROM products p
      WHERE p.slug = ${slug} AND p.is_active = true
      LIMIT 1
    `;
    
    if (products.length === 0) return null;
    
    const p = products[0];
    return {
      ...p,
      id: p.slug,
      images: p.images || [],
      availableFabrics: p.availableFabrics || [],
      availableInnerFabrics: p.availableInnerFabrics || [],
    } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Get all fabrics by type
 */
export async function getFabricsByType(type: 'outer' | 'inner'): Promise<Fabric[]> {
  const sql = getSql();
  if (!sql) return [];
  
  try {
    const fabrics = await sql`
      SELECT 
        slug as id,
        name,
        image_url as image
      FROM fabrics
      WHERE fabric_type = ${type} AND is_active = true
      ORDER BY sort_order
    `;
    
    return fabrics as Fabric[];
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    return [];
  }
}

/**
 * Get all outer fabrics
 */
export async function getOuterFabrics(): Promise<Fabric[]> {
  return getFabricsByType('outer');
}

/**
 * Get all inner fabrics
 */
export async function getInnerFabrics(): Promise<Fabric[]> {
  return getFabricsByType('inner');
}

/**
 * Check if a product exists and is in stock
 */
export async function checkProductStock(slug: string): Promise<{ exists: boolean; inStock: boolean; stock: number }> {
  const sql = getSql();
  if (!sql) return { exists: false, inStock: false, stock: 0 };
  
  try {
    const result = await sql`
      SELECT stock, is_active
      FROM products
      WHERE slug = ${slug}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return { exists: false, inStock: false, stock: 0 };
    }
    
    return {
      exists: true,
      inStock: result[0].stock > 0 && result[0].is_active,
      stock: result[0].stock,
    };
  } catch (error) {
    console.error('Error checking stock:', error);
    return { exists: false, inStock: false, stock: 0 };
  }
}

/**
 * Validate product and fabric selections for checkout
 */
export async function validateProductSelection(
  productSlug: string,
  fabricSlug: string,
  liningSlug?: string
): Promise<{ valid: boolean; error?: string; product?: Product }> {
  try {
    // Get product
    const product = await getProductBySlug(productSlug);
    if (!product) {
      return { valid: false, error: 'Product not found' };
    }
    
    // Check fabric availability
    if (!product.availableFabrics.includes(fabricSlug)) {
      return { valid: false, error: 'Invalid fabric selection' };
    }
    
    // Check lining if product has lining option
    if (product.hasLiningOption && liningSlug) {
      const innerFabrics = await getInnerFabrics();
      const validLining = innerFabrics.find(f => f.id === liningSlug);
      if (!validLining) {
        return { valid: false, error: 'Invalid lining selection' };
      }
    }
    
    return { valid: true, product };
  } catch (error) {
    console.error('Error validating selection:', error);
    return { valid: false, error: 'Validation error' };
  }
}
