/**
 * API MIJOZI — serverga barcha so'rovlar shu yerdan o'tadi.
 *
 * ── PANELDAGI MIJOZDAN NIMASI BILAN FARQ QILADI ───────────────────────
 *
 * ⚠️ REFRESH OQIMI YO'Q. Panelda 401 olinganda token yangilanadi va
 * so'rov qayta yuboriladi. Bu yerda esa token UZOQ MUDDATLI (30
 * kun) va u eskirgan bo'lsa, ilova Telegram'dan YANGI `initData`
 * olib, qaytadan kiradi — refresh token, uning rotatsiyasi va
 * "qayta ishlatilgan token" tekshiruvi butunlay KERAK EMAS.
 *
 * ⚠️ 401 OLGANDA QAYTA KIRILADI, LOGIN EKRANIGA YO'NALTIRILMAYDI:
 * mini-ilovada "login ekrani" degan tushuncha yo'q — foydalanuvchi
 * allaqachon Telegram'da autentifikatsiyadan o'tgan va unga
 * "qaytadan kiring" deyish ma'nosiz bo'lardi.
 *
 * ⚠️ PARALLEL 401'LAR BITTA KIRISHNI KUTADI (`loginPromise`) —
 * paneldagi bilan AYNI sabab: bosh sahifa 4 ta so'rovni birga
 * yuboradi va ularning har biri alohida kirish so'rovi yuborardi.
 */

import { getInitData, isInsideTelegram } from "../lib/telegram";

/**
 * API MANZILI.
 *
 * ⚠️ IKKI SHAKLNI HAM QABUL QILADI:
 *
 *   `/api`                        — PROKSI orqali (bir xil manzil)
 *   `https://host/api`            — to'g'ridan-to'g'ri
 *
 * Birinchisi Telegram mini-ilova uchun standart
 * (`next.config.ts#rewrites` izohi): bitta HTTPS manzil, CORS yo'q.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** Nisbiy manzilmi (proksi rejimi). */
const isRelative = !/^https?:\/\//i.test(API_URL);

/**
 * FAYL MANZILLARI UCHUN ILDIZ.
 *
 * ⚠️ `/api` OLIB TASHLANADI: yuklangan fayllar `api` prefiksidan
 * TASHQARIDA turadi (`server/src/main.ts`) va server `/uploads/...`
 * ko'rinishidagi NISBIY manzil qaytaradi.
 *
 * ⚠️ PROKSI REJIMIDA BO'SH SATR: `/uploads/...` ning o'zi
 * to'g'ri manzil va unga hech narsa qo'shilmaydi.
 */
export const FILE_ORIGIN = isRelative ? "" : API_URL.replace(/\/api\/?$/, "");

