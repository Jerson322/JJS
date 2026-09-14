"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rankShortcuts, type RankedShortcut } from "@/server/services/search-shortcuts/rank";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";

const querySchema = z.string().trim().min(2).max(100);

// Intentionally open to anonymous visitors: this only reads a small curated
// list of public category links to help point the search bar somewhere
// precise, it never touches purchase data.
export async function searchShortcutsAction(
  query: string,
): Promise<RankedShortcut[]> {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return [];

  const entries = await prisma.searchShortcut.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return rankShortcuts(parsed.data, entries);
}

const shortcutSchema = z.object({
  brandLabel: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().url(),
  keywords: z
    .string()
    .transform((raw) =>
      raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  sortOrder: z.coerce.number().int().default(0),
});

export interface SearchShortcutFormState {
  error?: string;
}

export async function createSearchShortcutAction(
  _prevState: SearchShortcutFormState,
  formData: FormData,
): Promise<SearchShortcutFormState> {
  await requireRole(["STAFF", "ADMIN"]);

  const parsed = shortcutSchema.safeParse({
    brandLabel: formData.get("brandLabel"),
    label: formData.get("label"),
    url: formData.get("url"),
    keywords: formData.get("keywords") ?? "",
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  await prisma.searchShortcut.create({ data: parsed.data });
  revalidatePath("/admin/atajos-busqueda");

  return {};
}

export async function deleteSearchShortcutAction(id: string): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);
  await prisma.searchShortcut.delete({ where: { id } });
  revalidatePath("/admin/atajos-busqueda");
}

export async function toggleSearchShortcutActiveAction(
  id: string,
  isActive: boolean,
): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);
  await prisma.searchShortcut.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/atajos-busqueda");
}
