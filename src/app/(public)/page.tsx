import Link from "next/link";
import { Beneficios } from "./Beneficios";
import { CategoryGrid } from "./CategoryGrid";
import { Calculadora } from "./Calculadora";
import { ComoFunciona } from "./ComoFunciona";
import { Faq } from "./Faq";
import { FeaturedProducts } from "./FeaturedProducts";
import { HeroBackground } from "./HeroBackground";
import { HeroIntro } from "./HeroIntro";
import { HeroSearch } from "./HeroSearch";
import { Reveal } from "@/components/Reveal";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <HeroBackground />
        <HeroIntro
          eyebrow="Importaciones desde EEUU"
          title="Todo lo que amas de Estados Unidos, en tu puerta."
          subtitle="Pega el link del producto o descríbelo con tus palabras. Nosotros lo compramos, lo traemos y te lo entregamos."
        >
          <HeroSearch />
        </HeroIntro>
        <Reveal delay={0.5} y={12} className={styles.quickLinks}>
          <Link href="/catalogo/apple" className={styles.quickLink}>
            Apple
          </Link>
          <Link href="/catalogo/nike" className={styles.quickLink}>
            Nike
          </Link>
          <Link href="/catalogo/amazon" className={styles.quickLink}>
            Amazon
          </Link>
          <Link href="/solicitar" className={styles.quickLink}>
            Otra tienda →
          </Link>
        </Reveal>
      </section>

      <CategoryGrid />
      <FeaturedProducts />
      <Beneficios />
      <ComoFunciona />
      <Calculadora />
      <Faq />
    </>
  );
}
