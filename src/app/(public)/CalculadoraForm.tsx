"use client";

import { useState, useTransition } from "react";
import {
  estimateDutyAction,
  type EstimateDutyResult,
} from "@/server/actions/duty-estimate.actions";
import { estimateShippingAction } from "@/server/actions/shipping-estimate.actions";
import styles from "./home.module.css";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  electronics: "Electrónica",
};

interface CalculadoraFormProps {
  categories: string[];
}

export function CalculadoraForm({ categories }: CalculadoraFormProps) {
  const [declaredValue, setDeclaredValue] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "general");
  const [result, setResult] = useState<EstimateDutyResult | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const response = await estimateDutyAction({
        declaredValue,
        category,
      });
      setResult(response);

      const weightValue = parseFloat(weightKg);
      if (weightValue > 0) {
        const shippingResponse = await estimateShippingAction({
          weightGrams: weightValue * 1000,
          category,
        });
        setShippingCost(shippingResponse.data?.shippingCost ?? null);
        setShippingError(shippingResponse.error ?? null);
      } else {
        setShippingCost(null);
        setShippingError(null);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.calcForm}>
      <div className="field">
        <label htmlFor="calc-value">Valor estimado del producto (USD)</label>
        <input
          id="calc-value"
          type="number"
          min={0}
          step="0.01"
          required
          value={declaredValue}
          onChange={(event) => setDeclaredValue(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="calc-weight">Peso estimado en kg (opcional)</label>
        <input
          id="calc-weight"
          type="number"
          min={0}
          step="0.01"
          value={weightKg}
          onChange={(event) => setWeightKg(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="calc-category">Categoría</label>
        <select
          id="calc-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] ?? cat}
            </option>
          ))}
        </select>
      </div>

      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "Calculando..." : "Calcular estimado"}
      </button>

      {result?.error && <p className="error">{result.error}</p>}

      {result?.data && (
        <div className={styles.calcResult}>
          {result.data.exempt ? (
            <p>Está por debajo del umbral de exención de aduana.</p>
          ) : (
            <p>Arancel de aduana estimado: ${result.data.dutyAmount.toFixed(2)}</p>
          )}

          {shippingError && <p className="error">{shippingError}</p>}
          {shippingCost != null && (
            <p>Envío internacional estimado: ${shippingCost.toFixed(2)}</p>
          )}

          <strong>
            Total estimado: $
            {(result.data.total + (shippingCost ?? 0)).toFixed(2)}
          </strong>

          <p className={styles.calcDisclaimer}>
            {shippingCost != null
              ? "Este estimado incluye aduana y envío internacional. La cotización final se confirma cuando revisamos tu solicitud."
              : "Este es solo un estimado de aduana. Agrega el peso del producto para incluir también el envío internacional."}
          </p>
        </div>
      )}
    </form>
  );
}
