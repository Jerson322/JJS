import Link from "next/link";
import { RegistroForm } from "./RegistroForm";

export default async function RegistroPage(props: PageProps<"/registro">) {
  const searchParams = await props.searchParams;
  const raw = searchParams.callbackUrl;
  const callbackUrl = Array.isArray(raw) ? raw[0] : raw;

  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";

  return (
    <div className="container stack">
      <h1>Crear cuenta</h1>
      <RegistroForm callbackUrl={callbackUrl} />
      <p>
        ¿Ya tienes cuenta? <Link href={loginHref}>Inicia sesión</Link>.
      </p>
    </div>
  );
}
