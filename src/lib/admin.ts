const DEFAULT_ADMIN_EMAIL = "jonas@email.com";

function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined) {
  return normalizeEmail(email) === DEFAULT_ADMIN_EMAIL;
}
