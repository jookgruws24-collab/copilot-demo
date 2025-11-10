# Research & Architectural Decisions

**Feature**: Employee Achievement and Rewards System  
**Date**: 2025-11-10  
**Status**: Phase 0 Complete

This document captures key architectural decisions, technology choices, and design patterns for implementing the employee rewards system.

---

## 1. SQLite Schema Design

### Decision: Normalized Schema with Foreign Keys

**Chosen Approach**:
- 8 core tables: `employees`, `roles`, `achievements`, `achievement_progress`, `products`, `purchases`, `history`, `sessions`
- Foreign key constraints enabled (`PRAGMA foreign_keys = ON`)
- Composite indexes for frequent queries (history filtering, employee achievements)
- `AUTOINCREMENT` for primary keys to prevent ID reuse

**Rationale**:
- SQLite supports foreign keys and transactions (ACID compliant)
- Normalized structure prevents data duplication and maintains integrity
- Indexes critical for 10k+ history records (SC-010: <2s search)
- Composite indexes optimize filtered queries (date + employee + type)

**Alternatives Considered**:
- **Denormalized tables**: Rejected - would duplicate employee/product data, violate FR-038 (accurate balance)
- **JSON columns**: Rejected - can't index efficiently, harder to query
- **Separate tables per role**: Rejected - over-engineering, role is just an attribute

### Migration Strategy

**Decision**: SQL migration files with version tracking

```sql
-- migrations/001_initial_schema.sql
-- migrations/002_add_indexes.sql
```

**Approach**:
- Track applied migrations in `schema_version` table
- Run migrations sequentially on app startup
- No down migrations (SQLite limitations, MVP scope)

**Rationale**: Simple, no external tools needed, works with better-sqlite3 synchronous API.

---

## 2. Authentication Architecture

### Decision: Cookie-based Sessions with Database Storage

**Chosen Approach**:
- Session tokens stored in `sessions` table (employee_id, token, expires_at)
- HTTP-only, Secure cookies (`__Host-session` prefix)
- Next.js middleware validates session on protected routes
- bcryptjs for password hashing (10 rounds)

**Rationale**:
- Stateful sessions easier to invalidate (logout, security breach)
- No JWT secret management complexity
- Middleware runs before page render (better UX than client-side checks)
- Database sessions enable "view active sessions" feature later

**Alternatives Considered**:
- **JWT tokens**: Rejected - can't revoke without database anyway, added complexity
- **Server component auth only**: Rejected - requires checks in every component, middleware cleaner
- **NextAuth.js**: Rejected - violates Minimal Dependencies principle, overkill for simple email/password

### Role-Based Access Control (RBAC)

**Decision**: Middleware + Server Component Guards

**Pattern**:
```typescript
// middleware.ts - route-level protection
if (!session && route.startsWith('/dashboard')) redirect('/login')

// RoleGuard component - feature-level protection
<RoleGuard roles={['admin', 'hr']}>
  <AdminFeature />
</RoleGuard>
```

**Rationale**:
- Middleware prevents unauthorized route access (100% enforcement per SC-009)
- Component guards provide fine-grained control within pages
- TypeScript ensures role strings are type-safe
- Server components can check roles before rendering (no client exposure)

---

## 3. Diamond Balance Integrity

### Decision: SQLite Transactions with Optimistic Locking

**Chosen Approach**:
```typescript
db.transaction(() => {
  const current = db.prepare('SELECT balance FROM employees WHERE id = ?').get(id)
  if (current.balance < cost) throw new Error('Insufficient balance')
  db.prepare('UPDATE employees SET balance = balance - ? WHERE id = ?').run(cost, id)
  db.prepare('INSERT INTO purchases ...').run(...)
  db.prepare('INSERT INTO history ...').run(...)
})
```

**Rationale**:
- SQLite transactions are ACID-compliant (FR-040)
- `db.transaction()` in better-sqlite3 handles BEGIN/COMMIT/ROLLBACK
- Read-verify-write pattern prevents race conditions
- All balance changes logged to history in same transaction

**Edge Cases Handled**:
- Concurrent claims: Transaction isolation prevents double-claims (FR-015)
- Purchase rejection: Rollback restores balance atomically (FR-026)
- Server crash: Incomplete transactions roll back automatically

**Alternatives Considered**:
- **Separate balance table**: Rejected - adds join complexity, same transaction guarantees needed
- **Application-level locking**: Rejected - SQLite provides better guarantees
- **Eventual consistency**: Rejected - violates FR-038 (100% accuracy)

### Audit Trail Strategy

