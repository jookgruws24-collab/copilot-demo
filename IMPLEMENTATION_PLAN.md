# Implementation Plan: Employee Achievement and Rewards System

**Branch**: `1-employee-rewards-system` | **Date**: 2025-11-10 | **Spec**: [EMPLOYEE_REWARDS_SPEC.md](./EMPLOYEE_REWARDS_SPEC.md)

**Input**: Build a web application using Next.js, TypeScript, Tailwind CSS, and local SQLite database for Employee Achievement and Rewards management with User Management, Achievement Tracking, Diamond Balance, Product Store with approval workflow, and History Tracking.

## Summary

Build a web application for employee achievement and rewards management using Next.js App Router with TypeScript, Tailwind CSS, and local SQLite database. The system enables employees to register profiles, track achievements across three states (Upcoming, On Doing, Completed), claim diamond rewards, purchase products with approval workflow, and view complete history with role-based access control (User, Admin, HR).

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), Node.js 20+  
**Primary Dependencies**: Next.js 16+ (App Router), React 19+, Tailwind CSS 4+  
**Storage**: SQLite (local database via better-sqlite3)  
**Testing**: Optional (per constitution - not required by feature spec)  
**Target Platform**: Web (API routes for database operations, server/client components)  
**Project Type**: Web application (single Next.js project with App Router)  

**Performance Goals**: 
- Page loads under 2 seconds
- Database queries under 100ms
- Support 500 concurrent users (per SC-011)
- Search/filter results under 2 seconds for 10k records (per SC-010)

**Constraints**: 
- Role-based access control must block unauthorized access 100% (per SC-009)
- Diamond balance calculations must be 100% accurate (per SC-007)
- All transactions (claims, purchases, refunds) atomic and consistent (per FR-040)
- Static-first architecture per constitution (API routes only for database operations)

**Scale/Scope**: 
- 500 concurrent employees
- 10,000+ history records
- 6 major screens (Profile, Achievements, Store, Approvals, History, Admin)
- 44 functional requirements (including invitation code system)
- 9 key entities (including invitation codes)

## Constitution Check

*All constitutional principles verified against this implementation plan.*

### ✅ I. Minimal Dependencies
**Status**: PASS  
**Required additions**:
- `better-sqlite3`: Native SQLite driver (minimal, zero npm dependencies)
- `bcryptjs`: Password hashing (security requirement, ~8KB)
- `zod`: Runtime validation (TypeScript companion, ~13KB)

**Justification**: All three additions are essential (database access, security, validation) and have no simpler native alternatives.

### ✅ II. Static-First Architecture
**Status**: PASS  
**Assessment**: API routes required only for authenticated database operations. Pages use server components where possible.

### ✅ III. Component Modularity
**Status**: PASS  
**Assessment**: Components organized by domain (auth, achievements, store, history) with shared UI primitives in `app/components/ui/`.

### ✅ IV. Type Safety
**Status**: PASS  
**Assessment**: TypeScript strict mode enabled. All entities, API responses, and component props will have explicit types.

### ✅ V. Build Performance
**Status**: PASS  
**Assessment**: Expected build time 20-30 seconds (well under 60s limit). Minimal client-side JavaScript.

**Conclusion**: All constitutional gates PASS ✅

## Project Structure

### Planned Directory Structure

```text
app/
├── (auth)/                       # Auth layout group
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/                  # Protected dashboard layout
│   ├── layout.tsx                # Shared nav, role guard
│   ├── profile/page.tsx          # Profile management
│   ├── achievements/page.tsx     # Achievement tracking
│   ├── store/page.tsx            # Product store
│   ├── history/page.tsx          # Personal/admin history
│   └── admin/
│       ├── achievements/page.tsx # Achievement management
│       ├── approvals/page.tsx    # Purchase approvals
│       ├── employees/page.tsx    # Employee management
│       └── invitations/page.tsx  # Invitation code management (NEW)
├── api/                          # API routes (database operations)
│   ├── auth/
│   ├── employees/
│   ├── invitations/              # Invitation code CRUD (NEW)
│   ├── achievements/
│   ├── purchases/
│   └── history/
├── components/
│   ├── ui/                       # Reusable primitives
│   ├── auth/                     # LoginForm, RoleGuard
│   ├── invitations/              # InvitationCodeForm, CodeList (NEW)
│   ├── achievements/             # Cards, progress bars
│   ├── store/                    # Products, purchases
│   ├── history/                  # Tables, filters
│   └── layout/                   # Navigation, Header
├── lib/
│   ├── db/                       # SQLite client, schema, seed
│   ├── auth/                     # Session, password, roles
│   ├── invitations/              # Code generation, validation (NEW)
│   ├── validations/              # Zod schemas
│   └── utils/                    # Dates, errors
└── types/                        # TypeScript definitions
    ├── employee.ts               # Employee, Role types
    ├── invitation.ts             # InvitationCode types (NEW)
    ├── achievement.ts            # Achievement, Progress types
└── copilot-demo.db              # SQLite database file (gitignored)
```

