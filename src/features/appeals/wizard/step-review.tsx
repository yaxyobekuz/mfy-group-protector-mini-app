"use client";

/**
 * 5-QADAM: AI TAHLILI VA TASDIQLASH.
 *
 * ── NIMA UCHUN BU DOKTRINANI BUZMAYDI ─────────────────────────────────
 *
 * ⚠️ "SIGNAL — MUAMMO EMAS" qoidasi AI ning TAXMINI rasmiy
 * navbatga TEKSHIRILMASDAN tushishiga qarshi. Bu yerda esa
 * muammo borligini AI emas, FUQARONING O'ZI aytyapti; AI faqat
 * YO'NALISHNI taklif qiladi va taklifni fuqaro SHU EKRANDA
 * tasdiqlaydi. Odam qarori oqimdan chiqib ketmaydi — u panel
 * xodimidan fuqaroning o'ziga ko'chadi.
 *
 * ⚠️ AI YIQILSA EKRAN BARIBIR KO'RINADI: taklif — qulaylik,
 * talab emas. Fuqaro yo'nalishni 1-qadamda allaqachon tanlagan.
 *
 * ⚠️ TAKLIF AVTOMATIK QO'LLANMAYDI: u TUGMA bo'lib ko'rinadi
 * ("Taklifni qabul qilish"). Avtomatik almashtirilsa, fuqaro
 * tanlagan yo'nalish ko'z oldida jimgina o'zgarib, u buni
 * sezmasdi.
 */

import { Building2, Check, Clock, MapPin, Sparkles } from "lucide-react";

import type { Category, AnalysisResponse } from "@/shared/api/types";
import { categoryColor, categoryIcon } from "@/shared/config/icons";
import { slaLabel } from "@/shared/config/labels";
import { cn } from "@/shared/lib/cn";
import { haptic } from "@/shared/lib/telegram";
import { Spinner } from "@/shared/ui/states";
import type { WizardFile } from "./wizard-state";

interface Props {
  category: Category | undefined;
  files: WizardFile[];
  address: string;
  body: string;
  analysis: AnalysisResponse | null;
  analyzing: boolean;
  onAcceptSuggestion: (categoryId: string) => void;
}

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2.5">
    <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <span className="mt-0.5 block text-[14px] font-medium leading-snug">{value}</span>
    </span>
  </div>
);

export const StepReview = ({
  category,
  files,
  address,
  body,
  analysis,
  analyzing,
  onAcceptSuggestion,
}: Props) => {
  const Icon = categoryIcon(category?.icon);
  const color = categoryColor(category?.color);

  const suggestion = analysis?.suggestion ?? null;
  // ⚠️ "BOSHQA YO'NALISH TAKLIF QILINDI" HOLATI ALOHIDA: taklif
  // fuqaro tanlagani bilan bir xil bo'lsa, uni ko'rsatish
  // ortiqcha shovqin bo'lardi.
  const differs = Boolean(suggestion && suggestion.categoryId !== category?.id);

  return (
    <div className="space-y-4">
      {/* ── TAHLIL NATIJASI ───────────────────────────────────── */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[13px] font-semibold leading-tight">
              Tahlil natijasi
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {analyzing
                ? "Tekshirilmoqda…"
                : suggestion
                  ? "Muammo turi avtomatik aniqlandi"
                  : "Siz tanlagan yo'nalish qo'llanadi"}
            </span>
          </span>

          {analyzing ? <Spinner className="ml-auto h-4 w-4" /> : null}
        </div>

        {/* Birinchi surat — "nima yuborilyapti" ni ko'rsatadi. */}
        {files[0] ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
            {files[0].kind === "video" ? (
              <video
                src={files[0].url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={files[0].url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ) : null}

        <div className="divide-y divide-border/60 px-4">
          {/* ── ANIQLANGAN YO'NALISH ──────────────────────────── */}
          <div className="flex items-center gap-3 py-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}1f`, color }}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-muted-foreground">
                Aniqlangan muammo
              </span>
              <span className="mt-0.5 block truncate text-[14px] font-semibold">
                {category?.name ?? "—"}
              </span>
            </span>

            {suggestion && !differs ? (
              /* ⚠️ FOIZ FAQAT TAKLIF FUQARO TANLOVI BILAN MOS
                 KELGANDA KO'RSATILADI: mos kelmaganda u
                 "tizim sizdan yaxshiroq biladi" degan ma'noni
                 berib, tanlovni shubha ostiga qo'yardi. */
              <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold tabular-nums text-success">
                {suggestion.confidence}%
              </span>
            ) : null}
          </div>

          <Row
            icon={<MapPin className="h-4 w-4" />}
            label="Joylashuv"
            value={address.trim() || "Ko'rsatilmagan"}
          />

          <Row
            icon={<Building2 className="h-4 w-4" />}
            label="Mas'ul tashkilot"
            value={category?.orgName ?? "Viloyat shtabi"}
          />

          <Row
            icon={<Clock className="h-4 w-4" />}
            label="Taxminiy javob muddati"
            value={category ? slaLabel(category.slaHours) : "—"}
          />
        </div>
      </section>

      {/* ── BOSHQA YO'NALISH TAKLIFI ──────────────────────────── */}
      {differs && suggestion ? (
        <section className="rounded-2xl border border-primary/30 bg-accent/40 p-4">
          <p className="text-[13px] leading-relaxed">
            Tizim bu murojaat{" "}
            <strong className="font-semibold">{suggestion.categoryName}</strong>{" "}
            yo&apos;nalishiga ko&apos;proq mos deb hisoblaydi (
            <span className="tabular-nums">{suggestion.confidence}%</span>).
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.select();
                onAcceptSuggestion(suggestion.categoryId);
              }}
              className={cn(
                "btn-base flex-1 bg-primary text-primary-foreground",
                "min-h-[2.5rem] px-3 text-[13px]",
              )}
            >
              <Check className="h-4 w-4" />
              Taklifni qabul qilish
            </button>

            <span className="flex-1 self-center text-center text-[12px] text-muted-foreground">
              yoki o&apos;z tanlovingizda qoling
            </span>
          </div>
        </section>
      ) : null}

      {/* ── MATN ──────────────────────────────────────────────── */}
      <section className="card p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Murojaat matni
        </h3>
        {/* ⚠️ `whitespace-pre-wrap`: fuqaro qatorlarga bo'lib
            yozgan bo'lishi mumkin va uni bitta uzun paragrafga
            aylantirish matnni o'qib bo'lmaydigan qilardi. */}
        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">{body}</p>
      </section>

      {files.length > 1 ? (
        <section className="card p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Biriktirilgan fayllar ({files.length})
          </h3>

          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="aspect-square overflow-hidden rounded-lg bg-muted"
              >
                {file.kind === "video" ? (
                  <video
                    src={file.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
