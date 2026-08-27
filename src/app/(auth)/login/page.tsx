import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="container stack">
      <h1>Iniciar sesión</h1>
      <LoginForm />
      <p>
        ¿No tienes cuenta? <Link href="/registro">Créala aquí</Link>.
      </p>
    </div>
  );
}
