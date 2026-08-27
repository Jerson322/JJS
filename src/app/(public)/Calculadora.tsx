import { getDutyCategories } from "@/server/actions/duty-estimate.actions";
import { CalculadoraForm } from "./CalculadoraForm";
import styles from "./home.module.css";

export async function Calculadora() {
  const categories = await getDutyCategories();
  if (categories.length === 0) return null;

  return (
    <section id="calculadora" className={styles.calcSection}>
      <div className={styles.calcIntro}>
        <h2 className={styles.sectionTitle}>Calcula tu estimado de aduana</h2>
        <p>
          Antes de pedir, hazte una idea de cuánto pagarías de aduana. La
          cotización real la confirmamos cuando revisamos tu solicitud.
        </p>
      </div>
      <CalculadoraForm categories={categories} />
    </section>
  );
}
