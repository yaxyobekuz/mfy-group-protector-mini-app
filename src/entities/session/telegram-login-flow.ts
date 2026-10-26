/**
 * TELEGRAM LOGIN OQIMI — MUSTAQIL ILOVA (APK) UCHUN.
 *
 * ── NIMA UCHUN BRAUZER ORQALI ─────────────────────────────────────────
 *
 * ⚠️ TELEGRAM OAUTH ILOVA ICHIDAGI WebView'DA ISHLAMAYDI. Telegram
 * (Google ham) ichki WebView'dan kelgan kirish so'rovini ATAYLAB
 * rad etadi — bu fishingdan himoya: soxta ilova WebView ichida
 * haqiqiy kirish sahifasini ko'rsatib, parolni o'g'irlashi mumkin
 * bo'lardi.
 *
 * Shuning uchun kirish TIZIM BRAUZERIDA ochiladi (Chrome Custom
 * Tab), natija esa `vshtabi://` deep link orqali ilovaga qaytadi.
 *
 * ── NIMA UCHUN REDIRECT SAHIFA KERAK ──────────────────────────────────
 *
 * ⚠️ TELEGRAM `redirect_url` SIFATIDA FAQAT HTTPS QABUL QILADI —
 * `vshtabi://` kabi maxsus sxemani RAD ETADI. Shuning uchun oqim
 * ikki qadamli:
 *
 *   Telegram → https://<domen>/auth/callback → vshtabi://auth?...
 *
 * ⚠️ DOMEN BotFather'DA RO'YXATDAN O'TGAN BO'LISHI SHART
 * (`/setdomain`). Aks holda Telegram "Bot domain invalid" deb
 * kirish sahifasini umuman ochmaydi — xato esa brauzerda
 * ko'rinib, ilovada jim qolardi.
 */

import { isNativeApp } from "@/shared/lib/native";

/**
 * BOT'NING RAQAMLI ID'SI — `oauth.telegram.org` SHUNI TALAB QILADI.
 *
 * ⚠️ BU YERGA BOT NOMI YOZILMAYDI (`ViloyatShtabiBot`): Telegram
 * `bot_id` sifatida FAQAT RAQAMNI qabul qiladi va nom yuborilsa
 * `bot_id_invalid` bilan rad etadi — kirish sahifasi umuman
 * ochilmaydi.
 *
 * ⚠️ QAYERDAN OLINADI: bu — bot tokenining `:` BELGISIDAN
 * OLDINGI qismi (`8730327441:AA...` → `8730327441`), ya'ni
 * `getMe` dagi `id` bilan AYNI. Tokenning o'zi esa bu yerga
 * hech qachon yozilmaydi — u faqat serverda.
 */
export const BOT_ID = process.env.NEXT_PUBLIC_BOT_ID?.trim() || "8730327441";

/** Bot nomi — faqat ko'rsatish uchun (kirish manzilida ISHLATILMAYDI). */
export const BOT_USERNAME =
  process.env.NEXT_PUBLIC_BOT_USERNAME?.trim() || "ViloyatShtabiBot";

/**
 * Kirish natijasi qaytadigan HTTPS manzil.
 *
 * ⚠️ SHU DOMEN BotFather `/setdomain` DA RO'YXATDAN O'TADI.
 */
export const AUTH_ORIGIN =
  process.env.NEXT_PUBLIC_AUTH_ORIGIN?.trim() || "https://nazoratchi-ai-api.mysrv.uz";

/** Ilovani uyg'otadigan deep link sxemasi (`AndroidManifest.xml` bilan AYNI). */
export const APP_SCHEME = "vshtabi";

/**
 * KIRISHNI BOSHLAYDI — tizim brauzerida Telegram oauth sahifasi.
 *
 * ⚠️ `window.open` EMAS, `location.href`: Capacitor WebView'da
 * `window.open` yangi WebView oynasini ochardi — ya'ni AYNAN
 * yuqorida aytilgan "ichki WebView" holati va Telegram uni rad
 * etardi. `location.href` esa `AndroidManifest` dagi qoida
 * tufayli tizim brauzeriga chiqadi.
 */
export const startTelegramLogin = (): void => {
  // ⚠️ `bot_id` — RAQAM (yuqoridagi izoh). Nom yuborilsa Telegram
  // `bot_id_invalid` beradi va sahifa ochilmaydi.
  const url =
    `https://oauth.telegram.org/auth?bot_id=${encodeURIComponent(BOT_ID)}` +
    `&origin=${encodeURIComponent(AUTH_ORIGIN)}` +
    `&return_to=${encodeURIComponent(`${AUTH_ORIGIN}/auth/callback`)}`;

  window.location.href = url;
};

/**
 * DEEP LINK'DAN KELGAN MAYDONLARNI O'QIYDI.
 *
 * ⚠️ BARCHA MAYDONLAR UZATILADI, TANLANMAYDI: imzo (`hash`) ular
 * ustidan hisoblangan va bittasi tushib qolsa, server imzoni
 * tasdiqlay olmasdi.
 */
