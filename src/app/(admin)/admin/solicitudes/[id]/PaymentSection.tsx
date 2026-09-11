"use client";

import { useActionState } from "react";
import type { RequestStatus } from "@/generated/prisma/enums";
import {
  confirmPaymentAction,
  recordPaymentAction,
  type RecordPaymentState,
} from "@/server/actions/admin-request.actions";

const initialState: RecordPaymentState = {};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

interface PaymentInfo {
  id: string;
  amount: number;
  provider: string;
  providerRef: string | null;
  proofOfPaymentUrl: string | null;
  status: string;
  createdAt: string;
}

interface PaymentSectionProps {
  requestId: string;
  currentStatus: RequestStatus;
  latestQuote: { id: string; totalAmount: number; currency: string } | null;
  payments: PaymentInfo[];
}

export function PaymentSection({
  requestId,
  latestQuote,
  payments,
}: PaymentSectionProps) {
  const [state, formAction, pending] = useActionState(recordPaymentAction, initialState);

  return (
    <div className="stack">
      {payments.length === 0 ? (
        <p>Todavía no hay pagos registrados.</p>
      ) : (
        <div className="stack">
          {payments.map((payment) => {
            const confirmWithArgs = confirmPaymentAction.bind(null, payment.id, requestId);
            return (
              <div
                key={payment.id}
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
              >
                <div>
                  <strong>${payment.amount.toFixed(2)}</strong> · {payment.provider}
                  {payment.providerRef ? ` · ref ${payment.providerRef}` : ""}
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {new Date(payment.createdAt).toLocaleString("es-PA")}
                    {payment.proofOfPaymentUrl && (
                      <>
                        {" · "}
                        <a href={payment.proofOfPaymentUrl} target="_blank" rel="noreferrer">
                          Ver comprobante
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    className={`badge ${payment.status === "CONFIRMED" ? "badge-success" : "badge-neutral"}`}
                  >
                    {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                  </span>
                  {payment.status === "PENDING" && (
                    <form action={confirmWithArgs}>
                      <button className="button secondary" type="submit">
                        Confirmar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {latestQuote ? (
        <form action={formAction} className="stack card">
          <h3>Registrar pago</h3>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="quoteId" value={latestQuote.id} />

          <div className="field">
            <label htmlFor="amount">Monto ({latestQuote.currency})</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step="0.01"
              defaultValue={latestQuote.totalAmount}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="provider">Método de pago</label>
            <input id="provider" name="provider" placeholder="Wompi, transferencia, efectivo..." required />
          </div>

          <div className="field">
            <label htmlFor="providerRef">Referencia (opcional)</label>
            <input id="providerRef" name="providerRef" />
          </div>

          <div className="field">
            <label htmlFor="proofOfPaymentUrl">Link al comprobante (opcional)</label>
            <input id="proofOfPaymentUrl" name="proofOfPaymentUrl" type="url" />
          </div>

          {state.error && <p className="error">{state.error}</p>}

          <button className="button" type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Registrar pago"}
          </button>
        </form>
      ) : (
        <p style={{ color: "var(--muted)" }}>
          Crea una cotización primero para poder registrar un pago.
        </p>
      )}
    </div>
  );
}
