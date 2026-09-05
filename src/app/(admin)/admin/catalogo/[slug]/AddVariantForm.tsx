"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { extractProductInfoAction } from "@/server/actions/product-extraction.actions";
import {
  createCatalogVariantAction,
  type CreateCatalogVariantState,
} from "@/server/actions/catalog.actions";

const initialState: CreateCatalogVariantState = {};

interface AddVariantFormProps {
  productId: string;
  brandSlug: string;
}

export function AddVariantForm({ productId, brandSlug }: AddVariantFormProps) {
  const [state, formAction, pending] = useActionState(
    createCatalogVariantAction,
    initialState,
  );

  const productUrlRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const capacityRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  const [isDetecting, startDetecting] = useTransition();
  const [detectError, setDetectError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  function toggleImage(url: string) {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function handleDetect() {
    const url = productUrlRef.current?.value.trim();
    if (!url) {
      setDetectError("Pega primero el link de esta variante.");
      return;
    }
    setDetectError(null);

    startDetecting(async () => {
      const result = await extractProductInfoAction(url);
      if (result.error || !result.data) {
        setDetectError(result.error ?? "No pudimos leer ese link.");
        return;
      }

      if (priceRef.current && result.data.price != null) {
        priceRef.current.value = String(result.data.price);
      }

      const images = result.data.images ?? [];
      setGalleryImages(images);
      setSelectedImages(new Set(images));

      const cover = images[0] ?? result.data.image;
      if (imageRef.current && cover) {
        imageRef.current.value = cover;
      }
      setPreviewImage(cover ?? null);
    });
  }

  return (
    <details className="card" style={{ marginTop: "0.5rem" }}>
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>
        + Agregar variante (color / capacidad)
      </summary>

      <form action={formAction} className="stack" style={{ marginTop: "0.75rem" }}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="brandSlug" value={brandSlug} />
        {Array.from(selectedImages).map((url) => (
          <input key={url} type="hidden" name="images" value={url} />
        ))}

        <div className="field">
          <label htmlFor={`variantUrl-${productId}`}>Link de esta variante</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id={`variantUrl-${productId}`}
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

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor={`capacity-${productId}`}>Capacidad (ej. 256GB)</label>
            <input id={`capacity-${productId}`} name="capacity" ref={capacityRef} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor={`color-${productId}`}>Color (ej. Silver)</label>
            <input id={`color-${productId}`} name="color" ref={colorRef} />
          </div>
        </div>

        <div className="field">
          <label htmlFor={`price-${productId}`}>Precio (USD, opcional)</label>
          <input
            id={`price-${productId}`}
            name="price"
            type="number"
            min={0}
            step="0.01"
            ref={priceRef}
          />
        </div>

        <div className="field">
          <label htmlFor={`imageUrl-${productId}`}>Imagen principal (URL, opcional)</label>
          <input
            id={`imageUrl-${productId}`}
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
              width={72}
              height={72}
              style={{ objectFit: "contain", marginTop: "0.5rem" }}
              onError={() => setPreviewImage(null)}
            />
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="field">
            <label>
              Fotos detectadas ({selectedImages.size} de {galleryImages.length} seleccionadas)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {galleryImages.map((url) => {
                const isSelected = selectedImages.has(url);
                return (
                  <label
                    key={url}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      border: isSelected ? "2px solid #2563eb" : "2px solid transparent",
                      borderRadius: 6,
                      padding: 2,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleImage(url)}
                      style={{ position: "absolute", top: 4, left: 4 }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      width={64}
                      height={64}
                      style={{ objectFit: "contain", display: "block" }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {state.error && <p className="error">{state.error}</p>}

        <button className="button" type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Agregar variante"}
        </button>
      </form>
    </details>
  );
}
