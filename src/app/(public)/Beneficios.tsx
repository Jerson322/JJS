import styles from "./home.module.css";

const ITEMS = [
  {
    title: "Nosotros compramos por ti",
    description:
      "No necesitas tarjeta internacional ni dirección en Estados Unidos. Nos dices qué quieres y lo compramos nosotros.",
  },
  {
    title: "Cotización transparente",
    description:
      "Ves el costo del producto, el envío y el arancel de aduana estimado antes de pagar. Sin sorpresas.",
  },
  {
    title: "Seguimiento en todo momento",
    description:
      "Desde que confirmas la compra hasta que lo recibes, puedes ver en qué va tu pedido desde tu cuenta.",
  },
];

export function Beneficios() {
  return (
    <section id="beneficios" className={styles.benefitsSection}>
      <div className={styles.benefitsGrid}>
        {ITEMS.map((item) => (
          <div key={item.title} className={styles.benefitCard}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
