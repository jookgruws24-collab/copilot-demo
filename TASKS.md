# Tasks: Employee Achievement and Rewards System

**Feature**: Employee Achievement and Rewards System  
**Branch**: `1-employee-rewards-system`  
**Date**: 2025-11-10

**Input**: Design documents (EMPLOYEE_REWARDS_SPEC.md, IMPLEMENTATION_PLAN.md, DATA_MODEL.md)  
**Prerequisites**: Next.js 16+, TypeScript 5+, SQLite database setup

**Tests**: Not explicitly required per specification - omitted per constitutional principle

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install required dependencies: better-sqlite3, bcryptjs, zod in package.json
- [x] T002 [P] Create TypeScript types directory with base types in types/common.ts
- [x] T003 [P] Setup Tailwind CSS configuration in tailwind.config.ts
- [x] T004 [P] Create base UI components (Button, Input, Card) in app/components/ui/
- [x] T005 Configure TypeScript strict mode and path aliases in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create SQLite database schema with all 8 tables in lib/db/migrations/001_initial_schema.sql
- [x] T007 Implement database client with connection pooling in lib/db/client.ts
- [x] T008 Create migration runner that tracks schema version in lib/db/migrate.ts
- [x] T009 [P] Generate TypeScript types for all database entities in types/database.ts
- [x] T010 [P] Create Zod validation schemas for all entities in lib/validations/schemas.ts
- [x] T011 Implement password hashing utilities using bcryptjs in lib/auth/password.ts
- [x] T012 Create session management with token generation in lib/auth/session.ts
- [x] T013 Implement Next.js middleware for authentication in middleware.ts
- [x] T014 Create RoleGuard component for role-based access control in app/components/auth/RoleGuard.tsx
- [x] T015 [P] Setup error handling utilities in lib/utils/errors.ts
- [x] T016 [P] Create date formatting utilities in lib/utils/dates.ts
- [x] T017 Create seed data script with sample employees, achievements, products in lib/db/seed.ts
- [x] T018 Create shared layout with navigation for dashboard in app/(dashboard)/layout.tsx

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Employee Profile Management (Priority: P1) 🎯 MVP

**Goal**: Enable employee registration, profile editing, invitation code system, and role management

**Independent Test**: Create new employee account with invitation code, edit profile details, assign roles, verify role-based access control

### Implementation for User Story 1

**Invitation Code System:**
- [x] T019 [P] [US1] Create InvitationCode TypeScript types in types/invitation.ts
- [x] T020 [P] [US1] Create invitation code generation utility in lib/invitations/generate.ts
- [x] T021 [P] [US1] Create invitation code validation logic in lib/invitations/validate.ts
- [x] T022 [US1] Implement GET /api/invitations endpoint to list all codes in app/api/invitations/route.ts
- [x] T023 [US1] Implement POST /api/invitations endpoint to create new code in app/api/invitations/route.ts
- [x] T024 [US1] Implement PATCH /api/invitations/[id] endpoint to deactivate code in app/api/invitations/[id]/route.ts
- [x] T025 [US1] Create InvitationCodeForm component in app/components/invitations/InvitationCodeForm.tsx
- [x] T026 [US1] Create InvitationCodeList component in app/components/invitations/InvitationCodeList.tsx
- [x] T027 [US1] Create invitation management page in app/(dashboard)/admin/invitations/page.tsx

**Authentication:**
- [x] T028 [P] [US1] Create Employee TypeScript types in types/employee.ts
- [x] T029 [US1] Implement POST /api/auth/register endpoint with invitation code handling in app/api/auth/register/route.ts
- [x] T030 [US1] Implement POST /api/auth/login endpoint in app/api/auth/login/route.ts
- [x] T031 [US1] Implement POST /api/auth/logout endpoint in app/api/auth/logout/route.ts
- [x] T032 [US1] Create registration form component with invitation code field in app/components/auth/RegisterForm.tsx
- [x] T033 [US1] Create login form component in app/components/auth/LoginForm.tsx
- [x] T034 [US1] Create registration page in app/(auth)/register/page.tsx
- [x] T035 [US1] Create login page in app/(auth)/login/page.tsx

