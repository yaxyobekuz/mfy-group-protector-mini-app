/**
 * YORLIQLAR — YAGONA MANBA (mini-ilova).
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
 *
 * ⚠️ MATNNING O'ZI BU YERDA EMAS, `dictionary.ts` DA — chunki u
 * TO'RT tilda. Bu yerda faqat RANG va kalit qoladi: rang tilga
 * bog'liq emas va uni lug'atga qo'shish har tarjimada ranglarni
 * ham takrorlashga majburlardi.
 */

import type { MessageKey } from "./dictionary";
import type { Translate } from "../lib/i18n";
import type { AppealStatus, Priority } from "../api/types";

interface LabelDef {
  /** Matn kaliti — `t()` orqali o'qiladi. */
  key: MessageKey;
  /** Yorliq (badge) uchun klasslar. */
  className: string;
  /** Nuqta/chiziq uchun toza rang klassi. */
  dot: string;
}

export const APPEAL_STATUS: Record<AppealStatus, LabelDef> = {
  new: {
    key: "status.new",
    className: "bg-accent text-accent-foreground",
    dot: "bg-primary",
  },
  in_progress: {
    key: "status.in_progress",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  resolved: {
    key: "status.resolved",
    className: "bg-success/15 text-success",
    dot: "bg-success",
  },
  rejected: {
    key: "status.rejected",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export const PRIORITY: Record<Priority, MessageKey> = {
  low: "priority.low",
  normal: "priority.normal",
  high: "priority.high",
  urgent: "priority.urgent",
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
  { key: "category", title: "wizard.step.category", hint: "wizard.step.categoryHint" },
  { key: "media", title: "wizard.step.media", hint: "wizard.step.mediaHint" },
  { key: "location", title: "wizard.step.location", hint: "wizard.step.locationHint" },
  { key: "details", title: "wizard.step.details", hint: "wizard.step.detailsHint" },
  { key: "review", title: "wizard.step.review", hint: "wizard.step.reviewHint" },
] as const satisfies readonly {
  key: string;
  title: MessageKey;
  hint: MessageKey;
}[];

export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];

/**
 * JAVOB MUDDATI — SOATDAN O'QILADIGAN MATNGA.
 *
 * ⚠️ "72 soat" EMAS, "3 kun": odam kun bilan o'ylaydi va "72 soat"
 * ni aqlda bo'lishga majbur qilish ma'nosiz ish.
 *
 * ⚠️ MATNNI O'ZI YIG'MAYDI, KALIT QAYTARADI: "3 kun" / "3 дн." /
 * "3 days" — tilga bog'liq va uni shu yerda yozish lug'atdan
 * chetlab o'tish bo'lardi.
 */
export const slaParts = (hours: number): { key: MessageKey; count: number } =>
  hours < 24
    ? { key: "time.hours", count: hours }
    : { key: "time.days", count: Math.round(hours / 24) };

/** Tayyor matn — "3 kun" / "3 дн." / "3 days". */
export const slaLabel = (hours: number, t: Translate): string => {
  const { key, count } = slaParts(hours);
  return t(key, { count });
};
