"use client";

import { motion, useScroll, useTransform } from "motion/react";

interface ScrollNavProps {
  children: React.ReactNode;
}

export function ScrollNav({ children }: ScrollNavProps) {
  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const boxShadow = useTransform(
    shadowOpacity,
    (v) => `0 1px 0 rgba(0,0,0,${v * 0.08})`,
  );
  const paddingBlock = useTransform(scrollY, [0, 80], [0.85, 0.6]);

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
