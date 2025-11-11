# Comprehensive Mock Data Summary

**Created**: 2025-11-11  
**Purpose**: Complete test data covering all statuses and edge cases

---

## 📊 Data Overview

### Employees (7 total)
- **1 Admin** - High balance (2000💎)
- **1 HR** - Medium balance (800💎)  
- **5 Users** - Various balances (0-1500💎)

### Achievements (7 total)
- **3 Ongoing** - Currently active
- **2 Upcoming** - Starting soon
- **2 Expired** - Past deadline

### Achievement Progress (10 records)
- **States**: 0%, 10%, 25%, 50%, 60%, 75%, 90%, 100% (ready to claim), claimed
- **Multiple users** with different progress levels

### Products (11 total)
- **Price range**: 15💎 - 2000💎
- **Availability**: In stock, low stock, out of stock (1 item)

### Purchases (7 total)
- **3 Pending** - Awaiting admin approval
- **2 Approved** - Successfully processed
- **2 Rejected** - With refunds and reasons

### History (13 records)
- Tracks all claims, purchases, approvals, rejections, refunds

---

## 🔑 Test Accounts

| Email | Password | Role | Balance | Use Case |
|-------|----------|------|---------|----------|
| admin@company.com | admin123 | Admin | 2000💎 | Admin testing, approvals |
| hr@company.com | hr123456 | HR | 800💎 | HR operations, achievement management |
| alice@company.com | user1234 | User | 1500💎 | High balance user, can buy expensive items |
| bob@company.com | user1234 | User | 500💎 | Medium balance, active progress |
| carol@company.com | user1234 | User | 150💎 | Low balance, limited options |
| david@company.com | user1234 | User | 0💎 | New employee, zero balance |
| eve@company.com | user1234 | User | 300💎 | Active user, multiple achievements |

---

## 🏆 Achievement Test Cases

### Ongoing Achievements (Active Now)

**1. Complete Onboarding** (100💎)
- Started: 7 days ago
- Ends: In 30 days
- Progress:
  - Alice: 100% (✅ **Ready to claim!**)
  - Bob: 50% (in progress)
  - Carol: 10% (just started)
  - Eve: 90% (almost done)

**2. First Month Excellence** (200💎)
- Started: 5 days ago
- Ends: In 25 days
- Progress:
  - Alice: 75% (in progress)
  - Eve: 100% (✅ **Ready to claim!**)

**3. Team Collaboration Master** (150💎)
- Started: 3 days ago
- Ends: In 45 days
- Progress:
  - Bob: 25% (early stage)
  - Eve: 60% (making good progress)

### Upcoming Achievements (Starting Soon)

**4. Q2 Sales Target** (300💎)
- Starts: In 7 days
- Ends: In 90 days
- **Status**: Not started yet

**5. Innovation Challenge Winner** (500💎)
- Starts: In 14 days
- Ends: In 120 days
- **Status**: Future opportunity

### Expired Achievements (Past Deadline)

**6. Year-End Sprint 2024** (250💎)
- Ended: 7 days ago
- **Claimed by**: Alice (250💎 received)
- **Status**: Completed & claimed

**7. Customer Satisfaction Award** (200💎)
- Ended: 10 days ago
- **Claimed by**: Carol (200💎 received)
- **Status**: Completed & claimed

---

## 🛒 Product Catalog

### Low-Cost Items (15-75💎)
1. **Sticker Pack** - 15💎 (200 available)
2. **Coffee Mug** - 25💎 (100 available)
3. **T-Shirt** - 50💎 (75 available)
4. **Water Bottle** - 75💎 (50 available)

### Medium-Cost Items (100-400💎)
5. **Wireless Mouse** - 100💎 (30 available)
6. **Noise-Cancelling Headphones** - 300💎 (15 available)
7. **Mechanical Keyboard** - 400💎 (10 available)

### High-Cost Items (600-2000💎)
8. **Standing Desk Converter** - 600💎 (5 available)
9. **Ergonomic Office Chair** - 1000💎 (3 available)
10. **MacBook Pro** - 2000💎 (2 available)

### Out of Stock
11. **Limited Edition Hoodie** - 150💎 (❌ 0 available)

---

## 🔄 Purchase Test Cases

### Pending Purchases (Need Admin Action)

**1. Alice → Wireless Mouse** (100💎)
- Quantity: 1
- Cost: 100💎
- Created: 1 day ago
- **Status**: ⏳ Pending approval
- **Test**: Approve or reject this

**2. Bob → T-Shirt** (100💎)
- Quantity: 2
- Cost: 100💎 (50💎 each)
- Created: 2 days ago
- **Status**: ⏳ Pending approval
- **Test**: Approve or reject this

**3. Carol → Coffee Mug** (25💎)
- Quantity: 1
- Cost: 25💎
- Created: Today
- **Status**: ⏳ Pending approval
- **Test**: Approve or reject this

### Approved Purchases (Success Cases)

**4. Alice → Sticker Pack** ✅
- Quantity: 3
- Cost: 45💎
- Created: 10 days ago
- Approved: 9 days ago
- Approved by: Admin
- **Status**: ✅ Approved & delivered

**5. Bob → Water Bottle** ✅
- Quantity: 1
- Cost: 75💎
- Created: 8 days ago
- Approved: 7 days ago
- Approved by: Admin
- **Status**: ✅ Approved & delivered

### Rejected Purchases (Refund Cases)

**6. Eve → Ergonomic Office Chair** ❌
- Quantity: 1
- Cost: 1000💎
- Created: 5 days ago
- Rejected: 4 days ago
- Rejected by: Admin
- **Reason**: "Out of budget allocation for this quarter"
- **Refund**: 1000💎 returned to Eve
- **Status**: ❌ Rejected with refund

