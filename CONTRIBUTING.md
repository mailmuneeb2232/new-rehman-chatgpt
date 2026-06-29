# Contributing to Electronic Store

Thank you for your interest in contributing. This document explains the development workflow, branching strategy, commit conventions, and pull request process.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Branching Strategy](#branching-strategy)
3. [Commit Conventions](#commit-conventions)
4. [Pull Request Process](#pull-request-process)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)

---

## Development Setup

```bash
# Prerequisites: Node.js 22+, pnpm 9+, Docker
git clone https://github.com/your-org/electronic-store
cd electronic-store
make setup
```

This runs: `pnpm install` → copies `.env.example` to `.env` → starts Docker services → runs DB migrations → seeds database.

---

## Branching Strategy

We use GitHub Flow with protected `main` and `develop` branches.

```
main          ← Production releases only
develop       ← Integration branch
feature/*     ← New features
fix/*         ← Bug fixes
chore/*       ← Tooling, config, dependency updates
docs/*        ← Documentation only
refactor/*    ← Code refactoring without behavior change
test/*        ← Test additions or fixes
```

**Branch naming examples:**
```
feature/product-reviews
fix/cart-quantity-overflow
chore/update-prisma-6
docs/api-authentication
```

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting (no logic change) |
| `refactor` | Refactoring (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build, config, dependency changes |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverts a previous commit |

**Examples:**
```
feat(products): add Draco-compressed 3D model viewer
fix(auth): prevent token reuse in refresh rotation
refactor(cart): extract price calculation to CartService
test(checkout): add E2E test for complete purchase flow
chore(deps): update Prisma to 5.18.0
```

---

## Pull Request Process

1. Create a branch from `develop`.
2. Make your changes following the code standards below.
3. Ensure all checks pass locally: `make lint && make type-check && make test`.
4. Push and open a PR against `develop`.
5. Fill in the PR template completely.
6. Request review from at least one code owner.
7. Address all review comments before merging.
8. Squash and merge (never merge with merge commits).

**PR title format:** Same as commit message format.

---

## Code Standards

- Follow all rules in `docs/guides/CODING-STANDARDS.md`.
- No `any` types in TypeScript.
- No inline styles in React components.
- No business logic in UI components.
- No direct database access from controllers.
- Every new service method needs a unit test.
- Every new API endpoint needs an integration test.

---

## Testing Requirements

| Change Type | Required Tests |
|-------------|----------------|
| New API endpoint | Integration test |
| New service method | Unit test |
| New React component | Component test |
| New custom hook | Hook test |
| Bug fix | Regression test |
| Critical user flow | E2E test |

Tests must pass before a PR can be merged. Coverage cannot decrease.
