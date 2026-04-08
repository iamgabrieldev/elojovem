import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { isAdminEmail } from "@/lib/admin";
import {
  getAdminAuth,
  getAdminDb,
  hasFirebaseAdminEnv,
} from "@/lib/firebase-admin";
import { getAppSettings } from "@/lib/firestore/repos";
import { SESSION_MAX_AGE_MS } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

type Body = {
  idToken?: string;
  /** Cadastro email/senha — exige pagamento depois */
  registrationKind?: "paid-email";
  name?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const idToken = body.idToken?.trim();
  if (!idToken) {
    return NextResponse.json({ error: "idToken obrigatório" }, { status: 400 });
  }

  if (!hasFirebaseAdminEnv()) {
    console.error(
      "[api/auth/session] FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY / projeto ausentes"
    );
    return NextResponse.json(
      {
        error:
          "Firebase Admin não configurado no servidor. Defina FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY e FIREBASE_PROJECT_ID (ou NEXT_PUBLIC_FIREBASE_PROJECT_ID).",
      },
      { status: 503 }
    );
  }

  try {
    const auth = getAdminAuth();

    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const uid = decoded.uid;
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();
    const email = decoded.email ?? "";
    const isAdmin = isAdminEmail(email);
    const settings = await getAppSettings();

    if (!existing.exists) {
      const base = {
        email,
        name: body.name?.trim() || decoded.name || null,
        image: decoded.picture ?? null,
        isAdmin,
        tradition: null,
        dailyTime: 10,
        goals: [] as string[],
        onboardingCompleted: false,
        abacateBillingId: null,
        subscriptionPlan: null,
        cellphone: null,
        taxId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (body.registrationKind === "paid-email" && settings.registrationPaymentEnabled) {
        await userRef.set({
          ...base,
          requiresPaymentCompletion: true,
          paymentCompleted: false,
        });
      } else {
        await userRef.set({
          ...base,
          requiresPaymentCompletion: false,
          paymentCompleted: true,
        });
      }
    } else {
      const current = existing.data() ?? {};
      const updates: Record<string, unknown> = {};

      if (current.email !== email && email) updates.email = email;
      if (current.isAdmin !== isAdmin) updates.isAdmin = isAdmin;

      if (
        body.registrationKind === "paid-email" &&
        settings.registrationPaymentEnabled === false &&
        current.requiresPaymentCompletion === true &&
        current.paymentCompleted !== true
      ) {
        updates.requiresPaymentCompletion = false;
        updates.paymentCompleted = true;
      }

      if (Object.keys(updates).length > 0) {
        await userRef.update({
          ...updates,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const profileSnap = await userRef.get();
    const requiresPaymentCompletion = Boolean(
      profileSnap.data()?.requiresPaymentCompletion
    );

    const res = NextResponse.json({ ok: true, requiresPaymentCompletion });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/auth/session] POST failed:", e);
    const clientMsg =
      process.env.NODE_ENV === "development"
        ? msg.slice(0, 400)
        : "Erro no servidor ao criar sessão";
    return NextResponse.json({ error: clientMsg }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
