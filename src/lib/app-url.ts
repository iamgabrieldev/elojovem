/** URL pública do app (usada em redirects AbacatePay). */
export function getAppUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}
