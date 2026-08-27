import styles from "./home.module.css";

const FAQS = [
  {
    question: "¿De qué tiendas pueden traer productos?",
    answer:
      "De prácticamente cualquier tienda en línea de Estados Unidos: Amazon, Apple, Nike, Adidas y muchas más. Si tienes el link del producto, podemos cotizarlo.",
  },
  {
    question: "¿Cómo se calcula el costo total?",
    answer:
      "El costo del producto, nuestra comisión de servicio, el envío internacional y el arancel de aduana estimado. Todo se muestra por separado en la cotización antes de que pagues.",
  },
  {
    question: "¿Cómo pago?",
    answer: "El pago se hace de forma segura a través de Wompi una vez apruebas la cotización.",
  },
  {
    question: "¿Puedo pedir sin crear una cuenta?",
    answer:
      "Sí, puedes llenar toda la solicitud sin cuenta. Solo te pediremos crear una al final, para poder darle seguimiento a tu pedido.",
  },
  {
    question: "¿Cómo sigo el estado de mi pedido?",
    answer:
      "Desde tu cuenta puedes ver en qué va tu solicitud: cotizada, pagada, comprada, en camino y entregada.",
  },
];

export function Faq() {
  return (
    <section id="faq" className={styles.faqSection}>
      <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
      <div className={styles.faqList}>
        {FAQS.map((faq) => (
          <details key={faq.question} className={styles.faqItem}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
