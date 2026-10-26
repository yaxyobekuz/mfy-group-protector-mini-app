"use client";

/**
 * KIRISH EKRANI — MUSTAQIL ILOVA (APK) UCHUN.
 *
 * ⚠️ MINI-ILOVADA BU EKRAN KO'RINMAYDI: u yerda `initData` bor va
 * kirish avtomatik. Bu ekran faqat Telegram TASHQARISIDA ochilgan
 * ilovada chiqadi (Play Market'dan o'rnatilgan APK).
 *
 * ── OQIM ──────────────────────────────────────────────────────────────
 *
 *   1. Fuqaro "Telegram orqali kirish" ni bosadi
 *   2. Tizim brauzeri Telegram oauth sahifasini ochadi
 *   3. Fuqaro Telegram'da TASDIQLAYDI
 *   4. Telegram imzolangan maydonlarni bizning sahifamizga qaytaradi
 *   5. Sahifa `vshtabi://` deep link bilan ilovani uyg'otadi
 *   6. Ilova imzoni serverga yuboradi va token oladi
 *
 * ⚠️ TIZIM BRAUZERI ISHLATILADI, ILOVA ICHIDAGI WebView EMAS:
 * Telegram (va Google) ichki WebView'dagi kirishni BLOKLAYDI
 * ("disallowed_useragent") — bu fishingdan himoya. Ichki
 * WebView'da ochilsa, fuqaro bo'sh sahifa ko'rardi.
 */

import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { startTelegramLogin } from "./telegram-login-flow";

export const TelegramLoginScreen = ({ error }: { error?: string | null }) => {
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10">
        {/* ⚠️ TELEGRAM BELGISI — INLINE SVG: `lucide` da u yo'q va
            rasm fayli qo'shilsa, internetsiz ko'rinmasdi. */}
        <svg viewBox="0 0 24 24" className="size-10 text-primary" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Viloyat shtabi</h1>
        <p className="text-sm text-muted-foreground">
          Hududingizdagi muammolarni fotosurat bilan yuboring
        </p>
      </div>

      {/* ⚠️ XATO SABABI KO'RSATILADI: "kirib bo'lmadi" degan quruq
          xabar fuqaroga nima qilishni aytmasdi. */}
      {error ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="w-full max-w-xs space-y-3">
        <Button
          full
          disabled={busy}
          onClick={() => {
            setBusy(true);
            startTelegramLogin();
            // ⚠️ TUGMA QAYTA YOQILADI: fuqaro brauzerda "orqaga"
            // bosib qaytishi mumkin va o'shanda tugma abadiy
            // o'chiq qolardi.
            window.setTimeout(() => setBusy(false), 3000);
          }}
        >
          {busy ? "Telegram ochilmoqda…" : "Telegram orqali kirish"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Kirish uchun Telegram hisobingiz kerak. Ma&apos;lumotlaringiz
          faqat murojaatingizni ko&apos;rib chiqish uchun ishlatiladi.
        </p>
      </div>
    </div>
  );
};