**Decision**: Immutable history table with triggers

```sql
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'claim' or 'purchase'
  action TEXT NOT NULL, -- 'created', 'approved', 'rejected'
  details TEXT NOT NULL, -- JSON with achievement/product info
  diamonds INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
)
```

**Rationale**:
- Every balance change has corresponding history row (FR-030, FR-031)
- JSON details preserve achievement/product info even if deleted (FR-036)
- No UPDATE/DELETE permissions on history table (immutable audit log)
- `created_at` captures exact timestamp for chronological ordering

---

## 4. Performance Optimization

### Decision: Strategic Indexing + Pagination

**Indexes**:
```sql
-- History queries (Admin/HR with filters)
CREATE INDEX idx_history_employee_date ON history(employee_id, created_at DESC);
CREATE INDEX idx_history_type_date ON history(type, created_at DESC);

-- Achievement queries (status filtering)
CREATE INDEX idx_achievements_dates ON achievements(start_date, end_date);
CREATE INDEX idx_progress_status ON achievement_progress(employee_id, status);

-- Purchase approval queue
CREATE INDEX idx_purchases_status ON purchases(status, created_at DESC);
```

**Rationale**:
- History table grows unbounded (10k+ records) - indexes critical for SC-010 (<2s search)
- Composite indexes optimize filtered queries (date range + employee + type)
- Covering indexes reduce disk I/O (SQLite query planner optimizes)

### Pagination Strategy

**Decision**: Offset-based pagination with row count caching

```typescript
// History endpoint
const total = db.prepare('SELECT COUNT(*) FROM history WHERE ...').get()
const rows = db.prepare('SELECT * FROM history WHERE ... LIMIT ? OFFSET ?').all(limit, offset)
```

**Rationale**:
- Simple to implement (no cursor complexity)
- Total count enables page indicators
- 10k records with indexes performs well (<2s per SC-010)
- Cursor-based overkill for MVP (can optimize later if needed)

**Alternatives Considered**:
- **Cursor-based**: Rejected - added complexity, offset sufficient for 10k records
- **Infinite scroll**: Rejected - admin needs pagination for auditing

### Caching Strategy

**Decision**: No caching layer (rely on SQLite speed)

**Rationale**:
- SQLite in-process (no network latency) - queries <100ms without caching
- Caching adds complexity (invalidation, consistency)
- Constitution principle: minimal dependencies
- Can add later if profiling shows need

---

## 5. Server vs. Client Components

### Decision: Server Components by Default

**Pattern**:
```typescript
// Server Component (default) - fetches data directly
export default async function AchievementsPage() {
  const achievements = await db.getAchievements()
  return <AchievementList achievements={achievements} />
}

// Client Component - interactive features only
'use client'
export function ClaimButton({ achievementId }: Props) {
  const handleClaim = async () => {
    await fetch(`/api/achievements/${achievementId}/claim`, { method: 'POST' })
  }
  return <button onClick={handleClaim}>Claim</button>
}
```

**Rationale**:
- Server components reduce JavaScript bundle (Build Performance principle)
- Data fetching in server components = no loading states, better UX
- Client components only for interactivity (forms, modals, state)
- Aligns with Static-First principle (server-render where possible)

**Client Components Needed**:
- Forms (registration, achievement creation)
- Modals (purchase confirmation, delete confirmation)
- Interactive tables (sorting, filtering with local state)
- Real-time updates (achievement progress tracking)

---

## 6. Date/Time Handling

### Decision: Store ISO 8601 strings, display in user's timezone

**Storage**: `TEXT` columns with ISO 8601 format (`2025-11-10T06:14:20.307Z`)

**Display**: Use `Intl.DateTimeFormat` in client components

```typescript
const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
})
formatter.format(new Date(isoString))
```

**Rationale**:
- ISO 8601 is sortable lexicographically (index optimization)
- SQLite `datetime()` functions work with ISO format
- Client-side formatting respects user timezone (no server config needed)
- No external date libraries (minimalism)

---

## 7. Error Handling

### Decision: Typed errors with user-friendly messages

**Pattern**:
```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) { super(message) }
}

// API route
try {
  // operation
} catch (error) {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.statusCode })
  }
  // log unexpected errors, return generic message
  console.error(error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
```

**Rationale**:
- User-friendly messages (no stack traces exposed)
- Consistent error format across API routes
- Type-safe error codes for client handling
- Logs internal errors for debugging

---

## 9. Invitation Code System

### Decision: Random 8-character alphanumeric codes with full management interface

