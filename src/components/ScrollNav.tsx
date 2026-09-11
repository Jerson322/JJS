"use client";

import { useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";

interface ScrollNavProps {
  logo: React.ReactNode;
  links: React.ReactNode;
}

export function ScrollNav({ logo, links }: ScrollNavProps) {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const shadowAlpha = useTransform(scrollY, [0, 120], [0.08, 0.16]);
  const boxShadow = useTransform(
    shadowAlpha,
    (v) => `0 8px 30px rgba(0,0,0,${v})`,
  );
  const paddingBlock = useTransform(scrollY, [0, 120], [0.75, 0.55]);

  return (
    <div className="navFixedContainer">
      <motion.nav
        className="nav"
        style={{
          boxShadow,
          paddingTop: useTransform(paddingBlock, (v) => `${v}rem`),
          paddingBottom: useTransform(paddingBlock, (v) => `${v}rem`),
        }}
      >
        {logo}
        <div className="links navLinksDesktop">{links}</div>
        <button
          type="button"
          className="navToggle"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="navMobilePanel"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          >
            <div className="links">{links}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
