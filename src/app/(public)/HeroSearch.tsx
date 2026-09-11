"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./home.module.css";

export function HeroSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    const query = trimmed
      ? `?prefill=${encodeURIComponent(trimmed)}`
      : "";
    router.push(`/solicitar${query}`);
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
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
              placeholder="Pega un link o describe lo que quieres importar..."
              aria-label="Buscar o pegar link de producto"
            />
            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
