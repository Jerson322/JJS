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
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [manualImageError, setManualImageError] = useState<string | null>(null);

  function toggleImage(url: string) {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }

  function addManualImage() {
    const url = manualImageUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setManualImageError("Pega una URL de imagen válida.");
      return;
    }
    setManualImageError(null);
    setManualImageUrl("");
    setGalleryImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setSelectedImages((prev) => new Set(prev).add(url));
    if (!previewImage) setPreviewImage(url);
  }

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
      if (descriptionRef.current && result.data.description) {
        descriptionRef.current.value = result.data.description;
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
    <form action={formAction} className="stack card">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="brandSlug" value={brandSlug} />
      {Array.from(selectedImages).map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

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
        <label htmlFor="imageUrl">Imagen principal (URL, opcional)</label>
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
        <label htmlFor="manualImageUrl">
          Agregar otra foto a mano (URL de imagen)
        </label>
        <p style={{ fontSize: "0.85rem", opacity: 0.75, margin: "0 0 0.4rem" }}>
          Útil cuando la tienda carga su galería con JavaScript y solo
          detectamos una foto: click derecho → &quot;Copiar dirección de la
          imagen&quot; en cada foto del sitio y pégala aquí.
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="manualImageUrl"
            type="url"
            value={manualImageUrl}
            onChange={(e) => setManualImageUrl(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" className="button" onClick={addManualImage}>
            Agregar foto
          </button>
        </div>
        {manualImageError && <p className="error">{manualImageError}</p>}
      </div>

      {galleryImages.length > 0 && (
        <div className="field">
          <label>
            Fotos del producto ({selectedImages.size} de {galleryImages.length}{" "}
            seleccionadas)
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
                    border: isSelected
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
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
                    width={72}
                    height={72}
                    style={{ objectFit: "contain", display: "block" }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}

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
