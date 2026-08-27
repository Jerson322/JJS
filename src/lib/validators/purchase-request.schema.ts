import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().optional(),
  province: z.string().min(2),
  district: z.string().min(2),
  corregimiento: z.string().optional(),
  addressLine: z.string().min(5),
  referencePoint: z.string().optional(),
  phone: z.string().min(6),
});

export const createPurchaseRequestSchema = z.object({
  productUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(10),
  quantity: z.coerce.number().int().min(1).default(1),
  estimatedDeclaredValue: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
  destinationAddressId: z.string().min(1),
});

export const submitPurchaseRequestSchema = z.object({
  productUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().min(10),
  quantity: z.coerce.number().int().min(1).default(1),
  estimatedDeclaredValue: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
  address: addressSchema,
});

export type CreatePurchaseRequestInput = z.infer<
  typeof createPurchaseRequestSchema
>;
export type SubmitPurchaseRequestInput = z.infer<
  typeof submitPurchaseRequestSchema
>;
export type AddressInput = z.infer<typeof addressSchema>;
