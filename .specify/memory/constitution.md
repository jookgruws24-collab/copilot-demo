<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: 
  * Principle I: Added better-sqlite3 to core dependencies
  * Principle II: Added client-side SQLite WASM exception for local data
- Added sections: Data Persistence (new principle VI)
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md (Constitution Check section verified)
  ✅ spec-template.md (aligned with data persistence principles)
  ✅ tasks-template.md (aligned with migration management approach)
- Follow-up TODOs: None
-->

# Copilot Demo Constitution

## Core Principles

### I. Minimal Dependencies

Every feature MUST minimize external dependencies to reduce maintenance burden and security surface area. Core dependencies are limited to: React, Next.js, Tailwind CSS, better-sqlite3 (for local data persistence). New dependencies require explicit justification demonstrating that native/built-in solutions are insufficient.

**Rationale**: Fewer dependencies mean fewer breaking changes, security vulnerabilities, and maintenance overhead. Static web apps should leverage browser capabilities and framework features before adding third-party code. SQLite provides local-first data without external services.

### II. Static-First Architecture

All pages MUST be statically generated at build time unless dynamic rendering is explicitly required and justified. API routes are permitted only for server-side operations that cannot be static. Client-side data fetching should use native fetch or framework utilities. Client-side SQLite using WASM is permitted for local-first data storage without server runtime.

**Rationale**: Static generation provides maximum performance, reliability, and deployment flexibility. Pre-rendered HTML requires no server runtime and deploys anywhere (CDN, object storage, static hosts). Client-side SQLite maintains static-first principles while enabling local data persistence.

### III. Component Modularity

Components MUST be self-contained, reusable, and single-purpose. Each component resides in its own file with co-located styles when needed. Shared components live in `app/components/`. Page-specific components may live within their page directory.

**Rationale**: Clear component boundaries improve testability, reusability, and maintainability. Self-contained components are easier to understand, modify, and relocate.

### IV. Type Safety

All code MUST use TypeScript with strict mode enabled. Props, state, and function signatures require explicit types. `any` type is forbidden except when interfacing with untyped third-party APIs, and must include a justification comment.

**Rationale**: Type safety catches errors at compile time, improves IDE support, serves as living documentation, and makes refactoring safer.

### V. Build Performance

Build times MUST remain under 60 seconds for full production builds. New features that increase build time by >10% require optimization before merge. Avoid unnecessary runtime JavaScript through static rendering and selective hydration.

**Rationale**: Fast builds enable rapid iteration and CI/CD efficiency. Minimal JavaScript improves page load performance and user experience.

### VI. Data Persistence

SQLite database file MUST be stored in the repository at `data/app.db` (tracked in git) for local-first data management. Database is intended for personal/local use with modest data volumes (<100MB). Schema migrations MUST use a migration tool (better-sqlite3-migrations or similar) with migration files in `data/migrations/`. All schema changes require migration files, never manual SQL.

**Rationale**: Repository-stored database ensures version control, easy backup/restore, and zero external dependencies. Migration tool provides repeatable schema evolution and rollback capability. Size constraint keeps repository manageable and build/clone times acceptable.

## Technology Stack

**Framework**: Next.js 16+ (App Router)  
**Language**: TypeScript 5+ (strict mode)  
**Styling**: Tailwind CSS 4+ (PostCSS)  
**Database**: SQLite 3+ via better-sqlite3 (local-first, client-side WASM)  
**Migrations**: Migration tool required (e.g., better-sqlite3-migrations, knex)  
**Runtime**: Node.js 20+ for development and build  
**Testing**: Optional - only add when explicitly required by feature specs  
**Package Manager**: npm (as evidenced by package-lock.json)

All dependencies MUST remain at latest stable versions. Security updates applied within 7 days of release.

**Database Constraints**:
- Database file location: `data/app.db` (tracked in repository)
- Maximum database size: 100MB (enforced via pre-commit hook)
- Migration files: `data/migrations/*.sql` or `*.js`
- Schema changes: Migration tool only, no manual SQL execution

## Development Workflow

**Code Quality**:
- ESLint configuration MUST pass with zero errors
- Formatting is enforced via ESLint rules
- TypeScript compiler MUST emit zero errors

**Testing Philosophy**:
- Tests are OPTIONAL by default
- Tests required only when feature specification explicitly requests them
- When tests are included, they MUST be written before implementation
- Integration tests preferred over unit tests

**Commit Standards**:
- Commits MUST be atomic and focused
- Commit messages follow conventional commits format
- Each commit MUST leave the project in a working state

**Deployment**:
- All deployments use static export (`next build`)
- Output directory (`out/`) contains only static assets
- No server runtime dependencies in production
- SQLite database file (`data/app.db`) deployed alongside static assets for client-side WASM access

## Governance

This constitution supersedes all other development practices and guidelines. All code reviews, feature planning, and architectural decisions MUST verify compliance with these principles.

**Amendment Process**:
- Amendments require documented rationale
- Version number MUST increment per semantic versioning
- Dependent templates and documentation MUST be updated within same PR

**Complexity Justification**:
- Violations require explicit approval and documentation in implementation plan
- Simpler alternatives MUST be documented and justified as insufficient
- All complexity debt tracked in constitution check section of plan.md

**Compliance Review**:
- Every feature specification checked against constitution
- Implementation plans include constitution check section
- Pre-merge reviews verify constitutional compliance

**Version**: 1.1.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
