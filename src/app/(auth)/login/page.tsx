"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { establishServerSession } from "@/lib/auth-client";
import { messageForAuthFlowError } from "@/lib/firebase-auth-messages";
import {
  firebaseSignInWithEmail,
  firebaseSignInWithGoogle,
} from "@/lib/firebase-client";
import { useGoogleRedirectCompletion } from "@/lib/use-google-redirect-auth";
import { AuthErrorHint } from "@/components/features/auth/auth-error-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);

  useGoogleRedirectCompletion({
    onError: (msg) => {
      setError(msg);
    },
    onPendingChange: setPending,
    afterSession: () => {
      router.push("/dashboard");
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLastError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    let step = "init";
    try {
      step = "signIn";
      const cred = await firebaseSignInWithEmail(email, password);
      step = "idToken";
      const idToken = await cred.user.getIdToken();
      step = "establishServerSession";
      await establishServerSession(idToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setLastError(err);
      if (process.env.NODE_ENV === "development") {
        console.warn("[login]", step, err);
      }
      setError(messageForAuthFlowError(err, { step }));
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setLastError(null);
    setPending(true);
    let redirecting = false;
    let step = "init";
    try {
      step = "popup";
      const cred = await firebaseSignInWithGoogle();
      step = "idToken";
      const idToken = await cred.user.getIdToken();
      step = "establishServerSession";
      await establishServerSession(idToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setLastError(err);
      if (process.env.NODE_ENV === "development") {
        console.warn("[login:google]", step, err);
      }
      const msg = messageForAuthFlowError(err, { step });
      setError(msg);
      if (msg.includes("Redirecionando")) redirecting = true;
    } finally {
      if (!redirecting) setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bem-vindo de volta ao Elo Jovem
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={pending}
        onClick={onGoogle}
      >
        Continuar com Google
      </Button>

      <p className="text-center text-xs text-slate-400">ou com email</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••"
          required
        />

        <AuthErrorHint error={error} lastError={lastError} />

        <Button type="submit" loading={pending} className="w-full mt-2">
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Não tem conta?{" "}
        <Link
          href="/registro"
          className="font-medium text-amber-600 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
