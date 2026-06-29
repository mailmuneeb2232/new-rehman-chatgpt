import { Router } from 'express';

export const ordersRouter = Router();

// GET    /api/v1/orders (customer's own orders)
// GET    /api/v1/orders/:id
// POST   /api/v1/orders (create order from cart)
// PATCH  /api/v1/orders/:id/cancel
// GET    /api/v1/orders/admin (ADMIN - all orders)
// PATCH  /api/v1/orders/:id/status (ADMIN)