/** Serverdan kelgan nisbiy manzilni to'liq manzilga aylantiradi. */
export const fileUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILE_ORIGIN}${path}`;
};

const TOKEN_KEY = "vsh.mobile.token";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ═══════════════════════════════════════════════════════════════════
//  TOKEN
// ═══════════════════════════════════════════════════════════════════

/**
 * ⚠️ `typeof window` TEKSHIRILADI: bu modul Next'da SERVER tomonida
 * ham yuklanishi mumkin (import zanjiri orqali) va u yerda
 * `localStorage` YO'Q — `ReferenceError` bilan butun sahifa
 * yiqilardi.
 *
 * ⚠️ `try/catch` HAM KERAK: Telegram'ning ba'zi mijozlarida
 * mini-ilova uchinchi tomon cookie'lari o'chirilgan kontekstda
 * ochiladi va `localStorage` ga murojaat XATO OTADI (ruxsat yo'q).
 * Xotirada saqlash zahira sifatida qoladi.
 */
let memoryToken: string | null = null;

export const tokens = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    if (typeof window === "undefined") return null;

    try {
      memoryToken = localStorage.getItem(TOKEN_KEY);
    } catch {
      memoryToken = null;
    }
    return memoryToken;
  },

  save(token: string): void {
    memoryToken = token;
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Xotiradagi nusxa yetarli — sessiya davomida ishlaydi.
    }
  },

  clear(): void {
    memoryToken = null;
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Jim.
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
//  KIRISH
// ═══════════════════════════════════════════════════════════════════

let loginPromise: Promise<boolean> | null = null;

/**
 * ⚠️ ISHLAB CHIQISHDAGI ZAXIRA: brauzerda `initData` yo'q va
 * serverdagi `/auth/dev` ishlaydi (faqat `NODE_ENV!=production`
 * da — server uni O'ZI rad etadi). Bu yerda ham tekshiruv bor,
 * ya'ni ishlab chiqarish qurilmasida bu yo'l umuman chaqirilmaydi.
 */
const DEV_TELEGRAM_ID = "900000001";

const doLogin = async (): Promise<boolean> => {
  try {
    const inside = isInsideTelegram();

    const response = inside
      ? await fetch(`${API_URL}/mobile/auth/telegram`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: getInitData() }),
        })
      : process.env.NODE_ENV === "production"
        ? null
        : await fetch(`${API_URL}/mobile/auth/dev`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              telegramId: DEV_TELEGRAM_ID,
              firstName: "Sinov",
            }),
          });

    if (!response?.ok) return false;

    const data = (await response.json()) as { token: string };
    tokens.save(data.token);
    return true;
  } catch {
    return false;
  }
};

export const loginOnce = (): Promise<boolean> => {
  // ⚠️ BITTA KIRISH — fayl boshidagi izoh.
  loginPromise ??= doLogin().finally(() => {
    loginPromise = null;
  });

  return loginPromise;
};

// ═══════════════════════════════════════════════════════════════════
//  SO'ROV
// ═══════════════════════════════════════════════════════════════════

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Tokensiz so'rov (kirish). */
  skipAuth?: boolean;
  /** `FormData` — `Content-Type` ni BRAUZER qo'yadi. */
  form?: FormData;
}

/**
 * ⚠️ `undefined`, `null` VA BO'SH SATR TASHLANADI — paneldagi bilan
 * AYNI sabab: `?status=undefined` ketib, server `@IsEnum` da
 * yiqilardi.
 */
const buildUrl = (path: string, params?: RequestOptions["params"]): string => {
  /**
   * ⚠️ `new URL(...)` NISBIY MANZILDA ILDIZ TALAB QILADI va usiz
   * `TypeError: Invalid URL` bilan yiqilardi — proksi rejimida
   * (`/api`) bu HAR so'rovda sodir bo'lardi.
   *
   * ⚠️ ILDIZ `window.location.origin` DAN: bu kod faqat brauzerda
   * ishlaydi (barcha sahifalar `"use client"`), lekin Next uni
   * server renderida ham YUKLAYDI — shuning uchun zahira qiymat
   * bor. U hech qachon so'rov yuborish uchun ishlatilmaydi.
   */
  const base = isRelative
    ? typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost"
    : undefined;

  const url = new URL(`${API_URL}${path}`, base);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
};

async function send<T>(
  path: string,
  options: RequestOptions,
  retried: boolean,
): Promise<T> {
  const headers: Record<string, string> = {};

  // ⚠️ `FormData` DA `Content-Type` QO'LDA QO'YILMAYDI: brauzer unga
  // `boundary` qo'shadi va qo'lda yozilgan sarlavha uni buzib,
  // server faylni umuman ko'rmasdi.
  if (!options.form) headers["Content-Type"] = "application/json";

  if (!options.skipAuth) {
    const token = tokens.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, options.params), {
    method: options.method ?? "GET",
    headers,
    body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
  });

  // ── 401: QAYTA KIRIB, BIR MARTA QAYTA URINISH ───────────────────
  if (response.status === 401 && !options.skipAuth && !retried) {
    const ok = await loginOnce();
    if (ok) return send<T>(path, options, true);

    tokens.clear();
    throw new ApiError(401, "Kirish amalga oshmadi — ilovani qayta oching");
  }

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const error = payload as
      | { message?: string; errors?: Record<string, string[]> }
      | null;

    // ⚠️ SERVER MATNI ISHLATILADI: u o'zbek tilida va fuqaroga
    // mo'ljallangan ("Bir kunda 10 tadan ko'p murojaat yuborib
    // bo'lmaydi"). Ilovada qayta tarjima qilish matnni ikki joyda
    // saqlashga olib kelardi.
    throw new ApiError(
      response.status,
      error?.message ?? `Xatolik (${response.status})`,
      error?.errors,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]): Promise<T> =>
    send<T>(path, { method: "GET", params }, false),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    send<T>(path, { method: "POST", body }, false),

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    send<T>(path, { method: "PATCH", body }, false),

  upload: <T>(path: string, form: FormData): Promise<T> =>
    send<T>(path, { method: "POST", form }, false),
};
