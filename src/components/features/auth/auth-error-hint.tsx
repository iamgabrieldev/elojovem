"use client";

import {
  firebaseConsoleGoogleUrl,
  isFirebaseConsoleSetupError,
} from "@/lib/firebase-auth-messages";

type Props = {
  error: string | null;
  lastError?: unknown;
};

export function AuthErrorHint({ error, lastError }: Props) {
  if (!error) return null;

  const showSetup =
    process.env.NODE_ENV === "development" &&
    lastError != null &&
    isFirebaseConsoleSetupError(lastError);

  return (
    <div className="flex flex-col gap-2 text-center">
      <p className="text-sm text-red-600">{error}</p>
      {showSetup && (
        <p className="text-xs text-slate-500">
          Configuração Firebase: veja{" "}
          <a
            href={firebaseConsoleGoogleUrl()}
            className="font-medium text-amber-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firebase Console → Google
          </a>{" "}
          ou rode{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">
            node scripts/firebase-enable-google-auth.mjs
          </code>
        </p>
      )}
    </div>
  );
}
