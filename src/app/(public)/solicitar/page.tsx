import Link from "next/link";
import { auth } from "@/server/auth/auth.config";
import { SolicitarForm } from "./SolicitarForm";

export default async function SolicitarPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="container stack">
        <h1>Solicitar una compra</h1>
        <p className="card">
          Para enviar una solicitud necesitas una cuenta, así puedes darle
          seguimiento a tu pedido. {" "}
          <Link href="/registro">Crea una cuenta</Link> o{" "}
          <Link href="/login">inicia sesión</Link> para continuar.
        </p>
      </div>
    );
  }

  return (
    <div className="container stack">
      <h1>Solicitar una compra</h1>
      <SolicitarForm />
    </div>
  );
}
