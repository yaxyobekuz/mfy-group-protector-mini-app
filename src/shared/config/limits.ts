/**
 * CHEGARALAR — SERVERDAGI BILAN AYNI BO'LISHI SHART.
 *
 * ⚠️ IKKISI AJRALSA, ilova qabul qilgan matn serverda RAD ETILADI
 * va fuqaro "yuborildi" deb o'ylab qoladi — bu botdagi bilan AYNI
 * xato (`server/src/modules/issues/bot-issues.controller.ts`
 * izohi). Serverdagi manba: `server/src/modules/mobile/dto/
 * mobile.dto.ts`.
 *
 * ⚠️ BU YERDAGI CHEGARA — QULAYLIK (sanoqchi, tugmani o'chirish),
 * HIMOYA EMAS. Haqiqiy tekshiruv serverda: ilovadagi raqamni
 * brauzer konsolidan o'zgartirish bir qatorlik ish.
 */

/** Murojaat matni. */
export const BODY_MIN = 10;

/**
 * ⚠️ EKRANDAGI SANOQCHI 500 KO'RSATADI (mockup), lekin server 2000
 * gacha qabul qiladi. Farq ataylab: sanoqchi "qisqa yozing" degan
 * MASLAHAT, server esa uzun yozganni rad etib, matnini yo'qotmaydi.
 */
export const BODY_SOFT_MAX = 500;
export const BODY_MAX = 2000;

/**
 * FAYLLAR SONI.
 *
 * ⚠️ HAQIQIY CHEGARA SOZLAMADA (`Settings.mobileMaxAttachments`) va
 * u serverdan keladi. Bu yerdagi qiymat — ilova birinchi
 * so'rovgacha ko'rsatadigan zahira.
 */
export const MAX_ATTACHMENTS = 5;

/** Manzil matni. */
export const ADDRESS_MAX = 300;

/**
 * XARITA BOSHLANG'ICH NUQTASI — Andijon shahri markazi.
 *
 * ⚠️ `0,0` DAN BOSHLANMAYDI: geolokatsiya rad etilganda xarita
 * Atlantika okeanining o'rtasida ochilib, fuqaro "xarita buzilgan"
 * deb o'ylardi.
 */
export const DEFAULT_CENTER: [number, number] = [40.7821, 72.3442];
export const DEFAULT_ZOOM = 13;
