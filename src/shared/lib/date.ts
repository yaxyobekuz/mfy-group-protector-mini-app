/**
 * SANA FORMATI — YAGONA MANBA (mobil ilova).
 *
 * ⚠️ BU FAYLDAN BOSHQA JOYDA SANA MATNI YIG'ILMAYDI. Serverdagi
 * `common/date.util.ts` va paneldagi `shared/lib/date.ts` ning
 * KO'ZGUSI: bitta murojaat panelda "21-may, 2025 14:30", ilovada
 * esa "21.05.2025" bo'lib ko'rinsa, fuqaro bilan xodim bir xil
 * yozuv haqida gaplashayotganiga ishonch qolmasdi.
 *
 * ⚠️ UCHALASI QO'LDA SINXRON. Umumiy paket chiqarish (`@vsh/date`)
 * uchta mustaqil repo (`server`, `admin`, `mobile`) o'rtasida
 * versiya boshqaruvini talab qilardi — bu loyiha hajmi uchun
 * ortiqcha.
 *
 *   kun         →  21-may, 2025
 *   kun + vaqt  →  21-may, 2025 14:30
 *   oy          →  Yanvar, 2026
 *   vaqt        →  14:30
 *
 * ── TO'RT TIL ─────────────────────────────────────────────────────────
 *
 * ⚠️ TUZILMA O'ZGARMAYDI, FAQAT OY NOMI ALMASHADI: "21-may, 2025"
 * tartibi (kun → oy → yil) to'rtala tilda ham saqlanadi. Sabab —
 * bu format server va panel bilan KO'ZGU bo'lishi kerak; tilga
 * qarab tartibni o'zgartirish ("May 21, 2025") bitta murojaatni
 * ikki joyda boshqacha ko'rsatardi.
 *
 * ⚠️ `Intl` BARIBIR ISHLATILMAYDI: til endi ilovaning O'Z
 * tanlovi va muhit sozlamasiga bog'liq emas — pastdagi taqiq
 * kuchida qoladi.
 *
 * ── TAQIQLANGAN ───────────────────────────────────────────────────────
 *
 * ⚠️ `toLocaleDateString()`, `toLocaleString()`, `Intl.DateTimeFormat`
 * va qo'lda yig'ilgan `${day}.${month}.${year}` ISHLATILMAYDI.
 * Natija kod YOZILGAN joyga emas, kod ISHLAYOTGAN muhitga bog'liq:
 * brauzer tili sozlamasi, OS locale'i. Shu sababli bitta jadvalda
 * bir ustun "21-may, 2025", ikkinchisi "21.05.2025" bo'lib qolardi.
 *
 * ── ISTISNO — ISO QIYMAT FORMAT EMAS ──────────────────────────────────
 *
 * `toISOString().slice(0, 10)` RUXSAT ETILGAN, lekin faqat
 * `<input type="date">` qiymati, so'rov parametri va `queryKey`
 * uchun. Ekranga chiqmaydi — shu uchun `toInputDate` alohida nomda.
 */

import { translate } from "@/shared/config/dictionary";
import { DEFAULT_LOCALE, type Locale } from "@/shared/config/locales";

