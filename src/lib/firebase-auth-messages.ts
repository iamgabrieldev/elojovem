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
  "auth/popup-blocked": "Popup bloqueado pelo navegador. Permita popups para este site.",
};

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
