import type { Role } from "@/generated/prisma/enums";
import { auth } from "./auth.config";

// Defense in depth: proxy.ts gates routes, but every server action must also
// check the role itself, since Server Functions are reachable by direct POST
// requests that bypass route-based gating.
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user || !allowed.includes(session.user.role)) {
    throw new Error("No autorizado");
  }
  return session.user;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
  return session.user;
}
