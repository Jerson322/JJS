"use client";

import { useRef, useState } from "react";
import { compressImageFile } from "@/lib/compress-image";

interface ImagePickerProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}

export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch {
      setError("No pudimos procesar esa imagen.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div>
      {value ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Imagen adjunta"
            style={{
              width: 96,
              height: 96,
              objectFit: "cover",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar imagen"
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              borderRadius: "999px",
              border: "none",
              background: "var(--foreground)",
              color: "var(--background)",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="button secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? "Procesando..." : (label ?? "📎 Adjuntar foto")}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
