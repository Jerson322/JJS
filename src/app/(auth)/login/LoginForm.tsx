"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="stack card">
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required />
      </div>
      {state.error && <p className="error">{state.error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
