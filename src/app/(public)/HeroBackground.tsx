"use client";

import { motion, useScroll, useTransform } from "motion/react";
import styles from "./home.module.css";

export function HeroBackground() {
  const { scrollY } = useScroll();

  const yBlue = useTransform(scrollY, [0, 800], [0, 220]);
  const yPurple = useTransform(scrollY, [0, 800], [0, -160]);
  const yCyan = useTransform(scrollY, [0, 800], [0, 320]);
  const fade = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <motion.div className={styles.heroBackground} style={{ opacity: fade }}>
      <motion.span
        className={styles.heroBlobBlue}
        style={{ y: yBlue }}
        animate={{ x: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className={styles.heroBlobPurple}
        style={{ y: yPurple }}
        animate={{ x: [0, -24, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className={styles.heroBlobCyan}
        style={{ y: yCyan }}
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
