import Link from "next/link";
import { RegistroForm } from "./RegistroForm";

export default function RegistroPage() {
  return (
    <div className="container stack">
      <h1>Crear cuenta</h1>
      <RegistroForm />
      <p>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>.
      </p>
    </div>
  );
}
