"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  submitPurchaseRequest,
  type SubmitPurchaseRequestState,
} from "@/server/actions/purchase-request.actions";
import { extractProductInfoAction } from "@/server/actions/product-extraction.actions";
import type { ExtractedProductInfo } from "@/server/services/product-extraction/extract-product-info";

const initialState: SubmitPurchaseRequestState = {};

const URL_PATTERN = /^https?:\/\//i;

const PENDING_STORAGE_KEY = "pendingSolicitud";

interface SolicitarFormProps {
  prefill?: string;
  isAuthenticated: boolean;
}

export function SolicitarForm({ prefill, isAuthenticated }: SolicitarFormProps) {
  const [state, formAction, pending] = useActionState(
    submitPurchaseRequest,
    initialState,
  );
  const router = useRouter();

  const prefillIsUrl = !!prefill && URL_PATTERN.test(prefill);

  const formRef = useRef<HTMLFormElement>(null);
  const productUrlRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);

  const [isDetecting, startDetecting] = useTransition();
  const [detectError, setDetectError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExtractedProductInfo | null>(null);

  function handleDetect(urlOverride?: string) {
    const url = (urlOverride ?? productUrlRef.current?.value ?? "").trim();
    if (!url) {
      setDetectError("Pega primero el link del producto.");
      return;
    }

    setDetectError(null);
    setPreview(null);

    startDetecting(async () => {
      const result = await extractProductInfoAction(url);

      if (result.error || !result.data) {
        setDetectError(result.error ?? "No pudimos leer ese link.");
        return;
      }

      setPreview(result.data);

      if (descriptionRef.current && !descriptionRef.current.value) {
        const parts = [result.data.title, result.data.brand, result.data.color]
          .filter(Boolean)
          .join(" - ");
        descriptionRef.current.value = parts;
      }

      if (valueRef.current && result.data.price != null) {
        valueRef.current.value = String(result.data.price);
      }
    });
  }

  useEffect(() => {
    // If the user comes back from login/registro, restore what they had
    // typed before we sent them there to finish creating their account.
    const pendingRaw = sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (pendingRaw && isAuthenticated && formRef.current) {
      sessionStorage.removeItem(PENDING_STORAGE_KEY);
      try {
        const pending: Record<string, string> = JSON.parse(pendingRaw);
        for (const [name, value] of Object.entries(pending)) {
          const field = formRef.current.elements.namedItem(name);
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement
          ) {
            field.value = value;
          }
        }
      } catch {
        // Ignore corrupted storage, user just retypes the form.
      }
      return;
    }

    if (prefillIsUrl && prefill) {
      handleDetect(prefill);
    }
    // Only run once, when the form first mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (isAuthenticated) return;

    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(data));
    router.push("/registro?callbackUrl=" + encodeURIComponent("/solicitar"));
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="stack">
      {!isAuthenticated && (
        <p style={{ color: "#6b7280" }}>
          Puedes llenar todo esto sin cuenta. Solo te pediremos crear una al
          final, para que puedas darle seguimiento a tu pedido.
        </p>
      )}
      <fieldset className="stack">
        <legend>¿Qué quieres importar?</legend>

        <div className="field">
          <label htmlFor="productUrl">Link del producto (opcional)</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="productUrl"
              name="productUrl"
              type="url"
              placeholder="https://www.nike.com/... o https://www.apple.com/..."
              ref={productUrlRef}
              defaultValue={prefillIsUrl ? prefill : undefined}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="button"
              onClick={() => handleDetect()}
              disabled={isDetecting}
            >
              {isDetecting ? "Detectando..." : "Detectar datos"}
            </button>
          </div>
          {detectError && <p className="error">{detectError}</p>}
          {preview && (
            <div className="card stack" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
              {preview.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.image}
                  alt=""
                  width={64}
                  height={64}
                  style={{ objectFit: "contain" }}
                />
              )}
              <div>
                <strong>{preview.title ?? "Producto detectado"}</strong>
                {preview.price != null && (
                  <div>
                    Precio detectado: {preview.currency ?? "USD"} {preview.price}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            rows={3}
            placeholder="Marca, modelo, color, talla, etc."
            ref={descriptionRef}
            defaultValue={!prefillIsUrl ? prefill : undefined}
          />
        </div>

        <div className="field">
          <label htmlFor="quantity">Cantidad</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
          />
        </div>

        <div className="field">
          <label htmlFor="estimatedDeclaredValue">
            Valor aproximado del producto (USD, opcional)
          </label>
          <input
            id="estimatedDeclaredValue"
            name="estimatedDeclaredValue"
            type="number"
            min={0}
            step="0.01"
            ref={valueRef}
          />
        </div>

        <div className="field">
          <label htmlFor="notes">Notas adicionales (opcional)</label>
          <textarea id="notes" name="notes" rows={2} />
        </div>
      </fieldset>

      <fieldset className="stack">
        <legend>¿Dónde te lo entregamos?</legend>

        <div className="field">
          <label htmlFor="addressLine">Dirección exacta</label>
          <input
            id="addressLine"
            name="addressLine"
            required
            minLength={5}
          />
        </div>

        <div className="field">
          <label htmlFor="city">Ciudad</label>
          <input id="city" name="city" required minLength={2} />
        </div>

        <div className="field">
          <label htmlFor="state">Estado / provincia (opcional)</label>
          <input id="state" name="state" />
        </div>

        <div className="field">
          <label htmlFor="postalCode">Código postal (opcional)</label>
          <input id="postalCode" name="postalCode" />
        </div>

        <div className="field">
          <label htmlFor="country">País</label>
          <input id="country" name="country" required minLength={2} />
        </div>

        <div className="field">
          <label htmlFor="referencePoint">Punto de referencia (opcional)</label>
          <input id="referencePoint" name="referencePoint" />
        </div>

        <div className="field">
          <label htmlFor="addressPhone">Teléfono de contacto</label>
          <input
            id="addressPhone"
            name="addressPhone"
            required
            minLength={6}
          />
        </div>
      </fieldset>

      {state.error && (
        <p className="error">
          {state.error}
          {state.requiresAccount && (
            <>
              {" "}
              <a href="/registro">Crea una cuenta</a>.
            </>
          )}
        </p>
      )}

      <button className="button" type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
