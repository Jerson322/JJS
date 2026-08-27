import Link from "next/link";
import { requireUser } from "@/server/auth/rbac";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="container stack">
      <h1>Hola, {user.name}</h1>
      <div className="card stack">
        <p>Aquí puedes ver tus solicitudes de importación y su estado.</p>
        <div>
          <Link href="/dashboard/solicitudes" className="button">
            Ver mis solicitudes
          </Link>
        </div>
      </div>
    </div>
  );
}
