"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./catalogo.module.css";

export interface VariantInfo {
  id: string;
  capacity: string | null;
  color: string | null;
  price: number | null;
  images: string[];
  productUrl: string | null;
}

interface ProductDetailProps {
  productName: string;
  description: string | null;
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
  "space gray": "#4c4d50",
  "mist blue": "#c3d2dc",
  lavender: "#d9d0e6",
  black: "#1c1c1e",
  white: "#f5f5f7",
  sage: "#a9b79b",
  "soft pink": "#f0cdd2",
  pink: "#eec3cf",
  teal: "#41595c",
  ultramarine: "#4a5fc1",
  blush: "#e8b9ae",
  citrus: "#e8b23a",
  indigo: "#3a3a6e",
  starlight: "#e8e3d8",
  midnight: "#1b1c26",
  blue: "#3a6ea5",
  orange: "#d9772e",
  green: "#5a7d5a",
  purple: "#7a5fa0",
  yellow: "#e0c341",
  natural: "#c9b79c",
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

export function ProductDetail({
  productName,
  description,
  brandName,
  variants,
}: ProductDetailProps) {
  const capacities = Array.from(
    new Set(variants.map((v) => v.capacity).filter((c): c is string => Boolean(c))),
  ).sort((a, b) => capacityRank(a) - capacityRank(b));

  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [imageIndex, setImageIndex] = useState(0);
  const current = variants.find((v) => v.id === selectedId) ?? variants[0];

  const colorsForCapacity = variants.filter((v) => v.capacity === current?.capacity);

  function selectVariant(id: string) {
    setSelectedId(id);
    setImageIndex(0);
  }

  function pickCapacity(capacity: string) {
    const match =
      variants.find((v) => v.capacity === capacity && v.color === current?.color) ??
      variants.find((v) => v.capacity === capacity);
    if (match) selectVariant(match.id);
  }

  if (!current) return null;

  const images = current.images;
  const mainImage = images[imageIndex] ?? images[0];

  return (
    <div className={styles.detailLayout}>
      <div className={styles.detailImageColumn}>
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={productName}
            className={styles.detailCarouselImage}
          />
        ) : (
          <div className={styles.detailImagePlaceholder}>{brandName}</div>
        )}

        {images.length > 1 && (
          <div className={styles.thumbRow}>
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Ver imagen ${i + 1}`}
                className={`${styles.thumbButton} ${
                  i === imageIndex ? styles.thumbButtonActive : ""
                }`}
                onClick={() => setImageIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.detailInfoColumn}>
        <div className={styles.buyBox}>
          <span className={styles.detailBrand}>{brandName}</span>
          <h1 className={styles.detailTitle}>{productName}</h1>

          {current.price != null && (
            <span className={styles.detailPrice}>${current.price}</span>
          )}

          {description && <p className={styles.detailDescription}>{description}</p>}

          {capacities.length > 1 && (
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>Capacidad</span>
              <div className={styles.variantOptions}>
                {capacities.map((capacity) => (
                  <button
                    key={capacity}
                    type="button"
                    title={capacity}
                    className={`${styles.variantPill} ${
                      current.capacity === capacity ? styles.variantPillActive : ""
                    }`}
                    onClick={() => pickCapacity(capacity)}
                  >
                    {capacity}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colorsForCapacity.length > 1 && (
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>
                Color{current.color ? `: ${current.color}` : ""}
              </span>
              <div className={styles.variantOptions}>
                {colorsForCapacity.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    title={variant.color ?? undefined}
                    aria-label={variant.color ?? "Color"}
                    onClick={() => selectVariant(variant.id)}
                    className={`${styles.colorSwatch} ${
                      variant.id === current.id ? styles.colorSwatchActive : ""
                    }`}
                    style={{ background: swatchColor(variant.color) }}
                  />
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/solicitar?prefill=${encodeURIComponent(
              current.productUrl ||
                `${productName} ${[current.capacity, current.color].filter(Boolean).join(" ")} (${brandName})`,
            )}`}
            className={`button ${styles.detailCta}`}
          >
            Solicitar este producto
          </Link>
          <p className={styles.detailFinePrint}>
            Te cotizamos el envío y la aduana antes de cobrarte.
          </p>
        </div>
      </div>
    </div>
  );
}
