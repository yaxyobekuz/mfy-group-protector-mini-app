/**
 * MUSTAQIL ILOVA (APK) QURISH.
 *
 * ── NIMA UCHUN SKRIPT ─────────────────────────────────────────────────
 *
 * Qurish uch qadamdan iborat va ularning TARTIBI muhim:
 *
 *   1. `next build` (BUILD_TARGET=native) → `out/`
 *   2. `cap sync android`                 → `out/` ni APK ichiga ko'chiradi
 *   3. `gradlew assembleRelease`          → APK
 *
 * Qo'lda bajarilsa 2-qadam ALBATTA unutiladi va natijada APK ichida
 * ESKI nusxa qolib ketadi — ilova "o'zgarishlar ko'rinmayapti" deb
 * shikoyat qilinadigan holatga tushadi.
 *
 * ⚠️ MANZIL TEKSHIRUVI MAJBURIY: APK ichida Next serveri YO'Q, ya'ni
 * proksi (`/api`) ishlamaydi. Nisbiy manzil bilan qurilgan ilova
 * ochiladi, lekin HAR SO'ROV muvaffaqiyatsiz bo'ladi va sabab faqat
 * "Serverga ulanib bo'lmadi" degan umumiy xabarda ko'rinadi. Shuning
 * uchun skript bunday qurishni BOSHLAMAYDI.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const wantsApk = process.argv.includes("--apk");

// ── .env.native (ixtiyoriy) ──────────────────────────────────────────
// ⚠️ ALOHIDA FAYL: `.env.local` proksi rejimi uchun (`/api`) va uni
// APK uchun o'zgartirish ishlab chiqishni buzardi.
const loadEnvFile = (name) => {
  const path = join(ROOT, name);
  if (!existsSync(path)) return {};

  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
};

const fileEnv = loadEnvFile(".env.native");

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? fileEnv.NEXT_PUBLIC_API_URL ?? "").trim();

if (!/^https:\/\//i.test(apiUrl)) {
  console.error(
    [
      "",
      "  QURISH TO'XTATILDI — API manzili to'liq emas.",
      "",
      `  Hozirgi qiymat: ${apiUrl || "(bo'sh)"}`,
      "",
      "  APK ichida Next serveri yo'q, ya'ni proksi ('/api') ishlamaydi.",
      "  To'liq HTTPS manzil kerak, masalan:",
      "",
      "    NEXT_PUBLIC_API_URL=https://nazoratchi-ai-api.mysrv.uz/api",
      "",
      "  Uni `mobile/.env.native` fayliga yozing yoki muhit o'zgaruvchisi",
      "  sifatida bering.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const childEnv = {
  ...process.env,
  ...fileEnv,
  NEXT_PUBLIC_API_URL: apiUrl,
  BUILD_TARGET: "native",
};

const run = (command, args, label) => {
  console.log(`\n── ${label} ─────────────────────────────────────\n`);
  // ⚠️ `shell: true` WINDOWS UCHUN: `npx`/`gradlew` — `.cmd`
  // fayllari va ular to'g'ridan-to'g'ri `spawn` bilan topilmasdi.
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: childEnv,
    cwd: ROOT,
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`\n  "${label}" muvaffaqiyatsiz tugadi.\n`);
    process.exit(result.status ?? 1);
  }
};

console.log(`\n  API manzili: ${apiUrl}\n`);

run("npx", ["next", "build"], "1/3 — Statik eksport (out/)");
run("npx", ["cap", "sync", "android"], "2/3 — Capacitor sinxronizatsiyasi");

if (!wantsApk) {
  console.log("\n  Tayyor. APK qurish uchun: npm run apk\n");
  process.exit(0);
}

// ── 3-qadam: Gradle ──────────────────────────────────────────────────
// ⚠️ `JAVA_HOME` ANDROID STUDIO'NIKIDAN: tizimda alohida JDK
// bo'lmasligi mumkin va Gradle "JAVA_HOME is not set" bilan
// to'xtardi.
const studioJbr = "C:\\Program Files\\Android\\Android Studio\\jbr";
if (!childEnv.JAVA_HOME && existsSync(studioJbr)) {
  childEnv.JAVA_HOME = studioJbr;
  console.log(`  JAVA_HOME: ${studioJbr}`);
}

/**
 * ⚠️ SDK YO'LI: `ANDROID_HOME` ko'pincha o'rnatilmagan bo'ladi
 * (Android Studio uni faqat o'z ichida biladi) va Gradle
 * "SDK location not found" bilan to'xtardi.
 */
if (!childEnv.ANDROID_HOME && !childEnv.ANDROID_SDK_ROOT) {
  const guess = join(
    process.env.LOCALAPPDATA ?? join(process.env.USERPROFILE ?? "", "AppData", "Local"),
    "Android",
    "Sdk",
  );
  if (existsSync(guess)) {
    childEnv.ANDROID_HOME = guess;
    childEnv.ANDROID_SDK_ROOT = guess;
    console.log(`  ANDROID_HOME: ${guess}`);
  }
}

// ⚠️ TO'LIQ YO'L: `shell: true` bilan ishga tushganda joriy katalog
// `PATH` ga KIRMAYDI va yalang'och `gradlew.bat` topilmasdi.
const gradlew = join(
  ROOT,
  "android",
  process.platform === "win32" ? "gradlew.bat" : "gradlew",
);

const gradle = spawnSync(gradlew, ["assembleDebug"], {
  stdio: "inherit",
  env: childEnv,
  cwd: join(ROOT, "android"),
  shell: true,
});

if (gradle.status !== 0) {
  console.error("\n  APK qurilmadi.\n");
  process.exit(gradle.status ?? 1);
}

const apkPath = join(
  ROOT,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);

console.log(`\n  ✅ APK tayyor:\n\n     ${apkPath}\n`);
