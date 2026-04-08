/**
 * URL pública do app (redirects AbacatePay, links absolutos).
 * Em produção, use NEXT_PUBLIC_APP_URL=https://elojovem.com.br para o retorno correto após o checkout.
 */
export function getAppUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://elojovem.com.br";
  }

  return "http://localhost:3000";
}
