import styles from "./home.module.css";

const ITEMS = [
  {
    title: "Nosotros compramos por ti",
    description:
      "No necesitas tarjeta internacional ni dirección en Estados Unidos. Nos dices qué quieres y lo compramos nosotros.",
    icon: (
      <path
        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4M3 6h18M16 10a4 4 0 0 1-8 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    title: "Cotización transparente",
    description:
      "Ves el costo del producto, el envío y el arancel de aduana estimado antes de pagar. Sin sorpresas.",
    icon: (
      <path
        d="M9 14l2 2 4-4M7 3h10a2 2 0 0 1 2 2v14l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    title: "Seguimiento en todo momento",
    description:
      "Desde que confirmas la compra hasta que lo recibes, puedes ver en qué va tu pedido desde tu cuenta.",
    icon: (
      <path
        d="M12 8v4l3 3M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

export function Beneficios() {
  return (
    <section id="beneficios" className={styles.benefitsSection}>
      <div className={styles.benefitsGrid}>
        {ITEMS.map((item) => (
          <div key={item.title} className={styles.benefitCard}>
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              className={styles.benefitIcon}
              aria-hidden="true"
            >
              {item.icon}
            </svg>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
