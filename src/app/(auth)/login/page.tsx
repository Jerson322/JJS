import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const raw = searchParams.callbackUrl;
  const callbackUrl = Array.isArray(raw) ? raw[0] : raw;

  const registroHref = callbackUrl
    ? `/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/registro";

  return (
    <div className="container stack">
      <h1>Iniciar sesión</h1>
      <LoginForm callbackUrl={callbackUrl} />
      <p>
        ¿No tienes cuenta? <Link href={registroHref}>Créala aquí</Link>.
      </p>
    </div>
  );
}
