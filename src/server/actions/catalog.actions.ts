"use server";

import { revalidatePath } from "next/cache";
import {
  createCatalogProductSchema,
  createCatalogVariantSchema,
} from "@/lib/validators/catalog.schema";
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

  const images = formData.getAll("images").filter((v): v is string => typeof v === "string" && v.length > 0);

  const parsed = createCatalogProductSchema.safeParse({
    brandId: formData.get("brandId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    images,
    price: formData.get("price") || undefined,
    productUrl: formData.get("productUrl") || "",
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const productImages = parsed.data.images.length > 0
    ? parsed.data.images
    : parsed.data.imageUrl
      ? [parsed.data.imageUrl]
      : [];

  await prisma.catalogProduct.create({
    data: {
      brandId: parsed.data.brandId,
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: productImages[0] || null,
      images: productImages,
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

export interface CreateCatalogVariantState {
  error?: string;
}

export async function createCatalogVariantAction(
  _prevState: CreateCatalogVariantState,
  formData: FormData,
): Promise<CreateCatalogVariantState> {
  await requireRole(["STAFF", "ADMIN"]);

  const images = formData.getAll("images").filter((v): v is string => typeof v === "string" && v.length > 0);

  const parsed = createCatalogVariantSchema.safeParse({
    productId: formData.get("productId"),
    color: formData.get("color") || undefined,
    capacity: formData.get("capacity") || undefined,
    imageUrl: formData.get("imageUrl") || "",
    images,
    price: formData.get("price") || undefined,
    productUrl: formData.get("productUrl") || "",
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const variantImages = parsed.data.images.length > 0
    ? parsed.data.images
    : parsed.data.imageUrl
      ? [parsed.data.imageUrl]
      : [];

  const siblingCount = await prisma.catalogProductVariant.count({
    where: { productId: parsed.data.productId },
  });

  await prisma.catalogProductVariant.create({
    data: {
      productId: parsed.data.productId,
      color: parsed.data.color,
      capacity: parsed.data.capacity,
      imageUrl: variantImages[0] || null,
      images: variantImages,
      price: parsed.data.price,
      productUrl: parsed.data.productUrl || null,
      sortOrder: siblingCount,
    },
  });

  const brandSlug = formData.get("brandSlug");
  if (typeof brandSlug === "string" && brandSlug) {
    revalidatePath(`/admin/catalogo/${brandSlug}`);
    revalidatePath(`/catalogo/${brandSlug}`);
  }

  return {};
}

export async function deleteCatalogVariantAction(
  id: string,
  brandSlug: string,
): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);
  await prisma.catalogProductVariant.delete({ where: { id } });
  revalidatePath(`/admin/catalogo/${brandSlug}`);
  revalidatePath(`/catalogo/${brandSlug}`);
}

export async function toggleCatalogVariantActiveAction(
  id: string,
  isActive: boolean,
  brandSlug: string,
): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);
  await prisma.catalogProductVariant.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/admin/catalogo/${brandSlug}`);
  revalidatePath(`/catalogo/${brandSlug}`);
}
