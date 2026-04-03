"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { establishServerSession } from "@/lib/auth-client";
import { messageForAuthFlowError } from "@/lib/firebase-auth-messages";
import {
  firebaseCreateUser,
  firebaseUpdateProfile,
  firebaseSignInWithGoogle,
} from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/features/onboarding/step-indicator";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    let step = "init";
    try {
      step = "createUser";
      const cred = await firebaseCreateUser(email, password);
      step = "updateProfile";
      await firebaseUpdateProfile(cred.user, { displayName: name.trim() });
      step = "getIdToken";
      const idToken = await cred.user.getIdToken(true);
      step = "establishServerSession";
      await establishServerSession(idToken, {
        registrationKind: "paid-email",
        name: name.trim(),
      });
      router.push("/registro/pagamento");
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[registro]", step, err);
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
      step = "popup";
      const cred = await firebaseSignInWithGoogle();
      step = "idToken";
      const idToken = await cred.user.getIdToken();
      step = "establishServerSession";
      await establishServerSession(idToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[registro:google]", step, err);
      }
      setError(messageForAuthFlowError(err, { step }));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator currentStep={1} totalSteps={2} />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Criar Conta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Etapa 1 de 2 — seus dados (em seguida, o pagamento)
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={pending}
        onClick={onGoogle}
      >
        Criar conta com Google
      </Button>

      <p className="text-center text-xs text-slate-400">
        Com Google você pula o pagamento desta etapa
      </p>

      <p className="text-center text-xs text-slate-400">ou com email</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Nome" name="name" placeholder="Seu nome" required />
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
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          required
        />

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <Button type="submit" loading={pending} className="w-full mt-2">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-600 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
