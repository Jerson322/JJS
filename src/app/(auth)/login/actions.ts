"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth/auth.config";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const callbackUrl = formData.get("callbackUrl");
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo:
        typeof callbackUrl === "string" && callbackUrl.startsWith("/")
          ? callbackUrl
          : "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}
