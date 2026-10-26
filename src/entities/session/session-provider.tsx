"use client";

/**
 * SESSIYA — "KIM KIRDI".
 *
 * ── NIMA UCHUN LOGIN EKRANI YO'Q ──────────────────────────────────────
 *
 * ⚠️ Foydalanuvchi ALLAQACHON Telegram'da autentifikatsiyadan
 * o'tgan va unga "kiring" deyish ma'nosiz ish bo'lardi. Ilova
 * ochilishi bilan `initData` ni serverga yuboradi va token oladi —
 * fuqaro bu bosqichni umuman ko'rmaydi.
 *
 * ⚠️ XATO HOLATI ALOHIDA KO'RSATILADI: kirish amalga oshmasa
 * (server o'chirilgan, ilova sozlamada yopilgan, hisob
 * cheklangan), bo'sh ekran ko'rsatish "ilova buzilgan" degan
 * taassurot qoldirardi. Sabab serverdan keladi va o'zbek tilida.
 */

import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { ApiError, api, loginOnce, tokens } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/query-keys";
import type { CitizenProfile } from "@/shared/api/types";
import { LoadingBlock } from "@/shared/ui/states";
import { Button } from "@/shared/ui/button";
import { isNativeApp } from "@/shared/lib/native";
import { closeApp } from "@/shared/lib/telegram";
import { Onboarding } from "./onboarding";
import { TelegramLoginScreen } from "./telegram-login";
import { consumePendingAuth, listenForAuth } from "./telegram-login-flow";

interface SessionValue {
  citizen: CitizenProfile;
  refetch: UseQueryResult<CitizenProfile>["refetch"];
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * ⚠️ XATO OTADI, `null` QAYTARMAYDI: provider ichidagi har
 * komponent fuqaro BOR deb hisoblashi kerak va har joyda `?.`
 * yozish amalda bittasini unutish bilan tugardi.
 */
export const useSession = (): SessionValue => {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession faqat <SessionProvider> ichida ishlatiladi");
  }
  return value;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  /**
   * ⚠️ MUSTAQIL ILOVADA KIRISH EKRANI KERAK: `initData` yo'q va
   * fuqaro tugmani O'ZI bosadi. Mini-ilovada bu hech qachon
   * `true` bo'lmaydi.
   */
  const [needsLogin, setNeedsLogin] = useState(false);

  /**
   * ⚠️ TOKEN BOR BO'LSA KIRISH TAKRORLANMAYDI: har ochilishda
   * `initData` yuborish ortiqcha so'rov bo'lardi. Token eskirgan
   * bo'lsa, `client.ts` birinchi 401 da o'zi qayta kiradi.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (tokens.get()) {
        if (!cancelled) setReady(true);
        return;
      }

      /**
       * ⚠️ DEEP LINK AVVAL TEKSHIRILADI: ilova Telegram kirishidan
       * keyin aynan shu manzil bilan ochiladi va token shundan
       * olinadi. Keyinroq tekshirilsa, ekran bir lahza kirish
       * tugmasini ko'rsatib, so'ng o'zgarardi.
       */
      const handled = await consumePendingAuth();
      if (cancelled) return;

      if (handled.status === "ok") {
        setReady(true);
        return;
      }

      if (handled.status === "error") {
        setLoginError(handled.message);
        setNeedsLogin(true);
        setReady(true);
        return;
      }

      const ok = await loginOnce();
      if (cancelled) return;

