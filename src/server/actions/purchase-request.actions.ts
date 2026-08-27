"use server";

import { redirect } from "next/navigation";
import { submitPurchaseRequestSchema } from "@/lib/validators/purchase-request.schema";
import { auth } from "@/server/auth/auth.config";
import { prisma } from "@/server/db/client";

export interface SubmitPurchaseRequestState {
  error?: string;
  requiresAccount?: boolean;
}

export async function submitPurchaseRequest(
  _prevState: SubmitPurchaseRequestState,
  formData: FormData,
): Promise<SubmitPurchaseRequestState> {
  // The form itself is public; browsers with JS redirect to crear cuenta
  // before ever reaching here. This is the fallback for that redirect not
  // having happened (e.g. JS disabled) — never create a request without a
  // real account behind it.
  const session = await auth();
  if (!session?.user) {
    return {
      requiresAccount: true,
      error: "Necesitas una cuenta para finalizar la solicitud.",
    };
  }
  const user = session.user;

  const parsed = submitPurchaseRequestSchema.safeParse({
    productUrl: formData.get("productUrl") || "",
    description: formData.get("description"),
    quantity: formData.get("quantity") || 1,
    estimatedDeclaredValue: formData.get("estimatedDeclaredValue") || undefined,
    notes: formData.get("notes") || undefined,
    address: {
      label: formData.get("addressLabel") || undefined,
      addressLine: formData.get("addressLine"),
      city: formData.get("city"),
      state: formData.get("state") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      country: formData.get("country"),
      referencePoint: formData.get("referencePoint") || undefined,
      phone: formData.get("addressPhone"),
    },
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const { address, ...requestData } = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    const existingAddressCount = await tx.address.count({
      where: { userId: user.id },
    });

    const createdAddress = await tx.address.create({
      data: {
        ...address,
        userId: user.id,
        isDefault: existingAddressCount === 0,
      },
    });

    return tx.purchaseRequest.create({
      data: {
        customerId: user.id,
        productUrl: requestData.productUrl || null,
        description: requestData.description,
        quantity: requestData.quantity,
        estimatedDeclaredValue: requestData.estimatedDeclaredValue,
        notes: requestData.notes,
        destinationAddressId: createdAddress.id,
        status: "SUBMITTED",
        events: {
          create: {
            toStatus: "SUBMITTED",
            actorUserId: user.id,
            note: "Solicitud enviada por el cliente.",
          },
        },
      },
    });
  });

  redirect(`/dashboard/solicitudes/${created.id}`);
}
