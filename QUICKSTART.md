# Quick Start Guide: Employee Achievement and Rewards System

**Last Updated**: 2025-11-10  
**Prerequisites**: Node.js 20+, npm

---

## Development Setup

### 1. Install Dependencies

```bash
npm install

# Install additional dependencies for this feature
npm install better-sqlite3 bcryptjs zod
npm install --save-dev @types/better-sqlite3 @types/bcryptjs
```

### 2. Initialize Database

The database will be automatically created and migrated on first run. To manually initialize:

```bash
# Create database directory
mkdir -p lib/db

# Run migrations (happens automatically when starting dev server)
npm run dev
```

### 3. Seed Development Data

Run the seed script to populate with sample data:

```bash
# TODO: Create seed script
node lib/db/seed.js
```

---

## Sample Data (Seed Script)

### Test Accounts

After seeding, use these accounts for testing:

| Email | Password | Role | Employee ID | Diamond Balance | Invitation Code Used |
|-------|----------|------|-------------|-----------------|---------------------|
| admin@company.com | password123 | admin | EMP001 | 1000 | WELCOME1 |
| hr1@company.com | password123 | hr | EMP002 | 500 | WELCOME1 |
| hr2@company.com | password123 | hr | EMP003 | 500 | WELCOME1 |
| alice@company.com | password123 | user | EMP004 | 250 | SALES2K5 |
| bob@company.com | password123 | user | EMP005 | 150 | SALES2K5 |
| carol@company.com | password123 | user | EMP006 | 100 | ENGR2025 |
| dave@company.com | password123 | user | EMP007 | 50 | NULL |
| eve@company.com | password123 | user | EMP008 | 200 | NULL |
| frank@company.com | password123 | user | EMP009 | 0 | NULL |
| grace@company.com | password123 | user | EMP010 | 300 | NULL |

### Sample Invitation Codes

| Code | Label | Created By | Status | Usage Count |
|------|-------|------------|--------|-------------|
| WELCOME1 | General Onboarding | Admin | Active | 3 |
| SALES2K5 | Q1 2025 Sales Team | HR1 | Active | 2 |
| ENGR2025 | Engineering Hires | HR2 | Active | 1 |
| INACTIVE | Old Campaign | Admin | Inactive | 0 |
| NOLABEL1 | (no label) | Admin | Active | 0 |

### Sample Achievements

| Title | Diamonds | Start Date | End Date | Status |
|-------|----------|------------|----------|--------|
| Complete Onboarding | 50 | -7 days | +30 days | Active |
| First Project Delivery | 100 | -7 days | +60 days | Active |
| Team Collaboration Award | 75 | +7 days | +90 days | Upcoming |
| Innovation Challenge | 200 | +14 days | +120 days | Upcoming |
| Legacy Code Cleanup | 150 | -90 days | -1 day | Expired |

### Sample Products

| Name | Diamond Price | Quantity |
|------|---------------|----------|
| Coffee Mug | 25 | 100 |
| T-Shirt | 50 | 50 |
| Wireless Mouse | 100 | 30 |
| Noise-Cancelling Headphones | 200 | 10 |
| Mechanical Keyboard | 250 | 5 |
| Standing Desk | 500 | 3 |
| Ergonomic Chair | 750 | 2 |
| MacBook Pro | 1500 | 1 |

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### Build for Production

```bash
npm run build
```

### Run Linter

```bash
npm run lint
```

---

## Testing Scenarios

### Scenario 1: Employee Registration with Invitation Code

1. **Navigate** to http://localhost:3000/register
2. **Enter**:
   - Employee ID: EMP999
   - Name: Test User
   - Email: test@company.com
   - Password: password123
   - Contact: 555-1234
   - Address: 123 Test St
   - Invitation Code: WELCOME1 (optional)
3. **Submit** form
4. **Verify**: 
   - Redirected to /login
   - Invitation code "WELCOME1" recorded in profile
5. **Login** with email and password
6. **Verify**: Redirected to /dashboard/profile

**Test with invalid code**:
1. Enter invitation code: INVALID99
2. Submit form
3. **Verify**: Registration succeeds, invalid code logged but doesn't block

**Test without code**:
1. Leave invitation code blank
2. Submit form
3. **Verify**: Registration succeeds normally

**Expected Results**:
- Profile created with default "user" role
- Diamond balance starts at 0
- Invitation code (if valid) stored in profile
- Invalid/missing codes don't block registration (FR-003)