**Profile Management:**
- [x] T036 [US1] Implement GET /api/employees/[id] endpoint in app/api/employees/[id]/route.ts
- [x] T037 [US1] Implement PATCH /api/employees/[id] endpoint for profile updates in app/api/employees/[id]/route.ts
- [x] T038 [US1] Implement PATCH /api/employees/[id]/role endpoint for role assignment in app/api/employees/[id]/role/route.ts
- [x] T039 [US1] Create ProfileForm component for editing profile in app/components/profile/ProfileForm.tsx
- [x] T040 [US1] Create EmployeeCard component for displaying employee info in app/components/profile/EmployeeCard.tsx
- [x] T041 [US1] Create profile management page in app/(dashboard)/profile/page.tsx
- [x] T042 [US1] Create admin employee management page in app/(dashboard)/admin/employees/page.tsx

**Validation & Error Handling:**
- [x] T043 [US1] Add validation for unique EmployeeID in registration endpoint
- [x] T044 [US1] Add role-based access control to admin-only endpoints
- [x] T045 [US1] Add error messages for invalid invitation codes (non-blocking)

**Checkpoint**: ✅ User Story 1 Complete - employees can register with invitation codes, login, edit profiles, and admins can manage roles and invitation codes

---

## Phase 4: User Story 2 - Achievement Creation and Management (Priority: P2)

**Goal**: Enable Admin/HR to create, edit, and manage achievements with time boundaries and diamond rewards

**Independent Test**: Admin/HR can create achievements with all details, set dates, employees can view achievements categorized by status

### Implementation for User Story 2

- [x] T046 [P] [US2] Create Achievement TypeScript types in types/achievement.ts
- [x] T047 [P] [US2] Create achievement status calculation utility in lib/achievements/status.ts
- [x] T048 [US2] Implement GET /api/achievements endpoint to list all achievements in app/api/achievements/route.ts
- [x] T049 [US2] Implement POST /api/achievements endpoint for Admin/HR in app/api/achievements/route.ts
- [x] T050 [US2] Implement GET /api/achievements/[id] endpoint in app/api/achievements/[id]/route.ts
- [x] T051 [US2] Implement PATCH /api/achievements/[id] endpoint for editing in app/api/achievements/[id]/route.ts
- [x] T052 [US2] Implement DELETE /api/achievements/[id] endpoint in app/api/achievements/[id]/route.ts
- [x] T053 [US2] Create AchievementForm component in app/components/achievements/AchievementForm.tsx
- [x] T054 [US2] Create AchievementCard component with status badges in app/components/achievements/AchievementCard.tsx
- [x] T055 [US2] Create AchievementList component with filtering in app/components/achievements/AchievementList.tsx
- [x] T056 [US2] Create admin achievement management page in app/(dashboard)/admin/achievements/page.tsx
- [x] T057 [US2] Add validation for date constraints (end_date > start_date)
- [x] T058 [US2] Add validation for positive diamond rewards

**Checkpoint**: At this point, Admin/HR can fully manage achievements, and all users can view them categorized by status (Upcoming, On Doing, Expired)

---

## Phase 5: User Story 3 - Achievement Progress Tracking and Claims (Priority: P1)

**Goal**: Enable employees to track achievement progress, view categorized statuses, and claim diamond rewards

**Independent Test**: Employees can view achievements by status (Upcoming, On Doing, Completed), track progress percentages, and claim rewards that update diamond balance

### Implementation for User Story 3

- [x] T059 [P] [US3] Create AchievementProgress TypeScript types in types/achievement.ts
- [x] T060 [US3] Implement GET /api/employees/[id]/achievements endpoint to get progress in app/api/employees/[id]/achievements/route.ts
- [x] T061 [US3] Implement PATCH /api/achievements/[id]/progress endpoint to update progress in app/api/achievements/[id]/progress/route.ts
- [x] T062 [US3] Implement POST /api/achievements/[id]/claim endpoint with transaction in app/api/achievements/[id]/claim/route.ts
- [x] T063 [US3] Create atomic transaction for claim (update balance, set claimed, insert history) in lib/achievements/claim.ts
- [x] T064 [US3] Create ProgressBar component in app/components/achievements/ProgressBar.tsx
- [x] T065 [US3] Create AchievementStatusBadge component (Upcoming, On Doing, Completed) in app/components/achievements/StatusBadge.tsx
- [x] T066 [US3] Create ClaimButton component with diamond animation in app/components/achievements/ClaimButton.tsx
- [x] T067 [US3] Create achievements tracking page with three sections in app/(dashboard)/achievements/page.tsx
- [x] T068 [US3] Add validation to prevent duplicate claims (check status before claim)
- [x] T069 [US3] Add validation to prevent expired achievement claims (check end_date)
- [x] T070 [US3] Display employee diamond balance prominently on achievements page

