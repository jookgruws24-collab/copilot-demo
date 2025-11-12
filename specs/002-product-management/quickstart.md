# Quickstart Guide: Product Management

**Feature**: Store and Product Management (Admin Interface)  
**Audience**: System Administrators  
**Prerequisites**: Admin role access to the Employee Rewards System

---

## Overview

This guide helps administrators manage the product catalog for the Employee Rewards Store. Products are purchased by employees using earned diamonds from achievements.

**Key Capabilities**:
- Create new products
- Edit existing products (name, description, price, quantity, image)
- Search and filter products
- Archive or delete products safely
- Monitor stock levels

---

## Quick Reference

### URLs

- **Admin Product Management**: `/admin/products`
- **Create Product**: `/admin/products/create`
- **Edit Product**: `/admin/products/{id}/edit`
- **Employee Store** (view only): `/store`

### Stock Status Indicators

| Status | Meaning | Color |
|--------|---------|-------|
| **In Stock** | Quantity ≥ 10 | Green |
| **Low Stock** | Quantity 1-9 | Yellow |
| **Out of Stock** | Quantity = 0 | Red |

---

## Getting Started

### Step 1: Access Product Management

1. Log in with admin credentials
2. Navigate to **Admin** → **Products** in the sidebar
3. You'll see the product list with search and create options

### Step 2: Create Your First Product

1. Click **"Create Product"** button
2. Fill in the required fields:
   - **Name**: Short product name (e.g., "Coffee Mug")
   - **Description**: Detailed description (e.g., "Premium ceramic mug with company logo")
   - **Diamond Price**: Cost in diamonds (minimum 1)
   - **Quantity**: Available stock (minimum 0)
   - **Image URL** *(optional)*: Link to product image
3. Click **"Create Product"**
4. Product immediately appears in employee store

### Step 3: Monitor and Manage

- View all products in the main list
- Use search box to find specific products
- Click column headers to sort (name, price, quantity, date)
- Edit products using the **Edit** button
- Archive or delete products using the **Delete** button

---

## Common Tasks

### Creating a Product

**Required Information**:
- Name (1-200 characters)
- Description (1-1000 characters)
- Diamond price (positive integer ≥ 1)
- Quantity (non-negative integer ≥ 0)

**Optional Information**:
- Image URL (must be valid URL, max 500 characters)

**Example**:
```
Name: Wireless Mouse
Description: Ergonomic wireless mouse with USB receiver. Works on all operating systems.
Diamond Price: 150
Quantity: 25
Image URL: https://cdn.company.com/products/mouse.jpg
```

**Validation Rules**:
- Name cannot be empty
- Price must be at least 1 diamond
- Quantity cannot be negative
- Image URL must be valid format (if provided)

### Editing a Product

1. Find product in list (use search if needed)
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Save Changes"**

**Important**:
- Changing product name does NOT affect purchase history (old name preserved)
- Changing price affects ONLY future purchases
- Reducing quantity below pending purchases is prevented

**Example - Quantity Update Blocked**:
```
Current Quantity: 10
Pending Purchases: 8
Attempted New Quantity: 5
Result: ERROR - "Cannot reduce quantity to 5. There are 8 pending purchases."
Action: Approve/reject pending purchases first, OR increase quantity
```

### Searching Products

**Search Box**: Type product name or description keyword
- Case-insensitive
- Matches partial text
- Real-time filtering

**Examples**:
- Search "coffee" → finds "Coffee Mug", "Coffee Beans"
- Search "wireless" → finds "Wireless Mouse", "Wireless Keyboard"

### Sorting Products

Click column headers to toggle sort order:
- **Name**: A-Z or Z-A
- **Price**: Low-to-High or High-to-Low
- **Quantity**: Low-to-High (shows low stock first) or High-to-Low
- **Date**: Newest or Oldest first

**Tip**: Sort by Quantity (ascending) to quickly identify low stock products.