**Chosen Approach**:
```typescript
// Code generation (A-Z, a-z, 0-9 excluding ambiguous: 0, O, 1, I, l)
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnopqrstuvwxyz'
const code = Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
```

**Rationale**:
- 8 characters = easy to share via email/SMS, memorable enough
- Excludes ambiguous characters (0/O, 1/I/l) for clarity
- ~2.8 trillion possible combinations (sufficient collision resistance)
- Simple validation: Just check if code exists and is_active = 1

**Alternatives Considered**:
- **UUID-based**: Rejected - too long (36 chars), harder to communicate verbally
- **Readable phrases**: Rejected - less professional, harder to generate uniquely
- **Numeric only**: Rejected - higher collision probability, less distinctive

### Database Schema

**Table**: `invitation_codes`
```sql
CREATE TABLE invitation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  label TEXT,                           -- Optional label (Q1: Answer A, Q3: Answer D)
  created_by INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1, -- Q3: Answer D (deactivation support)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES employees(id)
);
```

**Employee Tracking**: (Q2: Answer A - minimal tracking)
```sql
ALTER TABLE employees ADD COLUMN invitation_code_used TEXT;
```

**Rationale**:
- Store code as text on employee (simple, no JOIN needed for audit)
- No foreign key constraint (code can be deleted without affecting employees)
- `is_active` enables deactivation without losing audit history
- Optional `label` helps organize codes (e.g., "Q1 2025 Hires", "Sales Team")

### Admin Interface Features (Q3: Answer D - Full Management)

**Pages**: `/dashboard/admin/invitations`

**Features**:
1. **Generate**: Button creates new code with optional label
2. **View List**: Table showing all codes with:
   - Code value (with copy button)
   - Label
   - Created by (admin name)
   - Created date
   - Status (Active/Inactive)
   - Usage count (computed from employees table)
3. **View Details**: Click code to see:
   - Who used the code (list of employees)
   - Registration timestamps
   - Usage statistics
4. **Deactivate**: Toggle `is_active` without deletion (preserves history)
5. **Search/Filter**: Find codes by label, creator, or status

**Validation Logic**:
```typescript
// During registration
async function validateInvitationCode(code: string): Promise<boolean> {
  if (!code) return true // Optional field
  const result = await db.query('SELECT is_active FROM invitation_codes WHERE code = ?', [code])
  return result ? result.is_active === 1 : false // Invalid code logged but doesn't block
}
```

**Rationale**: Q3: D selected - provides complete visibility and control for Admin/HR while maintaining audit trail

---

## 10. Seed Data Strategy (Updated)

### Decision: Include invitation codes in seed data

**Seed Content** (additions):
- 5 invitation codes with different labels:
  - `WELCOME1` - "General Onboarding"
  - `SALES2K5` - "Q1 2025 Sales Team"
  - `ENGR2025` - "Engineering Hires"
  - `INACTIVE` - "Old Campaign" (is_active = 0)
  - `NOLABEL1` - (no label, demonstrates optional field)

**Usage Distribution**:
- 3 employees used `WELCOME1`
- 2 employees used `SALES2K5`
- 1 employee used `ENGR2025`
- 4 employees registered without code (NULL)

### Decision: Deterministic seed script for development

**Content**:
- 10 employees (1 admin, 2 HR, 7 users) with known passwords
- 5 achievements (2 upcoming, 2 active, 1 expired)
- 8 products (various prices: 10, 25, 50, 100, 200 diamonds)
- Sample progress/claims/purchases for testing workflows

**Rationale**:
- Developers can test all roles without manual setup
- Known passwords enable quick login (dev only)
- Sample data covers all states (upcoming, completed, pending, etc.)
- Idempotent script (clear + reseed for clean state)

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Database | SQLite with foreign keys, composite indexes | ACID transactions, fast queries (<100ms) |
| Auth | Cookie sessions + database storage | Easy revocation, no JWT complexity |
| RBAC | Middleware + component guards | 100% enforcement (SC-009) |
| Balance | Transaction-wrapped updates | Atomic consistency (FR-044) |
| History | Immutable audit log with JSON details | Preserve deleted references (FR-040) |
| Performance | Strategic indexes, offset pagination | <2s search for 10k records (SC-010) |
| Components | Server-first, client only for interactivity | Minimal JS bundle (Build Performance) |
| Errors | Typed errors with friendly messages | Security + UX |
| Invitation Codes | 8-char alphanumeric, full management UI | Easy sharing, complete admin control |

---

**Next Phase**: Generate data-model.md with complete SQLite schema and API contracts
