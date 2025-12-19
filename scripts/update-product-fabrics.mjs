#!/usr/bin/env node
/**
 * Update product_fabrics table to add fabric_role column
 * Run with: node scripts/update-product-fabrics.mjs
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

async function updateSchema() {
  console.log('🚀 Updating product_fabrics table...\n');

  try {
    // Check if fabric_role column exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'product_fabrics' AND column_name = 'fabric_role'
    `;

    if (columns.length === 0) {
      console.log('Adding fabric_role column...');
      await sql`
        ALTER TABLE product_fabrics 
        ADD COLUMN fabric_role VARCHAR(20) DEFAULT 'outer'
      `;
      console.log('✅ fabric_role column added\n');

      // Update existing records - fabrics with type 'outer' get role 'outer', type 'inner' get role 'inner'
      console.log('Updating existing fabric associations...');
      await sql`
        UPDATE product_fabrics pf
        SET fabric_role = f.fabric_type
        FROM fabrics f
        WHERE pf.fabric_id = f.id
      `;
      console.log('✅ Existing associations updated\n');

      // Drop old unique constraint and create new one
      console.log('Updating unique constraint...');
      try {
        await sql`
          ALTER TABLE product_fabrics 
          DROP CONSTRAINT IF EXISTS product_fabrics_product_id_fabric_id_key
        `;
      } catch (e) {
        // Constraint might not exist
      }
      
      await sql`
        ALTER TABLE product_fabrics 
        ADD CONSTRAINT product_fabrics_product_fabric_role_key 
        UNIQUE (product_id, fabric_id, fabric_role)
      `;
      console.log('✅ Unique constraint updated\n');
    } else {
      console.log('✅ fabric_role column already exists\n');
    }

    console.log('🎉 Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateSchema();
