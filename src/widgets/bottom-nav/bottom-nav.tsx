"use client";

/**
 * PASTKI MENYU.
 *
 * ⚠️ O'RTADAGI TUGMA KATTA VA KO'TARILGAN: "Murojaat yuborish" —
 * ilovaning YAGONA asosiy amali va u boshqa to'rtta bo'lim bilan
 * bir xil ko'rinishda bo'lsa, foydalanuvchi uni qidirib yurardi.
 *
 * ⚠️ MENYU SEHRGAR ICHIDA KO'RSATILMAYDI (`/new`): to'ldirilayotgan
 * murojaatdan bir bosishda chiqib ketish yozilganlarni yo'qotardi.
 * Sehrgardan chiqish — `X` tugmasi orqali, tasdiq bilan.
 */

import { FileText, Home, Map, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/shared/lib/cn";
import { useT, type Translate } from "@/shared/lib/i18n";
import type { MessageKey } from "@/shared/config/dictionary";
import { haptic } from "@/shared/lib/telegram";

interface NavItem {
  href: string;
  /** ⚠️ KALIT, MATN EMAS: yorliq til almashganda yangilanishi kerak. */
  label: MessageKey;
  icon: typeof Home;
}

const LEFT: NavItem[] = [
  { href: "/", label: "nav.home", icon: Home },
  { href: "/map", label: "nav.map", icon: Map },
];

const RIGHT: NavItem[] = [
  { href: "/news", label: "nav.news", icon: FileText },
  { href: "/profile", label: "nav.profile", icon: User },
];

/** ⚠️ SEHRGAR VA UNING OSTIDAGI YO'LLARDA MENYU YO'Q. */
const HIDDEN_PREFIXES = ["/new"];

/**
 * YO'L SHU BO'LIMGA TEGISHLIMI.
 *
 * ⚠️ ODDIY `startsWith` YETARLI EMAS VA BU AYNAN SHU YERDA
 * TUTILGAN XATO: `"/news".startsWith("/new")` — `true`. Ya'ni
 * "Yangiliklar" sahifasi sehrgar deb hisoblanib, PASTKI MENYU
 * O'ZINI YASHIRIB QO'YGAN edi va u sahifadan chiqib bo'lmasdi.
 *
 * Shuning uchun moslik BO'LAK chegarasida tekshiriladi: yo aynan
 * o'sha yo'l, yo uning ostidagi yo'l (`/new/...`).
 */
const underRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

const Tab = ({
  item,
  active,
  t,
}: {
  item: NavItem;
  active: boolean;
  t: Translate;
}) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={() => haptic.tap()}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2 transition",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {/* ⚠️ `strokeWidth` 1.5 — ingichkaroq, zamonaviyroq ko'rinish.
          Faol holat RANG va QALIN YORLIQ bilan ajratiladi (chiziq
          qalinligi bilan emas), shuning uchun faol/nofaol ikonka bir
          xil qalinlikda qoladi. */}
      <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} />
      <span className={cn("text-[10px] leading-none", active && "font-semibold")}>
        {t(item.label)}
      </span>
    </Link>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();

  if (HIDDEN_PREFIXES.some((route) => underRoute(pathname, route))) return null;

  // ⚠️ ANIQ MOSLIK `/` UCHUN: `startsWith` bo'lsa, bosh sahifa
  // HAR doim faol ko'rinardi. Qolganlari uchun `underRoute` —
  // yuqoridagi `/news` ↔ `/new` xatosi bilan AYNI sabab.
  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : underRoute(pathname, href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-nav safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch px-2">
        {LEFT.map((item) => (
          <Tab key={item.href} item={item} active={isActive(item.href)} t={t} />
        ))}

        {/* ⚠️ KO'TARILGAN TUGMA MENYUDAN TASHQARIGA CHIQADI
            (`-mt-6`): u menyu qatoridan ajralib turishi kerak,
            aks holda uchta bir xil belgidan biri bo'lib qolardi. */}
        <div className="flex w-[4.5rem] shrink-0 justify-center">
          <button
            type="button"
            aria-label={t("nav.newAppeal")}
            onClick={() => {
              haptic.press();
              router.push("/new");
            }}
            className={cn(
              "-mt-6 flex h-14 w-14 items-center justify-center rounded-full",
              "bg-primary text-primary-foreground shadow-lift",
              "ring-4 ring-background transition active:scale-95",
            )}
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        {RIGHT.map((item) => (
          <Tab key={item.href} item={item} active={isActive(item.href)} t={t} />
        ))}
      </div>
    </nav>
  );
};
