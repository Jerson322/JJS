import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { RequestStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/client";
import { assertTransition } from "./transitions";

interface TransitionStatusInput {
  purchaseRequestId: string;
  from: RequestStatus;
  to: RequestStatus;
  actorUserId?: string;
  note?: string;
}

type Client = PrismaClient | Prisma.TransactionClient;

async function runTransition(
  tx: Prisma.TransactionClient,
  input: TransitionStatusInput,
) {
  const request = await tx.purchaseRequest.update({
    where: { id: input.purchaseRequestId },
    data: { status: input.to },
  });

  await tx.statusEvent.create({
    data: {
      purchaseRequestId: input.purchaseRequestId,
      fromStatus: input.from,
      toStatus: input.to,
      actorUserId: input.actorUserId,
      note: input.note,
    },
  });

  return request;
}

// Single entry point for changing a PurchaseRequest's status. Nothing else
// should write to PurchaseRequest.status directly, so the audit trail
// (StatusEvent) can never drift from the actual status.
export async function transitionStatus(
  input: TransitionStatusInput,
  client: Client = prisma,
) {
  assertTransition(input.from, input.to);

  if ("$transaction" in client) {
    return client.$transaction((tx) => runTransition(tx, input));
  }

  return runTransition(client, input);
}
