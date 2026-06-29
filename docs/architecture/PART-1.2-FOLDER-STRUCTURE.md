# Electronic Store — Part 1.2
# Complete Enterprise Monorepo Folder Structure & Architecture

**Version:** 1.0.0  
**Status:** Foundation — Canonical Reference  
**Phase:** 1.2 — Project Scaffold  
**Follows:** Part 1.1 (SAD)

---

## Table of Contents

1. [Philosophy & Principles](#1-philosophy--principles)
2. [Root Monorepo Tree](#2-root-monorepo-tree)
3. [Root Configuration Files](#3-root-configuration-files)
4. [apps/ — Application Layer](#4-apps--application-layer)
5. [apps/web/ — Next.js Frontend](#5-appsweb--nextjs-frontend)
6. [apps/api/ — Express.js Backend](#6-appsapi--expressjs-backend)
7. [apps/admin/ — Admin Application](#7-appsadmin--admin-application)
8. [apps/docs/ — Documentation Site](#8-appsdocs--documentation-site)
9. [apps/future/ — Reserved Expansion Slots](#9-appsfuture--reserved-expansion-slots)
10. [packages/ — Shared Library Layer](#10-packages--shared-library-layer)
11. [packages/types/](#11-packagestypes)
12. [packages/utils/](#12-packagesutils)
13. [packages/ui/](#13-packagesui)
14. [packages/config/](#14-packagesconfig)
15. [packages/validators/](#15-packagesvalidators)
16. [packages/email-templates/](#16-packagesemail-templates)
17. [packages/constants/](#17-packagesconstants)
18. [packages/hooks/](#18-packageshooks)
19. [packages/logger/](#19-packageslogger)
20. [packages/permissions/](#20-packagespermissions)
21. [infrastructure/ — DevOps Layer](#21-infrastructure--devops-layer)
22. [.github/ — CI/CD Layer](#22-github--cicd-layer)
23. [scripts/ — Developer Tooling](#23-scripts--developer-tooling)
24. [tests/ — Global Test Layer](#24-tests--global-test-layer)
25. [assets/ — Static Asset Repository](#25-assets--static-asset-repository)
26. [docs/ — Project Documentation](#26-docs--project-documentation)
27. [Naming Conventions Reference](#27-naming-conventions-reference)
28. [Future Scalability Strategy](#28-future-scalability-strategy)
29. [Asset Organization Strategy](#29-asset-organization-strategy)
30. [Shared Package Strategy](#30-shared-package-strategy)

---

## 1. Philosophy & Principles

This folder structure follows five governing principles:

**Principle 1 — Cohesion over Convenience**  
Files are grouped by domain responsibility, not by file type. A `product` module contains its controller, service, repository, types, and tests — not a flat `controllers/` folder containing every controller from every module.

**Principle 2 — Explicit over Implicit**  
Every directory has a single, documented responsibility. A developer who has never seen this project should understand the purpose of any folder within 10 seconds of reading its name.

**Principle 3 — Scalability without Restructuring**  
The architecture supports adding a mobile app, vendor portal, marketplace, or AI module as a new `apps/*` or `packages/*` entry — without touching existing code.

**Principle 4 — Colocation of Related Concerns**  
A React component lives alongside its types, hooks, tests, and stories. An API module lives alongside its routes, validators, and DTOs. Related code stays together.

**Principle 5 — Package Isolation**  
Shared packages (`packages/*`) are dependency-free from application code. Applications depend on packages. Packages never depend on applications.

---

## 2. Root Monorepo Tree

```
electronic-store/                        # Monorepo root
│
├── apps/                                # Deployable applications
│   ├── web/                             # Next.js 15 customer storefront
│   ├── api/                             # Express.js REST API server
│   ├── admin/                           # Next.js admin dashboard (isolated app)
│   ├── docs/                            # Docusaurus documentation site
│   └── future/                          # Reserved expansion slots
│       ├── mobile/                      # React Native (future)
│       ├── desktop/                     # Electron (future)
│       ├── vendor-portal/               # Vendor marketplace app (future)
│       └── analytics/                   # Standalone analytics dashboard (future)
│
├── packages/                            # Shared internal libraries
│   ├── types/                           # Shared TypeScript types & domain models
│   ├── utils/                           # Shared pure utility functions
│   ├── ui/                              # Shared UI primitive components
│   ├── config/                          # Shared environment validation schemas
│   ├── validators/                      # Shared Zod validation schemas
│   ├── email-templates/                 # Shared React email templates
│   ├── constants/                       # Shared application constants
│   ├── hooks/                           # Shared React hooks
│   ├── logger/                          # Shared Winston logger factory
│   └── permissions/                     # RBAC permission definitions
│
├── infrastructure/                      # DevOps & deployment configuration
│   ├── docker/                          # Per-app Dockerfiles
│   ├── nginx/                           # Nginx reverse proxy configuration
│   ├── kubernetes/                      # Kubernetes manifests
│   ├── terraform/                       # Infrastructure as Code (cloud resources)
│   ├── monitoring/                      # Prometheus / Grafana configuration
│   ├── ssl/                             # TLS certificate management
│   └── cdn/                             # CDN configuration & edge rules
│
├── .github/                             # GitHub-specific configuration
│   ├── workflows/                       # GitHub Actions CI/CD pipelines
│   ├── ISSUE_TEMPLATE/                  # Issue report templates
│   └── pull_request_template.md         # PR template
│
├── scripts/                             # Developer & deployment automation scripts
│   ├── setup.sh                         # One-command dev environment setup
│   ├── seed.ts                          # Database seeding
│   ├── migrate.ts                       # Database migration runner
│   ├── check-env.ts                     # Environment variable validator
│   ├── generate-types.ts                # Auto-generate types from Prisma schema
│   └── deploy.sh                        # Production deployment script
│
├── tests/                               # Cross-application test infrastructure
│   ├── e2e/                             # Playwright end-to-end tests
│   ├── performance/                     # Lighthouse CI & k6 load tests
│   ├── security/                        # OWASP ZAP security scan configs
│   ├── fixtures/                        # Shared test fixtures & factories
│   └── utils/                           # Shared test utilities
│
├── assets/                              # Source static assets (pre-processed)
│   ├── images/                          # Raw image assets
│   ├── 3d/                              # 3D model source files
│   ├── fonts/                           # Font license files & sources
│   ├── icons/                           # SVG icon sources
│   └── videos/                          # Video assets
│
├── docs/                                # Project documentation
│   ├── architecture/                    # System design documents
│   ├── api/                             # API reference (OpenAPI)
│   ├── guides/                          # Developer & operator guides
│   ├── decisions/                       # Architecture Decision Records
│   ├── database/                        # Database schema docs & ER diagrams
│   └── ui/                              # UI guidelines & component docs
│
├── logs/                                # Runtime log output (gitignored)
│   ├── app/
│   ├── security/
│   ├── audit/
│   └── archived/
│
├── .husky/                              # Git hooks (pre-commit, commit-msg)
│
├── README.md                            # Project overview & quick start
├── LICENSE                              # MIT license
├── CHANGELOG.md                         # Version history
├── CONTRIBUTING.md                      # Contribution guidelines
├── SECURITY.md                          # Security policy & vulnerability disclosure
├── CODE_OF_CONDUCT.md                   # Community code of conduct
├── package.json                         # Root workspace manifest
├── pnpm-workspace.yaml                  # pnpm workspaces definition
├── turbo.json                           # Turborepo pipeline configuration
├── tsconfig.base.json                   # Base TypeScript configuration
├── eslint.config.js                     # ESLint flat configuration (v9+)
├── prettier.config.js                   # Prettier formatting rules
├── .gitignore                           # Git ignore rules
├── .editorconfig                        # Editor formatting baseline
├── .env.example                         # Environment variable reference
├── docker-compose.yml                   # Full development stack
├── docker-compose.dev.yml               # Development overrides
├── docker-compose.prod.yml              # Production overrides
└── Makefile                             # Developer command shortcuts
```

---

## 3. Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace manifest. Defines `scripts` that delegate to Turborepo. No production code runs here. |
| `pnpm-workspace.yaml` | Declares workspace glob patterns so pnpm resolves packages from `apps/*` and `packages/*`. |
| `turbo.json` | Defines Turborepo task pipeline: build order, caching rules, and dependency graph between workspaces. |
| `tsconfig.base.json` | Base TypeScript compiler options extended by every workspace. Enforces strict mode, path aliases, and module resolution. |
| `eslint.config.js` | Flat ESLint configuration (v9+) covering TypeScript, React, accessibility, and import-order rules across all workspaces. |
| `prettier.config.js` | Single Prettier config for consistent formatting across all languages (TS, TSX, CSS, JSON, MD). |
| `.gitignore` | Excludes node_modules, build outputs, env files, logs, OS files, and IDE artifacts. |
| `.editorconfig` | Enforces baseline editor settings (indent, charset, newline) regardless of IDE. |
| `.env.example` | Documents every required environment variable with description and example value. Committed to repo. |
| `docker-compose.yml` | Orchestrates the full development stack: API, Web, PostgreSQL, Redis, MailHog. |
| `docker-compose.dev.yml` | Development-specific overrides: volume mounts, hot reload, debug ports. |
| `docker-compose.prod.yml` | Production-specific compose for staging validation before Kubernetes. |
| `Makefile` | One-word developer commands: `make setup`, `make dev`, `make test`, `make build`, `make deploy`. |
| `README.md` | Project overview, architecture summary, tech stack, quick start, and links. |
| `LICENSE` | MIT license. |
| `CHANGELOG.md` | Semantic versioning changelog following Keep a Changelog format. |
| `CONTRIBUTING.md` | Git workflow, branch naming, commit conventions, PR process. |
| `SECURITY.md` | Responsible disclosure policy and contact for security vulnerabilities. |
| `CODE_OF_CONDUCT.md` | Contributor Covenant community standards. |

---

## 4. apps/ — Application Layer

Each directory under `apps/` is an independently deployable application. Applications share code only through `packages/*` — never by importing directly from each other.

```
apps/
├── web/          → Customer-facing Next.js storefront        (port 3000)
├── api/          → Express.js REST API server                (port 3001)
├── admin/        → Admin dashboard (separate Next.js app)    (port 3002)
├── docs/         → Docusaurus documentation site             (port 3003)
└── future/       → Reserved application slots (not deployed)
```

**Why is admin a separate app from web?**  
The admin dashboard has fundamentally different security requirements, authentication flows, dependencies, and deployment policies. Separating it ensures that:
- Admin code is never shipped in the customer bundle.
- Admin deployments can be independently gated behind a VPN.
- An admin security incident cannot directly affect the storefront.

---

## 5. apps/web/ — Next.js Frontend

```
apps/web/
│
├── src/
│   │
│   ├── app/                                   # Next.js App Router root
│   │   │
│   │   ├── (marketing)/                       # Route group: public marketing pages
│   │   │   ├── layout.tsx                     # Marketing layout (navbar + footer)
│   │   │   ├── page.tsx                       # Homepage (ISR)
│   │   │   ├── about/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── contact/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── careers/
│   │   │   │   └── page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── faq/
│   │   │   │   └── page.tsx
│   │   │   ├── support/
│   │   │   │   └── page.tsx
│   │   │   ├── newsletter/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   ├── terms/
│   │   │   │   └── page.tsx
│   │   │   ├── refund/
│   │   │   │   └── page.tsx
│   │   │   └── shipping/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (shop)/                            # Route group: shopping experience
│   │   │   ├── layout.tsx                     # Shop layout
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                   # Product listing (ISR)
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx               # Product detail (SSR)
│   │   │   │       ├── loading.tsx
│   │   │   │       ├── error.tsx
│   │   │   │       └── opengraph-image.tsx    # Dynamic OG image
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── loading.tsx
│   │   │   ├── brands/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx                   # CSR — not indexed
│   │   │   ├── deals/
│   │   │   │   └── page.tsx
│   │   │   ├── new-arrivals/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx                   # CSR — user-specific
│   │   │   └── checkout/
│   │   │       ├── page.tsx
│   │   │       ├── success/
│   │   │       │   └── page.tsx
│   │   │       └── cancel/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (auth)/                            # Route group: authentication
│   │   │   ├── layout.tsx                     # Auth layout (no navbar/footer)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx
│   │   │   └── otp/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (customer)/                        # Route group: authenticated customer area
│   │   │   ├── layout.tsx                     # Customer layout (requires auth)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                   # Customer dashboard home
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── wishlist/
│   │   │       │   └── page.tsx
│   │   │       ├── profile/
│   │   │       │   └── page.tsx
│   │   │       ├── addresses/
│   │   │       │   └── page.tsx
│   │   │       ├── invoices/
│   │   │       │   └── page.tsx
│   │   │       ├── downloads/
│   │   │       │   └── page.tsx
│   │   │       ├── reviews/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/                               # Next.js API routes (BFF only)
│   │   │   ├── revalidate/
│   │   │   │   └── route.ts                   # On-demand ISR revalidation
│   │   │   └── upload-signature/
│   │   │       └── route.ts                   # Cloudinary signed upload token
│   │   │
│   │   ├── sitemap.ts                         # Auto-generated XML sitemap
│   │   ├── robots.ts                          # robots.txt generation
│   │   ├── manifest.ts                        # PWA web app manifest
│   │   ├── globals.css                        # Global CSS (Tailwind base)
│   │   ├── layout.tsx                         # Root layout (fonts, providers)
│   │   ├── not-found.tsx                      # Global 404 page
│   │   ├── error.tsx                          # Global error boundary
│   │   └── loading.tsx                        # Global loading UI
│   │
│   ├── components/                            # UI Component Library
│   │   │
│   │   ├── ui/                                # ShadCN primitive components
│   │   │   ├── button/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── button.types.ts
│   │   │   │   └── button.test.tsx
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   ├── dialog/
│   │   │   ├── drawer/
│   │   │   ├── dropdown-menu/
│   │   │   ├── badge/
│   │   │   ├── card/
│   │   │   ├── avatar/
│   │   │   ├── skeleton/
│   │   │   ├── tooltip/
│   │   │   ├── popover/
│   │   │   ├── tabs/
│   │   │   ├── separator/
│   │   │   ├── slider/
│   │   │   ├── switch/
│   │   │   ├── checkbox/
│   │   │   ├── radio-group/
│   │   │   ├── textarea/
│   │   │   ├── progress/
│   │   │   ├── toast/
│   │   │   ├── table/
│   │   │   ├── pagination/
│   │   │   ├── breadcrumb/
│   │   │   ├── command/
│   │   │   └── index.ts                       # Barrel export
│   │   │
│   │   ├── layout/                            # Layout shell components
│   │   │   ├── navbar/
│   │   │   │   ├── navbar.tsx
│   │   │   │   ├── navbar-mobile.tsx
│   │   │   │   ├── navbar-search.tsx
│   │   │   │   ├── navbar-cart-icon.tsx
│   │   │   │   ├── navbar-user-menu.tsx
│   │   │   │   ├── navbar.types.ts
│   │   │   │   └── navbar.test.tsx
│   │   │   ├── footer/
│   │   │   │   ├── footer.tsx
│   │   │   │   ├── footer-links.tsx
│   │   │   │   ├── footer-newsletter.tsx
│   │   │   │   └── footer.types.ts
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── sidebar.types.ts
│   │   │   └── page-wrapper/
│   │   │       └── page-wrapper.tsx
│   │   │
│   │   ├── common/                            # Application-wide reusable components
│   │   │   ├── seo/
│   │   │   │   ├── json-ld.tsx                # Structured data injector
│   │   │   │   └── meta-tags.tsx
│   │   │   ├── breadcrumb/
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   └── breadcrumb.types.ts
│   │   │   ├── error-boundary/
│   │   │   │   └── error-boundary.tsx
│   │   │   ├── loading-spinner/
│   │   │   │   └── loading-spinner.tsx
│   │   │   ├── empty-state/
│   │   │   │   └── empty-state.tsx
│   │   │   ├── image/
│   │   │   │   └── optimized-image.tsx        # next/image wrapper with defaults
│   │   │   ├── rating/
│   │   │   │   └── star-rating.tsx
│   │   │   ├── price/
│   │   │   │   └── price-display.tsx          # Multi-currency aware
│   │   │   ├── countdown/
│   │   │   │   └── countdown-timer.tsx
│   │   │   └── share/
│   │   │       └── share-button.tsx
│   │   │
│   │   ├── product/                           # Product domain components
│   │   │   ├── product-card/
│   │   │   │   ├── product-card.tsx
│   │   │   │   ├── product-card-skeleton.tsx
│   │   │   │   ├── product-card.types.ts
│   │   │   │   └── product-card.test.tsx
│   │   │   ├── product-gallery/
│   │   │   │   ├── product-gallery.tsx
│   │   │   │   ├── product-gallery-thumbnails.tsx
│   │   │   │   └── product-gallery-zoom.tsx
│   │   │   ├── product-info/
│   │   │   │   ├── product-title.tsx
│   │   │   │   ├── product-price.tsx
│   │   │   │   ├── product-rating.tsx
│   │   │   │   ├── product-badges.tsx
│   │   │   │   └── product-availability.tsx
│   │   │   ├── product-actions/
│   │   │   │   ├── add-to-cart-button.tsx
│   │   │   │   ├── add-to-wishlist-button.tsx
│   │   │   │   ├── buy-now-button.tsx
│   │   │   │   └── quantity-selector.tsx
│   │   │   ├── product-specs/
│   │   │   │   ├── product-specs-table.tsx
│   │   │   │   └── product-specs-accordion.tsx
│   │   │   ├── product-reviews/
│   │   │   │   ├── review-list.tsx
│   │   │   │   ├── review-form.tsx
│   │   │   │   ├── review-card.tsx
│   │   │   │   └── review-summary.tsx
│   │   │   ├── product-recommendations/
│   │   │   │   ├── similar-products.tsx
│   │   │   │   └── recently-viewed.tsx
│   │   │   ├── product-filters/
│   │   │   │   ├── filter-sidebar.tsx
│   │   │   │   ├── filter-price-range.tsx
│   │   │   │   ├── filter-brand.tsx
│   │   │   │   ├── filter-category.tsx
│   │   │   │   ├── filter-rating.tsx
│   │   │   │   └── active-filters.tsx
│   │   │   └── product-grid/
│   │   │       ├── product-grid.tsx
│   │   │       └── product-list-item.tsx
│   │   │
│   │   ├── cart/                              # Cart domain components
│   │   │   ├── cart-drawer/
│   │   │   │   ├── cart-drawer.tsx
│   │   │   │   └── cart-drawer-item.tsx
│   │   │   ├── cart-page/
│   │   │   │   ├── cart-item.tsx
│   │   │   │   ├── cart-summary.tsx
│   │   │   │   └── cart-coupon.tsx
│   │   │   └── mini-cart/
│   │   │       └── mini-cart.tsx
│   │   │
│   │   ├── checkout/                          # Checkout domain components
│   │   │   ├── checkout-steps/
│   │   │   │   └── checkout-steps.tsx
│   │   │   ├── checkout-address/
│   │   │   │   ├── address-form.tsx
│   │   │   │   └── address-selector.tsx
│   │   │   ├── checkout-shipping/
│   │   │   │   └── shipping-method-selector.tsx
│   │   │   ├── checkout-payment/
│   │   │   │   ├── payment-form.tsx
│   │   │   │   └── payment-summary.tsx
│   │   │   └── order-success/
│   │   │       └── order-success-screen.tsx
│   │   │
│   │   ├── auth/                              # Authentication components
│   │   │   ├── login-form/
│   │   │   │   └── login-form.tsx
│   │   │   ├── register-form/
│   │   │   │   └── register-form.tsx
│   │   │   ├── otp-input/
│   │   │   │   └── otp-input.tsx
│   │   │   ├── password-strength/
│   │   │   │   └── password-strength-indicator.tsx
│   │   │   └── social-login/
│   │   │       └── social-login-buttons.tsx
│   │   │
│   │   ├── search/                            # Search components
│   │   │   ├── search-bar/
│   │   │   │   ├── search-bar.tsx
│   │   │   │   └── search-suggestions.tsx
│   │   │   ├── search-results/
│   │   │   │   └── search-results.tsx
│   │   │   └── search-empty/
│   │   │       └── search-empty-state.tsx
│   │   │
│   │   ├── dashboard/                         # Customer dashboard components
│   │   │   ├── order-card/
│   │   │   │   └── order-card.tsx
│   │   │   ├── order-timeline/
│   │   │   │   └── order-timeline.tsx
│   │   │   ├── wishlist-grid/
│   │   │   │   └── wishlist-grid.tsx
│   │   │   ├── profile-form/
│   │   │   │   └── profile-form.tsx
│   │   │   └── address-book/
│   │   │       ├── address-card.tsx
│   │   │       └── address-form-modal.tsx
│   │   │
│   │   ├── 3d/                                # Three.js / React Three Fiber components
│   │   │   ├── scenes/
│   │   │   │   ├── hero-scene.tsx             # Homepage hero 3D product showcase
│   │   │   │   ├── product-viewer-scene.tsx   # Interactive product 360° viewer
│   │   │   │   └── ambient-scene.tsx          # Background ambient animation
│   │   │   ├── models/
│   │   │   │   ├── product-model.tsx          # GLTF model renderer
│   │   │   │   └── environment-setup.tsx      # HDR lighting setup
│   │   │   ├── effects/
│   │   │   │   ├── bloom-effect.tsx
│   │   │   │   ├── depth-of-field.tsx
│   │   │   │   └── reflections.tsx
│   │   │   ├── controls/
│   │   │   │   └── product-orbit-controls.tsx
│   │   │   └── canvas/
│   │   │       └── scene-canvas.tsx           # Base canvas with performance monitor
│   │   │
│   │   ├── animations/                        # Animation components
│   │   │   ├── gsap/
│   │   │   │   ├── scroll-reveal.tsx
│   │   │   │   ├── text-split-animation.tsx
│   │   │   │   ├── parallax-section.tsx
│   │   │   │   └── magnetic-element.tsx
│   │   │   ├── framer/
│   │   │   │   ├── fade-in.tsx
│   │   │   │   ├── slide-in.tsx
│   │   │   │   ├── stagger-children.tsx
│   │   │   │   └── page-transition.tsx
│   │   │   └── lottie/
│   │   │       └── lottie-player.tsx
│   │   │
│   │   ├── charts/                            # Data visualization components
│   │   │   ├── sales-chart.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   └── donut-chart.tsx
│   │   │
│   │   ├── forms/                             # Reusable form components
│   │   │   ├── form-field.tsx
│   │   │   ├── form-error.tsx
│   │   │   └── form-label.tsx
│   │   │
│   │   └── skeletons/                         # Loading skeleton components
│   │       ├── product-card-skeleton.tsx
│   │       ├── product-grid-skeleton.tsx
│   │       ├── product-detail-skeleton.tsx
│   │       └── dashboard-skeleton.tsx
│   │
│   ├── features/                              # Feature business logic layer
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── use-login.ts
│   │   │   │   ├── use-register.ts
│   │   │   │   └── use-logout.ts
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   └── store/
│   │   │       └── use-auth-store.ts
│   │   ├── products/
│   │   │   ├── hooks/
│   │   │   │   ├── use-products.ts
│   │   │   │   ├── use-product.ts
│   │   │   │   └── use-product-search.ts
│   │   │   └── api/
│   │   │       └── products.api.ts
│   │   ├── cart/
│   │   │   ├── hooks/
│   │   │   │   └── use-cart.ts
│   │   │   ├── api/
│   │   │   │   └── cart.api.ts
│   │   │   └── store/
│   │   │       └── use-cart-store.ts
│   │   ├── checkout/
│   │   │   ├── hooks/
│   │   │   │   ├── use-checkout.ts
│   │   │   │   └── use-payment.ts
│   │   │   └── api/
│   │   │       └── checkout.api.ts
│   │   ├── orders/
│   │   │   ├── hooks/
│   │   │   │   └── use-orders.ts
│   │   │   └── api/
│   │   │       └── orders.api.ts
│   │   ├── wishlist/
│   │   │   ├── hooks/
│   │   │   │   └── use-wishlist.ts
│   │   │   └── store/
│   │   │       └── use-wishlist-store.ts
│   │   ├── search/
│   │   │   └── hooks/
│   │   │       └── use-search.ts
│   │   └── reviews/
│   │       ├── hooks/
│   │       │   └── use-reviews.ts
│   │       └── api/
│   │           └── reviews.api.ts
│   │
│   ├── hooks/                                 # Global application hooks
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   ├── use-reduced-motion.ts
│   │   ├── use-outside-click.ts
│   │   ├── use-scroll-position.ts
│   │   ├── use-intersection-observer.ts
│   │   ├── use-copy-to-clipboard.ts
│   │   └── use-window-size.ts
│   │
│   ├── store/                                 # Zustand global state stores
│   │   ├── use-auth-store.ts
│   │   ├── use-cart-store.ts
│   │   ├── use-wishlist-store.ts
│   │   ├── use-ui-store.ts
│   │   ├── use-theme-store.ts
│   │   └── use-notification-store.ts
│   │
│   ├── providers/                             # React context providers
│   │   ├── query-provider.tsx                 # TanStack Query client
│   │   ├── theme-provider.tsx                 # next-themes
│   │   ├── auth-provider.tsx
│   │   ├── cart-provider.tsx
│   │   ├── lenis-provider.tsx                 # Smooth scroll
│   │   └── toast-provider.tsx
│   │
│   ├── lib/                                   # Library configurations & wrappers
│   │   ├── axios.ts                           # Configured Axios instance
│   │   ├── query-client.ts                    # TanStack Query defaults
│   │   ├── fonts.ts                           # next/font definitions
│   │   ├── utils.ts                           # cn() and shared lib utils
│   │   ├── gsap.ts                            # GSAP registration + plugins
│   │   └── lenis.ts                           # Lenis smooth scroll singleton
│   │
│   ├── services/                              # Axios API service functions
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── cart.service.ts
│   │   ├── orders.service.ts
│   │   ├── checkout.service.ts
│   │   ├── users.service.ts
│   │   ├── wishlist.service.ts
│   │   ├── reviews.service.ts
│   │   ├── search.service.ts
│   │   ├── categories.service.ts
│   │   └── upload.service.ts
│   │
│   ├── types/                                 # Frontend-specific TypeScript types
│   │   ├── api.types.ts
│   │   ├── component.types.ts
│   │   ├── route.types.ts
│   │   └── global.d.ts
│   │
│   ├── constants/                             # Frontend constants
│   │   ├── routes.ts
│   │   ├── query-keys.ts
│   │   ├── animations.ts
│   │   └── config.ts
│   │
│   ├── config/                                # Frontend configuration
│   │   ├── site.config.ts                     # Site metadata, nav links
│   │   └── theme.config.ts                    # Design tokens
│   │
│   └── middleware.ts                          # Next.js edge middleware (auth guards)
│
├── public/                                    # Statically served assets
│   ├── images/
│   │   ├── hero/
│   │   ├── og/                                # Open Graph images
│   │   └── placeholders/
│   ├── fonts/                                 # Self-hosted font files
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   └── favicon-32x32.png
│   ├── 3d/                                    # Compressed GLTF/GLB models
│   │   ├── products/
│   │   └── environments/
│   └── lottie/                                # Lottie animation JSON files
│
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## 6. apps/api/ — Express.js Backend

```
apps/api/
│
├── src/
│   │
│   ├── config/                                # Application configuration bootstrap
│   │   ├── env.ts                             # Zod-validated environment variables
│   │   ├── database.ts                        # Prisma client singleton
│   │   ├── redis.ts                           # Redis client singleton
│   │   ├── cloudinary.ts                      # Cloudinary SDK configuration
│   │   ├── mailer.ts                          # Nodemailer transporter
│   │   └── logger.ts                          # Winston logger factory
│   │
│   ├── modules/                               # Feature modules (Domain-organized)
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── users.validator.ts
│   │   │   └── users.types.ts
│   │   │
│   │   ├── products/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.repository.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── products.validator.ts
│   │   │   └── products.types.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── categories.repository.ts
│   │   │   ├── categories.routes.ts
│   │   │   ├── categories.validator.ts
│   │   │   └── categories.types.ts
│   │   │
│   │   ├── brands/
│   │   │   ├── brands.controller.ts
│   │   │   ├── brands.service.ts
│   │   │   ├── brands.repository.ts
│   │   │   ├── brands.routes.ts
│   │   │   ├── brands.validator.ts
│   │   │   └── brands.types.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.repository.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── cart.validator.ts
│   │   │   └── cart.types.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── orders.repository.ts
│   │   │   ├── orders.routes.ts
│   │   │   ├── orders.validator.ts
│   │   │   └── orders.types.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.repository.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── payments.validator.ts
│   │   │   └── payments.types.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   ├── reviews.repository.ts
│   │   │   ├── reviews.routes.ts
│   │   │   ├── reviews.validator.ts
│   │   │   └── reviews.types.ts
│   │   │
│   │   ├── wishlist/
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── wishlist.service.ts
│   │   │   ├── wishlist.repository.ts
│   │   │   ├── wishlist.routes.ts
│   │   │   └── wishlist.types.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── inventory.repository.ts
│   │   │   ├── inventory.routes.ts
│   │   │   ├── inventory.validator.ts
│   │   │   └── inventory.types.ts
│   │   │
│   │   ├── coupons/
│   │   │   ├── coupons.controller.ts
│   │   │   ├── coupons.service.ts
│   │   │   ├── coupons.repository.ts
│   │   │   ├── coupons.routes.ts
│   │   │   ├── coupons.validator.ts
│   │   │   └── coupons.types.ts
│   │   │
│   │   ├── search/
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── search.repository.ts
│   │   │   ├── search.routes.ts
│   │   │   └── search.types.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.repository.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── analytics.types.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.repository.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── notifications.types.ts
│   │   │
│   │   ├── addresses/
│   │   │   ├── addresses.controller.ts
│   │   │   ├── addresses.service.ts
│   │   │   ├── addresses.repository.ts
│   │   │   ├── addresses.routes.ts
│   │   │   ├── addresses.validator.ts
│   │   │   └── addresses.types.ts
│   │   │
│   │   └── uploads/
│   │       ├── uploads.controller.ts
│   │       ├── uploads.service.ts
│   │       ├── uploads.routes.ts
│   │       └── uploads.types.ts
│   │
│   ├── shared/                                # Cross-module shared code
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts                # JWT access token validation
│   │   │   ├── authorize.ts                   # RBAC permission enforcement
│   │   │   ├── rate-limiter.ts                # Per-route rate limiting
│   │   │   ├── request-logger.ts              # Morgan-based structured logging
│   │   │   ├── error-handler.ts               # Global error handler
│   │   │   ├── validate.ts                    # Zod schema request validation
│   │   │   ├── not-found.ts                   # 404 handler
│   │   │   └── request-id.ts                  # UUID injection per request
│   │   │
│   │   ├── errors/
│   │   │   ├── app-error.ts                   # Base error class
│   │   │   ├── validation-error.ts
│   │   │   ├── auth-error.ts
│   │   │   ├── not-found-error.ts
│   │   │   ├── conflict-error.ts
│   │   │   ├── payment-error.ts
│   │   │   ├── inventory-error.ts
│   │   │   └── rate-limit-error.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── api-response.ts                # Response envelope factory
│   │   │   ├── pagination.ts                  # Cursor + offset pagination helpers
│   │   │   ├── crypto.ts                      # Hashing, token generation
│   │   │   ├── slugify.ts                     # URL slug generator
│   │   │   └── date.ts                        # Date formatting utilities
│   │   │
│   │   ├── types/
│   │   │   ├── express.d.ts                   # Express Request augmentation
│   │   │   └── shared.types.ts
│   │   │
│   │   └── constants/
│   │       ├── cache-keys.ts                  # All Redis key patterns
│   │       ├── queue-names.ts                 # All BullMQ queue names
│   │       └── event-names.ts                 # All domain event names
│   │
│   ├── infrastructure/                        # External system integrations
│   │   │
│   │   ├── database/
│   │   │   └── prisma.ts                      # Singleton Prisma client with logging
│   │   │
│   │   ├── cache/
│   │   │   ├── redis.client.ts                # ioredis client
│   │   │   └── cache.service.ts               # Typed get/set/del/invalidate
│   │   │
│   │   ├── queue/
│   │   │   ├── queue.factory.ts               # BullMQ queue factory
│   │   │   ├── workers/
│   │   │   │   ├── email.worker.ts
│   │   │   │   ├── invoice.worker.ts
│   │   │   │   ├── analytics.worker.ts
│   │   │   │   └── cache-warmup.worker.ts
│   │   │   └── jobs/
│   │   │       ├── send-email.job.ts
│   │   │       ├── generate-invoice.job.ts
│   │   │       └── aggregate-analytics.job.ts
│   │   │
│   │   ├── storage/
│   │   │   └── cloudinary.service.ts          # Signed upload + transform helpers
│   │   │
│   │   ├── mailer/
│   │   │   ├── mailer.service.ts              # Nodemailer send abstraction
│   │   │   └── templates/
│   │   │       ├── welcome.email.tsx
│   │   │       ├── order-confirmation.email.tsx
│   │   │       ├── shipping-update.email.tsx
│   │   │       ├── password-reset.email.tsx
│   │   │       ├── email-verification.email.tsx
│   │   │       ├── otp.email.tsx
│   │   │       ├── invoice.email.tsx
│   │   │       └── refund.email.tsx
│   │   │
│   │   ├── sockets/
│   │   │   ├── socket.server.ts               # Socket.io initialization
│   │   │   └── handlers/
│   │   │       ├── order.socket-handler.ts
│   │   │       └── notification.socket-handler.ts
│   │   │
│   │   └── cron/
│   │       └── cron.scheduler.ts              # node-cron job registration
│   │
│   ├── app.ts                                 # Express application factory
│   └── server.ts                              # HTTP server bootstrap + graceful shutdown
│
├── prisma/
│   ├── schema.prisma                          # Database schema
│   ├── migrations/                            # Prisma migration history
│   └── seed/
│       ├── index.ts                           # Seed orchestrator
│       ├── data/
│       │   ├── categories.seed.ts
│       │   ├── brands.seed.ts
│       │   ├── products.seed.ts
│       │   └── users.seed.ts
│       └── factories/
│           ├── product.factory.ts
│           └── user.factory.ts
│
├── tsconfig.json
└── package.json
```

---

## 7. apps/admin/ — Admin Application

```
apps/admin/
│
├── src/
│   ├── app/                                   # Next.js App Router (admin routes)
│   │   ├── layout.tsx                         # Admin root layout (auth required)
│   │   ├── page.tsx                           # Redirect to /admin/dashboard
│   │   ├── login/
│   │   │   └── page.tsx                       # Admin-only login page
│   │   └── (protected)/
│   │       ├── layout.tsx                     # Protected admin shell
│   │       ├── dashboard/
│   │       │   └── page.tsx                   # KPI overview
│   │       ├── products/
│   │       │   ├── page.tsx                   # Product list + bulk actions
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx               # Product edit
│   │       │       └── variants/
│   │       │           └── page.tsx
│   │       ├── categories/
│   │       ├── brands/
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── customers/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── inventory/
│   │       │   └── page.tsx
│   │       ├── coupons/
│   │       ├── reviews/
│   │       ├── analytics/
│   │       │   ├── page.tsx
│   │       │   ├── sales/
│   │       │   ├── products/
│   │       │   └── customers/
│   │       ├── media/
│   │       ├── emails/
│   │       ├── blogs/
│   │       ├── reports/
│   │       │   └── page.tsx
│   │       ├── logs/
│   │       │   └── page.tsx
│   │       ├── monitoring/
│   │       └── settings/
│   │           ├── page.tsx
│   │           ├── store/
│   │           ├── payment/
│   │           ├── shipping/
│   │           ├── email/
│   │           ├── security/
│   │           └── system/
│   │
│   ├── components/                            # Admin-specific components
│   │   ├── layout/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   └── admin-breadcrumb.tsx
│   │   ├── dashboard/
│   │   │   ├── kpi-card.tsx
│   │   │   ├── recent-orders-table.tsx
│   │   │   └── sales-overview-chart.tsx
│   │   ├── products/
│   │   │   ├── product-form.tsx
│   │   │   ├── product-image-uploader.tsx
│   │   │   └── product-table.tsx
│   │   ├── orders/
│   │   │   ├── order-table.tsx
│   │   │   └── order-status-updater.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── column-filter.tsx
│   │       └── export-button.tsx
│   │
│   ├── features/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── lib/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. apps/docs/ — Documentation Site

```
apps/docs/
├── docs/                                      # Markdown documentation source
│   ├── intro.md
│   ├── architecture/
│   ├── api/
│   ├── guides/
│   └── deployment/
├── src/
│   └── css/custom.css
├── static/
├── docusaurus.config.ts
├── sidebars.ts
├── tsconfig.json
└── package.json
```

---

## 9. apps/future/ — Reserved Expansion Slots

```
apps/future/
├── mobile/
│   └── README.md                              # React Native — planned Q3 2026
├── desktop/
│   └── README.md                              # Electron — planned Q4 2026
├── vendor-portal/
│   └── README.md                              # Multi-vendor marketplace — planned
└── analytics/
    └── README.md                              # Standalone BI dashboard — planned
```

These directories are not deployed. They exist to signal architectural intent and prevent ad-hoc expansion that violates the monorepo contract.

---

## 10. packages/ — Shared Library Layer

```
packages/
├── types/          @electronic-store/types
├── utils/          @electronic-store/utils
├── ui/             @electronic-store/ui
├── config/         @electronic-store/config
├── validators/     @electronic-store/validators
├── email-templates/ @electronic-store/email-templates
├── constants/      @electronic-store/constants
├── hooks/          @electronic-store/hooks
├── logger/         @electronic-store/logger
└── permissions/    @electronic-store/permissions
```

**Package Dependency Rule:**  
`packages/*` → may depend on other `packages/*`  
`apps/*` → may depend on `packages/*`  
`packages/*` → must NEVER depend on `apps/*`

---

## 11. packages/types/

```
packages/types/
├── src/
│   ├── domain/                                # Core domain models
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   ├── brand.types.ts
│   │   ├── cart.types.ts
│   │   ├── order.types.ts
│   │   ├── payment.types.ts
│   │   ├── review.types.ts
│   │   ├── inventory.types.ts
│   │   ├── coupon.types.ts
│   │   ├── address.types.ts
│   │   └── notification.types.ts
│   ├── api/                                   # Request & response DTOs
│   │   ├── auth.dto.ts
│   │   ├── product.dto.ts
│   │   ├── cart.dto.ts
│   │   ├── order.dto.ts
│   │   ├── user.dto.ts
│   │   └── pagination.dto.ts
│   ├── enums/                                 # Shared enumerations
│   │   ├── order-status.enum.ts
│   │   ├── payment-status.enum.ts
│   │   ├── user-role.enum.ts
│   │   ├── product-status.enum.ts
│   │   └── notification-type.enum.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 12. packages/utils/

```
packages/utils/
├── src/
│   ├── formatters/
│   │   ├── currency.ts                        # formatCurrency(amount, locale, currency)
│   │   ├── date.ts                            # formatDate, formatRelativeTime
│   │   ├── number.ts                          # formatNumber, formatFileSize
│   │   └── string.ts                          # truncate, capitalize, slugify
│   ├── validators/
│   │   ├── email.ts
│   │   ├── phone.ts
│   │   └── url.ts
│   ├── crypto/
│   │   ├── hash.ts                            # SHA-256, MD5 helpers
│   │   └── random.ts                          # Secure random string
│   ├── array/
│   │   └── array.ts                           # chunk, unique, groupBy, sortBy
│   ├── object/
│   │   └── object.ts                          # pick, omit, deepMerge, flatten
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 13. packages/ui/

```
packages/ui/
├── src/
│   ├── components/                            # Shared primitive components
│   │   ├── button/
│   │   ├── input/
│   │   ├── badge/
│   │   ├── spinner/
│   │   └── typography/
│   ├── tokens/                                # Design system tokens
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── shadows.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 14. packages/config/

```
packages/config/
├── src/
│   ├── env.schema.ts                          # Zod schema for all env variables
│   ├── validate-env.ts                        # Startup validator
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 15. packages/validators/

```
packages/validators/
├── src/
│   ├── auth.schema.ts
│   ├── product.schema.ts
│   ├── cart.schema.ts
│   ├── order.schema.ts
│   ├── user.schema.ts
│   ├── address.schema.ts
│   ├── coupon.schema.ts
│   ├── review.schema.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 16. packages/email-templates/

```
packages/email-templates/
├── src/
│   ├── components/                            # Reusable email components
│   │   ├── email-layout.tsx
│   │   ├── email-header.tsx
│   │   ├── email-footer.tsx
│   │   ├── email-button.tsx
│   │   └── email-product-card.tsx
│   ├── templates/
│   │   ├── welcome.tsx
│   │   ├── order-confirmation.tsx
│   │   ├── order-shipped.tsx
│   │   ├── order-delivered.tsx
│   │   ├── order-cancelled.tsx
│   │   ├── invoice.tsx
│   │   ├── password-reset.tsx
│   │   ├── email-verification.tsx
│   │   ├── otp.tsx
│   │   ├── abandoned-cart.tsx
│   │   ├── refund-processed.tsx
│   │   ├── promotion.tsx
│   │   └── newsletter.tsx
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 17. packages/constants/

```
packages/constants/
├── src/
│   ├── pagination.ts                          # DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
│   ├── cache.ts                               # Cache TTL constants
│   ├── auth.ts                                # Token expiry, lockout thresholds
│   ├── upload.ts                              # File size limits, allowed types
│   ├── product.ts                             # Max images, max specs
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 18. packages/hooks/

```
packages/hooks/
├── src/
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   ├── use-media-query.ts
│   ├── use-reduced-motion.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 19. packages/logger/

```
packages/logger/
├── src/
│   ├── logger.factory.ts                      # Winston logger factory
│   ├── transports/
│   │   ├── console.transport.ts
│   │   ├── file.transport.ts
│   │   └── datadog.transport.ts
│   ├── formatters/
│   │   └── json.formatter.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 20. packages/permissions/

```
packages/permissions/
├── src/
│   ├── roles.ts                               # Role enum: SUPER_ADMIN, ADMIN, CUSTOMER, GUEST
│   ├── permissions.ts                         # Permission enum: products:write, orders:read …
│   ├── role-permissions.ts                    # Role → Permission[] map
│   ├── can.ts                                 # can(role, permission) → boolean
│   └── index.ts
├── tsconfig.json
└── package.json
```

---

## 21. infrastructure/ — DevOps Layer

```
infrastructure/
│
├── docker/
│   ├── api/
│   │   ├── Dockerfile                         # Multi-stage production image
│   │   └── Dockerfile.dev                     # Development image with hot reload
│   ├── web/
│   │   ├── Dockerfile
│   │   └── Dockerfile.dev
│   └── admin/
│       └── Dockerfile
│
├── nginx/
│   ├── nginx.conf                             # Main reverse proxy configuration
│   ├── sites/
│   │   ├── api.conf                           # API upstream configuration
│   │   ├── web.conf                           # Frontend upstream configuration
│   │   └── admin.conf                         # Admin app configuration
│   └── ssl/
│       └── README.md                          # SSL cert placement instructions
│
├── kubernetes/
│   ├── namespaces/
│   │   └── electronic-store.yaml
│   ├── deployments/
│   │   ├── api-deployment.yaml
│   │   ├── web-deployment.yaml
│   │   ├── worker-deployment.yaml
│   │   └── admin-deployment.yaml
│   ├── services/
│   │   ├── api-service.yaml
│   │   ├── web-service.yaml
│   │   └── admin-service.yaml
│   ├── ingress/
│   │   └── ingress.yaml                       # Nginx ingress + TLS
│   ├── configmaps/
│   │   └── app-config.yaml
│   ├── secrets/
│   │   └── README.md                          # Never commit secrets — use Vault
│   └── hpa/
│       ├── api-hpa.yaml                       # Horizontal Pod Autoscaler
│       └── web-hpa.yaml
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   ├── s3/
│   │   └── eks/
│   └── environments/
│       ├── staging.tfvars
│       └── production.tfvars
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   └── dashboards/
│   │       ├── api-performance.json
│   │       └── database-metrics.json
│   └── alertmanager/
│       └── alertmanager.yml
│
├── cdn/
│   └── cloudfront-policy.json                 # CloudFront cache behavior rules
│
└── ssl/
    └── README.md
```

---

## 22. .github/ — CI/CD Layer

```
.github/
├── workflows/
│   ├── ci.yml                                 # Pull request checks (lint, type, test, build)
│   ├── cd-staging.yml                         # Deploy to staging on develop merge
│   ├── cd-production.yml                      # Deploy to production on main merge
│   ├── security-scan.yml                      # Weekly OWASP ZAP + npm audit
│   ├── lighthouse.yml                         # Lighthouse CI on every PR
│   └── dependency-update.yml                  # Dependabot auto-PR workflow
│
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── security_vulnerability.md
│
└── pull_request_template.md
```

---

## 23. scripts/ — Developer Tooling

```
scripts/
├── setup.sh                                   # One-command project bootstrap
├── seed.ts                                     # Seed database with realistic data
├── migrate.ts                                  # Run Prisma migrations
├── migrate-rollback.ts                         # Rollback last migration
├── check-env.ts                                # Validate .env completeness
├── generate-types.ts                           # Prisma → TypeScript type generation
├── generate-api-sdk.ts                         # Generate typed API client from OpenAPI
├── analyze-bundle.ts                           # Next.js bundle analysis
├── backup-db.sh                                # PostgreSQL backup script
├── restore-db.sh                               # Restore from backup
└── deploy.sh                                   # Production deployment orchestration
```

---

## 24. tests/ — Global Test Layer

```
tests/
│
├── e2e/                                       # Playwright end-to-end tests
│   ├── auth/
│   │   ├── register.spec.ts
│   │   ├── login.spec.ts
│   │   └── password-reset.spec.ts
│   ├── shop/
│   │   ├── browse-products.spec.ts
│   │   ├── search.spec.ts
│   │   └── add-to-cart.spec.ts
│   ├── checkout/
│   │   └── complete-purchase.spec.ts          # Critical path
│   ├── admin/
│   │   ├── create-product.spec.ts
│   │   └── manage-orders.spec.ts
│   ├── fixtures/
│   │   └── test-user.ts
│   └── playwright.config.ts
│
├── performance/
│   ├── lighthouse/
│   │   └── lighthouserc.js
│   └── load/
│       ├── product-listing.k6.ts              # k6 load test scripts
│       └── checkout-flow.k6.ts
│
├── security/
│   └── zap/
│       └── zap.yaml                           # OWASP ZAP scan config
│
├── fixtures/                                  # Shared test data
│   ├── products.json
│   ├── users.json
│   └── orders.json
│
└── utils/
    ├── test-db.ts                             # Test database helpers
    ├── mock-server.ts                         # MSW mock server setup
    └── render-with-providers.tsx              # RTL provider wrapper
```

---

## 25. assets/ — Static Asset Repository

```
assets/
│
├── images/
│   ├── products/                              # Unprocessed product photos
│   ├── categories/                            # Category hero images
│   ├── brands/                                # Brand logos (SVG preferred)
│   ├── hero/                                  # Homepage hero images
│   ├── banners/                               # Promotional banners
│   ├── illustrations/                         # Custom SVG illustrations
│   ├── og/                                    # Open Graph image templates
│   ├── social/                                # Social media branded assets
│   └── placeholders/                          # Blur placeholder images
│
├── 3d/
│   ├── models/
│   │   ├── source/                            # Original .blend / .fbx files
│   │   └── optimized/                         # Draco-compressed .glb files
│   ├── environments/
│   │   └── studio.hdr                         # HDR environment map
│   ├── textures/
│   │   ├── metal/
│   │   ├── glass/
│   │   └── plastic/
│   └── materials/
│
├── fonts/
│   ├── licenses/                              # Font license agreements
│   └── sources/                               # Original font files
│
├── icons/
│   ├── app-icons/                             # iOS / Android app icons
│   ├── favicon/                               # Favicon source SVG
│   └── social/                                # Social media platform icons
│
├── videos/
│   ├── hero/                                  # Hero background videos
│   └── product-demos/                         # Product demonstration videos
│
└── audio/                                     # UI sound effects (optional)
```

---

## 26. docs/ — Project Documentation

```
docs/
│
├── architecture/
│   ├── SAD.md                                 # Software Architecture Document (Part 1.1)
│   ├── PART-1.2-FOLDER-STRUCTURE.md           # This document
│   └── diagrams/
│       ├── system-context.svg
│       ├── clean-architecture.svg
│       └── data-flow.svg
│
├── api/
│   ├── openapi.yaml                           # OpenAPI 3.1 full specification
│   └── README.md
│
├── guides/
│   ├── SETUP.md                               # Local development setup
│   ├── DEPLOYMENT.md                          # Production deployment guide
│   ├── CONTRIBUTING.md                        # Git workflow & PR process
│   ├── CODING-STANDARDS.md                    # Code style & patterns
│   ├── TROUBLESHOOTING.md                     # Common issues & fixes
│   ├── ENVIRONMENT.md                         # Environment variables guide
│   └── TESTING.md                             # Testing strategy & commands
│
├── decisions/
│   ├── ADR-001-monorepo.md
│   ├── ADR-002-nextjs.md
│   ├── ADR-003-express.md
│   ├── ADR-004-postgresql.md
│   ├── ADR-005-redis.md
│   ├── ADR-006-jwt-auth.md
│   ├── ADR-007-bullmq.md
│   └── ADR-008-cloudinary.md
│
├── database/
│   ├── SCHEMA.md                              # Human-readable schema documentation
│   ├── ER-DIAGRAM.md                          # Entity relationship description
│   └── QUERY-PATTERNS.md                      # Common query optimization notes
│
├── ui/
│   ├── DESIGN-TOKENS.md
│   ├── COMPONENT-LIBRARY.md
│   ├── ANIMATION-GUIDELINES.md
│   └── 3D-GUIDELINES.md
│
└── security/
    ├── SECURITY-REVIEW.md
    └── PENETRATION-TEST-RESULTS.md            # Populated post-launch
```

---

## 27. Naming Conventions Reference

### Files

| Pattern | Convention | Example |
|---------|------------|---------|
| React components | `kebab-case.tsx` | `product-card.tsx` |
| TypeScript modules | `kebab-case.ts` | `auth.service.ts` |
| Type files | `kebab-case.types.ts` | `user.types.ts` |
| Test files | `kebab-case.test.ts(x)` | `product-card.test.tsx` |
| Story files | `kebab-case.stories.tsx` | `button.stories.tsx` |
| Schema files | `kebab-case.schema.ts` | `auth.schema.ts` |
| Hook files | `use-*.ts` | `use-cart.ts` |
| Config files | `*.config.ts` | `next.config.ts` |
| Constants files | `*.constants.ts` | `api.constants.ts` |
| Email templates | `*.email.tsx` | `welcome.email.tsx` |

### Directories

| Pattern | Convention | Example |
|---------|------------|---------|
| All directories | `kebab-case` | `product-reviews/` |
| Feature modules | `feature-name/` | `shopping-cart/` |
| Route groups | `(group-name)/` | `(marketing)/` |
| Dynamic segments | `[param]/` | `[slug]/` |

### TypeScript Identifiers

| Kind | Convention | Example |
|------|------------|--------|
| Variables | `camelCase` | `productSlug` |
| Functions | `camelCase` | `calculateTotal()` |
| React Components | `PascalCase` | `ProductCard` |
| Classes | `PascalCase` | `CartService` |
| Interfaces | `PascalCase` | `CreateProductDto` |
| Type aliases | `PascalCase` | `ProductStatus` |
| Enums | `PascalCase` | `OrderStatus` |
| Enum values | `UPPER_SNAKE_CASE` | `ORDER_STATUS.PENDING` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_CART_ITEMS` |
| Generics | Single `PascalCase` letter or descriptive | `T`, `TResponse` |

---

## 28. Future Scalability Strategy

### Adding a New Application

To add a **Vendor Portal** in the future:

```
1. Create apps/vendor-portal/         (copy apps/admin as template)
2. Add "vendor-portal" to pnpm-workspace.yaml apps glob
3. Add turbo.json pipeline entry for vendor-portal tasks
4. Create infrastructure/docker/vendor-portal/Dockerfile
5. Create .github/workflows/cd-vendor-portal.yml
6. Add /vendor-portal routes to infrastructure/nginx/sites/
```

Zero changes to `apps/web`, `apps/api`, or any existing package.

### Adding a New API Module

To add an **Affiliate** module:

```
1. Create apps/api/src/modules/affiliates/
   ├── affiliates.controller.ts
   ├── affiliates.service.ts
   ├── affiliates.repository.ts
   ├── affiliates.routes.ts
   ├── affiliates.validator.ts
   └── affiliates.types.ts
2. Add types to packages/types/src/domain/affiliate.types.ts
3. Register routes in apps/api/src/app.ts
4. Add Prisma model to prisma/schema.prisma
```

Zero changes to any other module.

### Adding a New Shared Package

```
1. Create packages/new-package/
   ├── src/index.ts
   ├── package.json    (name: @electronic-store/new-package)
   └── tsconfig.json
2. Add to pnpm-workspace.yaml (already covered by packages/* glob)
3. Install in consuming app: pnpm add @electronic-store/new-package --filter app-name
```

### Microservices Migration Path

If the platform grows to require microservices, each `apps/api/src/modules/*` is already structured as an independent bounded context. Migration path:

```
Phase 1 (current): Modular monolith in apps/api/
Phase 2: Extract payments → apps/payment-service/
Phase 3: Extract inventory → apps/inventory-service/
Phase 4: Extract notifications → apps/notification-service/
Phase 5: Introduce API Gateway (Kong / AWS API Gateway)
```

Each step is incremental. The module boundaries defined today are the microservice boundaries of tomorrow.

---

## 29. Asset Organization Strategy

### Source vs. Distribution

- `assets/` contains **source assets** — original, unprocessed files.
- `apps/web/public/` contains **distribution assets** — compressed, optimized, web-ready.
- Never commit unprocessed large files to `apps/web/public/`.
- 3D models in `apps/web/public/3d/` must be Draco-compressed `.glb` files only.

### Image Pipeline

```
assets/images/products/*.jpg  →  Cloudinary upload  →  Served via Cloudinary CDN
assets/images/hero/*.jpg      →  Optimized to WebP  →  apps/web/public/images/hero/
assets/images/og/*.jpg        →  1200×630 exact     →  apps/web/public/images/og/
```

### 3D Model Pipeline

```
assets/3d/models/source/*.blend
  → Export to .glb (Blender)
  → Draco compress (gltfpack -cc)
  → Copy to apps/web/public/3d/products/
```

---

## 30. Shared Package Strategy

### Dependency Direction

```
                   ┌─────────────────┐
          ┌───────►│  packages/types  │◄────────┐
          │        └─────────────────┘          │
          │                                     │
┌─────────┴──────┐                   ┌──────────┴──────┐
│  packages/utils│                   │packages/validators
└─────────┬──────┘                   └──────────┬──────┘
          │                                     │
          └──────────────┬──────────────────────┘
                         │
              ┌──────────▼──────────┐
              │       apps/*        │
              │  (web, api, admin)  │
              └─────────────────────┘
```

### Version Strategy

- All packages use `"version": "0.0.0"` with `"private": true`.
- Versions are managed by the monorepo root, not published to npm.
- Internal packages are referenced as `"@electronic-store/types": "workspace:*"`.
- There is no need for version bumping between packages — changes are immediate.

### Build Strategy

```json
// turbo.json — package build order is auto-determined by dependency graph
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]
    }
  }
}
```

Turborepo automatically builds `packages/types` before `apps/api` because `apps/api` depends on it. No manual orchestration needed.

---

*End of Part 1.2 — Complete Enterprise Monorepo Folder Structure*  
*Next: Part 1.3 — Root Configuration Files Implementation*
