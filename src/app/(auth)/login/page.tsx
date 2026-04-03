"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { establishServerSession } from "@/lib/auth-client";
import { messageForAuthFlowError } from "@/lib/firebase-auth-messages";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    let step = "init";
    try {
      step = "getAuth";
      const auth = getFirebaseAuth();
      step = "signIn";
      const cred = await signInWithEmailAndPassword(auth, email, password);
      step = "idToken";
      const idToken = await cred.user.getIdToken();
      step = "establishServerSession";
      await establishServerSession(idToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
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
    setPending(true);
    let step = "init";
    try {
      step = "getAuth";
      const auth = getFirebaseAuth();
      step = "popup";
      const cred = await signInWithPopup(auth, getGoogleProvider());
      step = "idToken";
      const idToken = await cred.user.getIdToken();
      step = "establishServerSession";
      await establishServerSession(idToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[login:google]", step, err);
      }
      setError(messageForAuthFlowError(err, { step }));
    } finally {
      setPending(false);
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

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

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
