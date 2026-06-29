# End-to-End Tests

E2E tests use [Playwright](https://playwright.dev/).

## Structure

```
tests/e2e/
  specs/           # Test spec files organized by user flow
    auth/          # Login, register, password reset
    shop/          # Browse, search, product detail
    cart/          # Add, update, remove cart items
    checkout/      # Full checkout flow
    customer/      # Account, orders, wishlist
  fixtures/        # Shared test fixtures and data
  helpers/         # Page object models
  playwright.config.ts
```

## Running

```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e --ui         # Interactive UI mode
pnpm test:e2e --debug      # Debug mode
```
