"use client";

/**
 * MENING MUROJAATLARIM.
 *
 * ⚠️ TAB YORLIQLARIDA SANOQ BOR ("Jarayonda 3"): usiz fuqaro
 * tabni bosib ko'rmaguncha u yerda nima borligini bilmasdi va
 * bo'sh tabni ochib, "ilova ishlamayapti" deb o'ylardi.
 *
 * ⚠️ SANOQLAR RO'YXAT BILAN BIRGA KELADI (`counts`): alohida
 * so'rov birinchi ekranni ikki marta yuklashga majbur qilardi.
 */

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMyAppeals } from "@/features/appeals/api";
import { AppealCard } from "@/features/appeals/appeal-card";
import type { AppealStatus } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { haptic } from "@/shared/lib/telegram";
import { CardSkeleton, EmptyState, ErrorState } from "@/shared/ui/states";
import { BottomNav } from "@/widgets/bottom-nav/bottom-nav";
import { PageHeader } from "@/widgets/page-header/page-header";

type Tab = "all" | "open" | "closed";

/**
 * ⚠️ "JARAYONDA" IKKI HOLATNI QAMRAYDI (`new` + `in_progress`),
 * lekin server bitta `status` filtrini qabul qiladi. Shuning
 * uchun "jarayonda" tabi filtrni SERVERGA YUBORMAYDI va
 * ro'yxatni ilovada ajratadi — ikkita so'rov yuborish yoki
 * serverga "ochiq" degan sun'iy holat qo'shishdan sodda.
 */
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "open", label: "Jarayonda" },
  { key: "closed", label: "Yopilgan" },
];

export default function AppealsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading, isError, refetch } = useMyAppeals();

  const counts = data?.counts;

  const visible = (data?.items ?? []).filter((appeal) => {
    if (tab === "all") return true;

    const closed: AppealStatus[] = ["resolved", "rejected"];
    return tab === "closed"
      ? closed.includes(appeal.status)
      : !closed.includes(appeal.status);
  });

  const countFor = (key: Tab): number | null => {
    if (!counts) return null;
    if (key === "all") return counts.all;
    if (key === "open") return counts.open;
    return counts.resolved + counts.rejected;
  };

  return (
    <div className="min-h-screen pb-nav">
      <PageHeader
        title="Mening murojaatlarim"
        below={
          <div className="flex gap-1.5">
            {TABS.map((item) => {
              const count = countFor(item.key);
              const active = tab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    haptic.select();
                    setTab(item.key);
                  }}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {item.label}
                  {count !== null ? (
                    <span className="ml-1 tabular-nums opacity-80">({count})</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        }
      />

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {isLoading && !data ? (
          Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} />)
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={
              tab === "all"
                ? "Hali murojaat yubormagansiz"
                : tab === "open"
                  ? "Jarayondagi murojaat yo'q"
                  : "Yopilgan murojaat yo'q"
            }
            hint={
              tab === "all"
                ? "Hududingizdagi muammoni fotosurat bilan yuboring — biz uni mas'ul tashkilotga yo'naltiramiz."
                : undefined
            }
            action={
              tab === "all"
                ? { label: "Murojaat yuborish", onClick: () => router.push("/new") }
                : undefined
            }
          />
        ) : (
          visible.map((appeal) => <AppealCard key={appeal.id} appeal={appeal} />)
        )}
      </main>

      <BottomNav />
    </div>
  );
}
