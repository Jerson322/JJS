"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PENDING_IMAGE_KEY,
  compressImageFile,
  extractPastedImage,
} from "@/lib/compress-image";
import styles from "./home.module.css";

export function HeroSearch() {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handlePaste(event: React.ClipboardEvent) {
    const pasted = await extractPastedImage(event.clipboardData);
    if (pasted) {
      event.preventDefault();
      setImage(pasted);
      setImageError(null);
    }
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Solo se aceptan imágenes.");
      return;
    }
    try {
      setImage(await compressImageFile(file));
      setImageError(null);
    } catch {
      setImageError("No pudimos procesar esa imagen.");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();

    if (image) {
      sessionStorage.setItem(PENDING_IMAGE_KEY, image);
    }

    const query = trimmed
      ? `?prefill=${encodeURIComponent(trimmed)}`
      : "";
    router.push(`/solicitar${query}`);
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} onPaste={handlePaste}>
      <div className={styles.searchOuter}>
        <div className={styles.searchGlow} aria-hidden="true" />
        <div className={styles.searchRing}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              className={styles.searchInput}
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Pega un link, describe el producto o pega una imagen..."
              aria-label="Buscar, pegar link o imagen de producto"
            />
            <button
              type="button"
              className={styles.searchAttach}
              aria-label="Adjuntar imagen"
              title="Adjuntar imagen"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12.5V7a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v11a3 3 0 0 0 3 3h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M18 16v6M15 19h6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          void handleFileSelected(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {imageError && <p className="error">{imageError}</p>}

      {image && (
        <div className={styles.searchImagePreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Imagen adjunta" />
          <span>Imagen lista para adjuntar a tu solicitud</span>
          <button type="button" onClick={() => setImage(null)} aria-label="Quitar imagen">
            ×
          </button>
        </div>
      )}
    </form>
  );
}
