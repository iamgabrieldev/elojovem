import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

/** Rotas de página que exigem sessão (demais passam e podem cair em 404). */
const PROTECTED_PAGE_PREFIXES = [
  "/dashboard",
  "/biblia",
  "/devocional",
  "/habitos",
  "/igrejas",
  "/mentor",
  "/objetivos",
  "/oracoes",
  "/perfil",
  "/reflexao",
  "/tempo",
  "/terco",
  "/tradicao",
];

const publicPaths = [
  "/",
  "/login",
  "/registro",
  "/api/auth",
  "/api/webhooks/abacatepay",
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isProtectedPage(pathname: string) {
  return PROTECTED_PAGE_PREFIXES.some((p) => matchesPrefix(pathname, p));
}

/** /api/* exceto estas — exige cookie (resposta 401, sem redirect HTML). */
function isPublicApi(pathname: string) {
  return publicPaths.some(
    (p) =>
      p.startsWith("/api/") &&
      (pathname === p || pathname.startsWith(`${p}/`))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isStaticExtension =
    !pathname.startsWith("/api") &&
    /\.(ico|png|jpe?g|gif|webp|svg|woff2?|ttf|eot|txt|xml|map|webmanifest|js|css|json)$/i.test(
      pathname
    );
  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    isStaticExtension;

  if (isPublic || isAsset) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/api/")) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!isProtectedPage(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/).*)",
  ],
};
