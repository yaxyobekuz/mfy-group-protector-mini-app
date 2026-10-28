"use client";

/**
 * YANGILIKLAR.
 *
 * ⚠️ TUMAN BO'YICHA FILTR SERVERDA (`citizen.districtId`): ilovada
 * qilinsa, fuqaro boshqa tumanning e'lonlarini so'rov parametrini
 * o'zgartirib ko'ra olardi.
 *
 * ⚠️ UMUMIY (viloyat) E'LONLAR HAMMAGA KO'RINADI: faqat tuman
 * bo'yicha filtrlansa, ular hech kimga yetib bormasdi.
 */

import { Eye, Pin, ScrollText } from "lucide-react";
import { useState } from "react";

import { useMarkNewsViewed, useNews } from "@/features/news/api";
import { fileUrl } from "@/shared/api/client";
import type { NewsItem } from "@/shared/api/types";
import { formatDateUz } from "@/shared/lib/date";
import { useLocale } from "@/shared/lib/i18n";
import { haptic } from "@/shared/lib/telegram";
import { Sheet } from "@/shared/ui/sheet";
import { CardSkeleton, EmptyState, ErrorState } from "@/shared/ui/states";
import { BottomNav } from "@/widgets/bottom-nav/bottom-nav";
import { PageHeader } from "@/widgets/page-header/page-header";

export default function NewsPage() {
  const { data, isLoading, isError, refetch } = useNews();
  const markViewed = useMarkNewsViewed();
  const [open, setOpen] = useState<NewsItem | null>(null);
  const { locale, t } = useLocale();

  const show = (item: NewsItem) => {
    haptic.tap();
    setOpen(item);
    // ⚠️ "OT VA UNUT": sanoq ko'rsatkich, uning yiqilishi
    // e'lonni ochishga to'sqinlik qilmasligi kerak.
    markViewed.mutate(item.id);
  };

  return (
    <div className="min-h-screen pb-nav">
      <PageHeader title={t("news.title")} />

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} />)
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-6 w-6" />}
            title={t("news.empty")}
            hint={t("news.emptyHint")}
          />
        ) : (
          data!.map((item) => {
            const cover = fileUrl(item.coverUrl);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => show(item)}
                className="card block w-full overflow-hidden text-left transition active:scale-[0.99]"
              >
                {cover ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : null}

                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {item.isPinned ? (
                      <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground">
                        <Pin className="h-3 w-3" />
                        {t("news.pinned")}
                      </span>
                    ) : null}

                    <span>{formatDateUz(item.publishedAt, locale)}</span>

                    {item.districtName ? <span>· {item.districtName}</span> : null}

                    <span className="ml-auto flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.viewCount}
                    </span>
                  </div>

                  <h2 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug">
                    {item.title}
                  </h2>

                  {/* ⚠️ UCH QATORDA KESILADI: e'lon uzun bo'lishi
                      mumkin (10 000 belgigacha) va uni to'liq
                      ko'rsatish ro'yxatni ishlatib bo'lmaydigan
                      qilardi. */}
                  <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </main>

      {/* ── TO'LIQ O'QISH ─────────────────────────────────────── */}
      <Sheet open={open !== null} onClose={() => setOpen(null)} title={open?.title} tall>
        {open ? (
          <article className="space-y-3">
            {fileUrl(open.coverUrl) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={fileUrl(open.coverUrl)!}
                alt=""
                className="w-full rounded-xl object-cover"
              />
            ) : null}

            <p className="text-[11px] text-muted-foreground">
              {formatDateUz(open.publishedAt, locale)}
              {open.districtName ? ` · ${open.districtName}` : ""}
            </p>

            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{open.body}</p>
          </article>
        ) : null}
      </Sheet>

      <BottomNav />
    </div>
  );
}
