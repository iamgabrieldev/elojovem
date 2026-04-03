import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { SESSION_MAX_AGE_MS } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

function hasFirebaseAdminEnv(): boolean {
  const pk = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const em = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const pid =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  return Boolean(pk && em && pid);
}

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

    if (!existing.exists) {
      const base = {
        email: decoded.email ?? "",
        name: body.name?.trim() || decoded.name || null,
        image: decoded.picture ?? null,
        tradition: null,
        dailyTime: 10,
        goals: [] as string[],
        onboardingCompleted: false,
        abacateBillingId: null,
        cellphone: null,
        taxId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (body.registrationKind === "paid-email") {
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
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const res = NextResponse.json({ ok: true });
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
