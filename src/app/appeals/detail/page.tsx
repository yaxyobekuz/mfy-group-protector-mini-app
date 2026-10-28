"use client";

/**
 * MUROJAAT KARTASI.
 *
 * ⚠️ JAVOB (`resolution`) ENG YUQORIDA: fuqaro bu ekranga aynan
 * "javob bormi" degan savol bilan keladi va uni sahifa oxiriga
 * qo'yish eng muhim ma'lumotni yashirardi.
 *
 * ⚠️ MUROJAAT MATNI TAHRIRLANMAYDI: yuborilgandan keyin u rasmiy
 * navbat yozuvi. Qo'shimcha aytish — IZOH orqali (append-only,
 * `IssueComment` qoidasi).
 */

import {
  AlertTriangle,
  Building2,
  Clock,
  History,
  MapPin,
  MessageSquarePlus,
  RotateCcw,
  Send,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useAddComment, useAppeal } from "@/features/appeals/api";
import { fileUrl } from "@/shared/api/client";
import { categoryColor, categoryIcon } from "@/shared/config/icons";
import { APPEAL_STATUS } from "@/shared/config/labels";
import { cn } from "@/shared/lib/cn";
import { useLocale } from "@/shared/lib/i18n";
import type { MessageKey } from "@/shared/config/dictionary";
import { formatDateTimeUz, formatRelativeUz } from "@/shared/lib/date";
import { haptic, showBackButton } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/field";
import { Sheet } from "@/shared/ui/sheet";
import { ErrorState, LoadingBlock } from "@/shared/ui/states";
import { MapView } from "@/widgets/map/map-view";

const FLAGS = [
  { key: "isHazard", label: "appeal.flag.hazard", icon: AlertTriangle },
  { key: "isLongStanding", label: "appeal.flag.longStanding", icon: History },
  { key: "isRepeatAppeal", label: "appeal.flag.repeat", icon: RotateCcw },
] as const satisfies readonly {
  key: string;
  label: MessageKey;
  icon: typeof AlertTriangle;
}[];

/**
 * ⚠️ MANZIL `/appeals/detail?id=…`, `/appeals/[id]` EMAS.
 *
 * Mustaqil ilova (APK) statik eksportda quriladi va u yerda
 * dinamik segment (`[id]`) uchun Next `generateStaticParams()`
 * talab qiladi — ya'ni BARCHA id'lar qurish paytida ma'lum
 * bo'lishi kerak. Murojaat id'lari esa fuqaroga tegishli va
 * qurish paytida mavjud emas.
 *
 * Sahifa allaqachon TO'LIQ mijoz tomonida ishlagani uchun
 * (`useAppeal` so'rov yuboradi) id'ni manzil parametridan olish
 * hech narsani o'zgartirmaydi.
 */
export default function AppealDetailPage() {
  /**
   * ⚠️ `Suspense` MAJBURIY: `useSearchParams` statik eksportda
   * uni TALAB qiladi va usiz qurish xato bilan to'xtardi.
   */
  return (
    <Suspense fallback={<LoadingBlock />}>
      <AppealDetailContent />
    </Suspense>
  );
}

function AppealDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, t } = useLocale();
  const id = searchParams.get("id") ?? "";

  const { data, isLoading, isError, refetch } = useAppeal(id);
  const comment = useAddComment(id);

  const [commenting, setCommenting] = useState(false);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  // ⚠️ TELEGRAM "ORQAGA" — ro'yxatga qaytaradi (`back`, `/appeals`
  // emas): fuqaro bu ekranga bosh sahifadan ham kelishi mumkin va
  // qat'iy manzil uni kutilmagan joyga olib borardi.
  useEffect(() => showBackButton(() => router.back()), [router]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  const Icon = categoryIcon(data.category.icon);
  const color = categoryColor(data.category.color);
  const status = APPEAL_STATUS[data.status];
  const closed = data.status === "resolved" || data.status === "rejected";

  const activeFlags = FLAGS.filter((flag) => data[flag.key]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── SARLAVHA ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md safe-top">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <span className="font-mono text-[14px] font-bold">{data.publicNo}</span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              status.className,
            )}
          >
            {t(status.key)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {/* ── JAVOB ─────────────────────────────────────────── */}
        {data.resolution ? (
          <section
            className={cn(
              "card border-l-4 p-4",
              data.status === "resolved" ? "border-l-success" : "border-l-muted-foreground",
            )}
          >
            <h2 className="text-[13px] font-semibold">
              {data.status === "resolved" ? t("appeal.answer") : t("appeal.rejectReason")}
            </h2>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed">
              {data.resolution}
            </p>
            {data.resolvedAt ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {formatDateTimeUz(data.resolvedAt, locale)}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* ── HOLAT ZANJIRI ─────────────────────────────────── */}
        <section className="card p-4">
          <ol className="space-y-0">
            {data.timeline.map((item, index) => {
              const isLast = index === data.timeline.length - 1;

              return (
                <li key={item.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "h-3 w-3 shrink-0 rounded-full border-2",
                        item.done ? "border-success bg-success" : "border-border bg-card",
                      )}
                    />
                    {!isLast ? (
                      <span
                        className={cn(
                          "w-0.5 flex-1",
                          data.timeline[index + 1]?.done ? "bg-success" : "bg-border",
                        )}
                      />
                    ) : null}
                  </div>

                  <span
                    className={cn(
                      "pb-4 text-[14px] leading-none",
                      isLast && "pb-0",
                      item.done ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── SURATLAR ──────────────────────────────────────── */}
        {data.attachments.length > 0 ? (
          <section className="grid grid-cols-3 gap-2">
            {data.attachments.map((item) => {
              const url = fileUrl(item.url) ?? item.url;

              return item.kind === "video" ? (
                <video
                  key={item.id}
                  src={url}
                  controls
                  playsInline
                  className="aspect-square w-full rounded-xl bg-muted object-cover"
                />
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    haptic.tap();
                    setPhoto(url);
                  }}
                  className="aspect-square overflow-hidden rounded-xl bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </section>
        ) : null}

        {/* ── MATN VA TAFSILOT ──────────────────────────────── */}
        <section className="card p-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}1f`, color }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-semibold">{data.category.name}</span>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">
            {data.body}
          </p>

          {activeFlags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeFlags.map((flag) => {
                const FlagIcon = flag.icon;
                return (
                  <span
                    key={flag.key}
                    className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-medium text-warning"
                  >
                    <FlagIcon className="h-3 w-3" />
                    {t(flag.label)}
                  </span>
                );
              })}
            </div>
          ) : null}

          <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-[12px]">
            {data.address ? (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {data.address}
                  {data.mahallaName ? (
                    <span className="block text-[11px]">
                      {data.mahallaName}
                      {data.districtName ? `, ${data.districtName}` : ""}
                    </span>
                  ) : null}
                </span>
              </p>
            ) : null}

            <p className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {data.category.orgName ?? t("appeal.defaultOrg")}
            </p>

            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {t("appeal.sentAt")}: {formatDateTimeUz(data.createdAt, locale)}
            </p>

            {/* ⚠️ MUDDAT FAQAT OCHIQ MUROJAATDA: yopilganida u
                "kechikdi" degan ma'nosiz yorliq bo'lib qolardi. */}
            {!closed && data.dueAt ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {t("appeal.dueAt")}: {formatDateTimeUz(data.dueAt, locale)}
              </p>
            ) : null}
          </div>
        </section>

        {/* ── YOZISHMA ──────────────────────────────────────── */}
        {data.comments.length > 0 ? (
          <section className="space-y-2">
            <h2 className="px-1 text-[13px] font-semibold">{t("appeal.chat")}</h2>

            {data.comments.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                  item.mine
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-card shadow-card",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    item.mine ? "opacity-80" : "text-muted-foreground",
                  )}
                >
                  {item.author}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed">
                  {item.body}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    item.mine ? "opacity-70" : "text-muted-foreground",
                  )}
                >
                  {formatRelativeUz(item.createdAt, locale)}
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </main>

      {/* ── QO'SHIMCHA YOZISH ─────────────────────────────────── */}
      {/* ⚠️ YOPILGAN MUROJAATGA YOZILMAYDI: javob berilgandan keyin
          yozilgan gap hech kimning navbatiga tushmasdi (server ham
          uni rad etadi). */}
      {!closed ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md safe-bottom">
          <div className="mx-auto max-w-lg">
            <Button
              full
              variant="secondary"
              icon={<MessageSquarePlus className="h-[18px] w-[18px]" />}
              onClick={() => setCommenting(true)}
            >
              {t("appeal.addInfo")}
            </Button>
          </div>
        </div>
      ) : null}

      <Sheet
        open={commenting}
        onClose={() => setCommenting(false)}
        title={t("appeal.addInfoTitle")}
      >
        <Textarea
          placeholder={t("appeal.addInfoPlaceholder")}
          value={draft}
          maxLength={1000}
          onChange={(event) => setDraft(event.target.value)}
          hint={t("appeal.addInfoHint")}
        />

        <Button
          full
          className="mt-4"
          icon={<Send className="h-[18px] w-[18px]" />}
          disabled={draft.trim().length < 2}
          pending={comment.isPending}
          onClick={() => {
            comment.mutate(draft.trim(), {
              onSuccess: () => {
                setDraft("");
                setCommenting(false);
              },
            });
          }}
        >
          {t("common.send")}
        </Button>
      </Sheet>

      {/* ── SURATNI KATTA KO'RISH ─────────────────────────────── */}
      {photo ? (
        <button
          type="button"
          aria-label={t("common.close")}
          onClick={() => setPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      ) : null}

      {/* ── XARITA ────────────────────────────────────────────── */}
      {data.lat !== null && data.lng !== null ? (
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="h-40 overflow-hidden rounded-2xl shadow-card">
            <MapView
              className="h-full w-full"
              center={[data.lat, data.lng]}
              zoom={16}
              markers={[{ id: data.id, lat: data.lat, lng: data.lng, color }]}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