**Checkpoint**: At this point, User Story 3 should work independently - employees can track and claim achievements, and balance updates correctly

---

## Phase 6: User Story 4 - Product Store and Purchases (Priority: P2)

**Goal**: Enable employees to browse products and make purchases using diamond balance with proper validation

**Independent Test**: Employees can browse products, see prices, make purchases with sufficient balance, see pending status, and inventory updates

### Implementation for User Story 4

- [x] T071 [P] [US4] Create Product TypeScript types in types/product.ts
- [x] T072 [P] [US4] Create Purchase TypeScript types in types/purchase.ts
- [x] T073 [US4] Implement GET /api/products endpoint to list available products in app/api/products/route.ts
- [x] T074 [US4] Implement POST /api/products endpoint for Admin to add products in app/api/products/route.ts
- [x] T075 [US4] Implement POST /api/purchases endpoint with transaction in app/api/purchases/route.ts
- [x] T076 [US4] Create atomic transaction for purchase (check balance, deduct diamonds, decrement inventory, create purchase, insert history) in lib/purchases/create.ts
- [x] T077 [US4] Create ProductCard component with price and availability in app/components/store/ProductCard.tsx
- [x] T078 [US4] Create ProductGrid component in app/components/store/ProductGrid.tsx
- [x] T079 [US4] Create PurchaseButton component with balance validation in app/components/store/PurchaseButton.tsx
- [x] T080 [US4] Create DiamondBalance component to display current balance in app/components/store/DiamondBalance.tsx
- [x] T081 [US4] Create product store page in app/(dashboard)/store/page.tsx
- [x] T082 [US4] Add validation to prevent purchases with insufficient balance
- [x] T083 [US4] Add validation to prevent purchases when quantity is 0
- [x] T084 [US4] Show out-of-stock badge on unavailable products

**Checkpoint**: At this point, employees can browse and purchase products, with proper balance and inventory validation

---

## Phase 7: User Story 5 - Purchase Approval Workflow (Priority: P3)

**Goal**: Enable Admin to review, approve, or reject pending purchases with proper notification and audit trail

**Independent Test**: Admin can view approval queue, approve purchases (status → Accepted), reject with refund and reason, verify audit trail

### Implementation for User Story 5

- [x] T085 [US5] Implement GET /api/purchases/pending endpoint for Admin in app/api/purchases/pending/route.ts
- [x] T086 [US5] Implement PATCH /api/purchases/[id]/approve endpoint with transaction in app/api/purchases/[id]/approve/route.ts
- [x] T087 [US5] Implement PATCH /api/purchases/[id]/reject endpoint with refund transaction in app/api/purchases/[id]/reject/route.ts
- [x] T088 [US5] Create atomic transaction for rejection (refund balance, update status, insert history) in lib/purchases/reject.ts
- [x] T089 [US5] Add validation to prevent duplicate approvals (check current status)
- [x] T090 [US5] Create PurchaseCard component with employee and product details in app/components/approvals/PurchaseCard.tsx
- [x] T091 [US5] Create ApprovalActions component (Approve/Reject buttons) in app/components/approvals/ApprovalActions.tsx
- [x] T092 [US5] Create RejectionModal component for entering reason in app/components/approvals/RejectionModal.tsx
- [x] T093 [US5] Create purchase approvals page in app/(dashboard)/admin/approvals/page.tsx
- [x] T094 [US5] Add notification logic for approval/rejection (can be in-app alert or placeholder)

