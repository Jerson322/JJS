"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { registerSchema } from "@/lib/validators/auth.schema";
import { signIn } from "@/server/auth/auth.config";
import { prisma } from "@/server/db/client";

export interface RegisterState {
  error?: string;
  createdButNeedsManualLogin?: boolean;
}

export async function registerCustomer(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo:
        typeof callbackUrl === "string" && callbackUrl.startsWith("/")
          ? callbackUrl
          : "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created; let the user log in manually as a fallback.
      return { createdButNeedsManualLogin: true };
    }
    throw error;
  }
}
