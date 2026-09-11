"use client";

import { motion, useScroll, useTransform } from "motion/react";

interface ScrollNavProps {
  children: React.ReactNode;
}

export function ScrollNav({ children }: ScrollNavProps) {
  const { scrollY } = useScroll();
  const shadowAlpha = useTransform(scrollY, [0, 120], [0.08, 0.16]);
  const boxShadow = useTransform(
    shadowAlpha,
    (v) => `0 8px 30px rgba(0,0,0,${v})`,
  );
  const paddingBlock = useTransform(scrollY, [0, 120], [0.75, 0.55]);

  return (
    <motion.nav
      className="nav"
      style={{
        boxShadow,
        paddingTop: useTransform(paddingBlock, (v) => `${v}rem`),
        paddingBottom: useTransform(paddingBlock, (v) => `${v}rem`),
      }}
    >
      {children}
    </motion.nav>
  );
}
