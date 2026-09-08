import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <strong>Tienda Importación</strong>
            <p>
              Compramos y te enviamos lo que necesites importar desde tus
              tiendas favoritas de Estados Unidos.
            </p>
          </div>
          <nav className={styles.links}>
            <Link href="/solicitar">Solicitar</Link>
            <Link href="/#como-funciona">Cómo funciona</Link>
            <Link href="/#calculadora">Calculadora</Link>
            <Link href="/#faq">Preguntas frecuentes</Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          © {new Date().getFullYear()} Tienda Importación. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
