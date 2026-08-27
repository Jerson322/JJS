import { HeroSearch } from "./HeroSearch";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Importaciones a Panamá</span>
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

      <section className="container card stack">
        <h2>¿Cómo funciona?</h2>
        <ol className="stack">
          <li>1. Nos cuentas qué producto quieres importar (link o descripción).</li>
          <li>2. Te enviamos una cotización con todos los costos incluidos.</li>
          <li>3. Apruebas y pagas de forma segura con Wompi.</li>
          <li>4. Compramos, gestionamos el envío y la aduana.</li>
          <li>5. Te entregamos el producto y puedes seguir el estado en todo momento.</li>
        </ol>
      </section>
    </>
  );
}
