"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  PENDING_IMAGE_KEY,
  compressImageFile,
  extractPastedImage,
} from "@/lib/compress-image";
import { searchShortcutsAction } from "@/server/actions/search-shortcut.actions";
import type { RankedShortcut } from "@/server/services/search-shortcuts/rank";
import styles from "./home.module.css";

interface MenuRect {
  top: number;
  left: number;
  width: number;
}

export function HeroSearch() {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<RankedShortcut[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchOuterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const showDropdown = showSuggestions && suggestions.length > 0;

  useEffect(() => {
    if (!showDropdown) return;

    function updateRect() {
      const rect = searchOuterRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuRect({ top: rect.bottom + 10, left: rect.left, width: rect.width });
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [showDropdown]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;

    const timeout = setTimeout(() => {
      searchShortcutsAction(trimmed)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 220);

    return () => clearTimeout(timeout);
  }, [value]);

  function handleValueChange(next: string) {
    setValue(next);
    if (next.trim().length < 2) {
      setSuggestions([]);
    }
  }

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
      <div className={styles.searchOuter} ref={searchOuterRef}>
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
              onChange={(event) => handleValueChange(event.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Pega un link, describe el producto o pega una imagen..."
              aria-label="Buscar, pegar link o imagen de producto"
              autoComplete="off"
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

      {showDropdown && menuRect && typeof document !== "undefined" &&
        createPortal(
          <ul
            className={styles.searchSuggestions}
            role="listbox"
            style={{
              position: "fixed",
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
            }}
            // Keeps the input focused while the user is clicking inside the
            // dropdown, so onBlur never fires mid-click. Without this, a
            // real (non-instant) mouse click races the 150ms onBlur timeout
            // below: the input blurs on mousedown, and if mouseup/click
            // lands after the dropdown has already unmounted, the click is
            // lost. Fast taps/synthetic clicks rarely hit that window, which
            // is why this only showed up with a real mouse on desktop.
            onMouseDown={(event) => event.preventDefault()}
          >
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <a
                  href={`/solicitar?prefill=${encodeURIComponent(suggestion.url)}`}
                  className={styles.searchSuggestionItem}
                  onClick={(event) => {
                    event.preventDefault();
                    router.push(`/solicitar?prefill=${encodeURIComponent(suggestion.url)}`);
                  }}
                >
                  <span className={styles.searchSuggestionBrand}>{suggestion.brandLabel}</span>
                  <span className={styles.searchSuggestionLabel}>{suggestion.label}</span>
                </a>
              </li>
            ))}
          </ul>,
          document.body,
        )}

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