---

### Scenario 2: Admin Generates Invitation Codes

**As Admin (admin@company.com)**:

1. **Navigate** to /dashboard/admin/invitations
2. **Click** "Generate New Code"
3. **Enter** label: "Q2 2025 Marketing Team"
4. **Submit**
5. **Verify**:
   - New 8-character code generated (e.g., "MK7Q3R8N")
   - Code appears in list with label
   - Copy button available
   - Status shows "Active"
6. **View** code details
7. **Verify**:
   - Created by admin name shown
   - Created timestamp displayed
   - Usage count: 0 (newly created)
8. **Click** "Deactivate"
9. **Verify**:
   - Status changes to "Inactive"
   - Code still visible in list
   - Attempting to use code during registration logs as invalid

**Expected Results**:
- Admin/HR can generate codes (FR-002)
- Codes are 8-char alphanumeric (Q1: A)
- Label is optional but helpful
- Deactivation preserves audit trail (Q3: D)

---

### Scenario 3: View Invitation Code Usage

**As Admin (admin@company.com)**:

1. **Navigate** to /dashboard/admin/invitations
2. **View** list of all codes
3. **Verify** usage counts displayed for each code:
   - WELCOME1: 3 uses
   - SALES2K5: 2 uses
   - ENGR2025: 1 use
   - NOLABEL1: 0 uses
4. **Click** on "WELCOME1" code
5. **Verify** detailed usage:
   - List of 3 employees who used this code
   - Employee names, IDs, registration dates
   - Can click employee to view their profile
6. **Use search** to find codes by label: "Sales"
7. **Verify**: SALES2K5 code appears in results

**Expected Results**:
- Minimal tracking: Just store code on employee (Q2: A)
- Can see who used which code
- Usage statistics computed from employees table
- Full management interface (Q3: D)

---

### Scenario 2: Achievement Tracking and Claims

**As User (alice@company.com)**:

1. **Navigate** to /dashboard/achievements
2. **Verify** three categories visible:
   - Upcoming: Shows future achievements
   - On Doing: Shows active achievements
   - Completed: Shows achievements ready to claim
3. **View** "Complete Onboarding" achievement (active)
4. **Note** progress indicator (e.g., 60%)
5. **Wait** for progress to reach 100% (manual update by admin or automatic)
6. **Navigate** to Completed tab
7. **Click** "Claim Rewards" button
8. **Verify**:
   - Diamond balance increases by reward amount
   - Achievement moves to History
   - Success notification appears

**Expected Results**:
- Progress tracked accurately (FR-016)
- Claim adds diamonds to balance (FR-018)
- Cannot claim same achievement twice (FR-019)

---

### Scenario 4: Product Purchase Flow

**As User (bob@company.com, 150 diamonds)**:

1. **Navigate** to /dashboard/store
2. **Verify** current balance displayed prominently (150 diamonds)
3. **Browse** available products
4. **Click** "Purchase" on Coffee Mug (25 diamonds)
5. **Confirm** purchase in modal
6. **Verify**:
   - Balance immediately deducted (150 → 125)
   - Purchase shows "Pending" status
   - Notification: "Purchase pending admin approval"
7. **Attempt** to purchase MacBook Pro (1500 diamonds)
8. **Verify**: Error message "Insufficient diamond balance"

**Expected Results**:
- Balance deducted immediately (FR-023)
- Purchase requires approval (FR-024)
- Cannot purchase with insufficient balance (FR-025)

---

### Scenario 5: Admin Approval Workflow

**As Admin (admin@company.com)**:

1. **Navigate** to /dashboard/admin/approvals
2. **View** pending purchases from all employees
3. **See** purchase details:
   - Employee name and ID
   - Product name
   - Diamond cost
   - Request timestamp
4. **Click** "Approve" on Bob's Coffee Mug purchase
5. **Verify**:
   - Status changes to "Accepted"
   - Approval timestamp recorded
   - Bob receives notification
6. **View** another pending purchase
7. **Click** "Reject" and enter reason: "Product unavailable"
8. **Verify**:
   - Status changes to "Rejected"
   - Diamonds refunded to employee balance
   - Employee receives notification with reason

**Expected Results**:
- Admin sees all pending purchases (FR-027)
- Approval updates status (FR-028)
- Rejection refunds diamonds (FR-030)
- Admin identity recorded (FR-032)

