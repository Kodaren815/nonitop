#!/usr/bin/env node
/**
 * Database Migration Script
 * Run with: node scripts/migrate-db.mjs
 * Requires NETLIFY_DATABASE_URL environment variable
 */

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error('❌ NETLIFY_DATABASE_URL environment variable is not set');
  console.log('Run: netlify env:get NETLIFY_DATABASE_URL');
  process.exit(1);
}

const sql = neon(connectionString);

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Create admin_users table for authentication
    console.log('Creating admin_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ admin_users table created\n');

    // Create products table
    console.log('Creating products table...');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        price INTEGER NOT NULL,
        currency VARCHAR(10) DEFAULT 'SEK',
        size VARCHAR(100),
        stock INTEGER DEFAULT 0,
        category VARCHAR(50) NOT NULL,
        has_lining_option BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ products table created\n');

    // Create product_images table (supports multiple images per product)
    console.log('Creating product_images table...');
    await sql`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ product_images table created\n');

    // Create fabrics table
    console.log('Creating fabrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS fabrics (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        fabric_type VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ fabrics table created\n');

    // Create product_fabrics junction table
    console.log('Creating product_fabrics junction table...');
    await sql`
      CREATE TABLE IF NOT EXISTS product_fabrics (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE,
        fabric_role VARCHAR(20) DEFAULT 'outer',
        UNIQUE(product_id, fabric_id, fabric_role)
      )
    `;
    console.log('✅ product_fabrics table created\n');

    // Create admin_sessions table for secure session management
    console.log('Creating admin_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ admin_sessions table created\n');

    // Create indexes for better query performance
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fabrics_type ON fabrics(fabric_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)`;
    console.log('✅ Indexes created\n');

    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
