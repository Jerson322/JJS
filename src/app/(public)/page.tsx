import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container stack">
      <section className="stack">
        <h1>¿Viste algo que quieres comprar afuera de Panamá?</h1>
        <p>
          Nosotros lo compramos por ti, lo traemos y te lo entregamos.
          Cuéntanos qué necesitas, te damos una cotización con el costo del
          producto, el envío y el arancel de aduana estimado, y tú decides si
          avanzamos.
        </p>
        <div>
          <Link href="/solicitar" className="button">
            Solicitar una compra
          </Link>
        </div>
      </section>

      <section className="card stack">
        <h2>¿Cómo funciona?</h2>
        <ol className="stack">
          <li>1. Nos cuentas qué producto quieres importar (link o descripción).</li>
          <li>2. Te enviamos una cotización con todos los costos incluidos.</li>
          <li>3. Apruebas y pagas de forma segura con Wompi.</li>
          <li>4. Compramos, gestionamos el envío y la aduana.</li>
          <li>5. Te entregamos el producto y puedes seguir el estado en todo momento.</li>
        </ol>
      </section>
    </div>
  );
}
