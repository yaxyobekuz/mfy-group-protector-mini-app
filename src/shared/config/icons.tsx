/**
 * YO'NALISH BELGILARI — KALITDAN KOMPONENTGA.
 *
 * ⚠️ BAZADA KALIT SAQLANADI, SVG EMAS (`IssueCategory.icon`).
 * Manzil yoki SVG saqlansa, ilova dizayni o'zgarganda bazadagi
 * yozuvlar eskirardi va ularni migratsiya bilan tuzatish kerak
 * bo'lardi.
 *
 * ⚠️ TANILMAGAN KALIT — ZAHIRA BELGI, bo'sh joy EMAS. Panelda yangi
 * yo'nalish qo'shilib, unga hali belgi tanlanmagan bo'lishi mumkin
 * va o'shanda ro'yxatda teshik paydo bo'lardi. Bu `labels.ts` dagi
 * "tanilmagan kalit kalit ko'rinishida chiqadi" qoidasi bilan ayni
 * yondashuv.
 */

import {
  Building2,
  Bus,
  CircleEllipsis,
  Droplets,
  FileText,
  HeartHandshake,
  Lightbulb,
  Route,
  ShieldAlert,
  Trash2,
  TreeDeciduous,
  UserCog,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  water: Droplets,
  road: Route,
  trash: Trash2,
  social: HeartHandshake,
  shield: ShieldAlert,
  staff: UserCog,
  document: FileText,
  more: CircleEllipsis,

  // ⚠️ RO'YXAT KENGROQ: panelda yangi yo'nalish ochilganda unga
  // mos belgi TOPILISHI kerak. Belgilar ro'yxatini kengaytirish
  // kod o'zgarishi, lekin u YO'NALISH qo'shishni to'smaydi —
  // zahira belgi bor.
  lamp: Lightbulb,
  power: Zap,
  tree: TreeDeciduous,
  building: Building2,
  transport: Bus,
};

const FALLBACK = CircleEllipsis;

export const categoryIcon = (key: string | null | undefined): LucideIcon =>
  (key ? ICONS[key] : undefined) ?? FALLBACK;

/**
 * YO'NALISH RANGI.
 *
 * ⚠️ `color` BO'SH BO'LISHI MUMKIN (schema'da ixtiyoriy) va
 * o'shanda BREND rangi ishlatiladi — tasodifiy rang emas: bir xil
 * ro'yxatda ikkita yo'nalish har yuklashda boshqa rangda
 * ko'rinardi.
 */
export const categoryColor = (color: string | null | undefined): string =>
  color ?? "#2563eb";
