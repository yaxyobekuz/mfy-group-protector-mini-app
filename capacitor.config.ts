import type { CapacitorConfig } from "@capacitor/cli";

/**
 * CAPACITOR — MUSTAQIL ILOVA (APK) SOZLAMASI.
 *
 * ⚠️ `webDir: "out"` — `BUILD_TARGET=native npm run build` natijasi.
 * Oddiy `next build` (server rejimi) `out/` yaratmaydi va bu yerga
 * eski nusxa qolib ketardi; shuning uchun qurish skripti
 * (`package.json#build:android`) ikkisini birga bajaradi.
 *
 * ⚠️ `appId` — Play Market'dagi YAGONA nom. Bir marta chiqarilgandan
 * keyin O'ZGARTIRIB BO'LMAYDI: o'zgartirilsa, Play uni BOSHQA ilova
 * deb qabul qiladi va mavjud foydalanuvchilar yangilanish olmasdi.
 */
const config: CapacitorConfig = {
  appId: "uz.mysrv.nazoratchi",
  appName: "Viloyat shtabi",
  webDir: "out",

  /**
   * ⚠️ `androidScheme: "https"`: standart `http` da Android
   * WebView `localhost` ni "xavfsiz bo'lmagan manba" deb
   * hisoblaydi va `localStorage` ni CHEKLAYDI — token saqlanmay,
   * fuqaro har ochilishda qaytadan kirishga majbur bo'lardi.
   */
  server: {
    androidScheme: "https",
  },

  android: {
    /**
     * ⚠️ `allowMixedContent: false`: ilova faqat HTTPS backend
     * bilan ishlaydi. `true` qilinsa, tasodifan HTTP manzilga
     * yozilgan so'rov jimgina ketib, ma'lumot ochiq uzatilardi.
     */
    allowMixedContent: false,
  },
};

export default config;
