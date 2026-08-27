"use client";

import { useActionState } from "react";
import {
  registerCustomer,
  type RegisterState,
} from "@/server/actions/auth.actions";

const initialState: RegisterState = {};

export function RegistroForm() {
  const [state, formAction, pending] = useActionState(
    registerCustomer,
    initialState,
  );

  if (state.success) {
    return (
      <p className="card">
        Cuenta creada. Ya puedes{" "}
        <a href="/login">iniciar sesión</a>.
      </p>
    );
  }

  return (
    <form action={formAction} className="stack card">
      <div className="field">
        <label htmlFor="name">Nombre completo</label>
        <input id="name" name="name" required minLength={2} />
      </div>
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="phone">Teléfono (opcional)</label>
        <input id="phone" name="phone" />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
        />
      </div>
      {state.error && <p className="error">{state.error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
