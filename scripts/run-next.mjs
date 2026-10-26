/**
 * NEXT'NI `.env` DAGI PORT BILAN ISHGA TUSHIRADI.
 *
 * ── NIMA UCHUN BU WRAPPER KERAK ───────────────────────────────────────
 *
 * ⚠️ `next dev`/`next start` PORTNI `.env.local` DAN O'QIMAYDI. Next env
 * fayllarini ILOVA uchun yuklaydi, lekin dev-server portini CLI ishga
 * tushishida, env-fayl yuklanishidan OLDIN, faqat OS'dagi
 * `process.env.PORT` dan hal qiladi. Natijada `.env.local` ga `PORT`
 * yozilsa ham Next uni ko'rmay, standart 3000 ni olardi.
 *
 * ⚠️ `-p 3100` NI `package.json` GA QOTIRISH — port ikki joyda
 * (`.env` va script) bo'lib qolardi va ular ajralib ketardi. Shu
 * wrapper port uchun YAGONA MANBANI `.env` qiladi: u faylni o'qib,
 * `PORT` ni muhitga qo'yadi va keyin Next uni oladi.
 *
 * ⚠️ YANGI PAKET QO'SHILMAYDI (`dotenv`/`cross-env` yo'q): fayl sodda
 * `KEY=VALUE` tahlili bilan o'qiladi — bizga faqat `PORT` kerak.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MODE = process.argv[2] === "start" ? "start" : "dev";
const DEFAULT_PORT = "3100";

/** `.env.local` ustun, keyin `.env`. Faqat `PORT` o'qiladi. */
const readPort = () => {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(process.cwd(), file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const match = /^\s*PORT\s*=\s*(.+?)\s*$/.exec(line);
        if (match && !line.trimStart().startsWith("#")) {
          // Qo'shtirnoqlarni olib tashlaymiz: PORT="3100" ham to'g'ri.
          return match[1].replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // Fayl yo'q — keyingisiga o'tamiz.
    }
  }
  return undefined;
};

// ⚠️ OS'dagi PORT USTUN: `PORT=4000 npm run dev` ishlashi kerak.
const port = process.env.PORT?.trim() || readPort() || DEFAULT_PORT;

// ⚠️ NEXT'NING JS KIRISHINI TO'G'RIDAN-TO'G'RI `node` BILAN CHAQIRAMIZ:
// `.bin/next.cmd` ni `shell: true` bilan chaqirish Node'da ogohlantirish
// beradi (DEP0190) va Windows'da shell talab qilardi. JS faylni
// `process.execPath` (joriy node) bilan chaqirish ikkala muammoni ham
// yo'q qiladi — shell kerak emas, platformaga bog'liq emas.
const nextEntry = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextEntry, MODE, "-p", port], {
  stdio: "inherit",
  env: { ...process.env, PORT: port },
});

child.on("exit", (code) => process.exit(code ?? 0));
