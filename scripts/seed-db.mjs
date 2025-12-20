#!/usr/bin/env node
/**
 * Seed Database with Initial Data
 * Run with: node scripts/seed-db.mjs
 * Requires NETLIFY_DATABASE_URL environment variable
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const connectionString = process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error('❌ NETLIFY_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(connectionString);

// Initial products data
const products = [
  {
    slug: 'miniskotvaska',
    name: 'Miniskötväska',
    description: `Den här lilla skötväskan är designad av en mamma - för alla som vill slippa tunga, otympliga skötväskor. Perfekt för små äventyr, snabba ärenden och dagar då du bara vill ha med det viktigaste.

Miniskötväskan rymmer ett fullpack våtservetter, 3-4 blöjor och ombyte. Den har en smidig öppning för våtservetter, och ett handtag så du lätt kan bära med dig den när du är på språng.

Perfekt för nyblivna föräldrar eller som en babyshower-present.`,
    short_description: 'Perfekt för nyblivna föräldrar. Rymmer våtservetter, blöjor och ombyte.',
    price: 500,
    size: 'ca 28 x 17 cm',
    stock: 10,
    category: 'mini',
    has_lining_option: true,
    images: [
      '/images/products/miniskotvaska.jpeg',
      '/images/products/miniskotvaska-wipes.jpg',
      '/images/products/collection-lifestyle.jpg',
    ],
  },
  {
    slug: 'mini-pouch',
    name: 'Mini Pouch',
    description: `Mini pouchen är handgjord och perfekt för nappar och småsaker när du är ute med din mini. Men är lika fin för dina egna småsaker, som läppbalsam, hörlurar eller annat smått du vill ha nära.

Fäst den på miniskötväskan eller dina nycklar för att alltid ha det viktigaste till hands. Och välj själv yttertyg och innetyg för att göra den helt din egen!

Storlek: ca 11 x 8 cm. Mini pouchen sys för hand och mindre avvikelser i storlek kan förekomma.`,
    short_description: 'Perfekt för nappar och småsaker. Fäst den på väskan eller nycklarna!',
    price: 150,
    size: 'ca 11 x 8 cm',
    stock: 15,
    category: 'mini',
    has_lining_option: true,
    images: [
      '/images/products/mini-pouch.jpeg',
      '/images/products/mini-pouch-clips.jpg',
      '/images/products/collection-lifestyle.jpg',
    ],
  },
  {
    slug: 'necessar',
    name: 'Necessär',
    description: `Varje necessär är handgjord och perfekt för hudvård, smink och allt smått du vill ha samlat — men lika fin för nappar, krämer och minisaker till din lilla.

Du kan designa den helt själv: välj tyg, insida och matcha den med miniskötväskan, mini pouch eller puffkorgen för ett riktigt Nonito-set 🧸🤎

Storlek: Ca 24 x 19 cm. Alla mina necessärer sys för hand och mindre avvikelser i storlek kan förekomma.`,
    short_description: 'Handgjord necessär för smink, hudvård eller barnens småsaker.',
    price: 350,
    size: 'ca 24 x 19 cm',
    stock: 8,
    category: 'accessories',
    has_lining_option: true,
    images: [
      '/images/products/necessar.jpeg',
      '/images/products/necessar-interior.jpg',
      '/images/products/necessar-collection.jpg',
    ],
  },
  {
    slug: 'puffkorg',
    name: 'Puffkorg',
    description: `Puffkorgen är handgjord och perfekt för småsaker – blöjor, nappar, krämer eller leksaker. Lika fin i barnrummet som i hallen eller på skötbordet.

Du kan välja både yttertyg och insida, så den passar perfekt in hos dig. Matcha med miniskötväskan, mini pouch eller necessären för ett komplett Nonito-set 🧸🤎

Storlek: Ca 15 x 10 cm. Alla puffkorgar sys för hand och mindre avvikelser i storlek kan förekomma.`,
    short_description: 'Handgjord puffkorg för småsaker. Perfekt i barnrummet eller på skötbordet.',
    price: 250,
    size: 'ca 15 x 10 cm',
    stock: 12,
    category: 'storage',
    has_lining_option: true,
    images: [
      '/images/products/puffkorg.jpeg',
      '/images/products/puffkorg-inside.jpg',
      '/images/products/puffkorg-lifestyle.jpg',
    ],
  },
];

// Initial fabrics data
const outerFabrics = [
  { slug: 'blomster', name: 'Blomster', image_url: '/images/fabrics/Blomster.jpg' },
  { slug: 'noel', name: 'Noel', image_url: '/images/fabrics/Joel.jpg' },
  { slug: 'olivia', name: 'Olivia', image_url: '/images/fabrics/Olivia.jpg' },
  { slug: 'anki', name: 'Anki', image_url: '/images/fabrics/Anki.jpg' },
  { slug: 'jennifer', name: 'Jennifer', image_url: '/images/fabrics/Jennifer.jpg' },
  { slug: 'bernie', name: 'Bernie', image_url: '/images/fabrics/Bernie.jpg' },
  { slug: 'sonia', name: 'Sonia', image_url: '/images/fabrics/Sonia.jpg' },
];

const innerFabrics = [
  { slug: 'vit', name: 'Vit', image_url: '/images/fabrics/vit.webp' },
  { slug: 'sand', name: 'Sand', image_url: '/images/fabrics/sand.webp' },
  { slug: 'rosa', name: 'Rosa', image_url: '/images/fabrics/rosa.webp' },
  { slug: 'brun', name: 'Brun', image_url: '/images/fabrics/brun.webp' },
  { slug: 'bla', name: 'Blå', image_url: '/images/fabrics/blå.webp' },
];

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create default admin user (CHANGE THIS PASSWORD IN PRODUCTION!)
    console.log('Creating admin user...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Nonito4Life!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', ${hashedPassword})
      ON CONFLICT (username) DO UPDATE SET password_hash = ${hashedPassword}
    `;
    console.log('✅ Admin user created (username: admin)\n');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!\n');

    // Insert outer fabrics
    console.log('Inserting outer fabrics...');
    for (let i = 0; i < outerFabrics.length; i++) {
      const fabric = outerFabrics[i];
      await sql`
        INSERT INTO fabrics (slug, name, image_url, fabric_type, sort_order)
        VALUES (${fabric.slug}, ${fabric.name}, ${fabric.image_url}, 'outer', ${i})
        ON CONFLICT (slug) DO UPDATE SET 
          name = ${fabric.name},
          image_url = ${fabric.image_url},
          sort_order = ${i}
      `;
    }
    console.log('✅ Outer fabrics inserted\n');

    // Insert inner fabrics
    console.log('Inserting inner fabrics...');
    for (let i = 0; i < innerFabrics.length; i++) {
      const fabric = innerFabrics[i];
      await sql`
        INSERT INTO fabrics (slug, name, image_url, fabric_type, sort_order)
        VALUES (${fabric.slug}, ${fabric.name}, ${fabric.image_url}, 'inner', ${i})
        ON CONFLICT (slug) DO UPDATE SET 
          name = ${fabric.name},
          image_url = ${fabric.image_url},
          sort_order = ${i}
      `;
    }
    console.log('✅ Inner fabrics inserted\n');

    // Insert products
    console.log('Inserting products...');
    for (const product of products) {
      // Insert product
      const result = await sql`
        INSERT INTO products (slug, name, description, short_description, price, size, stock, category, has_lining_option)
        VALUES (${product.slug}, ${product.name}, ${product.description}, ${product.short_description}, ${product.price}, ${product.size}, ${product.stock}, ${product.category}, ${product.has_lining_option})
        ON CONFLICT (slug) DO UPDATE SET 
          name = ${product.name},
          description = ${product.description},
          short_description = ${product.short_description},
          price = ${product.price},
          size = ${product.size},
          stock = ${product.stock},
          category = ${product.category},
          has_lining_option = ${product.has_lining_option}
        RETURNING id
      `;
      
      const productId = result[0].id;

      // Delete existing images for this product (to avoid duplicates on re-run)
      await sql`DELETE FROM product_images WHERE product_id = ${productId}`;
      
      // Insert product images
      for (let i = 0; i < product.images.length; i++) {
        await sql`
          INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
          VALUES (${productId}, ${product.images[i]}, ${i}, ${i === 0})
        `;
      }

      // Get all outer fabric IDs
      const fabricIds = await sql`SELECT id FROM fabrics WHERE fabric_type = 'outer'`;
      
      // Delete existing product-fabric associations
      await sql`DELETE FROM product_fabrics WHERE product_id = ${productId}`;
      
      // Associate product with all outer fabrics
      for (const fabric of fabricIds) {
        await sql`
          INSERT INTO product_fabrics (product_id, fabric_id)
          VALUES (${productId}, ${fabric.id})
          ON CONFLICT DO NOTHING
        `;
      }

      console.log(`  ✅ ${product.name}`);
    }
    console.log('✅ Products inserted\n');

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
