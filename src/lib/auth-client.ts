"use client";

export async function establishServerSession(
  idToken: string,
  options?: { registrationKind?: "paid-email"; name?: string }
): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, ...options }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Falha ao criar sessão");
  }
}