**Checkpoint**: At this point, Admin can fully manage purchase approvals with proper refund handling and audit trail

---

## Phase 8: User Story 6 - History Tracking and Reporting (Priority: P2)

**Goal**: Provide complete audit trail with role-based visibility, filtering, and search capabilities

**Independent Test**: Employees can view own history, Admin/HR can view all history with filters (date, employee, type, status) and search functionality

### Implementation for User Story 6

- [x] T095 [P] [US6] Create History TypeScript types in types/history.ts
- [x] T096 [US6] Implement GET /api/history endpoint with role-based filtering in app/api/history/route.ts
- [x] T097 [US6] Add query parameter support for filters (date range, employee, type, status) in history endpoint
- [x] T098 [US6] Add search functionality (employee_name, details fields) in history endpoint
- [x] T099 [US6] Implement pagination for history results (limit/offset) in history endpoint
- [x] T100 [US6] Create HistoryTable component with sortable columns in app/components/history/HistoryTable.tsx
- [x] T101 [US6] Create HistoryFilters component (date picker, dropdowns, search) in app/components/history/HistoryFilters.tsx
- [x] T102 [US6] Create HistoryDetailModal component for detailed view in app/components/history/HistoryDetailModal.tsx
- [x] T103 [US6] Create history page with role-based content in app/(dashboard)/history/page.tsx
- [x] T104 [US6] Add role check: User role sees only own history, Admin/HR see all
- [x] T105 [US6] Optimize history query with proper indexes for <2s performance (10k records)

**Checkpoint**: At this point, all history is tracked, searchable, and filterable with proper role-based access

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T106 [P] Add loading states to all async components
- [x] T107 [P] Add error boundaries for graceful error handling in app/error.tsx
- [x] T108 [P] Improve mobile responsiveness across all pages
- [x] T109 [P] Add toast notifications for success/error feedback in lib/utils/toast.ts
- [x] T110 Add animation for diamond balance updates
- [x] T111 Add confirmation dialogs for destructive actions (delete achievement, reject purchase)
- [x] T112 [P] Create QUICKSTART.md with setup instructions, seed data, and testing guide
- [x] T113 [P] Update README.md with feature overview and architecture
- [x] T114 Verify all success criteria (SC-001 to SC-012) are met
- [x] T115 Run seed script and validate all user stories end-to-end
- [x] T116 Performance audit: Verify page loads <2s, queries <100ms
- [x] T117 Security audit: Verify 100% role-based access control enforcement

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (Profile Management) - P1 priority, should start first
  - US3 (Achievement Claims) - P1 priority, depends on US2 for achievements to exist
  - US2 (Achievement Management) - P2 priority, can run parallel with US1
  - US4 (Product Store) - P2 priority, can run parallel with US1-3
  - US6 (History) - P2 priority, can run parallel with other stories
  - US5 (Approvals) - P3 priority, depends on US4 for purchases to exist
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent from US1
- **User Story 3 (P1)**: Depends on US2 (needs achievements to track/claim)
- **User Story 4 (P2)**: Can start after Foundational - Independent from US1-3
- **User Story 5 (P3)**: Depends on US4 (needs purchases to approve)
- **User Story 6 (P2)**: Can start after Foundational - History is created by other stories

### Within Each User Story

- Type definitions before implementation
- API endpoints before UI components
- Validation utilities before endpoints
- Shared components before page components
- Atomic transaction logic before endpoint implementation

### Parallel Opportunities

**Setup Phase:**
- T002, T003, T004 can run in parallel (different file areas)

**Foundational Phase:**
- T009, T010 can run in parallel (types and validations)
- T011, T012, T015, T016 can run in parallel (different utilities)

**User Story 1:**
- T019, T020, T021 can run in parallel (invitation code utilities)
- T025, T026 can run in parallel (invitation UI components)
- T028 can run in parallel with invitation code tasks
- T032, T033 can run in parallel (auth forms)

**User Story 2:**
- T046, T047 can run in parallel (types and utilities)
- T053, T054, T055 can run in parallel (achievement UI components)

**User Story 3:**
- T064, T065, T066 can run in parallel (progress UI components)

