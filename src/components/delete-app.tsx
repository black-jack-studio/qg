"use client";

import { ConfirmButton } from "./confirm-button";

export function DeleteAppButton({ action, name }: { action: () => Promise<void>; name: string }) {
  return <ConfirmButton label={`Supprimer ${name}`} onConfirm={action} />;
}
