/**
 * Admin Product Operations
 * Secure CRUD operations for product management
 */

// Type for the neon query function
type NeonQueryFunction = any;

/**
 * Get SQL instance with dynamic import and error handling
 * Uses dynamic import to prevent build-time errors
 */
async function getSql(): Promise<NeonQueryFunction | null> {
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  
  // Skip if no valid URL - covers build time when URL might not be set or is invalid
  if (!dbUrl || !dbUrl.startsWith('postgres')) {
    return null;
  }
  
  try {
    // Import directly from @neondatabase/serverless with the connection string
    const { neon } = await import('@neondatabase/serverless');
    return neon(dbUrl);
  } catch (error) {
    console.warn('Database not available');
    return null;
  }
}

export interface AdminProduct {
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
  images: { id: number; url: string; isPrimary: boolean; sortOrder: number }[];
  fabricIds: number[];
}

export interface CreateProductData {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  size: string;
  stock: number;
  category: string;
  hasLiningOption: boolean;
  images: string[];
  fabricIds: number[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

/**
 * Sanitize and validate slug
 */
function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate product data
 */
function validateProductData(data: CreateProductData): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (!data.slug || data.slug.trim().length === 0) {
    return { valid: false, error: 'Slug is required' };
  }
  if (typeof data.price !== 'number' || data.price < 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }
  if (typeof data.stock !== 'number' || data.stock < 0) {
    return { valid: false, error: 'Stock must be a non-negative number' };
  }
  if (!['mini', 'accessories', 'storage'].includes(data.category)) {
    return { valid: false, error: 'Invalid category' };
  }
  return { valid: true };
}

/**
 * Get all products for admin (including inactive)
 */
export async function getAllAdminProducts(): Promise<AdminProduct[]> {
  const sql = await getSql();
  if (!sql) return [];
  
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
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    FROM products p
    ORDER BY p.created_at DESC
  `;

  // Get images and fabrics for each product
  const productsWithDetails = await Promise.all(
    products.map(async (product: any) => {
      const images = await sql`
        SELECT id, image_url as url, is_primary as "isPrimary", sort_order as "sortOrder"
        FROM product_images
        WHERE product_id = ${product.id}
        ORDER BY sort_order
      `;

      const fabrics = await sql`
        SELECT fabric_id
        FROM product_fabrics
        WHERE product_id = ${product.id}
      `;

      return {
        ...product,
        images,
        fabricIds: fabrics.map((f: any) => (f as { fabric_id: number }).fabric_id),
      };
    })
  );

  return productsWithDetails as AdminProduct[];
}

/**
 * Get single product by ID for admin
 */
export async function getAdminProductById(id: number): Promise<AdminProduct | null> {
  const sql = await getSql();
  if (!sql) return null;
  
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
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    FROM products p
    WHERE p.id = ${id}
    LIMIT 1
  `;

  if (products.length === 0) return null;

  const product = products[0];

  const images = await sql`
    SELECT id, image_url as url, is_primary as "isPrimary", sort_order as "sortOrder"
    FROM product_images
    WHERE product_id = ${product.id}
    ORDER BY sort_order
  `;

  const fabrics = await sql`
    SELECT fabric_id
    FROM product_fabrics
    WHERE product_id = ${product.id}
  `;

  return {
    ...product,
    images,
    fabricIds: fabrics.map((f: any) => (f as { fabric_id: number }).fabric_id),
  } as AdminProduct;
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductData): Promise<{ success: boolean; id?: number; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  // Validate
  const validation = validateProductData(data);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const slug = sanitizeSlug(data.slug);

  try {
    // Check for duplicate slug
    const existing = await sql`
      SELECT id FROM products WHERE slug = ${slug} LIMIT 1
    `;
    if (existing.length > 0) {
      return { success: false, error: 'A product with this slug already exists' };
    }

    // Insert product
    const result = await sql`
      INSERT INTO products (slug, name, description, short_description, price, size, stock, category, has_lining_option)
      VALUES (${slug}, ${data.name}, ${data.description}, ${data.shortDescription}, ${data.price}, ${data.size}, ${data.stock}, ${data.category}, ${data.hasLiningOption})
      RETURNING id
    `;

    const productId = result[0].id;

    // Insert images
    for (let i = 0; i < data.images.length; i++) {
      await sql`
        INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
        VALUES (${productId}, ${data.images[i]}, ${i}, ${i === 0})
      `;
    }

    // Insert fabric associations
    for (const fabricId of data.fabricIds) {
      await sql`
        INSERT INTO product_fabrics (product_id, fabric_id)
        VALUES (${productId}, ${fabricId})
        ON CONFLICT DO NOTHING
      `;
    }

    return { success: true, id: productId };
  } catch (error) {
    console.error('Create product error:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: number, data: UpdateProductData): Promise<{ success: boolean; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Check product exists
    const existing = await sql`
      SELECT id FROM products WHERE id = ${id} LIMIT 1
    `;
    if (existing.length === 0) {
      return { success: false, error: 'Product not found' };
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];

    if (data.name !== undefined) {
      await sql`UPDATE products SET name = ${data.name} WHERE id = ${id}`;
    }
    if (data.description !== undefined) {
      await sql`UPDATE products SET description = ${data.description} WHERE id = ${id}`;
    }
    if (data.shortDescription !== undefined) {
      await sql`UPDATE products SET short_description = ${data.shortDescription} WHERE id = ${id}`;
    }
    if (data.price !== undefined) {
      await sql`UPDATE products SET price = ${data.price} WHERE id = ${id}`;
    }
    if (data.size !== undefined) {
      await sql`UPDATE products SET size = ${data.size} WHERE id = ${id}`;
    }
    if (data.stock !== undefined) {
      await sql`UPDATE products SET stock = ${data.stock} WHERE id = ${id}`;
    }
    if (data.category !== undefined) {
      await sql`UPDATE products SET category = ${data.category} WHERE id = ${id}`;
    }
    if (data.hasLiningOption !== undefined) {
      await sql`UPDATE products SET has_lining_option = ${data.hasLiningOption} WHERE id = ${id}`;
    }
    if (data.isActive !== undefined) {
      await sql`UPDATE products SET is_active = ${data.isActive} WHERE id = ${id}`;
    }
    if (data.slug !== undefined) {
      const slug = sanitizeSlug(data.slug);
      // Check slug doesn't conflict
      const conflict = await sql`
        SELECT id FROM products WHERE slug = ${slug} AND id != ${id} LIMIT 1
      `;
      if (conflict.length > 0) {
        return { success: false, error: 'Slug already in use' };
      }
      await sql`UPDATE products SET slug = ${slug} WHERE id = ${id}`;
    }

    // Update timestamp
    await sql`UPDATE products SET updated_at = NOW() WHERE id = ${id}`;

    // Update images if provided
    if (data.images !== undefined) {
      await sql`DELETE FROM product_images WHERE product_id = ${id}`;
      for (let i = 0; i < data.images.length; i++) {
        await sql`
          INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
          VALUES (${id}, ${data.images[i]}, ${i}, ${i === 0})
        `;
      }
    }

    // Update fabric associations if provided
    if (data.fabricIds !== undefined) {
      await sql`DELETE FROM product_fabrics WHERE product_id = ${id}`;
      for (const fabricId of data.fabricIds) {
        await sql`
          INSERT INTO product_fabrics (product_id, fabric_id)
          VALUES (${id}, ${fabricId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

/**
 * Delete a product (soft delete by setting inactive, or hard delete)
 */
export async function deleteProduct(id: number, hard: boolean = false): Promise<{ success: boolean; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    if (hard) {
      // Hard delete - will cascade to images and fabrics
      await sql`DELETE FROM products WHERE id = ${id}`;
    } else {
      // Soft delete
      await sql`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
    }
    return { success: true };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

/**
 * Get all fabrics for admin selection
 */
export async function getAllFabrics(): Promise<{ id: number; slug: string; name: string; imageUrl: string; type: string }[]> {
  const sql = await getSql();
  if (!sql) return [];
  
  const fabrics = await sql`
    SELECT id, slug, name, image_url as "imageUrl", fabric_type as type
    FROM fabrics
    WHERE is_active = true
    ORDER BY fabric_type, sort_order
  `;
  return fabrics as { id: number; slug: string; name: string; imageUrl: string; type: string }[];
}

/**
 * Update product stock
 */
export async function updateProductStock(id: number, stock: number): Promise<{ success: boolean; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  if (stock < 0) {
    return { success: false, error: 'Stock cannot be negative' };
  }
  try {
    await sql`UPDATE products SET stock = ${stock}, updated_at = NOW() WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('Update stock error:', error);
    return { success: false, error: 'Failed to update stock' };
  }
}

/**
 * Add image to product
 */
export async function addProductImage(productId: number, imageUrl: string, isPrimary: boolean = false): Promise<{ success: boolean; id?: number; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Get max sort order
    const maxOrder = await sql`
      SELECT COALESCE(MAX(sort_order), -1) as max FROM product_images WHERE product_id = ${productId}
    `;
    const sortOrder = maxOrder[0].max + 1;

    // If setting as primary, unset existing primary
    if (isPrimary) {
      await sql`UPDATE product_images SET is_primary = false WHERE product_id = ${productId}`;
    }

    const result = await sql`
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
      VALUES (${productId}, ${imageUrl}, ${sortOrder}, ${isPrimary})
      RETURNING id
    `;

    return { success: true, id: result[0].id };
  } catch (error) {
    console.error('Add image error:', error);
    return { success: false, error: 'Failed to add image' };
  }
}

/**
 * Remove image from product
 */
export async function removeProductImage(imageId: number): Promise<{ success: boolean; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    await sql`DELETE FROM product_images WHERE id = ${imageId}`;
    return { success: true };
  } catch (error) {
    console.error('Remove image error:', error);
    return { success: false, error: 'Failed to remove image' };
  }
}

/**
 * Set primary image for product
 */
export async function setPrimaryImage(productId: number, imageId: number): Promise<{ success: boolean; error?: string }> {
  const sql = await getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    await sql`UPDATE product_images SET is_primary = false WHERE product_id = ${productId}`;
    await sql`UPDATE product_images SET is_primary = true WHERE id = ${imageId}`;
    return { success: true };
  } catch (error) {
    console.error('Set primary image error:', error);
    return { success: false, error: 'Failed to set primary image' };
  }
}
