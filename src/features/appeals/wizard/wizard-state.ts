"use client";

/**
 * SEHRGAR HOLATI VA QORALAMASI.
 *
 * ── NIMA UCHUN QORALAMA SAQLANADI ─────────────────────────────────────
 *
 * ⚠️ TELEGRAM MINI-ILOVANI ISTALGAN PAYTDA YOPADI: kelgan
 * qo'ng'iroq, boshqa chatga o'tish, pastga tortish. Besh qadamli
 * oqimni to'ldirayotgan fuqaro buning har birida hamma narsani
 * boshidan yozishga majbur bo'lardi — va ikkinchi marta yozmasdi.
 *
 * ⚠️ SURATLAR HAM SAQLANADI, lekin BRAUZERDAGI `blob:` manzil
 * EMAS — u ilova yopilishi bilan yaroqsiz bo'ladi. Saqlanadigan
 * narsa: serverning imzolangan havolasi (`token`) va serverdagi
 * manzil. Imzo 6 soat yaroqli (`server/.../signed-ref.ts`), ya'ni
 * qoralama ham shuncha vaqt ma'noli.
 *
 * ⚠️ QORALAMA MUDDATI BOR: bir hafta avvalgi yarim yozilgan
 * murojaat ochilishi "bu nima?" degan savolni tug'dirardi va
 * undagi fayl havolalari allaqachon eskirgan bo'lardi.
 */

import type { AnalysisResponse } from "@/shared/api/types";

export interface WizardFile {
  /** Ro'yxat kaliti — serverga yuborilmaydi. */
  id: string;
  /** Serverning imzolangan havolasi. */
  token: string;
  kind: "photo" | "video";
  /** Serverdagi to'liq manzil. */
  url: string;
}

export interface WizardState {
  categoryId: string | null;
  files: WizardFile[];
  lat: number | null;
  lng: number | null;
  address: string;
  districtId: string | null;
  mahallaId: string | null;
  body: string;
  isHazard: boolean;
  isLongStanding: boolean;
  isRepeatAppeal: boolean;
  /** `<input type="datetime-local">` qiymati. */
  occurredAt: string;
  analysis: AnalysisResponse | null;
}

export const EMPTY_STATE: WizardState = {
  categoryId: null,
  files: [],
  lat: null,
  lng: null,
  address: "",
  districtId: null,
  mahallaId: null,
  body: "",
  isHazard: false,
  isLongStanding: false,
  isRepeatAppeal: false,
  occurredAt: "",
  analysis: null,
};

const DRAFT_KEY = "vsh.mobile.draft";

/** ⚠️ QORALAMA MUDDATI — yuqoridagi izoh. */
const DRAFT_TTL_MS = 6 * 60 * 60 * 1000;

interface StoredDraft {
  savedAt: number;
  state: WizardState;
}

/**
 * ⚠️ `try/catch` MAJBURIY: Telegram'ning ba'zi mijozlarida
 * mini-ilova uchinchi tomon ma'lumoti o'chirilgan kontekstda
 * ochiladi va `localStorage` ga murojaat XATO OTADI. Qoralama —
 * qulaylik, uning yo'qligi ilovani to'xtatmasligi kerak.
 */
export const loadDraft = (): WizardState | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredDraft;

    if (!parsed?.state || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }

    // ⚠️ MAYDONLAR BO'SH HOLAT USTIGA YOZILADI: eski qoralamada
    // yangi maydon bo'lmasligi mumkin (ilova yangilangan) va
    // `undefined` qiymat komponentni "boshqarilmaydigan"
    // (uncontrolled) holatga o'tkazib, React ogohlantirishi bilan
    // kiritish maydonini buzardi.
    return { ...EMPTY_STATE, ...parsed.state };
  } catch {
    return null;
  }
};

export const saveDraft = (state: WizardState): void => {
  if (typeof window === "undefined") return;

  try {
    const payload: StoredDraft = { savedAt: Date.now(), state };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Jim — qoralama qulaylik.
  }
};

export const clearDraft = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Jim.
  }
};

/** Qoralamada ko'rsatishga arziydigan narsa bormi. */
export const hasContent = (state: WizardState): boolean =>
  Boolean(
    state.categoryId ||
      state.files.length > 0 ||
      state.body.trim() ||
      state.address.trim() ||
      state.lat !== null,
  );
