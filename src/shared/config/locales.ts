/**
 * TILLAR — YAGONA MANBA.
 *
 * ⚠️ TIL KODI `Citizen` DA EMAS, QURILMADA SAQLANADI
 * (`localStorage`): til — INTERFEYS sozlamasi, fuqaro ma'lumoti
 * emas. Serverga qo'shilsa, har o'zgartirish `PATCH /mobile/me`
 * so'rovini kutishga majburlardi va tarmoqsiz holatda til umuman
 * almashmasdi.
 *
 * ⚠️ RO'YXAT TARTIBI = TANLASH OYNASIDAGI TARTIB. O'zbekcha
 * (lotin) birinchi — ilovaning asosiy auditoriyasi.
 *
 * ⚠️ `nativeName` O'Z TILIDA YOZILADI ("Русский", "English"), ingliz
 * tilidagi nomi EMAS: til tanlash ro'yxatini odam o'zi
 * TUSHUNMAYDIGAN tilda o'qishga majbur bo'lmasligi kerak — aynan
 * shu ro'yxat unga kerakli tilni topish uchun kerak.
 */

export const LOCALES = ["uz", "uzc", "ru", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "uz";

interface LocaleDef {
  /** O'z tilidagi nomi — tanlash ro'yxatida shu ko'rinadi. */
  nativeName: string;
  /** Bayroq o'rniga yozuv belgisi — bayroq TILNI emas, DAVLATNI bildiradi. */
  short: string;
  /** `<html lang>` uchun. */
  htmlLang: string;
}

/**
 * ⚠️ BAYROQ EMOJISI ISHLATILMAYDI: bayroq davlatni bildiradi,
 * tilni emas — o'zbek kirill va o'zbek lotin uchun bitta bayroq
 * chiqib, ikkisi ajralmasdi. Shuning uchun qisqa YOZUV belgisi.
 */
export const LOCALE_DEFS: Record<Locale, LocaleDef> = {
  uz: { nativeName: "O'zbekcha", short: "UZ", htmlLang: "uz" },
  uzc: { nativeName: "Ўзбекча", short: "ЎЗ", htmlLang: "uz-Cyrl" },
  ru: { nativeName: "Русский", short: "RU", htmlLang: "ru" },
  en: { nativeName: "English", short: "EN", htmlLang: "en" },
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/**
 * TELEGRAM TILIDAN TAXMIN.
 *
 * ⚠️ FAQAT BIRINCHI OCHISHDA: foydalanuvchi tilni QO'LDA tanlagan
 * bo'lsa, Telegram sozlamasi uni bosib ketmasligi kerak.
 *
 * ⚠️ KIRILL AVTOMATIK TANLANMAYDI: Telegram `uz` kodini beradi va
 * yozuvni ajratmaydi. Shuning uchun lotin — zahira qiymat, kirill
 * esa faqat qo'lda tanlanadi.
 */
export const guessLocale = (languageCode?: string | null): Locale => {
  if (!languageCode) return DEFAULT_LOCALE;

  const code = languageCode.toLowerCase().slice(0, 2);
  if (code === "ru") return "ru";
  if (code === "en") return "en";
  return DEFAULT_LOCALE;
};
