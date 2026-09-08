"use client";

import { motion } from "motion/react";
import styles from "./home.module.css";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

interface HeroIntroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function HeroIntro({ eyebrow, title, subtitle, children }: HeroIntroProps) {
  return (
    <motion.div
      className={styles.heroIntro}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.span variants={item} className={styles.eyebrow}>
        {eyebrow}
      </motion.span>
      <motion.h1 variants={item} className={styles.title}>
        {title}
      </motion.h1>
      <motion.p variants={item} className={styles.subtitle}>
        {subtitle}
      </motion.p>
      <motion.div variants={item} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