const MONTHS: Record<Locale, readonly string[]> = {
  uz: [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    // ⚠️ IMLO QAT'IY: "sentabr"/"oktabr" — "sentyabr"/"oktyabr" EMAS.
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ],
  uzc: [
    "январ",
    "феврал",
    "март",
    "апрел",
    "май",
    "июн",
    "июл",
    "август",
    "сентабр",
    "октабр",
    "ноябр",
    "декабр",
  ],
  /**
   * ⚠️ RUSCHA OYLAR — QARATQICH KELISHIGIDA ("21 мая", "21 май"
   * emas): rus tilida sana aynan shu shaklda o'qiladi va bosh
   * kelishikdagi ro'yxat ("май") sanada xato ko'rinardi.
   */
  ru: [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/**
 * OY NOMI — BOSH HARF BILAN ("Yanvar, 2026").
 *
 * ⚠️ RUS TILIDA BOSHQA RO'YXAT: sanadagi "января" qaratqichda,
 * yolg'iz oy nomi esa bosh kelishikda bo'lishi kerak ("Январь,
 * 2026"). Birinchi harfni katta qilish bilan "Января, 2026"
 * chiqib, xato bo'lardi.
 */
const MONTHS_ALONE: Record<Locale, readonly string[]> = {
  uz: MONTHS.uz,
  uzc: MONTHS.uzc,
  ru: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
  en: MONTHS.en,
};

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** Bo'sh yoki yaroqsiz qiymat — `Invalid Date` yoki bo'sh satr EMAS. */
const EMPTY = "—";

/** Toshkent (+5), DST yo'q. */
const TASHKENT_OFFSET_MINUTES = 5 * 60;

type DateInput = Date | string | number | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * TOSHKENT DEVOR-SOATI.
 *
 * ⚠️ `getHours()` ISHLATILMAYDI: u BRAUZERNING zonasini beradi.
 * Xodim boshqa zonada bo'lsa (yoki noutbukining zonasi xato
 * qo'yilgan bo'lsa), "soat 14:30 da kelgan murojaat" boshqa vaqt
 * ko'rsatardi. Tizim esa Asia/Tashkent bo'yicha ishlaydi va
 * hisobot ham shunga qarab quriladi — ya'ni ko'rinish ham shunday
 * bo'lishi kerak.
 */
const toTashkent = (date: Date): Date =>
  new Date(date.getTime() + TASHKENT_OFFSET_MINUTES * 60_000);

const pad = (value: number): string => String(value).padStart(2, "0");

/**
 * "21-may, 2025" / "21 мая, 2025" / "21 May, 2025"
 *
 * ⚠️ DEFIS FAQAT O'ZBEK TILIDA: "21-may" o'zbekcha yozuv qoidasi,
 * rus va ingliz tilida esa "21-мая" xato ko'rinardi.
 */
export const formatDateUz = (
  value: DateInput,
  locale: Locale = DEFAULT_LOCALE,
): string => {
  const date = toDate(value);
  if (!date) return EMPTY;

  const tz = toTashkent(date);
  const month = MONTHS[locale][tz.getUTCMonth()]!;
  const separator = locale === "uz" || locale === "uzc" ? "-" : " ";

  // ⚠️ Kun raqami NOLDAN BOSHLANMAYDI: "3-yanvar", "03-yanvar" emas.
  return `${tz.getUTCDate()}${separator}${month}, ${tz.getUTCFullYear()}`;
};

/** "14:30" */
export const formatTimeUz = (value: DateInput): string => {
  const date = toDate(value);
  if (!date) return EMPTY;

  const tz = toTashkent(date);
  return `${pad(tz.getUTCHours())}:${pad(tz.getUTCMinutes())}`;
};

/** "21-may, 2025 14:30" */
export const formatDateTimeUz = (
  value: DateInput,
  locale: Locale = DEFAULT_LOCALE,
): string => {
  const date = toDate(value);
  if (!date) return EMPTY;

  return `${formatDateUz(date, locale)} ${formatTimeUz(date)}`;
};

/** "Yanvar, 2026" */
export const formatMonthUz = (
  value: DateInput,
  locale: Locale = DEFAULT_LOCALE,
): string => {
  const date = toDate(value);
  if (!date) return EMPTY;

  const tz = toTashkent(date);
  return `${capitalize(MONTHS_ALONE[locale][tz.getUTCMonth()]!)}, ${tz.getUTCFullYear()}`;
};

/**
 * NISBIY VAQT — "5 daqiqa oldin".
 *
 * ⚠️ FAQAT YAQIN O'TMISH UCHUN. Bir kundan oshsa to'liq sanaga
 * o'tadi: "23 kun oldin" degan yorliq odamga hech narsa bermaydi va
 * u baribir aniq sanani izlardi.
 *
 * ⚠️ `Intl.RelativeTimeFormat` ISHLATILMAYDI — u ham locale'ga
 * bog'liq va o'zbek tilida ba'zi muhitlarda ingliz tilida chiqardi.
 */
export const formatRelativeUz = (
  value: DateInput,
  locale: Locale = DEFAULT_LOCALE,
): string => {
  const date = toDate(value);
  if (!date) return EMPTY;

  const diffMs = Date.now() - date.getTime();

  // Kelajakdagi sana (muddat) — nisbiy ko'rsatilmaydi.
  if (diffMs < 0) return formatDateTimeUz(date, locale);

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return translate(locale, "time.now");
  if (minutes < 60) return translate(locale, "time.minutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return translate(locale, "time.hoursAgo", { count: hours });

  return formatDateTimeUz(date, locale);
};

/**
 * `<input type="date">` QIYMATI ("2025-05-21").
 *
 * ⚠️ FORMAT EMAS, ISO QIYMAT — ekranga chiqmaydi. Nomi shuning
 * uchun `format*` emas: ikkisini chalkashtirmaslik kerak.
 *
 * ⚠️ TOSHKENT KUNI bo'yicha: `toISOString()` ni to'g'ridan-to'g'ri
 * olsa, mahalliy 01:00 dagi sana KECHAGI kunga tushib qolardi.
 */
export const toInputDate = (value: DateInput): string => {
  const date = toDate(value);
  if (!date) return "";

  return toTashkent(date).toISOString().slice(0, 10);
};

/** Bugundan N kun oldingi Toshkent kuni — hisobot filtri uchun. */
export const daysAgoInput = (days: number): string => {
  const date = new Date(Date.now() - days * 86_400_000);
  return toInputDate(date);
};
