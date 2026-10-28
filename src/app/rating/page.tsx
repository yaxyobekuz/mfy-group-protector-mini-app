"use client";

/**
 * FAOL FUQAROLAR REYTINGI.
 *
 * ⚠️ FAMILIYA TO'LIQ KO'RSATILMAYDI (serverda qisqartiriladi):
 * reyting ommaviy ro'yxat va to'liq ism "falonchi nechta shikoyat
 * yozgan" degan ma'lumotni hammaga ochardi.
 *
 * ⚠️ BALL "KIM KO'P YOZGAN" EMAS: yuborilganiga 5, HAL
 * QILINGANIGA 15 (`server/src/common/points.ts`). Teskarisi bo'lsa,
 * reyting tizimni ma'nosiz murojaatlar bilan to'ldirardi.
 */

import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { useSession } from "@/entities/session/session-provider";
import { useRating } from "@/features/news/api";
import { fileUrl } from "@/shared/api/client";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/lib/i18n";
import { haptic, showBackButton } from "@/shared/lib/telegram";
import { CardSkeleton, EmptyState, ErrorState } from "@/shared/ui/states";
import { PageHeader } from "@/widgets/page-header/page-header";
import { useRouter } from "next/navigation";

/** ⚠️ FAQAT UCHTASI RANGLANADI: hammasini bo'yash tartibni yo'qotardi. */
const MEDAL: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-zinc-300 text-zinc-800",
  3: "bg-orange-400/80 text-orange-950",
};

export default function RatingPage() {
  const router = useRouter();
  const { citizen } = useSession();
  const [scope, setScope] = useState<"province" | "district">("province");
  const t = useT();

  const { data, isLoading, isError, refetch } = useRating(scope);

  // ⚠️ REYTING PASTKI MENYUDA YO'Q (bosh sahifadagi plitkadan
  // ochiladi), shuning uchun orqaga tugmasi KERAK.
  useEffect(() => showBackButton(() => router.back()), [router]);

  return (
    <div className="min-h-screen pb-10">
      <PageHeader
        title={t("rating.title")}
        below={
          <div className="flex gap-1.5">
            {(
              [
                { key: "province", label: t("rating.province") },
                {
                  key: "district",
                  label: citizen.districtName ?? t("rating.myDistrict"),
                },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                // ⚠️ TUMAN TANLANMAGAN BO'LSA O'CHIRILGAN: server
                // bunday holatda butun viloyat ro'yxatini
                // qaytaradi va ikkita tab bir xil natija
                // ko'rsatardi.
                disabled={item.key === "district" && !citizen.districtId}
                onClick={() => {
                  haptic.select();
                  setScope(item.key);
                }}
                className={cn(
                  "flex-1 truncate rounded-xl px-3 py-2 text-[13px] font-medium transition disabled:opacity-40",
                  scope === item.key
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      <main className="mx-auto max-w-lg space-y-2 px-4 py-4">
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => <CardSkeleton key={index} />)
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Trophy className="h-6 w-6" />}
            title={t("rating.empty")}
            hint={t("rating.emptyHint")}
            action={{ label: t("nav.newAppeal"), onClick: () => router.push("/new") }}
          />
        ) : (
          data!.map((row) => {
            const photo = fileUrl(row.photoUrl);
            const isMe = row.id === citizen.id;

            return (
              <div
                key={row.id}
                className={cn(
                  "card flex items-center gap-3 p-3.5",
                  // ⚠️ O'ZI AJRATIB KO'RSATILADI: 50 ta qatorda
                  // o'zini topish aks holda imkonsiz bo'lardi.
                  isMe && "ring-2 ring-primary",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold tabular-nums",
                    MEDAL[row.rank] ?? "bg-secondary text-muted-foreground",
                  )}
                >
                  {row.rank}
                </span>

                {photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-accent-foreground">
                    {row.name.charAt(0)}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">
                    {row.name}
                    {isMe ? (
                      <span className="ml-1.5 text-[11px] font-normal text-primary">
                        ({t("common.you")})
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {t("rating.appeals", { count: row.appeals })}
                    {row.districtName ? ` · ${row.districtName}` : ""}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-[15px] font-bold tabular-nums text-primary">
                    {row.points}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {t("rating.points")}
                  </span>
                </span>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
