"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { establishServerSession } from "@/lib/auth-client";
import { messageForAuthFlowError } from "@/lib/firebase-auth-messages";
import { firebaseCompleteGoogleRedirect } from "@/lib/firebase-client";

type Options = {
  onError: (message: string) => void;
  onPendingChange: (pending: boolean) => void;
  afterSession: (requiresPaymentCompletion: boolean) => void;
  registrationKind?: "paid-email";
  name?: string;
};

/**
 * Completa login Google quando a página carrega após signInWithRedirect.
 */
export function useGoogleRedirectCompletion(options: Options) {
  const router = useRouter();
  const started = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    (async () => {
      let step = "redirectResult";
      try {
        const cred = await firebaseCompleteGoogleRedirect();
        if (!cred || cancelled) return;

        optionsRef.current.onPendingChange(true);
        step = "idToken";
        const idToken = await cred.user.getIdToken();
        step = "establishServerSession";
        const session = await establishServerSession(idToken, {
          registrationKind: optionsRef.current.registrationKind,
          name: optionsRef.current.name,
        });
        optionsRef.current.afterSession(session.requiresPaymentCompletion);
        router.refresh();
      } catch (err) {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth:google-redirect]", step, err);
        }
        optionsRef.current.onError(messageForAuthFlowError(err, { step }));
      } finally {
        if (!cancelled) optionsRef.current.onPendingChange(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);
}
