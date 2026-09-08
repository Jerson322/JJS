import styles from "./auth.module.css";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  points: string[];
  children: React.ReactNode;
}

export function AuthLayout({ eyebrow, title, points, children }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.branding}>
        <span className={styles.brandingEyebrow}>{eyebrow}</span>
        <h2 className={styles.brandingTitle}>{title}</h2>
        <div className={styles.brandingList}>
          {points.map((point) => (
            <span key={point}>✓ {point}</span>
          ))}
        </div>
      </div>
      <div className={styles.formSide}>
        <div className={styles.formCard}>{children}</div>
      </div>
    </div>
  );
}
