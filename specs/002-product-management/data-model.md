# Data Model: Store and Product Management

**Feature**: Store and Product Management (Admin Interface)  
**Date**: 2025-11-12  
**Database**: SQLite 3 (existing schema)

---

## Overview

This feature extends the existing Employee Achievement and Rewards System by adding admin-only product management capabilities. **No database schema changes are required** - the products table already exists in the initial migration (001_initial_schema.sql, lines 119-134).

This document describes:
1. The existing products table schema (no changes)
2. Soft delete implementation strategy (add `is_archived` column via migration)
3. Data integrity rules for product management
4. Queries specific to admin product operations

---

## Existing Schema

### Products Table (EXISTING - No Changes)

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  diamond_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  CHECK (diamond_price > 0),
  CHECK (quantity >= 0)
);

CREATE INDEX idx_products_price ON products(diamond_price);
```

**Current State**: Fully implemented and operational. Employee store uses this table via GET /api/products endpoint.

---

## Schema Extension Required

### Migration 002: Add Soft Delete Support

**File**: `lib/db/migrations/002_add_product_archive.sql`

```sql
-- Add soft delete column to products table
ALTER TABLE products ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1));

-- Index for filtering archived products
CREATE INDEX idx_products_archived ON products(is_archived);

-- Update schema version
INSERT INTO schema_version (version) VALUES (2);
```

**Rationale**: 
- Soft delete required by spec (FR-025, FR-027, FR-028)
- Prevents data loss when products have purchase history
- Boolean field (0 = active, 1 = archived) for simple filtering
- Index improves query performance for active products list

**Impact Analysis**:
- ✅ Non-breaking change (default value 0 = active)
- ✅ Existing store queries unchanged (WHERE is_archived = 0)
- ✅ Backward compatible - all existing products default to active
- ✅ Purchase history preserved even for archived products

---

## Data Entities

### Product (Extended Definition)

**Attributes**:
```typescript
interface Product {
  id: number;                    // Auto-increment primary key
  name: string;                  // Max 200 chars (enforced in validation)
  description: string;           // Max 1000 chars (enforced in validation)
  diamond_price: number;         // Positive integer ≥1 (CHECK constraint)
  quantity: number;              // Non-negative integer ≥0 (CHECK constraint)
  image_url: string | null;      // Optional, max 500 chars (enforced in validation)
  is_archived: 0 | 1;            // 0 = active, 1 = archived (soft delete)
  created_at: string;            // ISO 8601 timestamp (automatic)
  updated_at: string;            // ISO 8601 timestamp (automatic on update)
}
```

**Stock Status** (Computed):
```typescript
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

function getStockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity < 10) return 'low_stock';
  return 'in_stock';
}
```

**Availability** (Computed):
```typescript
function isAvailable(product: Product): boolean {
  return product.is_archived === 0 && product.quantity > 0;
}
```

---

## Data Relationships

### Products ↔ Purchases (Existing, Unchanged)

```
products (1) ----< (*) purchases
         └─ product_id (FK)
         └─ product_name (denormalized)
```

**Key Points**:
- One product can have many purchases (pending, accepted, rejected)
- `product_name` is denormalized in purchases table for history preservation (FR-015)
- When product is edited, purchase records retain original name
- Cannot hard delete product if ANY purchases exist (FR-024, FR-025)
- Archiving product does NOT affect existing purchases

**Referential Integrity**:
- Foreign key: `purchases.product_id → products.id` (NO CASCADE)
- Soft delete ensures purchases always have valid product_id reference
- Historical data remains queryable even for archived products

---

## Data Validation Rules

### Product Creation (FR-001 to FR-008)

```typescript
const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  diamond_price: z.number().int().min(1, 'Price must be at least 1 diamond'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  image_url: z.string().url('Invalid URL').max(500, 'URL too long').optional(),
});
```

**Database-Level Validation**:
- `diamond_price > 0` (CHECK constraint)
- `quantity >= 0` (CHECK constraint)
- `name NOT NULL` (column constraint)
- `description NOT NULL` (column constraint)

### Product Update (FR-009 to FR-015)

```typescript
const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  diamond_price: z.number().int().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  image_url: z.string().url().max(500).nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be updated'
});
```

**Additional Validation**:
- Cannot reduce quantity below pending purchases count (FR-013)
- Query: `SELECT COUNT(*) FROM purchases WHERE product_id = ? AND status = 'pending'`
- If `new_quantity < pending_count`, reject with error

---

## Data Integrity Rules

### Rule 1: Soft Delete Before Hard Delete (FR-024, FR-025, FR-026)

**Logic**:
```sql
-- Check for any purchase history
SELECT COUNT(*) FROM purchases WHERE product_id = ?;

