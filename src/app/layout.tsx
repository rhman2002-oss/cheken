import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { restaurantData } from "@/config/restaurant";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "جكن اكسبريس",
  },
  title: `${restaurantData.name} | ${restaurantData.tagline}`,
  description: restaurantData.description,
  icons: {
    icon: restaurantData.logo,
  },
  openGraph: {
    title: restaurantData.name,
    description: restaurantData.description,
    images: [
      {
        url: restaurantData.heroImage,
        width: 1200,
        height: 630,
        alt: restaurantData.name,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full scroll-smooth`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e63946" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwa_deferred_prompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwa_deferred_prompt = e;
                console.log('🔥 [PWA Head Listener] beforeinstallprompt received!', e);
                window.dispatchEvent(new CustomEvent('pwa_prompt_ready', { detail: e }));
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
