-- Add soft delete column to products table
-- Migration 002: Product Archive Support
-- Date: 2025-11-12

ALTER TABLE products ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1));

-- Index for filtering archived products
CREATE INDEX idx_products_archived ON products(is_archived);

-- Update schema version
INSERT INTO schema_version (version) VALUES (2);

