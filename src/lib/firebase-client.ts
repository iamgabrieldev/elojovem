"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

/** Remove aspas extras e espaços comuns em .env mal formatado */
function normalizePublicEnvValue(value: string | undefined): string {
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

const REQUIRED_PUBLIC_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

function readFirebaseWebConfig() {
  const apiKey = normalizePublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const authDomain = normalizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  );
  const projectId = normalizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
  const storageBucket = normalizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  );
  const messagingSenderId = normalizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  );
  const appId = normalizePublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

  const values = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  const envMap: Record<(typeof REQUIRED_PUBLIC_KEYS)[number], string> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: values.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: values.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: values.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: values.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: values.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: values.appId,
  };
  const missing = REQUIRED_PUBLIC_KEYS.filter((key) => !envMap[key]);

  if (missing.length > 0) {
    throw new Error(
      `Firebase client: variáveis ausentes ou vazias: ${missing.join(", ")}. ` +
        "Copie do console do Firebase (Web app) para o .env e reinicie `next dev`."
    );
  }

  if (!apiKey.startsWith("AIza")) {
    throw new Error(
      "Firebase client: NEXT_PUBLIC_FIREBASE_API_KEY parece inválida (deve começar com AIza). " +
        "Confira se não há aspas duplicadas no .env."
    );
  }

  const measurementId = normalizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  );

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  const cfg = readFirebaseWebConfig();
  app = getApps().length ? getApps()[0]! : initializeApp(cfg);
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getGoogleProvider() {
  return new GoogleAuthProvider();
}
