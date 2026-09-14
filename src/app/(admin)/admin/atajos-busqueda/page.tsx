import {
  deleteSearchShortcutAction,
  toggleSearchShortcutActiveAction,
} from "@/server/actions/search-shortcut.actions";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import { AddShortcutForm } from "./AddShortcutForm";

export default async function AdminSearchShortcutsPage() {
  await requireRole(["STAFF", "ADMIN"]);

  const shortcuts = await prisma.searchShortcut.findMany({
    orderBy: [{ brandLabel: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="container stack">
      <h1>Atajos de búsqueda</h1>
      <p>
        Cuando un cliente escribe en el buscador, le mostramos estos links
        reales en vez de traer todo el catálogo de cada tienda. Agrega más a
        medida que sumes marcas.
      </p>

      <AddShortcutForm />

      <div className="stack">
        {shortcuts.map((shortcut) => {
          const deleteWithArgs = deleteSearchShortcutAction.bind(null, shortcut.id);
          const toggleWithArgs = toggleSearchShortcutActiveAction.bind(
            null,
            shortcut.id,
            !shortcut.isActive,
          );

          return (
            <div
              key={shortcut.id}
              className="card"
              style={{ display: "flex", gap: "1rem", alignItems: "center" }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {shortcut.brandLabel}
                </span>
                <div>
                  <strong>{shortcut.label}</strong>
                  {!shortcut.isActive && (
                    <span className="badge" style={{ marginLeft: "0.5rem" }}>
                      Inactivo
                    </span>
                  )}
                </div>
                <a
                  href={shortcut.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.85rem" }}
                >
                  {shortcut.url}
                </a>
                {shortcut.keywords.length > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {shortcut.keywords.join(", ")}
                  </div>
                )}
              </div>
              <form action={toggleWithArgs}>
                <button className="button" type="submit">
                  {shortcut.isActive ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={deleteWithArgs}>
                <button className="button" type="submit">
                  Eliminar
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
