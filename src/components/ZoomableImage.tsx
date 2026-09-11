"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  width?: number;
}

export function ZoomableImage({ src, alt, width = 220 }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        style={{
          maxWidth: width,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          cursor: "zoom-in",
          display: "block",
        }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1.5rem",
              cursor: "zoom-out",
            }}
          >
            <motion.img
              src={src}
              alt={alt}
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                maxWidth: "90vw",
                maxHeight: "88vh",
                objectFit: "contain",
                borderRadius: "var(--radius-md)",
                cursor: "default",
              }}
            />
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                top: "1.25rem",
                right: "1.25rem",
                width: 36,
                height: 36,
                borderRadius: "999px",
                border: "none",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#fff",
                fontSize: "1.3rem",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
