"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

/** Suppression en deux temps, sans boîte de dialogue : un clic arme, le second confirme. */
export function ConfirmButton({
  onConfirm,
  label = "Supprimer",
  compact = false,
}: {
  onConfirm: () => Promise<unknown> | void;
  label?: string;
  compact?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  if (compact && !armed) {
    return (
      <button type="button" className="btn btn-ghost btn-icon" aria-label={label} title={label} onClick={() => setArmed(true)}>
        <Trash2 size={15} />
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      className={`btn btn-sm ${armed ? "btn-danger" : "btn-ghost"}`}
      onClick={() => (armed ? start(async () => void (await onConfirm())) : setArmed(true))}
    >
      {!armed && <Trash2 size={14} />}
      {armed ? "Confirmer la suppression" : label}
    </button>
  );
}
