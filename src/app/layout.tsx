import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ui/theme-script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elo Jovem",
  description:
    "Plataforma espiritual para jovens cristãos — hábitos, devocionais e mentor IA.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elo Jovem",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d97706",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans antialiased">
        <ThemeScript />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  if (${JSON.stringify(process.env.NODE_ENV)} === 'production') {
                    navigator.serviceWorker.register('/sw.js').then((registration) => {
                      registration.update().catch(() => {});
                    }).catch(() => {});
                  } else {
                    navigator.serviceWorker.getRegistrations()
                      .then((registrations) =>
                        Promise.all(registrations.map((registration) => registration.unregister()))
                      )
                      .catch(() => {});

                    if ('caches' in window) {
                      caches.keys()
                        .then((keys) =>
                          Promise.all(
                            keys
                              .filter((key) => key.startsWith('elo-jovem-'))
                              .map((key) => caches.delete(key))
                          )
                        )
                        .catch(() => {});
                    }
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
