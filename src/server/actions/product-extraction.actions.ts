"use server";

import { z } from "zod";
import { requireUser } from "@/server/auth/rbac";
import { extractProductInfo } from "@/server/services/product-extraction/extract-product-info";
import type { ExtractedProductInfo } from "@/server/services/product-extraction/extract-product-info";

const urlSchema = z.string().url();

export interface ExtractProductInfoResult {
  data?: ExtractedProductInfo;
  error?: string;
}

export async function extractProductInfoAction(
  url: string,
): Promise<ExtractProductInfoResult> {
  await requireUser();

  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) {
    return { error: "Ese link no parece válido." };
  }

  try {
    const data = await extractProductInfo(parsed.data);
    if (!data.title && data.price == null) {
      return {
        error: "No pudimos detectar datos automáticamente. Complétalos manualmente.",
      };
    }
    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No pudimos leer ese link. Complétalos manualmente.",
    };
  }
}
