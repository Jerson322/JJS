"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImageCarousel } from "./ProductImageCarousel";
import styles from "./catalogo.module.css";

export interface VariantInfo {
  id: string;
  capacity: string | null;
  color: string | null;
  price: number | null;
  images: string[];
  productUrl: string | null;
}

interface ProductVariantCardProps {
  productName: string;
  brandName: string;
  variants: VariantInfo[];
}

const COLOR_SWATCHES: Record<string, string> = {
  silver: "#e3e4e5",
  "deep blue": "#3b4a5a",
  "cosmic orange": "#d1652f",
  "sky blue": "#b9d3e6",
  "light gold": "#e6d2ab",
  "cloud white": "#f2f1ec",
  "space black": "#2b2b2c",
  "mist blue": "#c3d2dc",
  lavender: "#d9d0e6",
  black: "#1c1c1e",
  white: "#f5f5f7",
  sage: "#a9b79b",
  "soft pink": "#f0cdd2",
  pink: "#eec3cf",
  teal: "#41595c",
  ultramarine: "#4a5fc1",
};

function swatchColor(color: string | null): string {
  if (!color) return "#9ca3af";
  return COLOR_SWATCHES[color.toLowerCase()] ?? "#9ca3af";
}

function capacityRank(capacity: string | null): number {
  if (!capacity) return 0;
  const match = capacity.match(/(\d+)\s*(GB|TB)/i);
  if (!match) return 0;
  const amount = parseInt(match[1], 10);
  return match[2].toUpperCase() === "TB" ? amount * 1024 : amount;
}

export function ProductVariantCard({
  productName,
  brandName,
  variants,
}: ProductVariantCardProps) {
  const capacities = Array.from(
    new Set(variants.map((v) => v.capacity).filter((c): c is string => Boolean(c))),
  ).sort((a, b) => capacityRank(a) - capacityRank(b));

  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const current = variants.find((v) => v.id === selectedId) ?? variants[0];

  const colorsForCapacity = variants.filter((v) => v.capacity === current?.capacity);

  function pickCapacity(capacity: string) {
    const match =
      variants.find((v) => v.capacity === capacity && v.color === current?.color) ??
      variants.find((v) => v.capacity === capacity);
    if (match) setSelectedId(match.id);
  }

  function pickVariant(id: string) {
    setSelectedId(id);
  }

  if (!current) return null;

  return (
    <div className={styles.productCard}>
      {current.images.length > 0 ? (
        <ProductImageCarousel images={current.images} alt={productName} />
      ) : (
        <div className={styles.productImagePlaceholder}>{brandName}</div>
      )}

      <strong>{productName}</strong>

      {current.price != null && (
        <span className={styles.productPrice}>${current.price}</span>
      )}

      {capacities.length > 1 && (
        <div className={styles.variantOptions}>
          {capacities.map((capacity) => (
            <button
              key={capacity}
              type="button"
              className={`${styles.variantPill} ${
                current.capacity === capacity ? styles.variantPillActive : ""
              }`}
              onClick={() => pickCapacity(capacity)}
            >
              {capacity}
            </button>
          ))}
        </div>
      )}

      {colorsForCapacity.length > 1 && (
        <div className={styles.variantOptions}>
          {colorsForCapacity.map((variant) => (
            <button
              key={variant.id}
              type="button"
              title={variant.color ?? undefined}
              aria-label={variant.color ?? "Color"}
              onClick={() => pickVariant(variant.id)}
              className={`${styles.colorSwatch} ${
                variant.id === current.id ? styles.colorSwatchActive : ""
              }`}
              style={{ background: swatchColor(variant.color) }}
            />
          ))}
        </div>
      )}

      {(current.color || current.capacity) && (
        <span className={styles.variantLabel}>
          {[current.capacity, current.color].filter(Boolean).join(" · ")}
        </span>
      )}

      <Link
        href={`/solicitar?prefill=${encodeURIComponent(
          current.productUrl ||
            `${productName} ${[current.capacity, current.color].filter(Boolean).join(" ")} (${brandName})`,
        )}`}
        className="button"
      >
        Solicitar este producto
      </Link>
    </div>
  );
}