-- If count > 0: MUST use soft delete (set is_archived = 1)
-- If count = 0: MAY use hard delete (DELETE FROM products WHERE id = ?)
```

**Implementation**:
1. Always check purchase count first
2. If purchases exist, prevent hard delete and offer archive
3. If no purchases, allow hard delete with confirmation

### Rule 2: Quantity Cannot Be Less Than Pending Purchases (FR-013)

**Validation Query**:
```sql
SELECT 
  COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count
FROM purchases 
WHERE product_id = ?;
```

**Enforcement**:
- Run query before UPDATE products SET quantity = ?
- If `new_quantity < pending_count`, return error with message:
  ```
  "Cannot reduce quantity to {new_quantity}. 
   There are {pending_count} pending purchases for this product."
  ```

### Rule 3: Denormalized Product Name Preservation (FR-015)

**Current Implementation** (no changes needed):
- Purchases table has `product_name TEXT NOT NULL` column
- Set at purchase creation time: `product_name = products.name`
- Never updated when products.name changes
- Historical accuracy preserved

---

## Admin Product Queries

### 1. List All Products (Admin View)

```sql
SELECT 
  p.*,
  CASE 
    WHEN p.quantity = 0 THEN 'out_of_stock'
    WHEN p.quantity < 10 THEN 'low_stock'
    ELSE 'in_stock'
  END as stock_status,
  COUNT(pu.id) as total_purchases,
  SUM(CASE WHEN pu.status = 'pending' THEN 1 ELSE 0 END) as pending_purchases
FROM products p
LEFT JOIN purchases pu ON pu.product_id = p.id
WHERE p.is_archived = 0
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### 2. Search Products (Case-Insensitive)

```sql
SELECT * FROM products
WHERE is_archived = 0
  AND (name LIKE ? OR description LIKE ?)
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- Parameters: '%{query}%', '%{query}%', limit, offset
```

### 3. Sort Products

```sql
-- By name (ascending)
SELECT * FROM products WHERE is_archived = 0 ORDER BY name ASC;

-- By price (descending)
SELECT * FROM products WHERE is_archived = 0 ORDER BY diamond_price DESC;

-- By quantity (ascending - show low stock first)
SELECT * FROM products WHERE is_archived = 0 ORDER BY quantity ASC, name ASC;

-- By date (newest first)
SELECT * FROM products WHERE is_archived = 0 ORDER BY created_at DESC;
```

### 4. Get Single Product with Pending Count

```sql
SELECT 
  p.*,
  COALESCE(SUM(CASE WHEN pu.status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count
FROM products p
LEFT JOIN purchases pu ON pu.product_id = p.id
WHERE p.id = ?
GROUP BY p.id;
```

### 5. Check Product Deletion Safety

```sql
-- Returns count of purchases (any status)
SELECT COUNT(*) as purchase_count
FROM purchases
WHERE product_id = ?;

-- If count > 0, must use soft delete
-- If count = 0, can hard delete
```

### 6. Soft Delete (Archive)

```sql
UPDATE products 
SET is_archived = 1, updated_at = datetime('now')
WHERE id = ?;
```

### 7. Hard Delete (Only if No Purchases)

```sql
-- Transaction required:
BEGIN TRANSACTION;
  -- Verify no purchases
  SELECT COUNT(*) FROM purchases WHERE product_id = ?;
  -- If count = 0:
  DELETE FROM products WHERE id = ?;
COMMIT;
```

