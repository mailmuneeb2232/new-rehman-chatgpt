# Electronic Store — Software Architecture Document (SAD)
## Part 1.1 — Project Overview, System Architecture, Technology Stack & Development Standards

**Version:** 1.0.0  
**Classification:** Internal Engineering Reference  
**Status:** Approved — Foundation Document  
**Date:** 2026-06-29  
**Authors:** Principal Architecture Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Vision & Objectives](#2-project-vision--objectives)
3. [System Context & Stakeholders](#3-system-context--stakeholders)
4. [Architecture Decision Records (ADR)](#4-architecture-decision-records-adr)
5. [Application Architecture](#5-application-architecture)
6. [Monorepo Structure](#6-monorepo-structure)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Database Architecture](#9-database-architecture)
10. [Caching Architecture](#10-caching-architecture)
11. [File Storage Architecture](#11-file-storage-architecture)
12. [API Architecture & Contracts](#12-api-architecture--contracts)
13. [State Management Architecture](#13-state-management-architecture)
14. [Authentication & Authorization Architecture](#14-authentication--authorization-architecture)
15. [Security Architecture](#15-security-architecture)
16. [Performance Architecture](#16-performance-architecture)
17. [Scalability Architecture](#17-scalability-architecture)
18. [Observability Architecture](#18-observability-architecture)
19. [Deployment Architecture](#19-deployment-architecture)
20. [Module Boundaries & Communication](#20-module-boundaries--communication)
21. [Technology Stack Justification](#21-technology-stack-justification)
22. [Coding Standards & Conventions](#22-coding-standards--conventions)
23. [Error Handling Strategy](#23-error-handling-strategy)
24. [Testing Strategy](#24-testing-strategy)
25. [SEO & Accessibility Architecture](#25-seo--accessibility-architecture)
26. [Third-Party Integration Map](#26-third-party-integration-map)
27. [Environment Strategy](#27-environment-strategy)
28. [Architectural Principles Reference](#28-architectural-principles-reference)
29. [Glossary](#29-glossary)

---

## 1. Executive Summary

Electronic Store is a luxury, enterprise-grade online electronics marketplace designed to serve hundreds of thousands of concurrent users. The platform combines an immersive, premium user experience inspired by Apple Store, Samsung, Razer, and Nothing, with a hardened, scalable backend capable of processing high-volume transactions, real-time inventory updates, and data-intensive analytics.

The system is architected as a monorepo containing a Next.js 15 frontend, a Node.js/Express.js backend, a PostgreSQL relational database managed through Prisma ORM, and a Redis caching layer. Every engineering decision prioritizes **correctness**, **security**, **performance**, **observability**, and **maintainability** over development speed shortcuts.

This document serves as the authoritative foundation specification. All subsequent implementation phases must conform to the constraints, patterns, and contracts defined herein without deviation.

---

## 2. Project Vision & Objectives

### 2.1 Vision Statement

To build the premier luxury electronics shopping destination on the internet — a platform that makes every visitor feel they are interacting with a world-class brand, backed by technology infrastructure that never fails under load.

### 2.2 Core Objectives

| # | Objective | Success Criteria |
|---|-----------|------------------|
| 1 | Premium User Experience | Google Lighthouse ≥ 100 across all metrics |
| 2 | Enterprise Security | Zero known OWASP Top 10 vulnerabilities |
| 3 | High Availability | 99.9% uptime SLA |
| 4 | Scalability | Support 500,000 concurrent users |
| 5 | Performance | TTFB < 200ms, LCP < 1.5s, CLS < 0.05 |
| 6 | Accessibility | WCAG 2.1 AA compliance |
| 7 | SEO | Structured data, sitemap, SSR for all product pages |
| 8 | Developer Experience | Type-safe end-to-end, modular, testable codebase |

### 2.3 Non-Functional Requirements

- **Response Time:** API P95 latency < 300ms under normal load
- **Throughput:** Backend capable of 10,000 requests/second per node
- **Data Integrity:** ACID-compliant transactions for all financial operations
- **Disaster Recovery:** RPO < 1 hour, RTO < 4 hours
- **Audit Trail:** All admin actions, payments, and security events logged immutably
- **Zero Downtime Deployments:** Blue-green or rolling deployments

---

## 3. System Context & Stakeholders

### 3.1 System Context Diagram (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ELECTRONIC STORE SYSTEM                          │
│                                                                         │
│  ┌──────────────┐    HTTPS     ┌────────────────────────────────────┐  │
│  │   Customer   │◄────────────►│          Next.js Frontend          │  │
│  │   Browser    │              │      (SSR / SSG / CSR hybrid)      │  │
│  └──────────────┘              └────────────────┬───────────────────┘  │
│                                                  │ REST API / WS        │
│  ┌──────────────┐    HTTPS     ┌────────────────▼───────────────────┐  │
│  │    Admin     │◄────────────►│       Express.js API Server        │  │
│  │   Browser    │              │     (Node.js / TypeScript)         │  │
│  └──────────────┘              └──┬──────────────┬──────────────────┘  │
│                                   │              │                      │
│                       ┌───────────▼──┐   ┌───────▼──────┐             │
│                        │  PostgreSQL  │   │    Redis     │             │
│                        │  (Primary +  │   │  (Cache +    │             │
│                        │   Replica)   │   │   Sessions)  │             │
│                        └──────────────┘   └──────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                   │
         ▼                    ▼                   ▼
   ┌──────────┐        ┌──────────┐        ┌──────────────┐
   │Cloudinary│        │  SMTP /  │        │  Payment     │
   │(Storage) │        │ Mailgun  │        │  Gateway     │
   └──────────┘        └──────────┘        └──────────────┘
```

### 3.2 Stakeholders

| Role | Concerns | Impact |
|------|----------|--------|
| End Customer | UX, speed, trust, security | Primary |
| Admin / Store Manager | Dashboard, inventory, orders | High |
| Product Owner | Business metrics, conversion | High |
| DevOps Engineer | Deployment, reliability, monitoring | High |
| Backend Engineer | API correctness, database integrity | High |
| Frontend Engineer | UI consistency, performance | High |
| Security Officer | Vulnerability surface, compliance | Critical |
| Database Administrator | Data integrity, query performance | High |

---

## 4. Architecture Decision Records (ADR)

### ADR-001: Monorepo Architecture

**Context:** Multiple packages (frontend, backend, shared types) need to coexist.  
**Decision:** Use a Turborepo-powered monorepo with pnpm workspaces.  
**Rationale:** Shared TypeScript types eliminate drift between frontend and backend. A single repository ensures atomic commits across packages. Turborepo provides incremental build caching, reducing CI time by 60–80%.  
**Consequences:** All engineers must understand workspace boundaries. CI pipeline must be configured per-package.

### ADR-002: Next.js 15 as the Frontend Framework

**Context:** Need SSR, SEO, performance, and React 19 compatibility.  
**Decision:** Next.js 15 with App Router, React Server Components, Streaming SSR.  
**Rationale:** App Router enables per-route rendering strategies (SSG for static marketing pages, SSR for product pages, CSR for dashboard). Built-in image optimization, font optimization, and edge-ready architecture satisfy all performance goals.  
**Consequences:** Engineers must understand the server/client component boundary. Data fetching patterns differ from traditional React SPAs.

### ADR-003: Express.js over NestJS

**Context:** Need a mature, flexible Node.js HTTP framework.  
**Decision:** Express.js with a strict layered architecture enforced by project conventions and TypeScript interfaces.  
**Rationale:** NestJS introduces opinionated abstractions (decorators, modules) that slow initial development and add runtime overhead. Express with clean architecture conventions provides the same separation of concerns with less magic, better debugging, and lower memory footprint. The layered architecture is enforced by TypeScript interfaces, not framework scaffolding.  
**Consequences:** Team must enforce architectural discipline through code review rather than framework constraints.

### ADR-004: PostgreSQL as Primary Database

**Context:** Need ACID-compliant relational storage for financial and inventory data.  
**Decision:** PostgreSQL 16 with Prisma ORM, read replica for analytics queries.  
**Rationale:** PostgreSQL's JSONB support, full-text search, and row-level security cover all data access patterns. Prisma provides type-safe query building, migration management, and schema validation. A read replica isolates heavy analytics queries from transactional throughput.  
**Consequences:** Schema migrations must be reviewed by a database architect. All queries must go through the repository layer.

### ADR-005: Redis for Caching and Sessions

**Context:** Need sub-millisecond access to frequently read data and session storage.  
**Decision:** Redis 7 with key namespacing and TTL policies per data type.  
**Rationale:** Redis supports atomic operations needed for cart management, OTP rate limiting, and inventory reservation. Persistence via RDB + AOF provides durability without sacrificing speed.  
**Consequences:** Cache invalidation strategy must be defined per resource type.

### ADR-006: JWT + Refresh Token Authentication

**Context:** Need stateless, scalable authentication compatible with multi-instance deployments.  
**Decision:** Short-lived (15 min) access tokens + long-lived (7 day) refresh tokens stored in HttpOnly cookies. Refresh token rotation on every use. Token family tracking in Redis for revocation.  
**Rationale:** Stateless access tokens allow horizontal scaling without sticky sessions. HttpOnly cookies prevent XSS token theft. Refresh token rotation detects token reuse attacks. Token family revocation prevents replay attacks on stolen refresh tokens.  
**Consequences:** Every API request must validate the access token. Refresh token rotation must be atomic.

### ADR-007: BullMQ for Background Job Processing

**Context:** Email, invoice generation, analytics aggregation, and cache warming must not block HTTP responses.  
**Decision:** BullMQ with Redis backend, separate queues per job type, dead-letter queues for failed jobs.  
**Rationale:** BullMQ provides priority queues, delayed jobs, job retries with exponential backoff, and real-time job monitoring. Redis-backed queues survive server restarts.  
**Consequences:** Job processors must be idempotent. Failed jobs must be alertable.

### ADR-008: Cloudinary for Media Management

**Context:** Product images, avatars, and documents require optimized storage and delivery.  
**Decision:** Cloudinary with transformation pipelines for automatic image optimization, WebP conversion, and responsive sizing.  
**Rationale:** Cloudinary's CDN delivers images from edge nodes globally. On-the-fly transformations (resize, crop, format conversion) eliminate the need for separate image processing infrastructure. Signed uploads prevent unauthorized storage access.  
**Consequences:** All image URLs must be generated via Cloudinary SDK. Direct blob storage is prohibited.

---

## 5. Application Architecture

### 5.1 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│   React Components · Pages · Layouts · UI Primitives        │
│   No business logic. Data display and user input only.      │
└────────────────────────┬────────────────────────────────────┘
                         │ Props / Hooks / Server Actions
┌────────────────────────▼────────────────────────────────────┐
│                    BUSINESS LAYER                            │
│   Custom Hooks · Context · TanStack Query · Zustand          │
│   Orchestrates UI-level business decisions.                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (Axios)
╔════════════════════════▼════════════════════════════════════╗
║              API BOUNDARY (REST over HTTPS)                 ║
╚════════════════════════╤════════════════════════════════════╝
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  APPLICATION LAYER (Backend)                 │
│   Controllers · Middlewares · Request Validation             │
│   No business rules. Orchestrates service calls.             │
└────────────────────────┬────────────────────────────────────┘
                         │ Service calls
┌────────────────────────▼────────────────────────────────────┐
│                    DOMAIN / SERVICE LAYER                    │
│   Service Classes · Business Rules · Domain Events           │
│   Pure business logic. No HTTP, no Prisma, no Redis.         │
└────────────────────────┬────────────────────────────────────┘
                         │ Repository interfaces
┌────────────────────────▼────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│   Repository Implementations · External APIs · Queue        │
│   Implements domain interfaces. Knows about Prisma/Redis.    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DATABASE LAYER                            │
│   PostgreSQL · Redis · Prisma Client · Migrations            │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow — Customer Purchase

```
Customer clicks Buy Now
        │
        ▼
Presentation Layer
  └─► CartButton component dispatches addToCart action
        │
        ▼
Business Layer
  └─► useCart hook (Zustand) updates optimistic state
  └─► TanStack Query mutation triggers POST /api/v1/cart
        │
        ▼
[API Boundary — HTTPS]
        │
        ▼
Application Layer
  └─► CartController.addItem()
  └─► validateCartItemDto()
  └─► authenticateRequest middleware
        │
        ▼
Domain / Service Layer
  └─► CartService.addItem(userId, productId, quantity)
  └─► InventoryService.checkAvailability(productId, quantity)
  └─► PricingService.calculateItemPrice(productId)
        │
        ▼
Infrastructure Layer
  └─► CartRepository.upsertCartItem()
  └─► ProductRepository.findById() [Redis cache hit → PostgreSQL fallback]
        │
        ▼
Database Layer
  └─► PostgreSQL: INSERT/UPDATE cart_items
  └─► Redis: SET cart:{userId} with updated cart JSON
        │
        ▼
[Response bubbles back up through layers]
        │
        ▼
Presentation Layer
  └─► Cart UI updates with confirmed server state
```

---

## 6. Monorepo Structure

```
electronic-store/
│
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   └── api/                          # Express.js backend
│
├── packages/
│   ├── types/                        # Shared TypeScript types & interfaces
│   │   ├── src/
│   │   │   ├── api/                  # Request/Response DTOs
│   │   │   ├── domain/               # Domain models
│   │   │   ├── enums/                # Shared enumerations
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                        # Shared pure utility functions
│   │   ├── src/
│   │   │   ├── formatters/
│   │   │   ├── validators/
│   │   │   ├── crypto/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                       # Shared configuration schemas
│   │   ├── src/
│   │   │   ├── env.schema.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ui/                           # Shared UI component primitives
│       ├── src/
│       │   ├── components/
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.prod.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   └── kubernetes/
│       ├── deployments/
│       ├── services/
│       ├── ingress/
│       └── configmaps/
│
├── scripts/
│   ├── setup.sh
│   ├── seed.ts
│   ├── migrate.ts
│   └── deploy.sh
│
├── docs/
│   ├── architecture/
│   │   ├── SAD.md                    # This document
│   │   └── diagrams/
│   ├── api/
│   │   └── openapi.yaml
│   ├── guides/
│   │   ├── SETUP.md
│   │   ├── DEPLOYMENT.md
│   │   ├── CONTRIBUTING.md
│   │   └── TROUBLESHOOTING.md
│   └── decisions/
│       └── ADR-*.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd-staging.yml
│   │   └── cd-production.yml
│   └── pull_request_template.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .eslintrc.js
├── .prettierrc
├── .editorconfig
└── README.md
```

### 6.1 apps/web/ (Next.js Frontend)

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # Route group: public pages
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── layout.tsx
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (shop)/                   # Route group: shopping experience
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Product detail (SSR)
│   │   │   ├── categories/
│   │   │   ├── search/
│   │   │   ├── cart/
│   │   │   └── checkout/
│   │   ├── (auth)/                   # Route group: authentication
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify-email/
│   │   ├── (customer)/               # Route group: customer dashboard
│   │   │   └── dashboard/
│   │   │       ├── orders/
│   │   │       ├── wishlist/
│   │   │       ├── profile/
│   │   │       └── addresses/
│   │   ├── (admin)/                  # Route group: admin dashboard
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── customers/
│   │   │       ├── inventory/
│   │   │       ├── analytics/
│   │   │       └── settings/
│   │   ├── api/                      # Next.js API routes (BFF layer only)
│   │   │   └── revalidate/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # ShadCN primitives
│   │   ├── common/                   # Shared application components
│   │   │   ├── navbar/
│   │   │   ├── footer/
│   │   │   ├── breadcrumb/
│   │   │   └── seo/
│   │   ├── product/                  # Product-domain components
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── 3d/                       # Three.js / R3F scenes
│   │   └── animations/               # GSAP / Framer Motion
│   │
│   ├── features/                     # Feature modules (business logic layer)
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── api/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── search/
│   │
│   ├── hooks/                        # Global reusable hooks
│   ├── store/                        # Zustand global stores
│   ├── lib/                          # Library configurations
│   │   ├── axios.ts
│   │   ├── query-client.ts
│   │   ├── fonts.ts
│   │   └── utils.ts
│   ├── services/                     # API service functions (Axios)
│   ├── config/                       # Frontend configuration
│   ├── types/                        # Frontend-specific types
│   └── constants/                    # Application constants
│
├── public/
│   ├── images/
│   ├── fonts/
│   ├── icons/
│   ├── 3d/                           # Static 3D model assets (.glb/.gltf)
│   └── lottie/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 6.2 apps/api/ (Express.js Backend)

```
apps/api/
├── src/
│   ├── config/                       # Environment + app configuration
│   │   ├── env.ts                    # Validated env using zod
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── cloudinary.ts
│   │   ├── mailer.ts
│   │   └── logger.ts
│   │
│   ├── modules/                      # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── reviews/
│   │   ├── wishlist/
│   │   ├── inventory/
│   │   ├── search/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── addresses/
│   │   └── uploads/
│   │
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts
│   │   │   ├── authorize.ts
│   │   │   ├── rate-limiter.ts
│   │   │   ├── request-logger.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── validate.ts
│   │   │   └── not-found.ts
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   ├── validation-error.ts
│   │   │   ├── auth-error.ts
│   │   │   ├── not-found-error.ts
│   │   │   └── payment-error.ts
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma.ts             # Singleton Prisma client
│   │   │   └── prisma/
│   │   │       ├── schema.prisma
│   │   │       └── migrations/
│   │   ├── cache/
│   │   │   ├── redis.ts
│   │   │   └── cache-keys.ts
│   │   ├── queue/
│   │   │   ├── queue.factory.ts
│   │   │   ├── workers/
│   │   │   │   ├── email.worker.ts
│   │   │   │   ├── invoice.worker.ts
│   │   │   │   ├── analytics.worker.ts
│   │   │   │   └── cache-warmup.worker.ts
│   │   │   └── jobs/
│   │   │       ├── send-email.job.ts
│   │   │       ├── generate-invoice.job.ts
│   │   │       └── aggregate-analytics.job.ts
│   │   ├── storage/
│   │   │   └── cloudinary.ts
│   │   ├── mailer/
│   │   │   ├── mailer.ts
│   │   │   └── templates/
│   │   └── cron/
│   │       └── cron.scheduler.ts
│   │
│   ├── app.ts                        # Express app setup
│   └── server.ts                     # HTTP server bootstrap
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tsconfig.json
└── package.json
```

---

## 7. Frontend Architecture

### 7.1 Rendering Strategy

| Page Type | Strategy | Reason |
|-----------|----------|--------|
| Homepage | ISR (60s revalidation) | Personalized banners + static hero |
| Product Listing | ISR (30s) | Changes on new products, not per request |
| Product Detail | SSR | Real-time pricing, stock, and SEO metadata |
| Search Results | CSR | Dynamic, user-driven, not indexable |
| Cart / Checkout | CSR | User-specific, no SEO value |
| Customer Dashboard | CSR | Protected, authenticated |
| Admin Dashboard | CSR | Protected, no SEO value |
| Marketing Pages | SSG | Fully static, highest performance |

### 7.2 Component Hierarchy

```
App Layout (Server Component)
├── ThemeProvider
├── QueryClientProvider
├── AuthProvider
│   └── Page (Server Component)
│       └── Suspense boundaries
│           ├── AsyncDataComponent (Server Component)
│           │   └── InteractiveIsland (Client Component — 'use client')
│           └── StaticSection (Server Component)
```

**Server Component rules:**
- Default to Server Components for all page sections that do not require user interaction.
- Only add `'use client'` directive when the component requires: browser APIs, event listeners, React hooks (useState/useEffect), or animation libraries.
- Never import server-only code (Prisma, fs) inside client components.

### 7.3 3D Architecture

The 3D layer is fully isolated into `components/3d/` and uses React Three Fiber as the React renderer over Three.js.

```
components/3d/
├── scenes/
│   ├── HeroScene.tsx              # Homepage hero 3D product showcase
│   ├── ProductViewerScene.tsx     # Interactive product 3D viewer
│   └── BackgroundScene.tsx       # Ambient animated background
├── models/
│   ├── ProductModel.tsx           # GLTF model loader + animations
│   └── EnvironmentSetup.tsx       # HDR environment + lighting
├── effects/
│   ├── BloomEffect.tsx
│   ├── DepthOfField.tsx
│   └── Reflections.tsx
├── controls/
│   └── OrbitControls.tsx
└── hooks/
    ├── useModelLoader.ts
    └── useSceneAnimation.ts
```

**3D Performance Rules:**
- All 3D canvases must be wrapped in a `Suspense` boundary with a fallback skeleton.
- GLTF models must be loaded via `useGLTF` (Drei) with Draco compression.
- `PerformanceMonitor` from Drei must dynamically adjust rendering quality.
- `dpr` must be capped at `[1, 2]` — never higher.
- All 3D scenes must support `prefers-reduced-motion` media query (disable animations, keep static model).

### 7.4 Animation Architecture

Two animation systems are used for distinct purposes:

| Library | Used For | Reason |
|---------|----------|--------|
| GSAP | Scroll storytelling, timeline animations, complex sequences | Industry standard for scroll-driven animation |
| Framer Motion | Component mount/unmount, layout animations, gesture-based | Integrates natively with React component lifecycle |
| Lenis | Smooth scroll physics | Replaces native scroll for momentum-based feel |
| Motion One | Lightweight imperative animations | Performance-critical micro-animations |

**Animation Rules:**
- All animations must respect `prefers-reduced-motion`. Use a `useReducedMotion()` hook globally.
- GSAP ScrollTrigger instances must be killed in cleanup functions to prevent memory leaks.
- Framer Motion `variants` must be defined outside components to prevent re-creation on render.
- Never animate properties that trigger layout (width, height, top, left). Only animate `transform` and `opacity`.

---

## 8. Backend Architecture

### 8.1 Module Structure (Feature-based)

Every module follows an identical 6-file structure:

```
module-name/
├── module-name.controller.ts    # HTTP in/out only. No logic.
├── module-name.service.ts       # All business rules. Pure functions where possible.
├── module-name.repository.ts    # All Prisma/Redis interactions.
├── module-name.routes.ts        # Route definitions + middleware chain.
├── module-name.validator.ts     # Zod schemas for request validation.
└── module-name.types.ts         # Module-specific TypeScript interfaces.
```

### 8.2 Request Lifecycle

```
Incoming HTTP Request
        │
        ▼
[1] Morgan request logger
        │
        ▼
[2] Helmet (security headers)
        │
        ▼
[3] CORS validation
        │
        ▼
[4] Rate Limiter (per-IP, per-route)
        │
        ▼
[5] Body Parser + Cookie Parser
        │
        ▼
[6] Route Matching
        │
        ▼
[7] authenticate middleware (JWT validation)
        │
        ▼
[8] authorize middleware (RBAC check)
        │
        ▼
[9] validate middleware (Zod schema validation)
        │
        ▼
[10] Controller method
        │
        ▼
[11] Service layer
        │
        ▼
[12] Repository layer
        │
        ▼
[13] Database / Cache
        │
        ▼
[14] Response serialization
        │
        ▼
[15] Winston request completion log
        │
        ▼
HTTP Response
```

### 8.3 Controller Contract

Controllers must follow this exact pattern. They may not contain business logic:

```typescript
// products.controller.ts
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const result = await this.productService.findBySlug(slug);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}
```

### 8.4 Service Contract

Services contain all business rules. They must be injectable and testable:

```typescript
// products.service.ts
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findBySlug(slug: string): Promise<ProductDto> {
    const cached = await this.cacheService.get<ProductDto>(CacheKeys.product(slug));
    if (cached) return cached;

    const product = await this.productRepository.findBySlug(slug);
    if (!product) throw new NotFoundError(`Product '${slug}' not found`);

    await this.cacheService.set(CacheKeys.product(slug), product, 300);
    return product;
  }
}
```

### 8.5 Repository Contract

Repositories are the only layer that touches Prisma and Redis:

```typescript
// products.repository.ts
export class ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findBySlug(slug: string): Promise<Product | null> {
    return this.db.product.findUnique({
      where: { slug, deletedAt: null },
      include: { images: true, brand: true, category: true },
    });
  }
}
```

### 8.6 Background Jobs Architecture

```
BullMQ Queue System
│
├── email-queue
│   ├── welcome-email job
│   ├── order-confirmation job
│   ├── shipping-notification job
│   ├── password-reset job
│   └── otp-email job
│
├── invoice-queue
│   └── generate-pdf job
│
├── analytics-queue
│   ├── aggregate-daily-sales job
│   ├── update-trending-products job
│   └── compute-search-rankings job
│
└── cache-queue
    ├── warmup-homepage job
    ├── warmup-categories job
    └── invalidate-product-cache job
```

**Job Principles:**
- Every job must be idempotent (safe to run twice with the same input).
- Jobs must use exponential backoff: `attempts: 5, backoff: { type: 'exponential', delay: 2000 }`.
- Failed jobs after max attempts must publish to a dead-letter queue and trigger an alert.
- Job data must be serializable plain objects — no class instances.

---

## 9. Database Architecture

### 9.1 Entity Relationship Overview

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│  Users   │────────►│    Orders    │────────►│ Order Items  │
└──────────┘  1:N    └──────────────┘  1:N    └──────────────┘
     │                      │                        │
     │ 1:N                  │ 1:1                    │ N:1
     ▼                      ▼                        ▼
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│ Addresses│         │   Payments   │         │   Products   │
└──────────┘         └──────────────┘         └──────────────┘
     │                                               │
     │                                               │ N:1
     │ (used by orders)                              ▼
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│   Cart   │────────►│  Cart Items  │    ┌───►│  Categories  │
└──────────┘  1:N    └──────────────┘    │    └──────────────┘
                            │ N:1        │
                            └────────────┤    ┌──────────────┐
                                         └───►│    Brands    │
┌──────────┐         ┌──────────────┐         └──────────────┘
│ Wishlist │────────►│Wishlist Items│
└──────────┘  1:N    └──────────────┘         ┌──────────────┐
                                          ┌───►│Product Images│
┌──────────┐         ┌──────────────┐    │    └──────────────┘
│ Reviews  │◄────────│   Products   │────┤
└──────────┘  N:1    └──────────────┘    │    ┌──────────────┐
                            │            └───►│Product Specs │
                            │ 1:1             └──────────────┘
                            ▼
                     ┌──────────────┐
                     │  Inventory   │
                     └──────────────┘
```

### 9.2 Core Model Conventions

Every Prisma model must implement the following base fields:

```prisma
model ExampleModel {
  id        String    @id @default(uuid()) @db.Uuid
  createdAt DateTime  @default(now())      @map("created_at")
  updatedAt DateTime  @updatedAt           @map("updated_at")
  deletedAt DateTime?                      @map("deleted_at")  // Soft delete

  @@map("example_models")  // snake_case table names
}
```

### 9.3 Indexing Strategy

| Column Pattern | Index Type | Reason |
|----------------|------------|--------|
| Foreign Keys | B-Tree | JOIN performance |
| `slug` fields | Unique B-Tree | Product/category URL lookup |
| `email` on users | Unique B-Tree | Auth lookup |
| `status` on orders | B-Tree | Dashboard filtering |
| `createdAt` on orders | B-Tree DESC | Time-series queries |
| Full-text search fields | GIN (tsvector) | Product name/description search |
| `deletedAt` | Partial index (WHERE deletedAt IS NULL) | Soft delete performance |

### 9.4 Query Performance Rules

- All queries touching more than 1,000 rows must use cursor-based pagination.
- N+1 queries are prohibited. Always use `include` or raw joins.
- Analytics queries (aggregations over large datasets) must execute on the read replica.
- Database transactions must be used for all multi-table write operations.
- Query explain plans must be reviewed for all queries during code review.

---

## 10. Caching Architecture

### 10.1 Redis Key Schema

All Redis keys follow a strict namespacing convention to prevent collisions:

```
{namespace}:{resource}:{identifier}:{variant}
```

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `cache:product:{slug}` | 300s | Single product detail |
| `cache:products:list:{page}:{filters_hash}` | 60s | Paginated product list |
| `cache:category:{slug}` | 600s | Category with subcategories |
| `cache:homepage` | 60s | Entire homepage data payload |
| `cache:search:suggestions:{query}` | 120s | Autocomplete suggestions |
| `cache:trending:products` | 900s | Trending product IDs |
| `session:refresh:{userId}:{tokenFamily}` | 7d | Refresh token family |
| `otp:{purpose}:{email}` | 600s | OTP code (email verification, password reset) |
| `cart:{userId}` | 86400s | User cart state |
| `ratelimit:{ip}:{route}` | 60s | Rate limit counter |
| `lock:inventory:{productId}` | 30s | Inventory reservation lock |
| `viewed:{userId}` | 86400s | Recently viewed product IDs (Redis List) |
| `wishlist:cache:{userId}` | 300s | Wishlist IDs |

### 10.2 Cache Invalidation Strategy

| Event | Invalidated Keys |
|-------|------------------|
| Product updated | `cache:product:{slug}`, `cache:products:list:*` |
| Product stock change | `cache:product:{slug}`, `cache:homepage` |
| Category updated | `cache:category:{slug}`, `cache:products:list:*` |
| Homepage banner updated | `cache:homepage` |
| Order placed | `cache:trending:products` (queued re-aggregation) |

Invalidation must use pattern-based deletion via Lua scripts — never `KEYS *` in production.

---

## 11. File Storage Architecture

### 11.1 Cloudinary Organization

```
electronic-store/
├── products/
│   ├── {productId}/
│   │   ├── main          # Primary product image
│   │   ├── gallery/      # Gallery images
│   │   └── 360/          # 360-degree view frames
├── categories/
├── brands/
├── users/
│   └── avatars/
├── cms/
│   └── banners/
└── documents/
    └── invoices/
```

### 11.2 Upload Security Rules

- All uploads must use Cloudinary **signed uploads**. Unsigned uploads are disabled on the Cloudinary account.
- Upload signatures must be generated server-side per-request with a 60-second expiry.
- Allowed file types: `jpg`, `jpeg`, `png`, `webp`, `gif`, `svg` for images; `pdf` for documents.
- Maximum file size: 10MB for images, 50MB for videos.
- All uploaded images are automatically transformed to WebP format.
- Transformation pipeline for product images: resize to max 1920px width, quality auto, format webp.

---

## 12. API Architecture & Contracts

### 12.1 Versioning

All API routes are prefixed: `/api/v1/`

Breaking changes require a new version prefix (`/api/v2/`). Old versions must be deprecated with a sunset date header:
```
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Deprecation: true
```

### 12.2 Standard Response Envelope

**Success (2xx):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-06-29T12:00:00.000Z",
    "requestId": "req_01J3X8...",
    "version": "v1"
  }
}
```

**Paginated Success:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 843,
    "totalPages": 43,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextCursor": "cursor_abc123"
  },
  "meta": {
    "timestamp": "2026-06-29T12:00:00.000Z",
    "requestId": "req_01J3X8..."
  }
}
```

**Error (4xx / 5xx):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Minimum 8 characters required" }
  ],
  "code": "VALIDATION_ERROR",
  "meta": {
    "timestamp": "2026-06-29T12:00:00.000Z",
    "requestId": "req_01J3X8..."
  }
}
```

**Error Codes Registry:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource already exists (duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
| `PAYMENT_FAILED` | 402 | Payment processing failure |
| `INVENTORY_INSUFFICIENT` | 422 | Requested quantity not available |
| `TOKEN_EXPIRED` | 401 | JWT access token expired |
| `TOKEN_INVALID` | 401 | JWT signature or structure invalid |
| `ACCOUNT_LOCKED` | 423 | Too many failed login attempts |

### 12.3 API Module Map

```
/api/v1/
├── auth/
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   ├── POST   /verify-email
│   ├── POST   /resend-verification
│   └── POST   /send-otp
│
├── users/
│   ├── GET    /me
│   ├── PATCH  /me
│   ├── DELETE /me
│   └── GET    /me/activity
│
├── products/
│   ├── GET    /                    # List with filters
│   ├── GET    /:slug                # Single product
│   ├── GET    /search               # Full-text search
│   ├── GET    /trending
│   ├── GET    /featured
│   ├── GET    /new-arrivals
│   ├── POST   /                    [admin]
│   ├── PATCH  /:id                 [admin]
│   ├── DELETE /:id                 [admin]
│   └── POST   /:id/images          [admin]
│
├── categories/
├── brands/
├── cart/
├── checkout/
├── orders/
├── payments/
├── reviews/
├── wishlist/
├── addresses/
├── inventory/  [admin]
├── analytics/  [admin]
├── users/      [admin]
└── uploads/
```

### 12.4 Rate Limiting Tiers

| Tier | Limit | Window | Applied To |
|------|-------|--------|------------|
| Auth endpoints | 10 requests | 15 min | POST /auth/* |
| OTP endpoints | 3 requests | 10 min | POST /auth/send-otp |
| Public read | 200 requests | 1 min | GET /products, GET /categories |
| Authenticated | 500 requests | 1 min | All authenticated routes |
| Admin | 1000 requests | 1 min | All /admin/* routes |
| Upload | 20 requests | 1 min | POST /uploads |

---

## 13. State Management Architecture

### 13.1 State Categories

| State Type | Tool | Reason |
|------------|------|--------|
| Server state (API data) | TanStack Query | Caching, background refetch, stale-while-revalidate |
| Global UI state | Zustand | Simple, performant, no boilerplate |
| Form state | React Hook Form | Performant forms, Zod integration |
| URL state | Next.js `useSearchParams` | Search filters, pagination |
| Theme | Zustand + localStorage | Persist preference |

### 13.2 Zustand Store Architecture

```typescript
// Individual stores — never one giant global store
stores/
├── use-auth-store.ts       // { user, isAuthenticated, setUser, clearUser }
├── use-cart-store.ts       // { items, addItem, removeItem, clearCart }
├── use-wishlist-store.ts   // { productIds, toggle, has }
├── use-ui-store.ts         // { mobileMenuOpen, searchOpen, notifications }
└── use-theme-store.ts      // { theme, setTheme }
```

**Store Rules:**
- Each store manages one domain. Cross-domain logic lives in hooks.
- Zustand stores must be initialized with `devtools` middleware in development.
- Persistent state must use `persist` middleware with a storage adapter.
- Never derive data inside a store — derive in the consuming component with `useShallow`.

### 13.3 TanStack Query Configuration

```typescript
// Global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 1 minute
      gcTime: 5 * 60_000,         // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**Query Key Convention:**
```typescript
// Centralized query key factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
};
```

---

## 14. Authentication & Authorization Architecture

### 14.1 Authentication Flow

```
Login Request
      │
      ▼
[1] Validate credentials (email + password)
      │
      ▼
[2] Compare bcrypt hash (cost factor: 12)
      │
      ▼
[3] Check account status (active, not locked)
      │
      ▼
[4] Generate Access Token
    └─► JWT, RS256, 15-minute expiry
    └─► Payload: { sub: userId, role, sessionId }
      │
      ▼
[5] Generate Refresh Token
    └─► Opaque random token (32 bytes, hex)
    └─► Stored in Redis: session:refresh:{userId}:{family}
    └─► 7-day TTL
      │
      ▼
[6] Set Cookies
    └─► access_token: HttpOnly, Secure, SameSite=Strict, 15min
    └─► refresh_token: HttpOnly, Secure, SameSite=Strict, 7d, Path=/api/v1/auth/refresh
      │
      ▼
[7] Log authentication event (Winston + audit table)
      │
      ▼
Response: { user: PublicUserDto }
```

### 14.2 Token Refresh Flow

```
Refresh Request (POST /api/v1/auth/refresh)
      │
      ▼
[1] Extract refresh_token from HttpOnly cookie
      │
      ▼
[2] Look up token family in Redis
      │
     / \
    /   \
 FOUND   NOT FOUND → 401 Unauthorized
    │
    ▼
[3] Token matches stored value?
     / \
    /   \
   YES   NO → Token reuse detected!
    │         Revoke entire family → 401 + security alert
    │
    ▼
[4] Rotate: delete old token, issue new refresh + access token
      │
      ▼
[5] Update Redis with new token (same family key)
      │
      ▼
Response: New cookies set
```

### 14.3 RBAC Model

```
Roles:
  SUPER_ADMIN     → All permissions
  ADMIN           → All product, order, user management
  INVENTORY_ADMIN → Inventory management only
  CUSTOMER        → Shopping operations only
  GUEST           → Read-only public access

Permissions (examples):
  products:read
  products:write
  products:delete
  orders:read
  orders:write
  orders:refund
  users:read
  users:ban
  inventory:update
  analytics:read
  settings:write
```

### 14.4 Account Security Rules

- 5 consecutive failed login attempts → 15-minute account lockout (Redis-based counter).
- Lockout duration doubles on each subsequent lockout series (15m → 30m → 60m → permanent review).
- Successful login resets the failure counter.
- All lockout events are logged and can trigger email alerts.
- OTP codes are 6 digits, valid for 10 minutes, single-use, and rate-limited to 3 per 10 minutes per email.

---

## 15. Security Architecture

### 15.1 Security Layer Stack

```
Incoming Request
      │
      ▼
[Cloudflare / CDN WAF]          ← DDoS protection, bot filtering
      │
      ▼
[Nginx Reverse Proxy]           ← TLS termination, HTTP→HTTPS redirect
      │
      ▼
[Helmet.js]                     ← Security headers
  Content-Security-Policy
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Permissions-Policy
      │
      ▼
[CORS Policy]                   ← Allowlist of permitted origins only
      │
      ▼
[Rate Limiter]                  ← Per-IP, per-route, Redis-backed
      │
      ▼
[Request Validation]            ← Zod schemas — reject malformed input early
      │
      ▼
[Authentication]                ← JWT verification (RS256)
      │
      ▼
[Authorization]                 ← RBAC permission check
      │
      ▼
[Business Logic]
      │
      ▼
[Prisma ORM]                    ← Parameterized queries — SQL injection prevention
      │
      ▼
[Response Sanitization]         ← Strip internal fields, PII minimization
```

### 15.2 OWASP Top 10 Mitigation

| OWASP Risk | Mitigation |
|------------|------------|
| A01 Broken Access Control | RBAC on every route, admin routes isolated |
| A02 Cryptographic Failures | bcrypt (cost 12), RS256 JWT, HTTPS-only, env var secrets |
| A03 Injection | Prisma parameterized queries, Zod input validation |
| A04 Insecure Design | Clean Architecture, defense in depth, threat modeling |
| A05 Security Misconfiguration | Helmet, CSP, environment-specific config, no default creds |
| A06 Vulnerable Components | Dependabot, `npm audit` in CI, pinned dependency versions |
| A07 Auth Failures | Refresh token rotation, account lockout, OTP, bcrypt |
| A08 Software Integrity Failures | Subresource integrity, signed Cloudinary uploads, locked lockfiles |
| A09 Logging Failures | Winston structured logging, immutable audit trail, log shipping |
| A10 SSRF | External URL validation, allowlist for webhook destinations |

### 15.3 Secrets Management

- All secrets must live in environment variables — never in source code or config files.
- `.env` files must never be committed. `.env.example` is committed with placeholder values only.
- Production secrets must be managed through a secrets manager (AWS Secrets Manager, Doppler, or Vault).
- JWT keys must use RSA-2048 key pairs (RS256), not HMAC secrets.
- Secrets must be rotated on a quarterly schedule or immediately on suspicion of exposure.
- All API keys must be scoped to minimum required permissions.

---

## 16. Performance Architecture

### 16.1 Frontend Performance Budget

| Metric | Target | Critical Threshold |
|--------|--------|-----------------|
| Time to First Byte (TTFB) | < 200ms | 500ms |
| First Contentful Paint (FCP) | < 1.2s | 2.5s |
| Largest Contentful Paint (LCP) | < 1.5s | 2.5s |
| Cumulative Layout Shift (CLS) | < 0.05 | 0.1 |
| Total Blocking Time (TBT) | < 150ms | 300ms |
| JavaScript Bundle (initial) | < 150KB | 300KB |
| Images | WebP, lazy loaded, sized | — |

### 16.2 Frontend Optimization Techniques

**Code Splitting:**
- All `(admin)` route group code is never shipped to customers.
- 3D scenes use `dynamic(() => import(...), { ssr: false })` — never block initial render.
- Heavy libraries (Chart.js, Recharts, Mapbox) loaded only on pages that need them.

**Image Optimization:**
- All images served via Next.js `<Image>` component — automatic WebP, AVIF, and responsive `srcset`.
- Hero images preloaded with `priority` prop.
- Product gallery images lazy-loaded.
- Cloudinary serves images through its CDN with automatic format and quality negotiation.

**Font Optimization:**
- Fonts loaded via `next/font` — zero layout shift, preloaded, self-hosted through Next.js CDN.
- Variable fonts used where available — single file instead of per-weight files.
- `font-display: swap` for all non-critical fonts.

**JavaScript Optimization:**
- `React.memo` on expensive list item components.
- `useMemo` for derived computations in render-heavy components.
- `useCallback` for stable event handler references passed to memoized children.
- Virtual scrolling (react-virtual) for lists exceeding 100 items.

### 16.3 Backend Performance Optimization

**Database:**
- Connection pooling via Prisma's built-in pool (min: 2, max: 20 per instance).
- All frequent queries tested against EXPLAIN ANALYZE.
- Composite indexes for multi-column WHERE clauses.
- Materialized views for analytics aggregations.
- pg-bouncer for connection pooling at the infrastructure level.

**Caching:**
- Cache-aside pattern for all product reads.
- Write-through cache for cart operations.
- Background job for cache warming of top 100 products.
- Redis pipeline for multi-key operations.

**HTTP:**
- gzip compression via `compression` middleware.
- Keep-alive connections enabled.
- HTTP/2 via Nginx.
- ETags and conditional requests for CDN-cacheable responses.

---

## 17. Scalability Architecture

### 17.1 Horizontal Scaling Strategy

```
                   ┌─────────────────┐
                   │  Load Balancer  │  (Nginx / AWS ALB)
                   └────────┬────────┘
                            │ Round-robin / Least-connections
              ┌─────────────┼─────────────┐
              │             │             │
     ┌────────▼──┐  ┌───────▼───┐  ┌─────▼─────┐
     │ API Node 1│  │ API Node 2│  │ API Node 3│
     └────────┬──┘  └───────┬───┘  └─────┬─────┘
              └─────────────┼─────────────┘
                            │ Shared state via Redis
                    ┌───────▼───────┐
                    │  Redis Cluster│
                    └───────────────┘
                            │
                    ┌───────▼───────┐
                    │  PostgreSQL   │
                    │Primary+Replica│
                    └───────────────┘
```

**Session-less design:** Access tokens are JWTs verified locally on each node. No sticky sessions required. Any node can handle any request.

**Stateless workers:** BullMQ workers can be scaled independently. Job queues persist in Redis.

**Database scaling path:**
1. Read replica for analytics and read-heavy queries.
2. Connection pooling (pg-bouncer) before database host.
3. Horizontal sharding by region if needed at 10M+ products.

### 17.2 Auto-scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU usage | > 70% for 2 min | < 30% for 10 min |
| Memory usage | > 80% | < 50% |
| Request queue depth | > 1000 | < 100 |
| P95 response time | > 500ms | < 150ms |

---

## 18. Observability Architecture

### 18.1 Structured Logging (Winston)

All logs output as JSON for ingestion into log aggregation platforms (Datadog, CloudWatch, Grafana Loki):

```json
{
  "level": "info",
  "timestamp": "2026-06-29T12:00:00.000Z",
  "requestId": "req_01J3X8ABC",
  "userId": "usr_01J3X8XYZ",
  "method": "POST",
  "path": "/api/v1/orders",
  "statusCode": 201,
  "durationMs": 145,
  "message": "Order created successfully",
  "meta": { "orderId": "ord_01J3X8DEF" }
}
```

**Log Levels:**

| Level | Used For |
|-------|----------|
| `error` | Uncaught exceptions, payment failures, database errors |
| `warn` | Deprecated usage, high latency, suspicious activity |
| `info` | Successful operations (auth, orders, payments) |
| `http` | Every incoming request (via Morgan) |
| `debug` | Development-only verbose information |

### 18.2 Audit Trail

Security-sensitive events are written to a dedicated `audit_logs` database table in addition to the log system. This table is append-only (no UPDATE, no DELETE).

| Event Type | Logged Fields |
|------------|---------------|
| Login success/failure | userId, IP, userAgent, timestamp |
| Password change | userId, IP, timestamp |
| Admin action | adminId, action, targetResource, targetId, before/after |
| Payment attempt | userId, orderId, amount, gateway response |
| Permission change | adminId, targetUserId, oldRole, newRole |
| Account lockout | userId, IP, failureCount |

### 18.3 Health Check Endpoints

```
GET /health           → { status: 'ok', version: '1.0.0', uptime: 12345 }
GET /health/deep      → { db: 'ok', redis: 'ok', queue: 'ok', storage: 'ok' }
GET /metrics          → Prometheus-compatible metrics (protected endpoint)
```

---

## 19. Deployment Architecture

### 19.1 Environment Hierarchy

```
development → staging → production
```

| Environment | Purpose | Deployment Trigger |
|-------------|---------|--------------------|
| development | Local developer machines | Manual |
| staging | Integration testing, QA | Push to `develop` branch |
| production | Live users | Merge to `main` + manual approval |

### 19.2 CI/CD Pipeline

```
Pull Request Opened
      │
      ▼
[1] Lint (ESLint + Prettier check)
[2] Type check (tsc --noEmit)
[3] Unit tests
[4] Integration tests
[5] Build check (tsc compilation)
[6] Security audit (npm audit)
      │
    PASS → Merge allowed
    FAIL → Block merge
      │
      ▼
Merge to develop branch
      │
      ▼
[Automatic deploy to staging]
[1] Docker build (multi-stage)
[2] Push to container registry
[3] Deploy to staging cluster
[4] Run smoke tests
[5] Notify team on Slack
      │
      ▼
Manual approval → Merge to main
      │
      ▼
[Production deploy]
[1] Docker build with production env
[2] Blue-green deployment
[3] Health check on new instances
[4] Traffic switch
[5] Old instances drained + terminated
```

### 19.3 Docker Architecture

**Multi-stage builds for minimal production images:**

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
# Install only production dependencies

# Stage 2: Builder
FROM node:22-alpine AS builder
# Build TypeScript, prune dev deps

# Stage 3: Runner
FROM node:22-alpine AS runner
# Copy only built output + node_modules
# Non-root user
# Health check
# Expose port
```

**Container security:**
- Non-root user (`node:1001`).
- Read-only filesystem where possible.
- No shell in production containers.
- Image scanning via Trivy in CI.

### 19.4 Infrastructure Services

```
Docker Compose (Development + Staging):
├── postgres:16-alpine
├── redis:7-alpine
├── api (Express.js)
├── web (Next.js)
└── mailhog (local email testing)

Kubernetes (Production):
├── Deployment: api (3+ replicas)
├── Deployment: web (3+ replicas)
├── Deployment: worker (BullMQ workers, 2+ replicas)
├── StatefulSet: postgres (primary + 1 replica)
├── StatefulSet: redis (cluster mode)
├── Ingress: Nginx ingress controller
├── CertManager: Let's Encrypt / AWS ACM TLS
├── HorizontalPodAutoscaler: api + web
└── PersistentVolumeClaim: postgres data
```

---

## 20. Module Boundaries & Communication

### 20.1 Frontend ↔ Backend Communication Rules

- All frontend-to-backend communication uses HTTPS REST API calls via Axios.
- The Axios instance is configured once in `lib/axios.ts` with base URL, timeout (10s), and interceptors.
- Access token is sent as HttpOnly cookie (automatic via browser) — never read by JavaScript.
- Axios request interceptor adds `X-Request-ID` header (UUID).
- Axios response interceptor handles 401 → automatic token refresh → retry original request.
- Axios response interceptor handles 5xx → display global error toast.
- Real-time events (order status, notifications) use Socket.io over the same server.

### 20.2 Inter-Module Boundaries (Backend)

- Modules communicate through service interfaces, never by importing another module's repository directly.
- Shared domain events (e.g., OrderPlaced) are published via an in-process event emitter and consumed by other services (e.g., InventoryService decrements stock, NotificationService sends email).
- The event emitter is type-safe using a strongly typed event map.

```typescript
// Correct: inter-module via service interface
class OrderService {
  constructor(
    private readonly inventoryService: InventoryService,  // ✓
    private readonly notificationService: NotificationService,  // ✓
  ) {}
}

// Wrong: direct repository access across modules
class OrderService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,  // ✗ Violates boundary
  ) {}
}
```

### 20.3 Shared Package Usage

| Package | Consumers | Purpose |
|---------|-----------|--------|
| `@electronic-store/types` | `web`, `api` | Shared DTOs, domain models, enums |
| `@electronic-store/utils` | `web`, `api` | Pure utility functions (formatters, validators) |
| `@electronic-store/config` | `web`, `api` | Environment schema validation |
| `@electronic-store/ui` | `web` only | Shared primitive UI components |

---

## 21. Technology Stack Justification

### 21.1 Frontend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Next.js | 15 | React framework | App Router, RSC, ISR/SSR/SSG hybrid, image optimization, edge-ready |
| React | 19 | UI library | Server Components, concurrent features, stable ecosystem |
| TypeScript | 5.x | Type safety | End-to-end type safety eliminating entire classes of bugs |
| TailwindCSS | 4.x | Styling | Utility-first, JIT, zero-runtime, design system in CSS |
| ShadCN UI | latest | UI components | Unstyled, accessible, copy-paste primitives with Radix UI |
| React Hook Form | 7.x | Forms | Uncontrolled forms, minimal re-renders, Zod integration |
| Zod | 3.x | Validation | Runtime schema validation, TypeScript inference |
| TanStack Query | 5.x | Server state | Caching, background sync, optimistic updates |
| Axios | 1.x | HTTP client | Interceptors, request cancellation, consistent error handling |
| Zustand | 5.x | Client state | Minimal API, performant, devtools support |
| React Three Fiber | 8.x | 3D rendering | React-friendly Three.js wrapper |
| Three.js | latest | 3D engine | Industry-standard WebGL 3D rendering |
| Drei | latest | R3F helpers | Camera controls, environment, GLTF loading, post-processing |
| GSAP | 3.x | Animations | Professional-grade scroll animations and timelines |
| Framer Motion | 11.x | UI animations | Layout animations, gesture handling, React lifecycle animations |
| Lenis | latest | Smooth scroll | Momentum-based scroll physics |
| Swiper | 11.x | Touch carousels | Mobile-first product gallery carousels |
| Embla Carousel | latest | Custom carousels | Lightweight, accessible carousel engine |
| Lottie | latest | Vector animations | JSON-based vector animations for loaders and icons |
| Recharts | 2.x | Charts | React-native chart library for admin analytics |
| Chart.js | 4.x | Advanced charts | Complex chart types for detailed analytics |
| Lucide React | latest | Icons | Consistent, tree-shakeable icon set |
| React Hot Toast | latest | Notifications | Minimal, accessible toast notifications |

### 21.2 Backend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Node.js | 22 LTS | Runtime | V8 engine, non-blocking I/O, large ecosystem |
| Express.js | 4.x | HTTP framework | Minimal, flexible, battle-tested, full control over architecture |
| TypeScript | 5.x | Type safety | Compile-time correctness, IDE support, refactoring safety |
| Prisma | 5.x | ORM | Type-safe queries, migrations, schema-first, excellent DX |
| PostgreSQL | 16 | Database | ACID, JSONB, full-text search, row-level security, proven at scale |
| Redis | 7 | Cache + sessions | Sub-millisecond reads, pub/sub, atomic operations, TTL support |
| JWT | RS256 | Authentication | Stateless, scalable, asymmetric signing |
| Passport.js | latest | Auth strategies | OAuth integrations (Google, GitHub) if required |
| Nodemailer | latest | Email delivery | SMTP-compatible, template-ready |
| BullMQ | 5.x | Job queues | Priority queues, retries, DLQ, Redis-backed |
| Cloudinary SDK | latest | File storage | Managed CDN, transformation API, signed uploads |
| Helmet | latest | Security headers | One-line security header configuration |
| Morgan | latest | HTTP logging | Standard request logging format |
| compression | latest | Gzip | Response compression |
| express-rate-limit | latest | Rate limiting | IP-based rate limiting |
| Winston | 3.x | Logging | Structured JSON logging, transport plugins |
| Socket.io | 4.x | WebSocket | Real-time order updates, notifications |
| Bcrypt | latest | Password hashing | Adaptive cost factor, safe against brute force |
| UUID | latest | ID generation | RFC-compliant universally unique identifiers |
| NanoID | latest | Short IDs | URL-safe short IDs for shareable resources |
| node-cron | latest | Cron jobs | Scheduled tasks (analytics aggregation, cache warming) |

---

## 22. Coding Standards & Conventions

### 22.1 Naming Conventions

```typescript
// Variables — camelCase
const productSlug = 'iphone-15-pro';
const totalOrderCount = 42;

// Functions — camelCase
function calculateDiscountedPrice(price: number, discount: number): number {}
async function findProductBySlug(slug: string): Promise<Product | null> {}

// Classes — PascalCase
class ProductService {}
class OrderRepository {}
class CartController {}

// Interfaces — PascalCase (no 'I' prefix)
interface Product {}
interface CreateProductDto {}
interface ApiResponse<T> {}

// Type aliases — PascalCase
type ProductStatus = 'active' | 'inactive' | 'draft';
type UUID = string;

// Enums — PascalCase, values UPPER_CASE
enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Constants — UPPER_SNAKE_CASE
const MAX_CART_ITEMS = 50;
const DEFAULT_PAGE_SIZE = 20;
const JWT_ACCESS_EXPIRY = '15m';

// React Components — PascalCase
function ProductCard({ product }: ProductCardProps) {}
function CheckoutForm() {}

// Files — kebab-case
// product-card.tsx
// order-service.ts
// cart-repository.ts
// use-cart-store.ts

// Folders — kebab-case
// product-management/
// order-processing/
// shopping-cart/
```

### 22.2 TypeScript Rules

```typescript
// tsconfig.json — Strict mode required
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- **Never use `any`.** Use `unknown` for truly unknown types and narrow with type guards.
- **Never use type assertions (`as Type`)** unless absolutely necessary and add a comment explaining why.
- **Never ignore TypeScript errors** with `// @ts-ignore`. Fix the underlying type issue.
- **Return types must be explicit** on all service and repository methods.
- **Discriminated unions** are preferred over optional fields for state representations.

### 22.3 React Component Rules

```typescript
// Always define props interface
interface ProductCardProps {
  product: ProductSummaryDto;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

// Function components only — no class components
export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  // ...
}

// Named exports only — no default exports from component files
// Exception: Next.js page files require default exports
```

### 22.4 Import Order (ESLint enforced)

```typescript
// 1. Node.js built-ins
import { randomBytes } from 'node:crypto';

// 2. External packages
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// 3. Internal packages (monorepo)
import type { ProductDto } from '@electronic-store/types';

// 4. Internal absolute imports
import { ProductRepository } from '@/modules/products/product.repository';

// 5. Relative imports
import { calculatePrice } from '../utils/pricing';

// 6. Type-only imports
import type { Request, Response } from 'express';
```

### 22.5 File Size Limits

| File Type | Maximum Lines | Action if Exceeded |
|-----------|--------------|--------------------|
| Component | 200 | Extract sub-components |
| Service | 300 | Extract to domain services |
| Controller | 100 | Extract to separate controller per resource |
| Repository | 250 | Extract query builders |
| Test file | 400 | Split by describe block |

---

## 23. Error Handling Strategy

### 23.1 Custom Error Hierarchy

```typescript
// Base error
class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Derived errors
class ValidationError extends AppError {}
class AuthenticationError extends AppError {}
class AuthorizationError extends AppError {}
class NotFoundError extends AppError {}
class ConflictError extends AppError {}
class PaymentError extends AppError {}
class InventoryError extends AppError {}
class RateLimitError extends AppError {}
```

### 23.2 Global Error Handler

```typescript
// Handles all errors passed to next(error)
export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError && err.isOperational) {
    // Known, expected error — return friendly message
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.code, err.errors)
    );
  }

  // Unknown error — log full stack, return generic message
  logger.error('Unhandled error', { error: err, requestId: req.id });
  return res.status(500).json(
    ApiResponse.error('An unexpected error occurred', 'INTERNAL_ERROR')
  );
}
```

### 23.3 Frontend Error Boundaries

- Root-level error boundary catches render errors and displays a recovery UI.
- Route-level `error.tsx` files handle page-level errors with Next.js App Router.
- TanStack Query `onError` callbacks display toast notifications for mutation failures.
- Network errors (no internet, server down) display a persistent banner.
- 3D scenes wrapped in separate error boundaries — failure renders a static image fallback.

---

## 24. Testing Strategy

### 24.1 Test Pyramid

```
             /\
            /  \
           / E2E \
          /  (5%) \
         /──────────\
        / Integration\
       /    (25%)    \
      /────────────────\
     /   Unit Tests    \
    /      (70%)        \
   /──────────────────────\
```

### 24.2 Test Tooling

| Layer | Tool | Scope |
|-------|------|-------|
| Unit (backend) | Vitest | Services, utilities, pure functions |
| Integration (backend) | Vitest + Supertest | API endpoints with real DB (test container) |
| Unit (frontend) | Vitest + React Testing Library | Components, hooks, stores |
| E2E | Playwright | Critical user journeys |
| Performance | Lighthouse CI | Automated performance regression |
| Security | OWASP ZAP (CI) | Automated vulnerability scanning |

### 24.3 Coverage Requirements

| Layer | Minimum Coverage |
|-------|------------------|
| Service layer | 90% |
| Repository layer | 80% |
| Controller layer | 80% |
| Utility functions | 95% |
| React hooks | 85% |
| Critical user flows (E2E) | 100% |

**Critical E2E paths (must always pass):**
1. User registration → email verification → login
2. Browse products → search → add to cart → checkout → payment → order confirmation
3. Admin: create product → publish → verify on storefront
4. Password reset flow
5. Order cancellation and refund initiation

---

## 25. SEO & Accessibility Architecture

### 25.1 SEO Implementation

**Metadata:** Every page exports a `generateMetadata` function:
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  return {
    title: `${product.name} | Electronic Store`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.mainImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      images: [product.mainImage],
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}
```

**Structured Data (JSON-LD):**
- `Product` schema on product detail pages (name, price, availability, rating, brand).
- `BreadcrumbList` schema on all deep pages.
- `Organization` schema on homepage.
- `FAQPage` schema on support pages.

**Technical SEO:**
- `sitemap.xml` auto-generated via `app/sitemap.ts` with all product and category URLs.
- `robots.txt` blocks admin, auth, and cart routes; allows all product and category pages.
- Canonical tags on all pages to prevent duplicate content.
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<aside>`, `<section>`, `<header>`, `<footer>` used correctly.
- Image `alt` attributes mandatory — enforced by ESLint `jsx-a11y/alt-text` rule.

### 25.2 Accessibility Implementation

- **Keyboard navigation:** All interactive elements reachable and operable via keyboard.
- **Focus management:** Modal dialogs trap focus. Route changes move focus to page heading.
- **ARIA:** `aria-label`, `aria-describedby`, `aria-expanded`, `aria-live` regions used correctly.
- **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA).
- **Skip link:** `Skip to main content` link as first focusable element on every page.
- **Screen reader testing:** All critical flows tested with VoiceOver and NVDA.
- **Reduced motion:** All animations disabled/simplified when `prefers-reduced-motion: reduce` is set.
- **Form accessibility:** Every input has an associated `<label>`. Error messages use `aria-describedby`.

---

## 26. Third-Party Integration Map

| Service | Purpose | Integration Point | Credentials Location |
|---------|---------|-------------------|---------------------|
| Cloudinary | File storage & CDN | Backend (signed uploads), Frontend (delivery URLs) | `CLOUDINARY_*` env vars |
| SMTP / Mailgun | Transactional email | Backend BullMQ email worker | `SMTP_*` env vars |
| Payment Gateway | Payments (Stripe recommended) | Backend only — never frontend direct | `PAYMENT_*` env vars |
| Google Analytics | Traffic analytics | Frontend (script tag, no PII) | `NEXT_PUBLIC_GA_ID` |
| Mapbox / Google Maps | Store locator | Frontend only | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Sentry | Error tracking | Frontend + Backend | `SENTRY_DSN` env vars |
| Datadog / CloudWatch | Metrics & logs | Backend log transport | `DATADOG_API_KEY` |

**Integration Rules:**
- Payment processing logic must never execute in the frontend — only the backend creates payment intents.
- Third-party scripts in the frontend must load with `next/script` strategy `afterInteractive` or `lazyOnload`.
- All third-party API calls must have a timeout (5–10 seconds) and fallback behavior.
- API keys must never appear in frontend code, even obfuscated — use `NEXT_PUBLIC_` only for truly public identifiers.

---

## 27. Environment Strategy

### 27.1 Environment Files

```
.env.example          ← Committed. Placeholder values only.
.env.development      ← Local development. Never committed.
.env.test             ← Test runner. Never committed.
.env.staging          ← Injected by CI/CD. Never committed.
.env.production       ← Managed by secrets manager. Never committed.
```

### 27.2 Environment Variable Categories

```bash
# Application
NODE_ENV=production
APP_PORT=3001
APP_URL=https://electronicstore.com
FRONTEND_URL=https://electronicstore.com
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/electronic_store
DATABASE_REPLICA_URL=postgresql://user:pass@replica:5432/electronic_store

# Redis
REDIS_URL=redis://:password@host:6379

# Authentication
JWT_ACCESS_SECRET=  # RSA private key
JWT_ACCESS_PUBLIC=  # RSA public key
JWT_REFRESH_SECRET= # 32+ byte random string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@electronicstore.com

# Payment
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

# Monitoring
SENTRY_DSN=
DATADOG_API_KEY=

# Frontend (Next.js public)
NEXT_PUBLIC_API_URL=https://api.electronicstore.com
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

### 27.3 Environment Validation

On application startup, all required environment variables are validated using Zod:

```typescript
// config/env.ts — executed before app initialization
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  APP_PORT: z.coerce.number().int().min(1024).max(65535),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(256),
  // ... all required variables
});

export const env = envSchema.parse(process.env);
// Application fails to start with a clear error if any variable is missing or invalid.
```

---

## 28. Architectural Principles Reference

### SOLID

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | Each class has one reason to change. `ProductService` only contains product business rules. |
| **O**pen/Closed | New payment providers added by implementing `PaymentProvider` interface — no existing code changes. |
| **L**iskov Substitution | All repository implementations are interchangeable behind their interface. |
| **I**nterface Segregation | `IProductReader` and `IProductWriter` are separate interfaces — read-only consumers don't receive write methods. |
| **D**ependency Inversion | Controllers depend on service interfaces, not concrete implementations. Wired via dependency injection factory. |

### Clean Architecture

- **The Dependency Rule:** Source code dependencies can only point inward. Domain layer knows nothing about infrastructure.
- **Use Case Isolation:** Each business use case (PlaceOrder, AddToCart, ProcessRefund) is a discrete operation with defined inputs and outputs.
- **Entity Purity:** Domain entities contain only identity and business invariants — no persistence, no HTTP.

### DRY (Don't Repeat Yourself)

- Shared types in `@electronic-store/types` package — defined once, used everywhere.
- Shared utilities in `@electronic-store/utils` — never duplicated between frontend and backend.
- Validation schemas defined once in `validator.ts` files — reused in frontend (React Hook Form + Zod) and backend (middleware).

### YAGNI (You Aren't Gonna Need It)

- Only implement features explicitly required by the specification.
- No premature abstraction layers.
- No configuration options for variations that don't exist yet.

---

## 29. Glossary

| Term | Definition |
|------|------------|
| SAD | Software Architecture Document — this document |
| ADR | Architecture Decision Record — documenting why a decision was made |
| DTO | Data Transfer Object — typed object for API request/response shapes |
| RSC | React Server Component — components that render on the server |
| ISR | Incremental Static Regeneration — Next.js background page regeneration |
| RBAC | Role-Based Access Control — permissions based on user role |
| DLQ | Dead Letter Queue — queue for failed jobs after max retries |
| TTL | Time To Live — expiry duration for cache entries |
| TTFB | Time To First Byte — server response latency metric |
| LCP | Largest Contentful Paint — Core Web Vital for perceived load speed |
| CLS | Cumulative Layout Shift — Core Web Vital for visual stability |
| WCAG | Web Content Accessibility Guidelines |
| WAF | Web Application Firewall |
| CDN | Content Delivery Network |
| BFF | Backend For Frontend — thin API layer serving frontend-specific data |
| ORM | Object-Relational Mapper (Prisma) |
| ACID | Atomicity, Consistency, Isolation, Durability — database transaction properties |
| SLA | Service Level Agreement — uptime and performance commitment |
| RPO | Recovery Point Objective — maximum tolerable data loss |
| RTO | Recovery Time Objective — maximum tolerable downtime |
| P95 | 95th percentile — metric excluding top 5% outliers |

---

*End of Part 1.1 — Software Architecture Document*  
*Next: Part 1.2 — Monorepo Initialization, Tooling Configuration & Base Infrastructure Setup*
