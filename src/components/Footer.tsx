import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(128,128,128,0.25)",
        padding: "2rem 1.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>© {new Date().getFullYear()} Tienda Importación</span>
      <nav style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        <Link href="/solicitar">Solicitar</Link>
        <Link href="/#como-funciona">Cómo funciona</Link>
        <Link href="/#calculadora">Calculadora</Link>
        <Link href="/#faq">Preguntas frecuentes</Link>
      </nav>
    </footer>
  );
}
