"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  submitPurchaseRequest,
  type SubmitPurchaseRequestState,
} from "@/server/actions/purchase-request.actions";
import { extractProductInfoAction } from "@/server/actions/product-extraction.actions";
import type { ExtractedProductInfo } from "@/server/services/product-extraction/extract-product-info";
import { ImagePicker } from "@/components/ImagePicker";
import { PENDING_IMAGE_KEY, extractPastedImage } from "@/lib/compress-image";
import styles from "./solicitar.module.css";

const initialState: SubmitPurchaseRequestState = {};

const URL_PATTERN = /^https?:\/\//i;

const PENDING_STORAGE_KEY = "pendingSolicitud";

function readInitialImage(): string | null {
  if (typeof window === "undefined") return null;

  const pendingImage = sessionStorage.getItem(PENDING_IMAGE_KEY);
  if (pendingImage) return pendingImage;

  const pendingRaw = sessionStorage.getItem(PENDING_STORAGE_KEY);
  if (pendingRaw) {
    try {
      const pending: Record<string, string> = JSON.parse(pendingRaw);
      if (pending.imageDataUrl) return pending.imageDataUrl;
    } catch {
      // Ignore corrupted storage, user just retypes the form.
    }
  }
  return null;
}

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
  const [image, setImage] = useState<string | null>(readInitialImage);

  async function handlePaste(event: React.ClipboardEvent) {
    const pasted = await extractPastedImage(event.clipboardData);
    if (pasted) {
      event.preventDefault();
      setImage(pasted);
    }
  }

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
    // Consume the hero-search handoff now that readInitialImage() already
    // picked it up for the image state above.
    const hadPendingImage = sessionStorage.getItem(PENDING_IMAGE_KEY) != null;
    sessionStorage.removeItem(PENDING_IMAGE_KEY);

    // If the user comes back from login/registro, restore what they had
    // typed before we sent them there to finish creating their account.
    const pendingRaw = sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (pendingRaw && isAuthenticated && formRef.current) {
      sessionStorage.removeItem(PENDING_STORAGE_KEY);
      try {
        const pending: Record<string, string> = JSON.parse(pendingRaw);
        for (const [name, value] of Object.entries(pending)) {
          // imageDataUrl is React-controlled via the `image` state
          // (readInitialImage() already picked it up above); setting the
          // DOM value directly here would just get overwritten on the
          // next render.
          if (name === "imageDataUrl") continue;
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
    } else if (!prefill && hadPendingImage && descriptionRef.current) {
      descriptionRef.current.value = "Producto en la imagen adjunta";
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
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      onPaste={handlePaste}
      className="stack"
    >
      <input type="hidden" name="imageDataUrl" value={image ?? ""} readOnly />
      {!isAuthenticated && (
        <p className={styles.hint}>
          Puedes llenar todo esto sin cuenta. Solo te pediremos crear una al
          final, para que puedas darle seguimiento a tu pedido.
        </p>
      )}
      <fieldset className={styles.fieldset}>
        <legend>¿Qué quieres importar?</legend>

        <div className="field">
          <label>Foto del producto (opcional)</label>
          <p className={styles.hint} style={{ marginTop: 0 }}>
            Si no tienes el link, pega una imagen (Ctrl+V) o adjúntala.
          </p>
          <ImagePicker value={image} onChange={setImage} />
        </div>

        <div className="field">
          <label htmlFor="productUrl">Link del producto (opcional)</label>
          <div className={styles.urlRow}>
            <input
              id="productUrl"
              name="productUrl"
              type="url"
              placeholder="https://www.nike.com/... o https://www.apple.com/..."
              ref={productUrlRef}
              defaultValue={prefillIsUrl ? prefill : undefined}
              className={styles.urlInput}
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
            <div className={`card ${styles.preview}`}>
              {preview.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.image}
                  alt=""
                  width={64}
                  height={64}
                  className={styles.previewImage}
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

      <fieldset className={styles.fieldset}>
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
