"use client";

/**
 * BOSH SAHIFA.
 *
 * ⚠️ BITTA ASOSIY AMAL: "Murojaat yuborish". Qolgan hamma narsa —
 * ikkinchi darajali va u pastda. Ekranni teng og'irlikdagi to'rtta
 * tugma bilan to'ldirish foydalanuvchini "qaysi birini bosay" degan
 * holatga qo'yardi va ilovaning maqsadi ko'rinmay qolardi.
 *
 * ⚠️ RAQAMLAR KO'RSATILADI ("1 248 ta hal qilindi"): ilovaga
 * ishonch shundan quriladi. "Yuboring, ko'rib chiqamiz" degan
 * va'da hech narsa isbotlamaydi.
 */

import {
  ArrowRight,
  FileText,
  Map,
  Plus,
  ScrollText,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSession } from "@/entities/session/session-provider";
import { useHomeStats } from "@/features/appeals/api";
import { BottomNav } from "@/widgets/bottom-nav/bottom-nav";
import { cn } from "@/shared/lib/cn";
import { haptic } from "@/shared/lib/telegram";

interface TileProps {
  href: string;
  label: string;
  hint: string;
  icon: typeof Map;
  tone: string;
}

const TILES: TileProps[] = [
  {
    href: "/map",
    label: "Xarita",
    hint: "Murojaatlar xaritasi",
    icon: Map,
    tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/appeals",
    label: "Mening murojaatlarim",
    hint: "Holatini kuzating",
    icon: FileText,
    tone: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/news",
    label: "Yangiliklar",
    hint: "Va natijalar",
    icon: ScrollText,
    tone: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  },
  {
    href: "/rating",
    label: "Reyting",
    hint: "Faol fuqarolar",
    icon: Trophy,
    tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  },
];

const Tile = ({ href, label, hint, icon: Icon, tone }: TileProps) => (
  <Link
    href={href}
    onClick={() => haptic.tap()}
    // ⚠️ `min-h`: ikki qatorli yorliq bitta plitkani boshqasidan
    // balandroq qilardi va to'rtlik tartibsiz ko'rinardi.
    className="card flex min-h-[4.5rem] items-center gap-3 p-3.5 transition active:scale-[0.98]"
  >
    <span
      className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tone)}
    >
      <Icon className="h-5 w-5" />
    </span>

    {/*
      ⚠️ YORLIQ IKKI QATORGA SIG'ADI (`line-clamp-2`), bir qatorda
      KESILMAYDI: "Mening murojaatlarim" 375px ekranda ikki
      ustunga sig'maydi va `truncate` uni "Mening mur…" qilib
      ko'rsatardi — ya'ni plitkaning nima ekani yo'qolardi.
    */}
    <span className="min-w-0">
      <span className="line-clamp-2 block text-[13px] font-semibold leading-tight">
        {label}
      </span>
      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
        {hint}
      </span>
    </span>
  </Link>
);

/** Katta raqam — "nol" ham ko'rsatiladi, yashirilmaydi. */
const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex-1 text-center">
    <p className="text-[22px] font-bold leading-none tabular-nums">
      {/* ⚠️ RAQAM AJRATGICHI — `toLocaleString` EMAS: u muhitga
          bog'liq va ba'zi brauzerlarda vergul qo'yardi
          ("1,248" — o'zbek tilida bu kasr sonday ko'rinadi). */}
      {String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
    </p>
    <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
  </div>
);

export default function HomePage() {
  const { citizen } = useSession();
  const router = useRouter();
  const stats = useHomeStats();

  const place = citizen.districtName ?? "Andijon viloyati";

  return (
    <div className="min-h-screen pb-nav">
      {/* ── SALOM VA ASOSIY AMAL ──────────────────────────────── */}
      <section className="relative overflow-hidden safe-top">
        {/*
          ⚠️ GRADIENT RASM EMAS: mockup'dagi fotosurat o'rnida
          gradient ishlatilgan, chunki ilova yuklanishi MUHIM —
          bosh sahifadagi katta surat mobil tarmoqda birinchi
          ekranni sekundlarga kechiktirardi va u hech qanday
          ma'lumot bermaydi.
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-sky-500" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-lg px-5 pb-8 pt-7 text-white">
          <p className="text-[13px] font-medium opacity-90">{place}</p>

          <h1 className="mt-2 text-[27px] font-bold leading-[1.15]">
            Toza va qulay
            <br />
            hudud uchun birga!
          </h1>

          <p className="mt-2.5 max-w-[20rem] text-[13px] leading-relaxed opacity-90">
            Hududingizdagi muammolarni fotosurat bilan yuboring. Biz ularni hal
            qilishga yordam beramiz.
          </p>

          <button
            type="button"
            onClick={() => {
              haptic.press();
              router.push("/new");
            }}
            className={cn(
              "btn-base mt-5 w-full bg-white text-primary shadow-lift",
              "justify-between px-5",
            )}
          >
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Murojaat yuborish
            </span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        {/* ── BO'LIMLAR ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {TILES.map((tile) => (
            <Tile key={tile.href} {...tile} />
          ))}
        </div>

        {/* ── UMUMIY RAQAMLAR ─────────────────────────────────── */}
        <section className="card p-4">
          <h2 className="text-sm font-semibold">Viloyat bo&apos;yicha</h2>

          <div className="mt-3.5 flex items-start divide-x divide-border">
            {/* ⚠️ YUKLANAYOTGANDA NOL KO'RSATILADI, skelet emas:
                uchta kichik raqam uchun skelet ekranni
                "miltillatardi". */}
            <Stat value={stats.data?.total ?? 0} label="Jami murojaat" />
            <Stat value={stats.data?.resolved ?? 0} label="Hal qilindi" />
            <Stat value={stats.data?.last30 ?? 0} label="Oxirgi 30 kun" />
          </div>
        </section>

        {/* ── SHAXSIY ─────────────────────────────────────────── */}
        {citizen.stats.total > 0 ? (
          <Link
            href="/appeals"
            onClick={() => haptic.tap()}
            className="card flex items-center justify-between gap-3 p-4 transition active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold">Sizning murojaatlaringiz</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {citizen.stats.open > 0
                  ? `${citizen.stats.open} ta ko'rib chiqilmoqda`
                  : `${citizen.stats.resolved} ta hal qilindi`}
              </p>
            </div>

            <span className="flex items-center gap-2">
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground tabular-nums">
                {citizen.stats.total}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </span>
          </Link>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
