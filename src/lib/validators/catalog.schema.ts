import { z } from "zod";

export const createCatalogProductSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).default([]),
  price: z.coerce.number().positive().optional(),
  productUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateCatalogProductInput = z.infer<
  typeof createCatalogProductSchema
>;
