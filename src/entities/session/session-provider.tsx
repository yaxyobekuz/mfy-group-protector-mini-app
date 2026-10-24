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

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { ApiError, api, loginOnce, tokens } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/query-keys";
import type { CitizenProfile } from "@/shared/api/types";
import { LoadingBlock } from "@/shared/ui/states";
import { Button } from "@/shared/ui/button";
import { closeApp } from "@/shared/lib/telegram";

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
  const [ready, setReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

      const ok = await loginOnce();
      if (cancelled) return;

      if (!ok) setLoginError("Kirish amalga oshmadi");
      setReady(true);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<CitizenProfile>("/mobile/me"),
    enabled: ready && !loginError,
    // ⚠️ `retry: 0`: kirish xatosi (403 — hisob cheklangan) qayta
    // urinishdan tuzalmaydi va uch marta urinish sababni
    // ko'rsatishni 6 soniyaga kechiktirardi.
    retry: 0,
  });

  if (!ready || (query.isLoading && !query.data)) {
    return <LoadingBlock label="Ilova ochilmoqda…" />;
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

  return (
    <SessionContext.Provider value={{ citizen: query.data, refetch: query.refetch }}>
      {children}
    </SessionContext.Provider>
  );
};
