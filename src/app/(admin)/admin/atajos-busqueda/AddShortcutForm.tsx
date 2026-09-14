"use client";

import { useActionState } from "react";
import {
  createSearchShortcutAction,
  type SearchShortcutFormState,
} from "@/server/actions/search-shortcut.actions";

const initialState: SearchShortcutFormState = {};

export function AddShortcutForm() {
  const [state, formAction, pending] = useActionState(
    createSearchShortcutAction,
    initialState,
  );

  return (
    <form action={formAction} className="stack card">
      <h2>Agregar atajo de búsqueda</h2>

      <div className="field">
        <label htmlFor="brandLabel">Marca / tienda</label>
        <input id="brandLabel" name="brandLabel" required placeholder="Nike" />
      </div>

      <div className="field">
        <label htmlFor="label">Nombre a mostrar</label>
        <input id="label" name="label" required placeholder="AIR FORCE 1" />
      </div>

      <div className="field">
        <label htmlFor="url">Link real de la categoría/producto</label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://www.nike.com/w/air-force-1-shoes-..."
        />
      </div>

      <div className="field">
        <label htmlFor="keywords">Palabras clave (separadas por coma)</label>
        <input
          id="keywords"
          name="keywords"
          placeholder="air force 1, air force one, af1, zapatillas air force"
        />
      </div>

      <div className="field">
        <label htmlFor="sortOrder">Orden (menor aparece primero, opcional)</label>
        <input id="sortOrder" name="sortOrder" type="number" defaultValue={0} />
      </div>

      {state.error && <p className="error">{state.error}</p>}

      <button className="button" type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Agregar atajo"}
      </button>
    </form>
  );
}
