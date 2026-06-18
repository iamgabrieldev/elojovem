/**
 * Habilita APIs e provedor Google no projeto Firebase via service account.
 * Uso: node scripts/firebase-enable-google-auth.mjs
 */
import { config } from "dotenv";
import { JWT } from "google-auth-library";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "") ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");

const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  .replace(/^"|"$/g, "")
  .split(/[\s\n]/)[0]
  ?.replace(/,\s*$/, "");

let PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^"|"$/g, "");
if (PRIVATE_KEY) PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, "\n");

const REQUIRED_DOMAINS = [
  "localhost",
  "elojovem.com.br",
  "www.elojovem.com.br",
  `${PROJECT_ID}.firebaseapp.com`,
  `${PROJECT_ID}.web.app`,
];

const SERVICES = [
  "identitytoolkit.googleapis.com",
  "firestore.googleapis.com",
];

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY?.includes("BEGIN PRIVATE KEY")) {
  fail(
    "Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env"
  );
}

const jwt = new JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

async function api(path, options = {}) {
  const token = await jwt.getAccessToken();
  const url = path.startsWith("http")
    ? path
    : `https://${options.host ?? "identitytoolkit.googleapis.com"}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function enableService(service) {
  const res = await api(
    `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${service}:enable`,
    { method: "POST", host: "serviceusage.googleapis.com" }
  );
  if (res.ok || res.status === 409) {
    console.log(`✓ API ${service} habilitada (ou já estava ativa)`);
    return true;
  }
  console.warn(`⚠ Não foi possível habilitar ${service}:`, res.status, res.json?.error?.message ?? res.json);
  return false;
}

async function getProjectConfig() {
  return api(`/v2/projects/${PROJECT_ID}/config`);
}

async function ensureAuthorizedDomains() {
  const current = await getProjectConfig();
  if (!current.ok) {
    console.warn("⚠ Não foi possível ler config do Identity Toolkit:", current.status, current.json?.error?.message);
    return;
  }

  const existing = new Set(current.json?.authorizedDomains ?? []);
  const merged = [...existing];
  let changed = false;
  for (const d of REQUIRED_DOMAINS) {
    if (!existing.has(d)) {
      merged.push(d);
      changed = true;
    }
  }

  if (!changed) {
    console.log("✓ Domínios autorizados já incluem os necessários");
    return;
  }

  const res = await api(`/v2/projects/${PROJECT_ID}/config?updateMask=authorizedDomains`, {
    method: "PATCH",
    body: { authorizedDomains: merged },
  });

  if (res.ok) {
    console.log("✓ Domínios autorizados atualizados:", merged.join(", "));
  } else {
    console.warn("⚠ Falha ao atualizar domínios:", res.status, res.json?.error?.message ?? res.json);
  }
}

async function ensureGoogleProvider() {
  const getRes = await api(
    `/v2/projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com`
  );

  if (getRes.ok && getRes.json?.enabled) {
    console.log("✓ Provedor Google já está ativo");
    return;
  }

  if (getRes.status === 404) {
    const createRes = await api(
      `/v2/projects/${PROJECT_ID}/defaultSupportedIdpConfigs?supportedIdpId=google.com`,
      {
        method: "POST",
        body: {
          name: `projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com`,
          enabled: true,
        },
      }
    );
    if (createRes.ok) {
      console.log("✓ Provedor Google criado e ativado");
      return;
    }
    console.warn("⚠ Falha ao criar provedor Google:", createRes.status, createRes.json?.error?.message ?? createRes.json);
    return;
  }

  const patchRes = await api(
    `/v2/projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com?updateMask=enabled`,
    {
      method: "PATCH",
      body: { enabled: true },
    }
  );

  if (patchRes.ok) {
    console.log("✓ Provedor Google ativado");
  } else {
    console.warn("⚠ Falha ao ativar provedor Google:", patchRes.status, patchRes.json?.error?.message ?? patchRes.json);
    console.warn(
      "  Ative manualmente em:",
      `https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`
    );
  }
}

async function probeFirestore() {
  try {
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: PROJECT_ID,
          clientEmail: CLIENT_EMAIL,
          privateKey: PRIVATE_KEY,
        }),
      });

    await getFirestore(app).collection("_health").doc("probe").set(
      { checkedAt: new Date().toISOString() },
      { merge: true }
    );
    console.log("✓ Firestore acessível (gravação de teste OK)");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("PERMISSION_DENIED") || msg.includes("has not been used")) {
      console.warn("⚠ Firestore API desativada ou banco não criado:", msg.slice(0, 120));
      console.warn(`  Crie em: https://console.firebase.google.com/project/${PROJECT_ID}/firestore`);
    } else {
      console.warn("⚠ Firestore:", msg.slice(0, 160));
    }
  }
}

async function probeClientConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim().replace(/^"|"$/g, "");
  if (!apiKey) return;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects?key=${apiKey}`
  );
  const json = await res.json().catch(() => ({}));
  if (json.error?.message === "CONFIGURATION_NOT_FOUND") {
    console.warn("⚠ Cliente ainda reporta CONFIGURATION_NOT_FOUND — aguarde propagação (1–2 min) ou revise o console.");
  } else if (res.ok) {
    console.log("✓ API Key do cliente responde corretamente ao Identity Toolkit");
  } else {
    console.log("ℹ Probe cliente:", res.status, json.error?.message ?? "ok");
  }
}

console.log(`\nConfigurando Firebase Auth (Google) — projeto ${PROJECT_ID}\n`);

for (const service of SERVICES) {
  await enableService(service);
}

await ensureAuthorizedDomains();
await ensureGoogleProvider();
await probeClientConfig();
await probeFirestore();

console.log("\nPróximos passos se o login ainda falhar:");
console.log(`  1. Firestore: https://console.firebase.google.com/project/${PROJECT_ID}/firestore`);
console.log(`  2. Provedor Google: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`);
console.log("  3. Aguarde 1–2 minutos e teste /login em aba anônima\n");
