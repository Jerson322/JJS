"use client";

import { useActionState } from "react";
import type { RequestStatus } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/status-labels";
import {
  transitionRequestStatusAction,
  type TransitionStatusState,
} from "@/server/actions/admin-request.actions";
import { ALLOWED_TRANSITIONS } from "@/server/services/status-machine/transitions";

const initialState: TransitionStatusState = {};

interface StatusControlProps {
  requestId: string;
  currentStatus: RequestStatus;
}

export function StatusControl({ requestId, currentStatus }: StatusControlProps) {
  const [state, formAction, pending] = useActionState(
    transitionRequestStatusAction,
    initialState,
  );

  const nextOptions = ALLOWED_TRANSITIONS[currentStatus];

  if (nextOptions.length === 0) {
    return <p style={{ color: "var(--muted)" }}>Este estado no admite más cambios.</p>;
  }

  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="field">
        <label htmlFor="to">Cambiar a</label>
        <select id="to" name="to" required defaultValue="">
          <option value="" disabled>
            Elige el nuevo estado
          </option>
          {nextOptions.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="note">Nota (opcional)</label>
        <input id="note" name="note" placeholder="Ej. comprado en Amazon, guía #123" />
      </div>
      {state.error && <p className="error">{state.error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Actualizando..." : "Actualizar estado"}
      </button>
    </form>
  );
}
