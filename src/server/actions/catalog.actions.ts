"use server";

import { revalidatePath } from "next/cache";
import { createCatalogProductSchema } from "@/lib/validators/catalog.schema";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";

export interface CreateCatalogProductState {
  error?: string;
}

export async function createCatalogProductAction(
  _prevState: CreateCatalogProductState,
  formData: FormData,
): Promise<CreateCatalogProductState> {
  await requireRole(["STAFF", "ADMIN"]);

  const parsed = createCatalogProductSchema.safeParse({
    brandId: formData.get("brandId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    price: formData.get("price") || undefined,
    productUrl: formData.get("productUrl") || "",
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  await prisma.catalogProduct.create({
    data: {
      brandId: parsed.data.brandId,
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      price: parsed.data.price,
      productUrl: parsed.data.productUrl || null,
    },
  });

  const brandSlug = formData.get("brandSlug");
  if (typeof brandSlug === "string" && brandSlug) {
    revalidatePath(`/admin/catalogo/${brandSlug}`);
    revalidatePath(`/catalogo/${brandSlug}`);
  }

  return {};
}

export async function deleteCatalogProductAction(
  id: string,
  brandSlug: string,
): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);
  await prisma.catalogProduct.delete({ where: { id } });
  revalidatePath(`/admin/catalogo/${brandSlug}`);
  revalidatePath(`/catalogo/${brandSlug}`);
}

export async function toggleCatalogProductActiveAction(
  id: string,
  isActive: boolean,
  brandSlug: string,
): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);
  await prisma.catalogProduct.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/admin/catalogo/${brandSlug}`);
  revalidatePath(`/catalogo/${brandSlug}`);
}
