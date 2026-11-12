"use client";

/**
 * 1-QADAM: YO'NALISH.
 *
 * ⚠️ RO'YXAT SERVERDAN KELADI, ILOVADA QOTIB QOLMAGAN. Panelda
 * yangi yo'nalish ochilsa, u ilovada DARHOL ko'rinadi — aks holda
 * har yo'nalish uchun ilova yangilanishini kutish kerak bo'lardi
 * (App Store/Telegram keshi).
 *
 * ⚠️ QIDIRUV 6 TADAN KO'P YO'NALISHDA KO'RINADI: to'rtta element
 * ustidagi qidiruv maydoni ekranni band qilib, hech narsa
 * bermaydi.
 */

import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useCategories } from "@/features/appeals/api";
import type { Category } from "@/shared/api/types";
import { categoryColor, categoryIcon } from "@/shared/config/icons";
import { slaLabel } from "@/shared/config/labels";
import { cn } from "@/shared/lib/cn";
import { useT, type Translate } from "@/shared/lib/i18n";
import { haptic } from "@/shared/lib/telegram";
import { Field } from "@/shared/ui/field";
import { CardSkeleton, ErrorState } from "@/shared/ui/states";

interface Props {
  value: string | null;
  onChange: (categoryId: string) => void;
}

const SEARCH_THRESHOLD = 6;

const CategoryCard = ({
  category,
  selected,
  onSelect,
  t,
}: {
  category: Category;
  selected: boolean;
  onSelect: () => void;
  t: Translate;
}) => {
  const Icon = categoryIcon(category.icon);
  const color = categoryColor(category.color);

  return (
    <button
      type="button"
      onClick={() => {
        haptic.select();
        onSelect();
      }}
      className={cn(
        "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-3 text-left transition",
        "active:scale-[0.97]",
        selected
          ? "border-primary bg-accent/60"
          : "border-transparent bg-card shadow-card",
      )}
    >
      {selected ? (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : null}

      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        // ⚠️ RANG INLINE: u BAZADAN keladi (ixtiyoriy hex) va
        // Tailwind klassi sifatida oldindan yozib bo'lmaydi —
        // JIT kompilyator dinamik klassni topa olmaydi.
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="block w-full">
        <span className="block text-[13px] font-semibold leading-tight">
          {category.name}
        </span>
        <span className="mt-1 block text-[10px] leading-tight text-muted-foreground">
          {/* ⚠️ MUDDAT SHU YERDA KO'RSATILADI: fuqaro yo'nalishni
              tanlayotganda "qachon javob olaman" degan savolga
              javob kerak bo'ladi, oxirgi qadamda emas. */}
          {t("category.sla", { value: slaLabel(category.slaHours, t) })}
        </span>
      </span>
    </button>
  );
};

export const StepCategory = ({ value, onChange }: Props) => {
  const { data, isLoading, isError, refetch } = useCategories();
  const [search, setSearch] = useState("");
  const t = useT();

  /**
   * ── TANLASA BO'LADIGAN YO'NALISHLAR ─────────────────────
   *
   * ⚠️ ICHIDA KICHIK YO'NALISHLARI BOR YO'NALISH KARTA BO'LIB
   * CHIQMAYDI: u faqat SARLAVHA. Tanlansa, bo'linishning ma'nosi
   * yo'qolardi — hisobotda yana bitta katta uyum paydo bo'lardi
   * (server ham rad etadi).
   */
  const selectable = useMemo(
    () => (data ?? []).filter((category) => category.selectable),
    [data],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return selectable;

    return selectable.filter(
      (category) =>
        category.name.toLowerCase().includes(needle) ||
        category.description?.toLowerCase().includes(needle),
    );
  }, [selectable, search]);

  /**
   * ── GURUHLAR ──────────────────────────────────────
   *
   * ⚠️ IKKI QADAMLI EKRAN QILINMADI (botdagidan farqli): bu yerda
   * butun ro'yxat EKRANDA sig'adi va qo'shimcha qadam fuqaroni
   * keraksiz bosishga majbur qilardi. Guruh sarlavhasi esa
   * "Ichimlik suvi" qaysi bo'limga tegishli ekanini ko'rsatadi.
   *
   * ⚠️ QIDIRUVDA GURUHLAR YO'QOLADI: qidirayotgan odam bo'lim
   * emas, NOM izlaydi — sarlavhalar natijani uzaytirib, uni
   * qiyinlashtirardi.
   */
  const groups = useMemo(() => {
    if (!data || search.trim()) return null;

    const roots = data.filter((category) => !category.parentId);
    const result: { key: string; title: string | null; items: Category[] }[] = [];

    for (const root of roots) {
      const children = data.filter((category) => category.parentId === root.id);
      if (children.length > 0) {
        result.push({ key: root.id, title: root.name, items: children });
      }
    }

    // ⚠️ BOLASI YO'Q ASOSIY YO'NALISHLAR — BITTA BO'LIMDA: har
    // biriga alohida sarlavha ochish ekranni bo'sh sarlavhalar
    // bilan to'ldirardi.
    const standalone = roots.filter((root) => !root.hasChildren);
    if (standalone.length > 0) {
      result.push({
        key: "__standalone__",
        title: result.length > 0 ? t("category.group.other") : null,
        items: standalone,
      });
    }

    return result;
  }, [data, search, t]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 6 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-4">
      {selectable.length > SEARCH_THRESHOLD ? (
        <Field
          placeholder={t("category.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          icon={<Search className="h-4 w-4" />}
          inputMode="search"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("category.notFound")}
        </p>
      ) : groups ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2">
              {group.title ? (
                <p className="text-[13px] font-semibold text-muted-foreground">
                  {group.title}
                </p>
              ) : null}

              {/* ⚠️ UCH USTUN: mockup'dagi tartib. Ikki ustun
                  bo'lsa ro'yxat ikki barobar uzayib, oxirgi
                  yo'nalishlar ekrandan chiqib ketardi. */}
              <div className="grid grid-cols-3 gap-2.5">
                {group.items.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    selected={value === category.id}
                    onSelect={() => onChange(category.id)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              selected={value === category.id}
              onSelect={() => onChange(category.id)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};
