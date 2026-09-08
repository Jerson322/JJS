import { getDutyCategories } from "@/server/actions/duty-estimate.actions";
import { Reveal } from "@/components/Reveal";
import { CalculadoraForm } from "./CalculadoraForm";
import styles from "./home.module.css";

export async function Calculadora() {
  const categories = await getDutyCategories();
  if (categories.length === 0) return null;

  return (
    <section id="calculadora" className={styles.calcSection}>
      <Reveal className={styles.calcIntro}>
        <h2 className={styles.sectionTitle}>Calcula tu estimado de aduana</h2>
        <p>
          Antes de pedir, hazte una idea de cuánto pagarías de aduana. La
          cotización real la confirmamos cuando revisamos tu solicitud.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <CalculadoraForm categories={categories} />
      </Reveal>
    </section>
  );
}
