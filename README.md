# Employee Achievement and Rewards System

A Next.js web application for managing employee achievements, diamond rewards, and product purchases with role-based access control.

## Project Overview

This application enables:
- **Employee Management**: Register with optional invitation codes, manage profiles, assign roles (User, Admin, HR)
- **Invitation System**: Admin/HR generate trackable codes for registration campaigns
- **Achievement Tracking**: Create time-bound achievements, track progress, claim diamond rewards
- **Diamond Economy**: Virtual currency system with accurate balance tracking
- **Product Store**: Purchase products with diamonds, pending admin approval
- **History & Audit**: Complete activity logs with role-based visibility

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Cookie-based sessions with bcryptjs
- **Validation**: Zod

## Documentation

- **[Feature Specification](./EMPLOYEE_REWARDS_SPEC.md)** - Complete requirements (40 functional requirements, 6 user stories)
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Architecture, tech decisions, constitutional compliance
- **[Research & Decisions](./RESEARCH.md)** - Architectural patterns, database strategy, auth design
- **[Data Model](./DATA_MODEL.md)** - SQLite schema (8 entities), relationships, indexes, queries
- **[Quick Start Guide](./QUICKSTART.md)** - Development setup, seed data, testing scenarios

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Install feature-specific dependencies
npm install better-sqlite3 bcryptjs zod
npm install --save-dev @types/better-sqlite3 @types/bcryptjs

# Start development server (auto-initializes database)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
app/
├── (auth)/              # Login, registration
├── (dashboard)/         # Protected pages (profile, achievements, store, history)
│   └── admin/           # Admin-only pages (approvals, management)
├── api/                 # API routes (database operations)
├── components/          # React components (UI, auth, domain-specific)
├── lib/                 # Database, auth, validations, utilities
└── types/               # TypeScript type definitions

lib/db/
└── copilot-demo.db     # SQLite database (gitignored)
```

## Key Features

### User Roles
- **User**: Register (with/without code), track achievements, claim rewards, purchase products, view own history
- **Admin**: All user features + generate invitation codes, approve purchases, manage employees, view all history, deactivate codes
- **HR**: All user features + generate invitation codes, create/edit achievements, view all history, deactivate codes

### Achievement States
- **Upcoming**: Not yet started (before start date)
- **On Doing**: Active and in progress
- **Completed**: Conditions met, ready to claim
- **Claimed**: Rewards added to diamond balance

### Purchase Workflow
1. Employee selects product
2. Diamonds deducted immediately (status: Pending)
3. Admin reviews and approves/rejects
4. If rejected, diamonds refunded with reason

## Success Criteria

- ✅ Profile registration in <3 minutes
- ✅ Achievement claim in <30 seconds
- ✅ Purchase flow in <1 minute
- ✅ 100% diamond balance accuracy
- ✅ 100% role-based access control enforcement
- ✅ History search in <2 seconds (10k+ records)
- ✅ Support 500 concurrent users

## Constitutional Compliance

This project adheres to the [Constitution](./.specify/memory/constitution.md):
- ✅ **Minimal Dependencies**: Only 3 additions (better-sqlite3, bcryptjs, zod)
- ✅ **Static-First**: API routes only for database operations
- ✅ **Component Modularity**: Domain-organized, self-contained components
- ✅ **Type Safety**: TypeScript strict mode, explicit types
- ✅ **Build Performance**: Expected 20-30s build time (<60s limit)

## Next Steps

1. **Implement database layer** (`lib/db/`)
2. **Create authentication system** (`lib/auth/`)
3. **Build UI components** (`app/components/`)
4. **Implement API routes** (`app/api/`)
5. **Create pages** (`app/(auth)/`, `app/(dashboard)/`)
6. **Add seed data** for development testing

For detailed implementation tasks, see [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