---

### Scenario 6: History Tracking

**As User (alice@company.com)**:

1. **Navigate** to /dashboard/history
2. **Verify** can see own activity:
   - Achievement claims with timestamps
   - Product purchases with statuses
3. **Verify** cannot see other employees' history

**As Admin (admin@company.com)**:

1. **Navigate** to /dashboard/history
2. **Verify** can see all employees' activity
3. **Use filters**:
   - Date range: Last 7 days
   - Employee: Select "Alice"
   - Type: Claims only
4. **Verify** results filtered correctly
5. **Use search**: Enter "Coffee"
6. **Verify** finds all coffee-related purchases
7. **Click** history entry
8. **Verify** detailed view with all metadata

**Expected Results**:
- Users see only own history (FR-036)
- Admin sees all history (FR-037)
- Filters work correctly (FR-038)
- Search works across names and products (FR-039)
- Results load in <2 seconds for 10k records (SC-010)

---

### Scenario 7: Role-Based Access Control

**As User (bob@company.com)**:

1. **Attempt** to navigate to /dashboard/admin/achievements
2. **Verify**: Access denied, redirected to /dashboard
3. **Attempt** to navigate to /dashboard/admin/approvals
4. **Verify**: Access denied
5. **Attempt** to navigate to /dashboard/admin/employees
6. **Verify**: Access denied

**As Admin (admin@company.com)**:

1. **Navigate** to /dashboard/admin/employees
2. **Select** user "Carol"
3. **Change** role from "user" to "hr"
4. **Save** changes
5. **Verify**: Carol can now access /dashboard/admin/achievements

**Expected Results**:
- User role cannot access admin features (FR-009)
- Admin can modify roles (FR-008)
- Role changes take effect immediately (SC-009: 100% enforcement)

---

### Scenario 8: Achievement Management (Admin/HR)

**As HR (hr1@company.com)**:

1. **Navigate** to /dashboard/admin/achievements
2. **Click** "Create Achievement"
3. **Fill** form:
   - Title: Q1 Sales Target
   - Description: Achieve 100% of quarterly sales goal
   - Conditions: Complete 20 sales calls and close 5 deals
   - Diamond Reward: 300
   - Start Date: 2025-12-01
   - End Date: 2026-03-31
4. **Submit** form
5. **Verify**:
   - Achievement created successfully
   - Visible to all employees
   - Shows as "Upcoming" (start date in future)
6. **Edit** achievement (change reward to 350)
7. **Verify**: Changes reflected immediately
8. **Delete** old expired achievement
9. **Verify**: Achievement removed, but history preserved

**Expected Results**:
- HR can create achievements (FR-012)
- HR can edit/delete achievements (FR-013)
- Changes visible system-wide
- History preserved after deletion (FR-040)

---

### Scenario 9: Edge Cases

**Concurrent Claims**:
1. **Open** two browser windows as same user
2. **Navigate** to same completed achievement
3. **Click** "Claim" in both windows simultaneously
4. **Verify**: Only one claim succeeds, other shows error

**Achievement Expiration During Claim**:
1. **Wait** until achievement end_date is 1 second away
2. **Initiate** claim
3. **Verify**: Claim succeeds if initiated before expiration

**Role Change During Pending Purchase**:
1. **As User**: Make purchase (status: pending)
2. **As Admin**: Change user's role to "admin"
3. **Verify**: Purchase remains pending (not auto-approved)

**Expected Results**:
- No duplicate claims (FR-019)
- Expiration enforced (FR-015)
- Role changes don't affect pending purchases
- Invalid invitation codes logged but don't block registration (FR-003)

---

## Database Inspection

### View Data (SQLite CLI)

```bash
sqlite3 lib/db/copilot-demo.db
```

**Useful queries**:

```sql
-- List all employees with balances
SELECT employee_id, name, role, diamond_balance FROM employees;

-- View pending purchases
SELECT p.id, e.name, p.product_name, p.diamond_cost, p.created_at
FROM purchases p JOIN employees e ON e.id = p.employee_id
WHERE p.status = 'pending';

-- Check achievement progress
SELECT e.name, a.title, ap.status, ap.progress_percentage
FROM achievement_progress ap
JOIN employees e ON e.id = ap.employee_id
JOIN achievements a ON a.id = ap.achievement_id;

-- Audit balance accuracy
SELECT 
  e.employee_id,
  e.diamond_balance as current_balance,
  COALESCE(SUM(h.diamonds), 0) as history_total
FROM employees e
LEFT JOIN history h ON h.employee_id = e.id
GROUP BY e.id;

-- Recent history
SELECT employee_name, type, action, diamonds, created_at
FROM history
ORDER BY created_at DESC
LIMIT 20;
```

