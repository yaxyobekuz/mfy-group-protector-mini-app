import type { NextConfig } from "next";

/**
 * SERVER MANZILI — PROKSI UCHUN.
 *
 * ⚠️ `NEXT_PUBLIC_` PREFIKSI YO'Q va bu ataylab: bu qiymat FAQAT
 * Next serverida o'qiladi va mijoz bundle'iga tushmasligi kerak.
 * Ichki manzil (`http://api.internal:4000`) brauzerga chiqib
 * ketsa, u yerdan foydasi yo'q, lekin ichki tarmoq tuzilishi
 * oshkor bo'lardi.
 */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET?.trim();

/**
 * ⚠️ BUILD XATOLARI JIM O'TKAZILMAYDI — admin paneldagi bilan AYNI
 * qoida: tur xatosi bilan chiqarilgan ilova ishlab chiqarishda
 * ishlamay qoladi va buni faqat foydalanuvchi aytadi.
 */
/**
 * TUNNEL MANZILI — ISHLAB CHIQISHDA TELEGRAM BILAN SINASH UCHUN.
 *
 * ⚠️ BUSIZ TUNNEL ORQALI OCHILGAN ILOVA JIM ISHLAMAYDI va buni
 * topish qiyin: sahifa YUKLANADI, HTML ko'rinadi, lekin React
 * HIDRATATSIYA BO'LMAYDI — ya'ni ekranda "Ilova ochilmoqda…"
 * abadiy turib qoladi, konsolda esa faqat HMR websocket xatosi
 * ko'rinadi.
 *
 * Sabab: Next ishlab chiqish rejimida o'z xizmat manzillarini
 * (`__nextjs_*`, HMR) BOSHQA domendan kelgan so'rovga 403 bilan
 * rad etadi. Tunnel domeni esa, ta'rifiga ko'ra, boshqa domen.
 *
 * ⚠️ ISHLAB CHIQARISHGA TEGISHLI EMAS: `next build` + `next start`
 * da bu tekshiruv umuman yo'q. Shuning uchun Telegram bilan
 * jiddiy sinov HAR DOIM qurilgan ilovada o'tkaziladi.
 */
const DEV_ORIGINS = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((item) => item.trim().replace(/^https?:\/\//, ""))
  .filter(Boolean);

/**
 * MUSTAQIL ILOVA (APK/Capacitor) UCHUN STATIK EKSPORT.
 *
 * ⚠️ `BUILD_TARGET=native` BO'LGANDA ILOVA STATIK FAYLLARGA
 * CHIQARILADI (`out/`), chunki APK ichida Node serveri YO'Q —
 * sahifalar qurilmaning o'zida `file://` orqali ochiladi.
 *
 * ⚠️ PROKSI BU REJIMDA ISHLAMAYDI va shuning uchun
 * `NEXT_PUBLIC_API_URL` TO'LIQ manzil bo'lishi SHART
 * (`https://.../api`). Nisbiy `/api` qoldirilsa, so'rov
 * qurilmaning o'ziga ketib, hech qachon serverga yetib
 * bormasdi — xato esa faqat "Serverga ulanib bo'lmadi" degan
 * umumiy xabarda ko'rinardi.
 *
 * ⚠️ `images.unoptimized`: Next rasm optimizatsiyasi SERVER
 * talab qiladi va statik eksportda qurish shu sababdan
 * yiqilardi.
 */
const IS_NATIVE = process.env.BUILD_TARGET === "native";

const config: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },

  ...(IS_NATIVE
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        // ⚠️ `file://` DA KATALOG MANZILI ISHLAMAYDI: `/news`
        // o'rniga `/news.html` kerak bo'lardi. `trailingSlash`
        // bilan Next har sahifani `news/index.html` qilib
        // chiqaradi va WebView uni to'g'ri topadi.
        trailingSlash: true,
      }
    : {}),

  ...(DEV_ORIGINS.length > 0 ? { allowedDevOrigins: DEV_ORIGINS } : {}),

  /**
   * API PROKSISI — BITTA HTTPS MANZIL.
   *
   * ── MUAMMO ───────────────────────────────────────────────────
   *
   * Telegram mini-ilovani FAQAT HTTPS'dan ochadi. Ilova esa
   * serverga so'rov yuboradi va brauzer HTTPS sahifadan HTTP
   * manzilga so'rovni BLOKLAYDI (mixed content) — xato esa faqat
   * konsolda ko'rinib, ekranda "yuklanmoqda" bo'lib qotib
   * qolardi.
   *
   * Ya'ni ikkala xizmat ham HTTPS bo'lishi kerak: ikkita
   * sertifikat, ikkita tunnel, CORS ro'yxati va har qayta
   * ishga tushirishda ikkita manzilni yangilash.
   *
   * ── YECHIM ───────────────────────────────────────────────────
   *
   * `API_PROXY_TARGET` berilsa, ilova so'rovni O'ZIGA yuboradi
   * (`/api/...`) va Next uni serverga uzatadi. Natijada:
   *
   *   — BITTA manzil HTTPS bo'lsa yetarli;
   *   — CORS UMUMAN kerak emas (so'rov bir xil manzildan);
   *   — server manzili mijoz bundle'iga tushmaydi.
   *
   * ⚠️ `/uploads` HAM UZATILADI: yuklangan fayllar `api`
   * prefiksidan TASHQARIDA turadi (`server/src/main.ts`) va
   * usiz murojaat suratlari HTTPS sahifada ochilmasdi.
   *
   * ⚠️ PROKSI MAJBURIY EMAS: `API_PROXY_TARGET` berilmasa, ilova
   * eskicha `NEXT_PUBLIC_API_URL` bo'yicha to'g'ridan-to'g'ri
   * murojaat qiladi (admin panel bilan ayni usul).
   */
  async rewrites() {
    if (!API_PROXY_TARGET) return [];

    return [
      { source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_PROXY_TARGET}/uploads/:path*` },
    ];
  },

  /**
   * ⚠️ `X-Frame-Options` QO'YILMAYDI VA BU ATAYLAB. Telegram
   * mini-ilovani IFRAME ichida ochadi (desktop mijoz) va bu sarlavha
   * qo'yilsa, ilova u yerda bo'm-bo'sh oynada ochilardi — xato esa
   * faqat brauzer konsolida ko'rinib, server logida jim qolardi.
   *
   * Next standart holda uni qo'ymaydi; bu izoh "xavfsizlik uchun
   * qo'shaylik" degan keyingi taklifga javob.
   */
};

export default config;
