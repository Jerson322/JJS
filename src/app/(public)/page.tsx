import Link from "next/link";
import { Beneficios } from "./Beneficios";
import { CategoryGrid } from "./CategoryGrid";
import { Calculadora } from "./Calculadora";
import { ComoFunciona } from "./ComoFunciona";
import { Faq } from "./Faq";
import { FeaturedProducts } from "./FeaturedProducts";
import { HeroSearch } from "./HeroSearch";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Importaciones desde EEUU</span>
        <h1 className={styles.title}>
          Todo lo que amas de Estados Unidos, en tu puerta.
        </h1>
        <p className={styles.subtitle}>
          Pega el link del producto o descríbelo con tus palabras. Nosotros lo
          compramos, lo traemos y te lo entregamos.
        </p>
        <HeroSearch />
        <div className={styles.quickLinks}>
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
        </div>
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