### Reset Database

```bash
# Delete database and restart server (will re-run migrations)
rm lib/db/copilot-demo.db
npm run dev

# Re-seed data
node lib/db/seed.js
```

---

## API Endpoints Reference

### Authentication

```
POST /api/auth/login
Body: { email, password }
Returns: { token, employee }

POST /api/auth/logout
Headers: Cookie: __Host-session=...
Returns: { success: true }

GET /api/auth/session
Headers: Cookie: __Host-session=...
Returns: { employee, role }
```

### Employees

```
GET /api/employees
Returns: [{ id, employee_id, name, role, diamond_balance, invitation_code_used }]

POST /api/employees
Body: { employee_id, name, email, password, contact, address, invitation_code? }
Returns: { id, employee_id, name, role, invitation_code_used }

GET /api/employees/[id]
Returns: { id, employee_id, name, email, contact, address, role, diamond_balance, invitation_code_used }

PATCH /api/employees/[id]
Body: { name?, email?, contact?, address?, role? }
Returns: { id, employee_id, name, role }
```

### Invitation Codes (NEW)

```
GET /api/invitations
Returns: [{ id, code, label, is_active, created_by, created_at, usage_count }]

POST /api/invitations
Body: { label? }
Returns: { id, code, label, is_active, created_at }

GET /api/invitations/[id]
Returns: { id, code, label, is_active, created_by, created_at, used_by: [employees] }

PATCH /api/invitations/[id]
Body: { is_active: 0 | 1, label? }
Returns: { id, code, is_active }

GET /api/invitations/validate/[code]
Returns: { valid: true/false, is_active: true/false }
```

### Achievements

```
GET /api/achievements
Query: ?status=active|upcoming|expired
Returns: [{ id, title, description, diamond_reward, start_date, end_date }]

POST /api/achievements
Body: { title, description, conditions, diamond_reward, start_date, end_date }
Returns: { id, title, ... }

POST /api/achievements/[id]/claim
Returns: { success: true, balance: 250 }
```

### Purchases

```
GET /api/purchases
Query: ?status=pending|accepted|rejected
Returns: [{ id, product_name, diamond_cost, status, created_at }]

POST /api/purchases
Body: { product_id }
Returns: { id, product_name, diamond_cost, status: 'pending' }

POST /api/purchases/[id]/approve
Body: { action: 'approve' | 'reject', reason? }
Returns: { id, status, approved_at, approved_by }
```

### History

```
GET /api/history
Query: ?employee_id=X&type=claim|purchase&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&search=X&page=1&limit=50
Returns: { items: [...], total: 150, page: 1, limit: 50 }
```

---

## Troubleshooting

### Database locked error

**Symptom**: `Error: database is locked`

**Solution**: Ensure only one dev server is running. SQLite allows only one writer at a time.

```bash
# Kill all node processes
pkill node

# Restart dev server
npm run dev
```

### Session expired

**Symptom**: Redirected to login after action

**Solution**: Sessions expire after 24 hours. Login again.

### Balance mismatch

**Symptom**: Balance doesn't match transaction history

**Solution**: Run audit query to identify discrepancy:

```sql
SELECT 
  e.employee_id,
  e.diamond_balance,
  COALESCE(SUM(h.diamonds), 0) as calculated_balance
FROM employees e
LEFT JOIN history h ON h.employee_id = e.id
GROUP BY e.id
HAVING e.diamond_balance != calculated_balance;
```

### Performance issues with history

**Symptom**: History queries take >2 seconds

**Solution**: Verify indexes exist:

```sql
.schema history
-- Should show all CREATE INDEX statements
```

If missing, run migration again or manually create indexes.

---

## Next Steps

1. ✅ **COMPLETE**: Development environment documented
2. **TODO**: Implement seed script at `lib/db/seed.ts`
3. **TODO**: Add API endpoint tests (optional per constitution)
4. **TODO**: Set up CI/CD pipeline
5. **TODO**: Deploy to production

**Status**: Ready for implementation - all design artifacts complete
