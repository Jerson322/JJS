import Link from "next/link";
import { auth } from "@/server/auth/auth.config";
import { SolicitarForm } from "./SolicitarForm";

export default async function SolicitarPage(
  props: PageProps<"/solicitar">,
) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const prefillRaw = searchParams.prefill;
  const prefill = Array.isArray(prefillRaw) ? prefillRaw[0] : prefillRaw;

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
      <SolicitarForm prefill={prefill} />
    </div>
  );
}
