// Code d'accès unique partagé. Le cookie contient un hash du code, jamais le code.
export const ACCESS_COOKIE = "qg_access";

export async function accessToken(code: string): Promise<string> {
  const data = new TextEncoder().encode(`qg:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function accessCode(): string | undefined {
  return process.env.QG_ACCESS_CODE || undefined;
}
