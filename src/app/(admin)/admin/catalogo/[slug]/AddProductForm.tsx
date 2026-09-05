"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { extractProductInfoAction } from "@/server/actions/product-extraction.actions";
import {
  createCatalogProductAction,
  type CreateCatalogProductState,
} from "@/server/actions/catalog.actions";

const initialState: CreateCatalogProductState = {};

interface AddProductFormProps {
  brandId: string;
  brandSlug: string;
}

export function AddProductForm({ brandId, brandSlug }: AddProductFormProps) {
  const [state, formAction, pending] = useActionState(
    createCatalogProductAction,
    initialState,
  );

  const productUrlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [isDetecting, startDetecting] = useTransition();
  const [detectError, setDetectError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  function handleDetect() {
    const url = productUrlRef.current?.value.trim();
    if (!url) {
      setDetectError("Pega primero el link del producto.");
      return;
    }
    setDetectError(null);

    startDetecting(async () => {
      const result = await extractProductInfoAction(url);
      if (result.error || !result.data) {
        setDetectError(result.error ?? "No pudimos leer ese link.");
        return;
      }

      if (nameRef.current && result.data.title) {
        nameRef.current.value = result.data.title;
      }
      if (priceRef.current && result.data.price != null) {
        priceRef.current.value = String(result.data.price);
      }
      if (imageRef.current && result.data.image) {
        imageRef.current.value = result.data.image;
        setPreviewImage(result.data.image);
      }
      if (descriptionRef.current && result.data.description) {
        descriptionRef.current.value = result.data.description;
      }
    });
  }

  return (
    <form action={formAction} className="stack card">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <div className="field">
        <label htmlFor="productUrl">Link del producto</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="productUrl"
            name="productUrl"
            type="url"
            ref={productUrlRef}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="button"
            onClick={handleDetect}
            disabled={isDetecting}
          >
            {isDetecting ? "Detectando..." : "Detectar datos"}
          </button>
        </div>
        {detectError && <p className="error">{detectError}</p>}
      </div>

      <div className="field">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" required minLength={2} ref={nameRef} />
      </div>

      <div className="field">
        <label htmlFor="price">Precio (USD, opcional)</label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          ref={priceRef}
        />
      </div>

      <div className="field">
        <label htmlFor="imageUrl">Imagen (URL, opcional)</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          ref={imageRef}
          onChange={(e) => setPreviewImage(e.target.value.trim() || null)}
        />
        {previewImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewImage}
            alt="Vista previa"
            width={80}
            height={80}
            style={{ objectFit: "contain", marginTop: "0.5rem" }}
            onError={() => setPreviewImage(null)}
          />
        )}
      </div>

      <div className="field">
        <label htmlFor="description">Descripción (opcional)</label>
        <textarea id="description" name="description" rows={2} ref={descriptionRef} />
      </div>

      {state.error && <p className="error">{state.error}</p>}

      <button className="button" type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}
