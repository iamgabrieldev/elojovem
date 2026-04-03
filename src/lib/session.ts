import { cookies } from "next/headers";
import { getAdminAuth } from "./firebase-admin";
import { SESSION_COOKIE_NAME } from "./session-constants";

export { SESSION_COOKIE_NAME };

/** Em ms; limite do Firebase para session cookie é 14 dias */
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;

export async function createSessionCookieFromIdToken(idToken: string) {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export async function verifySession(): Promise<{ uid: string } | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(raw, true);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

/** Compatível com o padrão NextAuth: `{ user: { id } } | null` */
export async function auth() {
  const s = await verifySession();
  if (!s) return null;
  return { user: { id: s.uid } };
}