### Deleting Products

**Two Types of Deletion**:

#### 1. Hard Delete (Permanent Removal)
- **When**: Product has ZERO purchase history
- **Effect**: Product completely removed from database
- **Reversible**: No (permanent)

#### 2. Soft Delete (Archive)
- **When**: Product has ANY purchase history (pending, accepted, or rejected)
- **Effect**: Product hidden from store but data preserved
- **Reversible**: Database admin can reverse

**Deletion Flow**:
1. Click **"Delete"** button on product
2. System checks for purchase history
3. If purchases exist: **Archive** option offered
4. If no purchases: **Hard Delete** option shown
5. Confirm action in dialog
6. Product removed or archived

**Why Archive?**:
- Preserves historical purchase records
- Maintains data integrity
- Allows reporting on past purchases
- Product name and details remain queryable

### Managing Stock Levels

**When to Restock**:
- Monitor **Low Stock** indicator (yellow badge)
- Check **Out of Stock** products (red badge)
- Review products with pending purchases

**Restocking Process**:
1. Edit product
2. Update **Quantity** field to new stock level
3. Save changes
4. Stock status updates automatically

**Inventory Tips**:
- Popular products: Keep quantity ≥ 20
- Seasonal items: Adjust before high-demand periods
- Out-of-stock products hidden from employee store automatically

---

## Stock Alerts

**Low Stock Alert** (< 10 units):
- Yellow badge on product row
- Review and restock soon

**Out of Stock Alert** (0 units):
- Red badge on product row
- Product invisible to employees in store
- No purchases possible until restocked

**Dashboard Summary** *(future feature)*:
- Count of low stock products
- Count of out-of-stock products
- Quick access to restock

---

## Data Validation and Errors

### Common Validation Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Name is required" | Empty name field | Enter product name |
| "Price must be at least 1 diamond" | Price set to 0 or negative | Set price ≥ 1 |
| "Quantity cannot be negative" | Negative quantity entered | Set quantity ≥ 0 |
| "Invalid URL" | Malformed image URL | Check URL format |
| "Cannot reduce quantity..." | New quantity < pending purchases | Approve pending purchases first |

### Permission Errors

**"Only admins can manage products"**:
- You do not have admin role
- Contact HR or system admin to upgrade account

**"Not authenticated"**:
- Session expired
- Log in again

---

## Best Practices

### Product Naming
- ✅ Keep names concise (2-4 words)
- ✅ Use title case: "Wireless Mouse"
- ❌ Avoid: "wireless mouse" or "WIRELESS MOUSE"

### Product Descriptions
- ✅ Include key features and benefits
- ✅ Mention compatibility or requirements
- ✅ Use 2-3 sentences minimum
- ❌ Avoid: Single-word descriptions

### Pricing Strategy
- Popular items: 50-100 diamonds
- Premium items: 100-300 diamonds
- Luxury items: 300+ diamonds
- Review achievement diamond rewards to ensure balance

