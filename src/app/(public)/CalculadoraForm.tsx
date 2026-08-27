"use client";

import { useState, useTransition } from "react";
import {
  estimateDutyAction,
  type EstimateDutyResult,
} from "@/server/actions/duty-estimate.actions";
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
  const [category, setCategory] = useState(categories[0] ?? "general");
  const [result, setResult] = useState<EstimateDutyResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const response = await estimateDutyAction({
        declaredValue,
        category,
      });
      setResult(response);
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
          <strong>Total estimado: ${result.data.total.toFixed(2)}</strong>
          <p className={styles.calcDisclaimer}>
            Este es solo un estimado de aduana. La cotización final incluye
            además el costo del producto y el envío internacional.
          </p>
        </div>
      )}
    </form>
  );
}
