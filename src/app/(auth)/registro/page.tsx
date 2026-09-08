import Link from "next/link";
import { AuthLayout } from "../AuthLayout";
import { RegistroForm } from "./RegistroForm";
import styles from "../auth.module.css";

export default async function RegistroPage(props: PageProps<"/registro">) {
  const searchParams = await props.searchParams;
  const raw = searchParams.callbackUrl;
  const callbackUrl = Array.isArray(raw) ? raw[0] : raw;

  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";

  return (
    <AuthLayout
      eyebrow="Únete"
      title="Crea tu cuenta y pide lo que quieras desde Estados Unidos."
      points={[
        "Sin tarjeta internacional ni dirección en EEUU",
        "Cotización transparente: producto, envío y aduana",
        "Historial y seguimiento de todos tus pedidos",
      ]}
    >
      <h1>Crear cuenta</h1>
      <RegistroForm callbackUrl={callbackUrl} />
      <p className={styles.formFootnote}>
        ¿Ya tienes cuenta? <Link href={loginHref}>Inicia sesión</Link>.
      </p>
    </AuthLayout>
  );
}
