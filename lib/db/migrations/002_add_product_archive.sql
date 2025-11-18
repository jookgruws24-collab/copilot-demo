-- Add soft delete column to products table
-- Migration 002: Product Archive Support
-- Date: 2025-11-12

-- Add column with default value (SQLite doesn't support CHECK in ALTER TABLE in older versions)
ALTER TABLE products ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;

-- Index for filtering archived products
CREATE INDEX IF NOT EXISTS idx_products_archived ON products(is_archived);

-- Update schema version
INSERT INTO schema_version (version) VALUES (2);

