"use client";

import { useState } from "react";
import styles from "./catalogo.module.css";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  imageClassName?: string;
}

export function ProductImageCarousel({
  images,
  alt,
  imageClassName,
}: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  function go(delta: number) {
    setIndex((prev) => (prev + delta + images.length) % images.length);
  }

  return (
    <div className={styles.carousel}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={alt}
        className={`${styles.carouselImage} ${imageClassName ?? ""}`}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
            onClick={() => go(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
            onClick={() => go(1)}
          >
            ›
          </button>
          <div className={styles.carouselDots}>
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Ver imagen ${i + 1}`}
                className={`${styles.carouselDot} ${
                  i === index ? styles.carouselDotActive : ""
                }`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