      // ⚠️ MUSTAQIL ILOVADA "KIRA OLMADI" XATO EMAS: fuqaro hali
      // kirmagan va unga kirish ekrani ko'rsatiladi.
      if (!ok) {
        if (isNativeApp()) setNeedsLogin(true);
        else setLoginError("Kirish amalga oshmadi");
      }
      setReady(true);
    };

    void run();

    /**
     * ⚠️ ILOVA FONDAN QAYTGANDA ham kirish tugallanishi kerak:
     * fuqaro Telegram'da tasdiqlaganda ilova fonda turadi va
     * natija `appUrlOpen` bilan keladi. Usiz ekran kirish
     * tugmasida qotib qolardi.
     */
    const stop = listenForAuth((result) => {
      if (cancelled) return;

      if (result.status === "ok") {
        setLoginError(null);
        setNeedsLogin(false);
        setReady(true);
        // ⚠️ QAYTA SO'RALADI: profil so'rovi kirishdan OLDIN
        // 401 bilan tugagan bo'lishi mumkin va u o'zi qayta
        // urinmaydi (`retry: 0`) — ekran kirgandan keyin ham
        // xato holatida qolardi.
        void queryClient.invalidateQueries({ queryKey: queryKeys.me() });
      } else if (result.status === "error") {
        setLoginError(result.message);
      }
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<CitizenProfile>("/mobile/me"),
    // ⚠️ KIRMAGAN HOLATDA SO'RALMAYDI (`!needsLogin`): aks holda
    // har ochilishda bitta 401 so'rov bekorga ketardi va
    // `client.ts` uni "qayta kirish" deb talqin qilardi.
    enabled: ready && !loginError && !needsLogin,
    // ⚠️ `retry: 0`: kirish xatosi (403 — hisob cheklangan) qayta
    // urinishdan tuzalmaydi va uch marta urinish sababni
    // ko'rsatishni 6 soniyaga kechiktirardi.
    retry: 0,
  });

  if (!ready || (query.isLoading && !query.data)) {
    return <LoadingBlock label="Ilova ochilmoqda…" />;
  }

  /**
   * ⚠️ KIRISH EKRANI XATO EKRANIDAN OLDIN: mustaqil ilovada
   * "hali kirmagan" holat XATO EMAS va unga "qaytadan urinish"
   * tugmasini ko'rsatish fuqaroni chalg'itardi.
   */
  if (needsLogin) {
    return <TelegramLoginScreen error={loginError} />;
  }

  if (loginError || query.isError || !query.data) {
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : "Serverga ulanib bo'lmadi. Internetni tekshirib, ilovani qayta oching.";

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-xl font-bold">Ilovaga kirib bo&apos;lmadi</h1>
        <p className="text-sm text-muted-foreground">{message}</p>

        <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
          <Button
            full
            onClick={() => {
              // ⚠️ TOKEN TOZALANADI: xato eskirgan yoki bekor
              // qilingan tokendan bo'lishi mumkin va uni saqlab
              // qolgan holda qayta urinish AYNI xatoni berardi.
              tokens.clear();
              window.location.reload();
            }}
          >
            Qaytadan urinish
          </Button>
          <Button full variant="ghost" onClick={closeApp}>
            Yopish
          </Button>
        </div>
      </div>
    );
  }

  /**
   * ⚠️ BIRINCHI KIRISH — HUDUD TANLANMAGUNCHA O'TKAZMAYDI. Tuman YOKI
   * MFY bo'sh bo'lsa, onboarding ekrani chiqadi va `children`
   * ko'rsatilmaydi. Shu tufayli hudud TEKSHIRUVI bitta joyda — har
   * sahifada qayta yozilmaydi.
   *
   * ⚠️ IKKALASI HAM TALAB QILINADI (tuman VA MFY): murojaat aniq MFY ga
   * yo'nalishi uchun. Saqlangach `refetch` sessiyani yangilaydi va bu
   * shart bajarilib, ekran yopiladi.
   */
  const needsOnboarding = !query.data.districtId || !query.data.mahallaId;
  if (needsOnboarding) {
    return (
      <Onboarding
        firstName={query.data.firstName}
        onDone={() => void query.refetch()}
      />
    );
  }

  return (
    <SessionContext.Provider value={{ citizen: query.data, refetch: query.refetch }}>
      {children}
    </SessionContext.Provider>
  );
};
