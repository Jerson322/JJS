import Link from "next/link";
import { AuthLayout } from "../AuthLayout";
import { LoginForm } from "./LoginForm";
import styles from "../auth.module.css";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const raw = searchParams.callbackUrl;
  const callbackUrl = Array.isArray(raw) ? raw[0] : raw;

  const registroHref = callbackUrl
    ? `/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/registro";

  return (
    <AuthLayout
      eyebrow="Bienvenido de vuelta"
      title="Sigue el estado de tus importaciones en un solo lugar."
      points={[
        "Cotizaciones claras antes de pagar",
        "Seguimiento en tiempo real de tu pedido",
        "Soporte durante todo el proceso",
      ]}
    >
      <h1>Iniciar sesión</h1>
      <LoginForm callbackUrl={callbackUrl} />
      <p className={styles.formFootnote}>
        ¿No tienes cuenta? <Link href={registroHref}>Créala aquí</Link>.
      </p>
    </AuthLayout>
  );
}
