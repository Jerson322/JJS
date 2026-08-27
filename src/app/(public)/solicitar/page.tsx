import { auth } from "@/server/auth/auth.config";
import { SolicitarForm } from "./SolicitarForm";

export default async function SolicitarPage(
  props: PageProps<"/solicitar">,
) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const prefillRaw = searchParams.prefill;
  const prefill = Array.isArray(prefillRaw) ? prefillRaw[0] : prefillRaw;

  return (
    <div className="container stack">
      <h1>Solicitar una compra</h1>
      <SolicitarForm prefill={prefill} isAuthenticated={!!session?.user} />
    </div>
  );
}
