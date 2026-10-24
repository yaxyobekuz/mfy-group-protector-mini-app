import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { Providers } from "./providers";

/**
 * ⚠️ `latin-ext` SUBSET SHART: o'zbek lotin yozuvidagi `oʻ` va `gʻ`
 * harflari (U+02BB) `latin` subsetida YO'Q va ularning o'rnida
 * to'rtburchak chiqardi. Admin panelda ham AYNI shrift va AYNI
 * subset.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viloyat shtabi — Murojaat",
  description: "Hududingizdagi muammolarni fotosurat bilan yuboring",
};

/**
 * ⚠️ `maximumScale: 1` + `userScalable: false`: Telegram ichida
 * ikki barmoq bilan kattalashtirish mini-ilovani "siniq" holatga
 * keltiradi — sarlavha paneli joyida qolib, kontent siljib ketadi.
 *
 * ⚠️ `viewportFit: "cover"`: `env(safe-area-inset-*)` ishlashi
 * uchun MAJBURIY. Usiz iPhone'da pastki menyu telefon chizig'i
 * ostida qolardi.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/**
         * ⚠️ TELEGRAM SKRIPTI `beforeInteractive`: `window.Telegram`
         * React ishga tushishidan OLDIN mavjud bo'lishi kerak —
         * aks holda birinchi render `initData` ni topa olmay,
         * ilova brauzer rejimiga tushib qolardi.
         *
         * ⚠️ MANZIL TELEGRAM CDN'IDAN: skriptni o'zimizga nusxalash
         * mumkin emas — Telegram uni mijoz versiyasiga qarab
         * yangilaydi va eski nusxa yangi mijozlarda ishlamay
         * qolardi.
         */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${sans.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
