<!--
Sync Impact Report:
- Version change: Template → 1.0.0
- Modified principles: All new (initial constitution)
- Added sections: Core Principles (5), Technology Stack, Development Workflow, Governance
- Removed sections: None (initial creation)
- Templates requiring updates:
  ✅ plan-template.md (Constitution Check section verified)
  ✅ spec-template.md (aligned with simplicity principles)
  ✅ tasks-template.md (aligned with testing optional approach)
- Follow-up TODOs: None
-->

# Copilot Demo Constitution

## Core Principles

### I. Minimal Dependencies

Every feature MUST minimize external dependencies to reduce maintenance burden and security surface area. Core dependencies are limited to: React, Next.js, Tailwind CSS. New dependencies require explicit justification demonstrating that native/built-in solutions are insufficient.

**Rationale**: Fewer dependencies mean fewer breaking changes, security vulnerabilities, and maintenance overhead. Static web apps should leverage browser capabilities and framework features before adding third-party code.

### II. Static-First Architecture

All pages MUST be statically generated at build time unless dynamic rendering is explicitly required and justified. API routes are permitted only for server-side operations that cannot be static. Client-side data fetching should use native fetch or framework utilities.

**Rationale**: Static generation provides maximum performance, reliability, and deployment flexibility. Pre-rendered HTML requires no server runtime and deploys anywhere (CDN, object storage, static hosts).

### III. Component Modularity

Components MUST be self-contained, reusable, and single-purpose. Each component resides in its own file with co-located styles when needed. Shared components live in `app/components/`. Page-specific components may live within their page directory.

**Rationale**: Clear component boundaries improve testability, reusability, and maintainability. Self-contained components are easier to understand, modify, and relocate.

### IV. Type Safety

All code MUST use TypeScript with strict mode enabled. Props, state, and function signatures require explicit types. `any` type is forbidden except when interfacing with untyped third-party APIs, and must include a justification comment.

**Rationale**: Type safety catches errors at compile time, improves IDE support, serves as living documentation, and makes refactoring safer.

### V. Build Performance

Build times MUST remain under 60 seconds for full production builds. New features that increase build time by >10% require optimization before merge. Avoid unnecessary runtime JavaScript through static rendering and selective hydration.

**Rationale**: Fast builds enable rapid iteration and CI/CD efficiency. Minimal JavaScript improves page load performance and user experience.

## Technology Stack

**Framework**: Next.js 16+ (App Router)  
**Language**: TypeScript 5+ (strict mode)  
**Styling**: Tailwind CSS 4+ (PostCSS)  
**Runtime**: Node.js 20+ for development and build  
**Testing**: Optional - only add when explicitly required by feature specs  
**Package Manager**: npm (as evidenced by package-lock.json)
**Database**: SQLite

All dependencies MUST remain at latest stable versions. Security updates applied within 7 days of release.

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

**Version**: 1.0.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
