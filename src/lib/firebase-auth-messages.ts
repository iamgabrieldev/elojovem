/**
 * Converte erros do fluxo Firebase + sessão em mensagens para a UI.
 */

const AUTH_CODE_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Este email já está cadastrado.",
  "auth/weak-password": "Senha fraca. Use pelo menos 6 caracteres.",
  "auth/invalid-email": "Email inválido.",
  "auth/invalid-credential": "Email ou senha incorretos.",
  "auth/wrong-password": "Email ou senha incorretos.",
  "auth/user-not-found": "Email ou senha incorretos.",
  "auth/operation-not-allowed":
    "Este método de login não está ativo no Firebase Console.",
  "auth/network-request-failed":
    "Sem rede ou Firebase indisponível. Tente de novo.",
  "auth/popup-closed-by-user": "Login cancelado (popup fechado).",
  "auth/cancelled-popup-request": "Só uma janela de login por vez. Feche a outra e tente de novo.",
  "auth/popup-blocked":
    "Popup bloqueado pelo navegador. Permita popups para este site ou use o login por redirecionamento.",
  "auth/unauthorized-domain":
    "Este domínio não está autorizado no Firebase. Adicione-o em Authentication → Settings → Authorized domains.",
  "auth/internal-error":
    "Login com Google falhou (erro interno). No Firebase Console: ative o provedor Google, adicione domínios autorizados (ex.: localhost e elojovem.com.br) e verifique se as APIs Identity Toolkit estão ativas.",
};

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "elojovem-481ca";

export function firebaseConsoleGoogleUrl(): string {
  return `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;
}

/** Códigos que indicam problema de configuração no Firebase Console. */
export function isFirebaseConsoleSetupError(err: unknown): boolean {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";
  return (
    code === "auth/internal-error" ||
    code === "auth/operation-not-allowed" ||
    code === "auth/unauthorized-domain"
  );
}

export function messageForAuthFlowError(
  err: unknown,
  options?: { step?: string }
): string {
  const msg = err instanceof Error ? err.message : String(err);
  const step = options?.step ?? "";

  if (msg.includes("Firebase client:")) {
    return (
      "Configuração do Firebase no app está incompleta. " +
      "Confira NEXT_PUBLIC_FIREBASE_* no .env e reinicie o servidor (`next dev`)."
    );
  }

  if (msg.includes("Firebase Admin não configurado")) {
    return (
      "Servidor sem Firebase Admin configurado. " +
      "Defina FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY e o projeto no .env."
    );
  }

  if (msg === "REDIRECT_IN_PROGRESS") {
    return "Redirecionando para o Google…";
  }

  if (step === "establishServerSession" && msg.includes("Token inválido")) {
    return "Não foi possível validar o login. Tente novamente.";
  }

  if (step === "establishServerSession" && msg.length > 0 && msg !== "Falha ao criar sessão") {
    return msg.slice(0, 220);
  }

  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";

  if (code && AUTH_CODE_MESSAGES[code]) {
    return AUTH_CODE_MESSAGES[code];
  }

  if (code.startsWith("auth/")) {
    return "Não foi possível autenticar. Tente novamente.";
  }

  return "Algo deu errado. Tente novamente.";
}
