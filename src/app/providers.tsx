"use client";

/**
 * ILOVA TAGLIKLARI — QUERY, TEMA, SESSIYA.
 *
 * ⚠️ `QueryClient` `useState` ICHIDA YARATILADI. Modul darajasida
 * yaratilsa, Next'ning server renderida u BARCHA so'rovlar uchun
 * bitta bo'lib qolardi va bir foydalanuvchining keshi
 * ikkinchisiga ko'rinardi.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import { SessionProvider } from "@/entities/session/session-provider";
import { LocaleProvider } from "@/shared/lib/i18n";
import {
  applyChrome,
  getColorScheme,
  initTelegram,
  onThemeChange,
} from "@/shared/lib/telegram";

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * ⚠️ 30 SONIYA: mini-ilovada foydalanuvchi ekranlar
         * orasida tez-tez yuradi (bosh sahifa → murojaatlar →
         * orqaga) va har o'tishda qayta so'rov mobil tarmoqda
         * sezilarli kechikish berardi.
         */
        staleTime: 30_000,

        /**
         * ⚠️ FOKUSDA QAYTA SO'RALMAYDI: Telegram'da ilova
         * klaviatura ochilib-yopilganda ham "fokusni qaytargan"
         * hisoblanadi va ro'yxat har harf yozilganda qayta
         * yuklanardi.
         */
        refetchOnWindowFocus: false,

        /**
         * ⚠️ 1 MARTA QAYTA URINISH: mobil tarmoq beqaror va
         * birinchi so'rov tez-tez uziladi. 3 marta (standart)
         * esa xato xabarini 10 soniyaga kechiktirardi.
         */
        retry: 1,
      },
      mutations: { retry: 0 },
    },
  });

export const Providers = ({ children }: { children: ReactNode }) => {
  const [client] = useState(makeClient);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    initTelegram();

    /**
     * TEMA — TELEGRAM'DAN.
     *
     * ⚠️ `next-themes` ISHLATILMADI (panelda ishlatilgan): u
     * foydalanuvchiga TANLOV beradi, bu yerda esa tanlov
     * Telegram'da qilingan. Ikkita mustaqil tanlov bo'lsa, ilova
     * Telegram qora rejimida oq bo'lib ochilardi.
     */
    const sync = () => {
      const scheme = getColorScheme();
      setTheme(scheme);
      document.documentElement.classList.toggle("dark", scheme === "dark");

      // Telegram sarlavha paneli ilova foni bilan bir xil bo'lishi
      // kerak — aks holda tepada begona chiziq ko'rinardi.
      applyChrome(scheme === "dark" ? "#121316" : "#f1f5f9");
    };

    sync();
    return onThemeChange(sync);
  }, []);

  return (
    <QueryClientProvider client={client}>
      {/* ⚠️ TIL SESSIYADAN TASHQARIDA: kirish xatosi ekrani ham
          tarjima qilinadi va u `SessionProvider` ICHIDA
          ko'rsatiladi — ya'ni til undan YUQORIDA bo'lishi kerak. */}
      <LocaleProvider>
        <SessionProvider>{children}</SessionProvider>
      </LocaleProvider>

      {/* ⚠️ `top-center`: pastda menyu bor va u yerdagi bildirishnoma
          tugmalarni bosib qolardi. */}
      <Toaster
        position="top-center"
        theme={theme}
        richColors
        closeButton={false}
        toastOptions={{ style: { borderRadius: "0.9rem" } }}
      />
    </QueryClientProvider>
  );
};
