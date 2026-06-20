"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { establishServerSession } from "@/lib/auth-client";
import { messageForAuthFlowError } from "@/lib/firebase-auth-messages";
import {
  firebaseCreateUser,
  firebaseUpdateProfile,
  firebaseSignInWithGoogle,
} from "@/lib/firebase-client";
import { useGoogleRedirectCompletion } from "@/lib/use-google-redirect-auth";
import { AuthErrorHint } from "@/components/features/auth/auth-error-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIconButton } from "@/components/ui/google-icon-button";
import { StepIndicator } from "@/components/features/onboarding/step-indicator";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);

  useGoogleRedirectCompletion({
    onError: (msg) => setError(msg),
    onPendingChange: setPending,
    afterSession: () => router.push("/dashboard"),
  });

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
      const session = await establishServerSession(idToken, {
        registrationKind: "paid-email",
        name: name.trim(),
      });
      router.push(
        session.requiresPaymentCompletion ? "/registro/pagamento" : "/tradicao"
      );
      router.refresh();
    } catch (err) {
      setLastError(err);
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
        console.warn("[registro:google]", step, err);
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
      <StepIndicator currentStep={1} totalSteps={2} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Criar Conta</h1>
        <p className="text-sm text-slate-600">
          Etapa 1 de 2 — seus dados (em seguida, o pagamento)
        </p>
      </div>

      <GoogleIconButton
        type="button"
        className="w-full"
        loading={pending}
        onClick={onGoogle}
      >
        Criar conta com Google
      </GoogleIconButton>

      <p className="text-center text-xs text-slate-500">
        ✨ Com Google você pula o pagamento desta etapa
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[hsl(var(--bg))] px-2 text-slate-500">ou</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input 
          label="Nome completo" 
          name="name" 
          placeholder="Seu nome" 
          icon={<User className="w-4 h-4" />}
          required 
        />
        
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          icon={<Mail className="w-4 h-4" />}
          required
        />
        
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Crie uma senha forte (mínimo 8 caracteres)"
          icon={<Lock className="w-4 h-4" />}
          minLength={8}
          required
        />

        <AuthErrorHint error={error} lastError={lastError} />

        <Button 
          type="submit" 
          loading={pending} 
          className="w-full mt-2 h-11 text-base font-semibold"
        >
          Prosseguir para pagamento
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          Entrar aqui
        </Link>
      </p>
    </div>
  );
}
