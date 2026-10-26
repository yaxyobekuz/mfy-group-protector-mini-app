/**
 * MUSTAQIL ILOVA (APK) — QOBIQ.
 *
 * ── ILOVA UCH MUHITDA OCHILADI ────────────────────────────────────────
 *
 *   1) Telegram mini-ilova  → `initData` bor, kirish avtomatik
 *   2) Mustaqil ilova (APK) → `initData` YO'Q, Telegram Login kerak
 *   3) Brauzer (ishlab chiqish) → dev kirish
 *
 * ⚠️ UCHALASI BIR KODDAN ISHLAYDI: ikkita alohida ilova saqlash
 * ekranlar bir-biridan jimgina ajralib ketishiga olib kelardi —
 * tuzatish bittasida qilinib, ikkinchisida unutilardi.
 *
 * ⚠️ `isNativeApp` CAPACITOR BOR-YO'QLIGIDAN ANIQLANADI, `userAgent`
 * dan EMAS: WebView'ning `userAgent` ini ishlab chiqaruvchi
 * o'zgartirishi mumkin va tekshiruv jimgina noto'g'ri javob berardi.
 */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

declare global {
  interface Window {
    Capacitor?: CapacitorGlobal;
  }
}

/** Capacitor qobig'i ichidamizmi (APK/IPA). */
export const isNativeApp = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.Capacitor?.isNativePlatform?.() === true;
};

/** `android` | `ios` | `web`. */
export const nativePlatform = (): string => {
  if (typeof window === "undefined") return "web";
  return window.Capacitor?.getPlatform?.() ?? "web";
};

const TOKEN_KEY = "vsh.mobile.token";

/**
 * TELEGRAM LOGIN NATIJASI UCHUN KUTISH.
 *
 * ⚠️ OQIM: ilova brauzerni ochadi → fuqaro Telegram'da tasdiqlaydi
 * → Telegram bizning `redirect` manzilimizga IMZOLANGAN maydonlar
 * bilan qaytaradi → sahifa `vshtabi://` deep link orqali ilovani
 * uyg'otadi.
 *
 * ⚠️ TOKEN `localStorage` GA YOZILADI, `client.ts` dagi AYNI kalit
 * bilan: ikkinchi saqlash joyi ochilsa, "ilovada chiqdim, lekin
 * baribir kirgan" degan holat chiqardi.
 */
export const saveNativeToken = (token: string): void => {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Jim — `client.ts` ham shunday qiladi.
  }
};
