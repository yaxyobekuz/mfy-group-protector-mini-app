"use client";

/**
 * MUROJAAT KARTASI — ro'yxatda.
 *
 * ⚠️ HOLAT ZANJIRI KARTADA KO'RINADI, ichida emas: "murojaatim
 * qayerda" — ilovaga qaytishning ASOSIY sababi va uni ko'rish
 * uchun kartani ochishga majbur qilish ortiqcha bosqich bo'lardi.
 *
 * ⚠️ ZANJIR SERVERDAN KELADI (`timeline`), ilovada hisoblanmaydi:
 * holat qoidasi panelda o'zgarsa (masalan "ijroga yuborildi"
 * ta'rifi), ilova uni darhol to'g'ri ko'rsatadi.
 */

import { ChevronRight, ImageIcon, MapPin } from "lucide-react";
import Link from "next/link";

import type { AppealListItem } from "@/shared/api/types";
import { categoryColor, categoryIcon } from "@/shared/config/icons";
import { APPEAL_STATUS } from "@/shared/config/labels";
import { cn } from "@/shared/lib/cn";
import { formatDateTimeUz } from "@/shared/lib/date";
import { haptic } from "@/shared/lib/telegram";
import { fileUrl } from "@/shared/api/client";

export const AppealCard = ({ appeal }: { appeal: AppealListItem }) => {
  const Icon = categoryIcon(appeal.category.icon);
  const color = categoryColor(appeal.category.color);
  const status = APPEAL_STATUS[appeal.status];

  return (
    <Link
      href={`/appeals/detail?id=${appeal.id}`}
      onClick={() => haptic.tap()}
      className="card block p-4 transition active:scale-[0.99]"
    >
      {/* ── SARLAVHA QATORI ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[12px] font-semibold text-muted-foreground">
          {appeal.publicNo}
        </span>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      {/* ── MAVZU ────────────────────────────────────────────── */}
      <div className="mt-2.5 flex items-start gap-2.5">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          {/* ⚠️ IKKI QATORDA KESILADI: uzun sarlavha kartani
              cho'zib, ro'yxatda bir nechta murojaat ko'rinishini
              buzardi. */}
          <span className="line-clamp-2 text-[14px] font-semibold leading-snug">
            {appeal.title}
          </span>

          {appeal.address ? (
            <span className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{appeal.address}</span>
            </span>
          ) : null}

          <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{formatDateTimeUz(appeal.createdAt)}</span>

            {appeal.photos.length > 0 ? (
              <span className="flex items-center gap-0.5">
                <ImageIcon className="h-3 w-3" />
                {appeal.photos.length}
              </span>
            ) : null}
          </span>
        </span>

        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {/* ── ZANJIR ───────────────────────────────────────────── */}
      <div className="mt-3.5 flex items-start">
        {appeal.timeline.map((stepItem, index) => {
          const isLast = index === appeal.timeline.length - 1;

          return (
            <div key={stepItem.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {/* Chap chiziq — birinchi nuqtada ko'rinmaydi. */}
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    index === 0
                      ? "bg-transparent"
                      : appeal.timeline[index]?.done
                        ? "bg-success"
                        : "bg-border",
                  )}
                />

                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full border-2",
                    stepItem.done
                      ? "border-success bg-success"
                      : "border-border bg-card",
                  )}
                />

                <span
                  className={cn(
                    "h-0.5 flex-1",
                    isLast
                      ? "bg-transparent"
                      : appeal.timeline[index + 1]?.done
                        ? "bg-success"
                        : "bg-border",
                  )}
                />
              </div>

              <span
                className={cn(
                  "mt-1.5 text-center text-[9px] leading-tight",
                  stepItem.done ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {stepItem.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── SURATLAR ─────────────────────────────────────────── */}
      {appeal.photos.length > 0 ? (
        <div className="mt-3 flex gap-2 overflow-hidden">
          {appeal.photos.slice(0, 3).map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo}
              src={fileUrl(photo) ?? photo}
              alt=""
              loading="lazy"
              className="h-16 flex-1 rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}
    </Link>
  );
};
