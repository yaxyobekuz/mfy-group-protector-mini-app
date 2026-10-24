"use client";

/**
 * MUROJAATLAR XARITASI.
 *
 * ⚠️ SHAXSIY MA'LUMOT KO'RSATILMAYDI: nuqtada fuqaro ismi ham,
 * murojaat matni ham yo'q — faqat yo'nalish, holat va sana. Matn
 * ko'rsatilsa, xarita butun viloyat bo'ylab shikoyatlarni o'qish
 * mumkin bo'lgan ochiq ro'yxatga aylanardi (server ham uni
 * qaytarmaydi).
 *
 * ⚠️ RAD ETILGANLAR XARITADA YO'Q (serverda filtrlangan): "bu
 * muammo emas" deb yopilgan nuqta xaritada muammo bo'lib turib
 * qolardi.
 */

import { Layers, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useCategories, useMapPoints } from "@/features/appeals/api";
import type { AppealStatus } from "@/shared/api/types";
import { categoryColor, categoryIcon } from "@/shared/config/icons";
import { APPEAL_STATUS } from "@/shared/config/labels";
import { cn } from "@/shared/lib/cn";
import { formatDateUz } from "@/shared/lib/date";
import { haptic } from "@/shared/lib/telegram";
import { Sheet } from "@/shared/ui/sheet";
import { BottomNav } from "@/widgets/bottom-nav/bottom-nav";
import { MapView, type MapMarker } from "@/widgets/map/map-view";

const STATUS_FILTERS: { key: AppealStatus | "all"; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: "Yangi" },
  { key: "in_progress", label: "Jarayonda" },
  { key: "resolved", label: "Hal qilindi" },
];

export default function MapPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [status, setStatus] = useState<AppealStatus | undefined>();
  const [filtering, setFiltering] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const categories = useCategories();
  const points = useMapPoints({ categoryId, status });

  const markers = useMemo<MapMarker[]>(
    () =>
      (points.data ?? [])
        // ⚠️ KOORDINATASIZ NUQTA TASHLANADI: server ularni
        // filtrlaydi, lekin tur bo'yicha ular `null` bo'lishi
        // mumkin va `L.marker(null)` xarita qatlamini butunlay
        // yiqitardi.
        .filter((point) => point.lat !== null && point.lng !== null)
        .map((point) => ({
          id: point.id,
          lat: point.lat!,
          lng: point.lng!,
          color: categoryColor(point.category.color),
          onClick: () => {
            haptic.tap();
            setSelected(point.id);
          },
        })),
    [points.data],
  );

  const active = (points.data ?? []).find((point) => point.id === selected);
  const ActiveIcon = categoryIcon(active?.category.icon);

  const hasFilter = Boolean(categoryId || status);

  return (
    <div className="relative min-h-screen">
      {/* ⚠️ XARITA BUTUN EKRANNI EGALLAYDI: telefon ekranida u
          asosiy kontent va uni kichik oynaga siqish nuqtalarni
          ko'rib bo'lmaydigan qilardi. */}
      <div className="fixed inset-0 bottom-0">
        <MapView className="h-full w-full" markers={markers} />
      </div>

      {/* ── FILTR TUGMASI ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-3 safe-top">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between gap-2">
          <span className="rounded-xl bg-card/95 px-3 py-2 text-[12px] font-semibold shadow-card backdrop-blur">
            {points.isLoading
              ? "Yuklanmoqda…"
              : `${markers.length} ta nuqta`}
          </span>

          <button
            type="button"
            onClick={() => {
              haptic.tap();
              setFiltering(true);
            }}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold shadow-card backdrop-blur transition active:scale-95",
              hasFilter
                ? "bg-primary text-primary-foreground"
                : "bg-card/95 text-foreground",
            )}
          >
            <Layers className="h-4 w-4" />
            Filtr
          </button>
        </div>
      </div>

      {/* ── TANLANGAN NUQTA ───────────────────────────────────── */}
      {active ? (
        <div className="fixed inset-x-0 bottom-[5.5rem] z-30 px-4">
          <div className="card mx-auto flex max-w-lg items-center gap-3 p-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${categoryColor(active.category.color)}1f`,
                color: categoryColor(active.category.color),
              }}
            >
              <ActiveIcon className="h-5 w-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">
                {active.category.name}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    APPEAL_STATUS[active.status].className,
                  )}
                >
                  {APPEAL_STATUS[active.status].label}
                </span>
                {formatDateUz(active.createdAt)}
              </span>
            </span>

            <button
              type="button"
              aria-label="Yopish"
              onClick={() => setSelected(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* ── FILTR OYNASI ──────────────────────────────────────── */}
      <Sheet open={filtering} onClose={() => setFiltering(false)} title="Filtr" tall>
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-[13px] font-semibold">Holat</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((item) => {
                const isActive =
                  item.key === "all" ? status === undefined : status === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      haptic.select();
                      setStatus(item.key === "all" ? undefined : (item.key as AppealStatus));
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[13px] font-medium transition",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[13px] font-semibold">Yo&apos;nalish</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  haptic.select();
                  setCategoryId(undefined);
                }}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] font-medium transition",
                  categoryId === undefined
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                Barchasi
              </button>

              {(categories.data ?? []).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    haptic.select();
                    setCategoryId(category.id);
                  }}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[13px] font-medium transition",
                    categoryId === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      </Sheet>

      <BottomNav />
    </div>
  );
}