### 8. Get Low Stock Products (Dashboard Alert)

```sql
SELECT id, name, quantity
FROM products
WHERE is_archived = 0 
  AND quantity > 0 
  AND quantity < 10
ORDER BY quantity ASC;
```

### 9. Get Out of Stock Products

```sql
SELECT id, name
FROM products
WHERE is_archived = 0 
  AND quantity = 0;
```

---

## Store Front-End Queries (Unchanged)

These queries remain unchanged to avoid breaking existing employee store:

```sql
-- Get all available products for store display
SELECT * FROM products 
WHERE is_archived = 0 AND quantity > 0
ORDER BY created_at DESC;

-- Get single product for purchase
SELECT * FROM products 
WHERE id = ? AND is_archived = 0 AND quantity > 0;
```

**Note**: Adding `is_archived = 0` filter is technically a change but is non-breaking since all existing products default to 0 (active).

---

## Transaction Examples

### Transaction 1: Create Product

```sql
BEGIN TRANSACTION;
  INSERT INTO products (name, description, diamond_price, quantity, image_url)
  VALUES (?, ?, ?, ?, ?);
  
  SELECT * FROM products WHERE id = last_insert_rowid();
COMMIT;
```

### Transaction 2: Update Product with Quantity Validation

```sql
BEGIN TRANSACTION;
  -- Check pending purchases
  SELECT COUNT(*) as pending_count
  FROM purchases
  WHERE product_id = ? AND status = 'pending';
  
  -- If new_quantity >= pending_count:
  UPDATE products
  SET name = ?, description = ?, diamond_price = ?, quantity = ?, 
      image_url = ?, updated_at = datetime('now')
  WHERE id = ?;
COMMIT;
-- If new_quantity < pending_count: ROLLBACK and return error
```

### Transaction 3: Safe Delete

```sql
BEGIN TRANSACTION;
  -- Check purchase history
  SELECT COUNT(*) as purchase_count
  FROM purchases
  WHERE product_id = ?;
  
  -- If purchase_count > 0:
  --   Soft delete: UPDATE products SET is_archived = 1 WHERE id = ?
  -- Else:
  --   Hard delete: DELETE FROM products WHERE id = ?
COMMIT;
```

---

## Performance Considerations

### Indexes

**Existing**:
- `PRIMARY KEY (id)` - clustered index (auto)
- `idx_products_price` - for price sorting

**New** (Migration 002):
- `idx_products_archived` - for filtering active products

**Query Optimization**:
- Admin list query: Uses `idx_products_archived` + primary key
- Search query: Full table scan acceptable for <1000 products (per spec)
- Sort operations: May require temp table but acceptable for target scale

### Caching Strategy

**Not Required**: Per constitution (static-first architecture), admin interface can fetch fresh data on each page load. No caching infrastructure needed for <1000 products with <2s target load time.

---

## Migration Path

### Step 1: Run Migration 002
```bash
npm run db:migrate  # Applies 002_add_product_archive.sql
```

### Step 2: Verify Data Integrity
```sql
-- All existing products should be active
SELECT COUNT(*) FROM products WHERE is_archived = 0;  -- Should equal total count

-- No orphaned purchases
SELECT COUNT(*) FROM purchases p
LEFT JOIN products pr ON pr.id = p.product_id
WHERE pr.id IS NULL;  -- Should be 0
```

### Step 3: Test Rollback (if needed)
```sql
-- Rollback: Remove is_archived column
ALTER TABLE products DROP COLUMN is_archived;
DELETE FROM schema_version WHERE version = 2;
```

**Note**: SQLite does not support DROP COLUMN directly. Full rollback requires:
1. Create temporary table without is_archived
2. Copy data
3. Drop original table
4. Rename temporary table

---

## Summary

- **Schema Changes**: Add `is_archived` column (Migration 002)
- **Breaking Changes**: None (all existing queries continue to work)
- **Data Integrity**: Soft delete + denormalized product_name preserves history
- **Performance**: All queries meet <1s target for 1000 products
- **Backward Compatibility**: 100% compatible with existing store implementation