### Stock Management
- Order buffer: Keep 20% extra stock
- Monitor purchase velocity
- Seasonal adjustment: Increase for holidays
- Archive discontinued products (don't delete)

### Images
- Use consistent image dimensions
- Host on CDN for performance
- Use HTTPS URLs only
- Placeholder if no image available

---

## Troubleshooting

### Problem: Cannot Delete Product

**Symptom**: Delete button blocked or shows archive option

**Cause**: Product has purchase history (any status)

**Solution**: 
1. Archive instead of delete (preserves history)
2. OR approve/reject all pending purchases, then archive

**Why**: System prevents data loss for historical reporting

---

### Problem: Quantity Update Rejected

**Symptom**: "Cannot reduce quantity" error message

**Cause**: Trying to set quantity below pending purchases count

**Solution**:
1. Go to **Admin** → **Approvals**
2. Approve or reject pending purchases for this product
3. Return to product edit and update quantity

**Example**:
- Product has 12 pending purchases
- Cannot set quantity to 10 (12 > 10)
- Must set quantity to ≥ 12

---

### Problem: Product Not Showing in Store

**Symptom**: Employees can't see product

**Possible Causes and Solutions**:

1. **Out of Stock**: Quantity = 0
   - Solution: Edit product, increase quantity

2. **Archived**: Product soft-deleted
   - Solution: Database admin can restore

3. **Just Created**: Cache delay (<10 seconds)
   - Solution: Wait 10 seconds and refresh

---

### Problem: Image Not Displaying

**Symptom**: Broken image icon or missing image

**Possible Causes**:
1. Invalid URL format
2. Image host requires authentication
3. HTTP (not HTTPS) URL
4. Image deleted from host

**Solution**:
- Edit product
- Update image URL with valid, public, HTTPS link
- Or leave blank for placeholder image

---

## FAQ

### Q: Can employees see archived products?
**A**: No. Archived products are hidden from the employee store. Only admins can see them (with "include archived" filter).

### Q: Can I restore an archived product?
**A**: Not through the UI. Contact database admin to update `is_archived` field.

### Q: What happens to purchases when I edit product details?
**A**: Historical purchases retain the original product name. Only future purchases use the new details.

### Q: Can I change the price of a product?
**A**: Yes. The new price applies to future purchases only. Existing purchases (pending, accepted, rejected) keep their original price.

### Q: How do I reorder products in the store?
**A**: Products are ordered by creation date (newest first) for employees. Admins can sort by any column.

### Q: Can multiple admins edit the same product?
**A**: Yes, but last save wins. Be aware of concurrent edits to avoid overwriting changes.

### Q: Is there a product limit?
**A**: System supports up to 1000 products efficiently. Contact support if you need more.

### Q: How do I add product categories?
**A**: Not supported in current version. All products in a flat list. Categories are future enhancement.

### Q: Can I bulk upload products?
**A**: Not currently. Each product must be created individually. Bulk import is a future enhancement.

---

## Integration with Purchases

### Purchase Flow
1. Employee browses store (`/store`)
2. Employee selects product and clicks "Purchase"
3. Purchase enters **Pending** status
4. Admin reviews in **Approvals** section
5. Admin approves → diamonds deducted, purchase complete
6. Admin rejects → diamonds refunded

### Product Quantity Updates
- Purchase request: Quantity decremented immediately
- Purchase rejection: Quantity incremented (refund)
- Purchase approval: No quantity change (already decremented)

---

## Next Steps

1. **Create initial product catalog**
   - Start with 5-10 popular items
   - Set reasonable prices (50-150 diamonds)
   - Ensure adequate stock levels

2. **Monitor store activity**
   - Check **Admin** → **Approvals** daily
   - Review low stock alerts weekly
   - Update prices based on employee feedback

3. **Expand catalog gradually**
   - Add new products monthly
   - Archive discontinued items
   - Balance diamond economy

4. **Review analytics** *(future feature)*
   - Most purchased products
   - Revenue by product
   - Employee satisfaction

---

## Support

**For Technical Issues**:
- Check troubleshooting section above
- Contact system administrator
- Review error messages carefully

**For Product Suggestions**:
- Gather employee feedback
- Consider seasonal items
- Balance catalog variety

**For Training**:
- Share this quickstart guide with new admins
- Schedule onboarding session
- Practice in test environment first

---

## Summary

Product management is straightforward:
1. **Create** products with clear names and descriptions
2. **Monitor** stock levels and adjust quantities
3. **Edit** products as needed (prices, descriptions, images)
4. **Archive** discontinued products (preserve history)
5. **Approve** purchase requests promptly

The system automatically handles:
- Stock validation
- Purchase history preservation
- Employee store visibility
- Data integrity checks

Focus on curating a great product catalog that employees love! 🎉
