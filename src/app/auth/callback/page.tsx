"use client";

/**
 * TELEGRAM LOGIN — QAYTISH SAHIFASI.
 *
 * ⚠️ BU SAHIFA BRAUZERDA OCHILADI, ILOVADA EMAS. Telegram
 * `redirect_url` sifatida faqat HTTPS qabul qiladi (`vshtabi://`
 * ni rad etadi), shuning uchun oqim ikki qadamli:
 *
 *   Telegram → BU SAHIFA (https) → `vshtabi://auth?...` → ilova
 *
 * ⚠️ IMZO SHU YERDA TEKSHIRILMAYDI va tekshirilmasligi kerak:
 * bot tokeni serverда va u mijoz kodiga hech qachon tushmaydi.
 * Bu sahifa maydonlarni faqat UZATADI.
 *
 * ⚠️ BRAUZERDA OCHILGAN ILOVA UCHUN ZAXIRA YO'L: agar deep link
 * ishlamasa (ilova o'rnatilmagan yoki brauzer bloklagan), fuqaro
 * qo'lda bosadigan tugma ko'rsatiladi — aks holda u abadiy
 * "yo'naltirilmoqda…" ekranida qolardi.
 */

import { useEffect, useState } from "react";

import { APP_SCHEME } from "@/entities/session/telegram-login-flow";

export default function AuthCallbackPage() {
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    /**
     * ⚠️ `hash` FRAGMENTIDAN HAM O'QILADI: Telegram javobni
     * `?` bilan ham, `#` bilan ham qaytarishi mumkin (widget
     * versiyasiga qarab) va faqat bittasini o'qish kirishni
     * tasodifiy ishlamaydigan qilardi.
     */
    const raw = window.location.search.length > 1
      ? window.location.search.slice(1)
      : window.location.hash.slice(1);

    if (!raw) {
      setFailed(true);
      return;
    }

    const link = `${APP_SCHEME}://auth?${raw}`;
    setDeepLink(link);

    // Ilovani uyg'otishga urinish.
    window.location.href = link;

    // ⚠️ 2 SONIYADAN KEYIN QO'LDA TUGMA: deep link ishlaganda
    // sahifa fonda qoladi va bu taymer ahamiyatsiz; ishlamasa —
    // fuqaroda chiqish yo'li bo'ladi.
    const timer = window.setTimeout(() => setFailed(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-8 text-center">
      <h1 className="text-xl font-bold">
        {failed ? "Ilovaga qaytish" : "Ilovaga qaytilmoqda…"}
      </h1>

      {failed ? (
        <>
          <p className="text-sm text-muted-foreground">
            Ilova o&apos;zi ochilmadi. Quyidagi tugmani bosing.
          </p>
          {deepLink ? (
            <a
              href={deepLink}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Ilovani ochish
            </a>
          ) : (
            <p className="text-sm text-destructive">
              Kirish ma&apos;lumotlari topilmadi. Ilovadan qaytadan urinib
              ko&apos;ring.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
