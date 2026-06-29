import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(['CARD', 'PAYPAL', 'BANK_TRANSFER']),
  notes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