**Structure Decision**: Single Next.js project with App Router. Route groups for different layouts. API routes for database operations. Components organized by domain with shared UI primitives.

## Complexity Tracking

**No violations** - all constitutional principles satisfied.

| Dependency | Why Needed | Simpler Alternative Rejected |
|------------|------------|------------------------------|
| better-sqlite3 | SQLite access in Node.js | No native Node.js SQLite API |
| bcryptjs | Password hashing (security) | Plain passwords are security violation |
| zod | Runtime validation for APIs | Manual validation is error-prone |

---

## Implementation Phases

### Phase 0: Research & Planning

**Research Areas:**
1. **SQLite Schema Design** - Migration strategy, indexes, foreign keys, transactions
2. **Authentication Architecture** - Next.js middleware, session storage, RBAC patterns
3. **Diamond Balance Integrity** - Atomic transactions, race condition prevention
4. **Performance Optimization** - Query optimization, pagination, caching

**Deliverable**: Research document with decisions and rationale

### Phase 1: Data Model & API Contracts

**Artifacts to Create:**
1. **data-model.md** - Complete SQLite schema (8 entities, relationships, indexes)
2. **API Contracts** - OpenAPI specs for all endpoints (auth, employees, achievements, purchases, history)
3. **quickstart.md** - Dev setup, database init, seed data, testing guide

**Deliverable**: Complete design documentation

### Phase 2: Task Breakdown

Execute `/speckit.tasks` to generate atomic implementation tasks with:
- Dependency ordering
- Acceptance criteria
- Effort estimates

**Deliverable**: tasks.md with prioritized implementation tasks

---

## Key Functional Areas

### 1. User Management (FR-001 to FR-011)
- Employee registration with EmployeeID, name, contact, address, optional invitation code
- Admin/HR generate and manage invitation codes (8-char alphanumeric)
- Invitation code validation (optional, doesn't block registration)
- Track invitation code usage for audit purposes
- Single-screen profile editing
- Role assignment (User, Admin, HR)
- Role-based access control

### 2. Achievement System (FR-012 to FR-019)
- Admin/HR creates achievements (title, description, conditions, diamonds, dates)
- Three states: Upcoming, On Doing, Completed
- Progress tracking with completion percentage
- Claim rewards → update Diamond Balance
- Prevent duplicate claims and expired claims

### 3. Product Store (FR-020 to FR-026)
- Display products with diamond prices
- Show current Diamond Balance
- Purchase with balance deduction
- Inventory tracking
- Prevent insufficient balance purchases

### 4. Approval Workflow (FR-027 to FR-033)
- Admin approval queue for pending purchases
- Approve (status → Accepted) or Reject (refund diamonds)
- Notification on approval/rejection
- Audit trail (admin identity, timestamp)
- Prevent duplicate approvals

### 5. History Tracking (FR-034 to FR-041)
- Log all claims and purchases
- Role-based visibility (own history vs. all history)
- Filtering (date, employee, type, status)
- Search (employee, achievement, product names)
- Preserve records even if source deleted

### 6. Data Integrity (FR-042 to FR-044)
- Accurate balance calculations (100%)
- Prevent negative balances
- Atomic transactions

---

## Success Criteria Summary

- ✅ Profile registration in <3 minutes
- ✅ Achievement creation in <2 minutes
- ✅ Achievement claim in <30 seconds
- ✅ Purchase flow in <1 minute
- ✅ Admin approval in <30 seconds
- ✅ History navigation in <1 minute
- ✅ 100% balance accuracy
- ✅ 100% access control enforcement
- ✅ Search results in <2 seconds (10k records)
- ✅ Support 500 concurrent users

---

## Next Steps

1. ✅ **COMPLETE**: Plan created and constitutional check passed
2. **TODO**: Create research.md (Phase 0)
3. **TODO**: Create data-model.md and API contracts (Phase 1)
4. **TODO**: Create quickstart.md (Phase 1)
5. **TODO**: Run `/speckit.tasks` to generate implementation tasks (Phase 2)

**Status**: Ready for Phase 0 - Research and architectural decisions
