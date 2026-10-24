/**
 * YORLIQLAR — YAGONA MANBA (mobil ilova).
 *
 * ⚠️ YORLIQ KOMPONENT ICHIDA YOZILMAYDI — admin paneldagi bilan
 * AYNI qoida: holat nomi o'nlab joyda ko'rinadi (ro'yxat, filtr,
 * karta, bildirishnoma) va har joyda qo'lda yozilsa, bir ekranda
 * "Hal qilindi", boshqasida "Yopildi" bo'lib qolardi.
 *
 * ⚠️ MATN PANELDAGIDAN FARQ QILADI va bu ataylab. Panelda
 * `in_progress` — "Ko'rib chiqilmoqda" (xodim tili), ilovada
 * "Bajarilmoqda" (fuqaro tili). Bitta lug'at ikkalasiga ham
 * noqulay matn berardi: fuqaroga "ko'rib chiqilmoqda" hech narsa
 * aytmaydi, xodimga esa "bajarilmoqda" ijro bosqichini noto'g'ri
 * ko'rsatardi.
 */

import type { AppealStatus, Priority } from "../api/types";

interface LabelDef {
  label: string;
  /** Yorliq (badge) uchun klasslar. */
  className: string;
  /** Nuqta/chiziq uchun toza rang klassi. */
  dot: string;
}

export const APPEAL_STATUS: Record<AppealStatus, LabelDef> = {
  new: {
    label: "Qabul qilindi",
    className: "bg-accent text-accent-foreground",
    dot: "bg-primary",
  },
  in_progress: {
    label: "Bajarilmoqda",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  resolved: {
    label: "Hal qilindi",
    className: "bg-success/15 text-success",
    dot: "bg-success",
  },
  rejected: {
    label: "Rad etildi",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export const PRIORITY: Record<Priority, string> = {
  low: "Past",
  normal: "O'rta",
  high: "Yuqori",
  urgent: "Shoshilinch",
};

/**
 * QADAMLAR — sehrgar sarlavhalari.
 *
 * ⚠️ RO'YXAT TARTIBI = QADAMLAR TARTIBI va "1/5" sanoqchisi ham
 * shundan chiqadi. Sanoqni qo'lda yozish (`1/5`, `2/5`) qadam
 * qo'shilganda beshta joyni tuzatishni talab qilardi va bittasi
 * albatta "3/5" bo'lib qolardi.
 */
export const WIZARD_STEPS = [
  { key: "category", title: "Muammo turini tanlang", hint: "Eng mos turini tanlang. AI tizim uni avtomatik tasniflaydi." },
  { key: "media", title: "Foto yoki video qo'shing", hint: "Muammoni aniq ko'rsatadigan surat yoki video yuboring." },
  { key: "location", title: "Manzilni belgilang", hint: "Xaritada aniq joyni belgilang yoki manzilni qo'lda kiriting." },
  { key: "details", title: "Batafsil ma'lumot", hint: "Muammoni qisqacha tasvirlang. Bu ijrochilarga tezroq hal qilishga yordam beradi." },
  { key: "review", title: "AI tahlili", hint: "Tizim yuborgan ma'lumotlaringizni tahlil qildi. Agar hammasi to'g'ri bo'lsa, tasdiqlang." },
] as const;

export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];

/** "12 ta murojaat" — paneldagi `plural` bilan ayni. */
export const plural = (count: number, word: string): string => `${count} ta ${word}`;

/**
 * JAVOB MUDDATI — SOATDAN O'QILADIGAN MATNGA.
 *
 * ⚠️ "72 soat" EMAS, "3 kun": odam kun bilan o'ylaydi va "72 soat"
 * ni aqlda bo'lishga majbur qilish ma'nosiz ish.
 */
export const slaLabel = (hours: number): string => {
  if (hours < 24) return `${hours} soat`;

  const days = Math.round(hours / 24);
  return `${days} kun`;
};
