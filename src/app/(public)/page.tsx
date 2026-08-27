import { Beneficios } from "./Beneficios";
import { BrandCarousel } from "./BrandCarousel";
import { Calculadora } from "./Calculadora";
import { ComoFunciona } from "./ComoFunciona";
import { Faq } from "./Faq";
import { HeroSearch } from "./HeroSearch";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Importaciones desde EEUU</span>
        <h1 className={styles.title}>
          ¿Qué quieres importar hoy?
        </h1>
        <HeroSearch />
        <p className={styles.hint}>
          Pega el link del producto (Nike, Apple, Amazon, la tienda que sea) o
          descríbelo con tus palabras. Nosotros lo compramos, lo traemos y te
          lo entregamos en la puerta de tu casa.
        </p>
      </section>

      <BrandCarousel />
      <Beneficios />
      <ComoFunciona />
      <Calculadora />
      <Faq />
    </>
  );
}
