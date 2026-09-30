"use client";

import { useActionState } from "react";
import { enter } from "@/app/actions";

export function EntryForm() {
  const [state, action, pending] = useActionState(enter, undefined);
  return (
    <form action={action} className="grid gap-3">
      <label htmlFor="code" className="sr-only">
        Code d&apos;accès
      </label>
      <input
        id="code"
        name="code"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Code d'accès"
        aria-invalid={Boolean(state?.error)}
        aria-describedby={state?.error ? "code-error" : undefined}
        className="field h-12 text-center text-[16px] tracking-[0.1em]"
      />
      {state?.error && (
        <p id="code-error" role="alert" className="text-center text-[13px] font-medium text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary h-12 text-[15px]" disabled={pending}>
        {pending ? "Vérification…" : "Entrer"}
      </button>
    </form>
  );
}
