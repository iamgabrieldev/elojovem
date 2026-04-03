import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function trimEnv(value: string | undefined): string {
  if (value == null) return "";
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

/** Aceita chave com \\n no .env e remove vírgulas/JSON colado por engano no email */
function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let k = trimEnv(raw);
  k = k.replace(/\\n/g, "\n");
  if (!k.includes("BEGIN PRIVATE KEY")) {
    return undefined;
  }
  return k;
}

function normalizeClientEmail(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let e = trimEnv(raw);
  e = e.split(/[\s\n]/)[0] ?? e;
  e = e.replace(/,\s*$/, "");
  if (!e.includes("@") || !e.endsWith(".iam.gserviceaccount.com")) {
    return undefined;
  }
  return e;
}

/** Verificação alinhada a `getAdminApp()` (útil em rotas antes de inicializar). */
export function hasFirebaseAdminEnv(): boolean {
  const projectId =
    trimEnv(process.env.FIREBASE_PROJECT_ID) ||
    trimEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const clientEmail = normalizeClientEmail(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  return Boolean(projectId && clientEmail && privateKey);
}

let app: App | null = null;

export function getAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  const projectId =
    trimEnv(process.env.FIREBASE_PROJECT_ID) ||
    trimEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const clientEmail = normalizeClientEmail(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    const parts: string[] = [];
    if (!projectId) parts.push("FIREBASE_PROJECT_ID ou NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!clientEmail) {
      parts.push(
        "FIREBASE_CLIENT_EMAIL (apenas o email da service account, sem trechos de JSON)"
      );
    }
    if (!privateKey) {
      parts.push(
        "FIREBASE_PRIVATE_KEY (chave PEM completa; use \\n para quebras de linha no .env)"
      );
    }
    throw new Error(`Firebase Admin: defina ${parts.join("; ")}`);
  }

  try {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (e) {
    const hint =
      e instanceof Error && e.message.includes("DECODER")
        ? " Verifique se a chave privada não foi cortada e se as quebras de linha estão como \\n no .env."
        : "";
    throw new Error(
      `Firebase Admin: falha ao inicializar credenciais.${hint} Detalhe: ${e instanceof Error ? e.message : String(e)}`
    );
  }
  return app;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