export const parseAuthParams = (search: string): Record<string, string> | null => {
  const raw = search.startsWith("?") || search.startsWith("#") ? search.slice(1) : search;

  /**
   * ⚠️ TELEGRAM IKKI KO'RINISHDA QAYTARADI:
   *
   *   1) `tgAuthResult=<base64 JSON>`  ← odatdagi yo'l
   *   2) `id=…&hash=…`                 ← ba'zi widget versiyalari
   *
   * Birinchisi `callback` sahifasida ochib berilsa ham, deep link
   * boshqa yo'l bilan (masalan, brauzer tarixidan) kelishi mumkin
   * — shuning uchun bu yerda ham qo'llab-quvvatlanadi.
   */
  const marker = "tgAuthResult=";
  const at = raw.indexOf(marker);

  if (at !== -1) {
    try {
      let encoded = raw.slice(at + marker.length);
      const amp = encoded.indexOf("&");
      if (amp !== -1) encoded = encoded.slice(0, amp);

      // ⚠️ `base64url` → `base64`: `-`/`_` bilan kelsa `atob`
      // yiqilardi.
      let b64 = decodeURIComponent(encoded).replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";

      const data = JSON.parse(atob(b64)) as Record<string, unknown>;
      const payload: Record<string, string> = {};

      for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) continue;
        payload[key] = String(value);
      }

      return payload.hash ? payload : null;
    } catch {
      return null;
    }
  }

  const params = new URLSearchParams(raw);
  const payload: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    payload[key] = value;
  }

  // ⚠️ `hash` SHART: usiz bu Telegram javobi emas (masalan, fuqaro
  // shunchaki sahifani ochgan) va serverga bekorga so'rov ketardi.
  if (!payload.hash) return null;

  return payload;
};

/**
 * KUTAYOTGAN KIRISHNI TUGATADI (ilova ochilganda chaqiriladi).
 *
 * ⚠️ MANZIL DARHOL TOZALANADI: imzolangan maydonlar manzil
 * satrida qolsa, ular tarixda saqlanib, keyingi ochilishda
 * MUDDATI O'TGAN imzo bilan qayta urinilardi — fuqaro esa
 * sababsiz "kirib bo'lmadi" xatosini ko'rardi.
 *
 * ⚠️ `replaceState`, `pushState` EMAS: orqaga tugmasi fuqaroni
 * kirish manziliga qaytarmasligi kerak.
 */
/**
 * Deep link manzilidan ma'lumot qismini oladi.
 *
 * ⚠️ `search` VA `hash` IKKALASI HAM QARALADI: Telegram
 * `tgAuthResult` ni FRAGMENTDA qaytaradi va faqat `search`
 * o'qilsa, kirish jimgina ishlamay qolardi.
 */
const urlPayload = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Qaysi biri to'lgan bo'lsa — o'sha.
    return parsed.search.length > 1 ? parsed.search : parsed.hash;
  } catch {
    return "";
  }
};

export type AuthResult =
  | { status: "none" }
  | { status: "ok" }
  | { status: "error"; message: string };

/** Imzolangan maydonlarni tokenga almashtiradi. */
const exchange = async (payload: Record<string, string>): Promise<AuthResult> => {
  const { loginWithTelegramPayload } = await import("@/shared/api/client");
  const result = await loginWithTelegramPayload(payload);
  return result.ok ? { status: "ok" } : { status: "error", message: result.message };
};

export const consumePendingAuth = async (): Promise<AuthResult> => {
  if (typeof window === "undefined") return { status: "none" };

  /**
   * ⚠️ IKKI MANBA TEKSHIRILADI:
   *
   *   1. Joriy manzil — ilova deep link bilan YANGIDAN ochilganda
   *      (Capacitor uni WebView manziliga qo'ymaydi, lekin
   *      brauzerda sinaganда shu yo'l ishlaydi);
   *   2. `@capacitor/app` dagi `getLaunchUrl()` — ilova aynan
   *      shu manzil bilan ishga tushgan bo'lsa.
   *
   * Faqat bittasi tekshirilsa, kirish YO brauzerda, YO ilovada
   * ishlamay qolardi.
   */
  const fromLocation =
    window.location.search.length > 1
      ? window.location.search.slice(1)
      : window.location.hash.slice(1);

  let payload = fromLocation ? parseAuthParams(fromLocation) : null;

  if (payload) {
    // ⚠️ MANZIL DARHOL TOZALANADI: imzolangan maydonlar tarixda
    // qolsa, keyingi ochilishda MUDDATI O'TGAN imzo bilan qayta
    // urinilardi va fuqaro sababsiz xato ko'rardi.
    window.history.replaceState(null, "", window.location.pathname);
    return exchange(payload);
  }

  if (isNativeApp()) {
    try {
      const { App } = await import("@capacitor/app");
      const launch = await App.getLaunchUrl();
      if (launch?.url) {
        payload = parseAuthParams(urlPayload(launch.url));
        if (payload) return exchange(payload);
      }
    } catch {
      // Plugin yo'q yoki manzil yaroqsiz — oddiy kirish yo'li qoladi.
    }
  }

  return { status: "none" };
};

/**
 * ILOVA OCHIQ TURGANDA KELGAN DEEP LINK.
 *
 * ⚠️ `getLaunchUrl()` YETARLI EMAS: u faqat ILOVA ISHGA TUSHGAN
 * manzilni beradi. Fuqaro kirish tugmasini bosganda ilova FONDA
 * qoladi va qaytganda yangi manzil `appUrlOpen` hodisasi bilan
 * keladi — usiz kirish tugallanmay, ekran kirish tugmasida
 * qotib qolardi.
 */
export const listenForAuth = (handler: (result: AuthResult) => void): (() => void) => {
  if (!isNativeApp()) return () => undefined;

  let remove: (() => void) | null = null;
  let cancelled = false;

  void (async () => {
    try {
      const { App } = await import("@capacitor/app");
      const listener = await App.addListener("appUrlOpen", (event) => {
        const payload = parseAuthParams(urlPayload(event.url));
        if (payload) void exchange(payload).then(handler);
      });

      if (cancelled) void listener.remove();
      else remove = () => void listener.remove();
    } catch {
      // Plugin yo'q — jim.
    }
  })();

  return () => {
    cancelled = true;
    remove?.();
  };
};