**User Story 4:**
- T071, T072 can run in parallel (types)
- T077, T078, T079, T080 can run in parallel (store UI components)

**User Story 6:**
- T095 can run early
- T100, T101, T102 can run in parallel (history UI components)

**Polish Phase:**
- T106, T107, T108, T109, T112, T113 can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase

```bash
# After T006-T008 (database setup) complete, launch utilities in parallel:

Task: "Generate TypeScript types for all database entities in types/database.ts"
Task: "Create Zod validation schemas for all entities in lib/validations/schemas.ts"
Task: "Implement password hashing utilities using bcryptjs in lib/auth/password.ts"
Task: "Create session management with token generation in lib/auth/session.ts"
Task: "Setup error handling utilities in lib/utils/errors.ts"
Task: "Create date formatting utilities in lib/utils/dates.ts"
```

## Parallel Example: User Story 1 - Invitation Code System

```bash
# Launch invitation code utilities in parallel:

Task: "Create InvitationCode TypeScript types in types/invitation.ts"
Task: "Create invitation code generation utility in lib/invitations/generate.ts"
Task: "Create invitation code validation logic in lib/invitations/validate.ts"

# Then launch UI components in parallel:

Task: "Create InvitationCodeForm component in app/components/invitations/InvitationCodeForm.tsx"
Task: "Create InvitationCodeList component in app/components/invitations/InvitationCodeList.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 3 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T018) - CRITICAL
3. Complete Phase 3: User Story 1 - Profile Management (T019-T045)
4. Complete Phase 4: User Story 2 - Achievement Management (T046-T058) - needed for US3
5. Complete Phase 5: User Story 3 - Achievement Claims (T059-T070)
6. **STOP and VALIDATE**: Test registration → create achievement → claim → balance update
7. Deploy MVP with core reward loop

### Full Feature Delivery

1. Complete Setup + Foundational (T001-T018)
2. Implement Priority P1 stories first:
   - User Story 1: Profile Management (T019-T045)
   - User Story 3: Achievement Claims (T059-T070) - depends on US2
3. Implement Priority P2 stories:
   - User Story 2: Achievement Management (T046-T058)
   - User Story 4: Product Store (T071-T084)
   - User Story 6: History Tracking (T095-T105)
4. Implement Priority P3 stories:
   - User Story 5: Purchase Approvals (T085-T094)
5. Polish and validate (T106-T117)

### Parallel Team Strategy

With 3 developers after Foundational phase:
- **Developer A**: User Story 1 (Profile + Invitations) → User Story 5 (Approvals)
- **Developer B**: User Story 2 (Achievements) → User Story 3 (Claims)
- **Developer C**: User Story 4 (Store) → User Story 6 (History)

---

## Summary

**Total Tasks**: 117
**Phases**: 9 (Setup, Foundational, 6 User Stories, Polish)
**User Stories**: 6 (mapped to spec priorities)
**Parallel Opportunities**: ~35 tasks marked [P] for parallel execution
**MVP Scope**: Phases 1-5 (T001-T070) = 70 tasks

**Task Breakdown by User Story**:
- **US1** (Profile Management): 27 tasks (T019-T045) - includes invitation code system
- **US2** (Achievement Management): 13 tasks (T046-T058)
- **US3** (Achievement Claims): 12 tasks (T059-T070)
- **US4** (Product Store): 14 tasks (T071-T084)
- **US5** (Purchase Approvals): 10 tasks (T085-T094)
- **US6** (History Tracking): 11 tasks (T095-T105)
- **Setup**: 5 tasks (T001-T005)
- **Foundational**: 13 tasks (T006-T018)
- **Polish**: 12 tasks (T106-T117)

**Independent Test Criteria**:
- ✅ Each user story has clear test validation criteria
- ✅ User stories can be developed and tested independently (except US3→US2, US5→US4)
- ✅ MVP (US1+US2+US3) delivers complete achievement-to-reward loop
- ✅ All functional requirements (FR-001 to FR-044) mapped to tasks
- ✅ All success criteria (SC-001 to SC-012) can be validated

**Format Validation**: ✅ All tasks follow checklist format with IDs, optional [P] markers, [Story] labels, and file paths
