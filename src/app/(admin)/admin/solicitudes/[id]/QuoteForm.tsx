"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import type { RequestStatus } from "@/generated/prisma/enums";
import {
  createQuoteAction,
  estimateDutyForQuoteAction,
  type CreateQuoteState,
} from "@/server/actions/admin-request.actions";
import { canTransition } from "@/server/services/status-machine/transitions";

const initialState: CreateQuoteState = {};

interface QuoteFormProps {
  requestId: string;
  currentStatus: RequestStatus;
}

export function QuoteForm({ requestId, currentStatus }: QuoteFormProps) {
  const [state, formAction, pending] = useActionState(createQuoteAction, initialState);
  const dutyRef = useRef<HTMLInputElement>(null);
  const [declaredValue, setDeclaredValue] = useState("");
  const [category, setCategory] = useState("general");
  const [isEstimating, startEstimating] = useTransition();
  const [estimateError, setEstimateError] = useState<string | null>(null);

  if (!canTransition(currentStatus, "QUOTED")) {
    return (
      <p style={{ color: "var(--muted)" }}>
        Solo se puede crear una cotización cuando la solicitud está en revisión.
      </p>
    );
  }

  function handleEstimateDuty() {
    const value = parseFloat(declaredValue);
    if (!value || value <= 0) {
      setEstimateError("Ingresa un valor declarado para estimar la aduana.");
      return;
    }
    setEstimateError(null);
    startEstimating(async () => {
      const result = await estimateDutyForQuoteAction({ declaredValue: value, category });
      if (result.error || !result.data) {
        setEstimateError(result.error ?? "No se pudo estimar.");
        return;
      }
      if (dutyRef.current) {
        dutyRef.current.value = String(result.data.dutyAmount);
      }
    });
  }

  return (
    <form action={formAction} className="stack card">
      <h3>Nueva cotización</h3>
      <input type="hidden" name="requestId" value={requestId} />

      <div className="field">
        <label htmlFor="itemCost">Costo del producto (USD)</label>
        <input id="itemCost" name="itemCost" type="number" min={0} step="0.01" required />
      </div>

      <div className="field">
        <label htmlFor="serviceFee">Comisión de servicio (USD)</label>
        <input id="serviceFee" name="serviceFee" type="number" min={0} step="0.01" required />
      </div>

      <div className="field">
        <label htmlFor="intlShippingCost">Envío internacional (USD)</label>
        <input
          id="intlShippingCost"
          name="intlShippingCost"
          type="number"
          min={0}
          step="0.01"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="estimatedDuty">Aduana estimada (USD)</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="estimatedDuty"
            name="estimatedDuty"
            type="number"
            min={0}
            step="0.01"
            required
            ref={dutyRef}
            style={{ flex: 1 }}
          />
          <button type="button" className="button secondary" onClick={handleEstimateDuty} disabled={isEstimating}>
            {isEstimating ? "Calculando..." : "Calcular"}
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Valor declarado para calcular"
            value={declaredValue}
            onChange={(e) => setDeclaredValue(e.target.value)}
            style={{ flex: 1 }}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="general">General</option>
            <option value="electronics">Electrónica</option>
          </select>
        </div>
        {estimateError && <p className="error">{estimateError}</p>}
      </div>

      <div className="field">
        <label htmlFor="currency">Moneda</label>
        <input id="currency" name="currency" defaultValue="USD" required />
      </div>

      {state.error && <p className="error">{state.error}</p>}

      <button className="button" type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Crear cotización y marcar como cotizada"}
      </button>
    </form>
  );
}