**7. Carol → Limited Edition Hoodie** ❌
- Quantity: 1
- Cost: 150💎
- Created: 6 days ago
- Rejected: 5 days ago
- Rejected by: HR
- **Reason**: "Product out of stock"
- **Refund**: 150💎 returned to Carol
- **Status**: ❌ Rejected with refund

---

## 📜 History Timeline (Most Recent First)

| When | Employee | Type | Action | Details | Diamonds |
|------|----------|------|--------|---------|----------|
| Today | Carol | Purchase | Created | Coffee Mug (Pending) | -25💎 |
| 1 day ago | Alice | Purchase | Created | Wireless Mouse (Pending) | -100💎 |
| 2 days ago | Bob | Purchase | Created | 2x T-Shirt (Pending) | -100💎 |
| 3 days ago | Carol | Claim | Claimed | Customer Satisfaction Award | +200💎 |
| 4 days ago | Eve | Purchase | Rejected | Chair (Refunded) | +1000💎 |
| 5 days ago | Eve | Purchase | Created | Ergonomic Chair | -1000💎 |
| 5 days ago | Carol | Purchase | Rejected | Hoodie (Refunded) | +150💎 |
| 5 days ago | Alice | Claim | Claimed | Year-End Sprint 2024 | +250💎 |
| 6 days ago | Carol | Purchase | Created | Limited Edition Hoodie | -150💎 |
| 7 days ago | Bob | Purchase | Approved | Water Bottle | 0💎 |
| 8 days ago | Bob | Purchase | Created | Water Bottle | -75💎 |
| 9 days ago | Alice | Purchase | Approved | Sticker Pack | 0💎 |
| 10 days ago | Alice | Purchase | Created | 3x Sticker Pack | -45💎 |

---

## 🧪 Test Scenarios

### Scenario 1: Claim Ready Achievement
**As**: alice@company.com  
**Action**: View "Complete Onboarding" (100% progress)  
**Expected**: See "Claim Reward" button  
**Result**: +100💎, balance increases to 1600💎

### Scenario 2: Approve Pending Purchase
**As**: admin@company.com  
**Action**: Approve Bob's T-Shirt purchase  
**Expected**: Status changes to "Approved", Bob notified  
**Result**: Purchase complete, history updated

### Scenario 3: Reject with Reason
**As**: admin@company.com  
**Action**: Reject Alice's Wireless Mouse with reason  
**Expected**: 100💎 refunded to Alice, reason recorded  
**Result**: Alice balance increases, history shows refund

### Scenario 4: Cannot Purchase (Insufficient Balance)
**As**: carol@company.com (150💎)  
**Action**: Try to buy Mechanical Keyboard (400💎)  
**Expected**: Error: "Insufficient diamond balance"  
**Result**: Purchase blocked, balance unchanged

### Scenario 5: Cannot Purchase (Out of Stock)
**As**: alice@company.com  
**Action**: Try to buy Limited Edition Hoodie  
**Expected**: Disabled/unavailable  
**Result**: Cannot add to cart

### Scenario 6: Progress Tracking (Admin Only)
**As**: hr@company.com  
**Action**: Update Bob's "Complete Onboarding" from 50% to 100%  
**Expected**: Progress updated, Bob can now claim  
**Result**: Bob sees "Claim Reward" button

### Scenario 7: View History (Role-Based)
**As**: bob@company.com  
**Action**: View history  
**Expected**: See only Bob's transactions  
**Result**: 2 purchase records visible

**As**: admin@company.com  
**Action**: View history  
**Expected**: See ALL employees' transactions  
**Result**: All 13 history records visible

### Scenario 8: Filter History
**As**: admin@company.com  
**Action**: Filter by "rejected" purchases  
**Expected**: See 2 rejected purchases (Eve & Carol)  
**Result**: Filtered list with refund details

---

## 🎯 Edge Cases Covered

### Balance Edge Cases
- ✅ Zero balance (David)
- ✅ Low balance <100 (Carol - 150💎)
- ✅ High balance >1000 (Alice - 1500💎, Admin - 2000💎)

### Achievement Edge Cases
- ✅ Not started (David has no progress)
- ✅ Just started (Carol - 10%)
- ✅ In progress (various 25-90%)
- ✅ Ready to claim (Alice, Eve - 100%)
- ✅ Already claimed (Alice, Carol - expired achievements)
- ✅ Expired unclaimed (available in expired list)

### Purchase Edge Cases
- ✅ Pending approval (3 purchases)
- ✅ Approved (2 purchases)
- ✅ Rejected with refund (2 purchases)
- ✅ Out of stock item (Hoodie)
- ✅ Multiple quantities (Bob's T-Shirt x2, Alice's Stickers x3)

### Role Edge Cases
- ✅ Admin can approve/reject
- ✅ HR can manage achievements
- ✅ Users cannot access admin pages
- ✅ Users see only own history
- ✅ Admin sees all history

---

## 🔄 How to Reseed

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Delete database
Remove-Item lib\db\copilot-demo.db -Force

# 3. Run seed script
node scripts\seed.js

# 4. Restart dev server
npm run dev
```

---

## ✅ Data Validation

After seeding, verify:
- [ ] 7 employees created
- [ ] 5 invitation codes created
- [ ] 7 achievements with correct dates
- [ ] 10 progress records with various percentages
- [ ] 11 products with different prices
- [ ] 7 purchases (3 pending, 2 approved, 2 rejected)
- [ ] 13 history records
- [ ] All balances add up correctly
- [ ] Claimed achievements marked as claimed
- [ ] Refunded purchases show in history

---

**Status**: ✅ Ready to use  
**Coverage**: All statuses, roles, and edge cases included  
**Perfect for**: Development, testing, demos, training
