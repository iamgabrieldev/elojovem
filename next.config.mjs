/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  // CORREÇÃO 1: Adicionado os domínios do Google no script-src para o Firebase Auth funcionar
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.google.com https://*.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  // CORREÇÃO Opcional: Adicionado googleusercontent.com para carregar a foto de perfil do Google depois do login
  "img-src 'self' data: blob: https://api.dicebear.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://*.google.com",
    "https://*.firebaseio.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firestore.googleapis.com",
    "https://firebaseinstallations.googleapis.com",
    "https://accounts.google.com",
  ].join(" "),
  [
    "frame-src 'self'",
    "https://accounts.google.com",
    "https://*.google.com",
    "https://*.firebaseapp.com",
    "https://*.gstatic.com",
  ].join(" "),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          // CORREÇÃO 2: O Header de Popups do COOP deve ficar AQUI DENTRO, na rota raiz (/:path*)
          { 
            key: "Cross-Origin-Opener-Policy", 
            value: "same-origin-allow-popups" 
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;