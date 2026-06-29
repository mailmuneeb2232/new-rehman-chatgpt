import { Router } from 'express';
import express from 'express';

export const webhooksRouter = Router();

// POST /api/v1/webhooks/stripe
// Express raw body needed for Stripe signature verification
webhooksRouter.use('/stripe', express.raw({ type: 'application/json' }));
