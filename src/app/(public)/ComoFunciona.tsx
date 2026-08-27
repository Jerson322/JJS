import styles from "./home.module.css";

const STEPS = [
  {
    title: "Nos dices qué quieres",
    description: "Pega el link del producto o descríbelo con tus palabras.",
  },
  {
    title: "Te enviamos la cotización",
    description:
      "Costo del producto, envío y arancel de aduana estimado, todo incluido.",
  },
  {
    title: "Apruebas y pagas",
    description: "Pago seguro con Wompi una vez estés de acuerdo con el total.",
  },
  {
    title: "Te lo entregamos",
    description:
      "Compramos, gestionamos el envío y la aduana, y le das seguimiento a cada paso.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className={styles.stepsSection}>
      <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
      <div className={styles.stepsGrid}>
        {STEPS.map((step, index) => (
          <div key={step.title} className={styles.stepCard}>
            <span className={styles.stepNumber}>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
