"use client";

/**
 * MUROJAAT YUBORILDI.
 *
 * ⚠️ RAQAM ENG KATTA VA NUSXALANADIGAN: fuqaro uni yozib olishi
 * yoki qo'llab-quvvatlashga aytishi kerak bo'ladi va qo'lda
 * ko'chirish 13 ta belgida albatta xato bilan tugardi.
 *
 * ⚠️ "ORQAGA" TUGMASI YO'Q: bu ekrandan sehrgarga qaytish
 * ma'nosiz — murojaat allaqachon yuborilgan va qaytgan fuqaro uni
 * IKKINCHI marta yuborardi. Ikki yo'l bor: holatni kuzatish yoki
 * bosh sahifa.
 */

import { Check, Clock, Copy, FileText, Home, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { CreatedAppeal } from "@/shared/api/types";
import { slaLabel } from "@/shared/config/labels";
import { formatDateTimeUz } from "@/shared/lib/date";
import { haptic } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";

export const SuccessScreen = ({ appeal }: { appeal: CreatedAppeal }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    haptic.tap();

    try {
      /**
       * ⚠️ `navigator.clipboard` TELEGRAM ICHIDA RAD ETILISHI
       * MUMKIN (xavfsiz kontekst va ruxsat talabi) va xato
       * ushlanmasa, bosilgan tugma hech narsa qilmagandek
       * ko'rinardi.
       */
      await navigator.clipboard.writeText(appeal.publicNo);
      setCopied(true);
      toast.success("Raqam nusxalandi");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nusxalab bo'lmadi — raqamni yozib oling");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-5 pt-14 safe-top">
        {/* ── BELGI ───────────────────────────────────────────── */}
        <div className="animate-scale-in flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lift">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>

        <h1 className="animate-fade-up mt-5 text-center text-[24px] font-bold leading-tight">
          Murojaat muvaffaqiyatli
          <br />
          yuborildi!
        </h1>

        <p className="animate-fade-up mt-2.5 max-w-[20rem] text-center text-[14px] leading-relaxed text-muted-foreground">
          Sizning murojaatingiz ro&apos;yxatga olindi va mas&apos;ul tashkilotga
          yo&apos;naltirildi.
        </p>

        {/* ── RAQAM ───────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => void copy()}
          className="animate-fade-up card mt-6 flex w-full items-center gap-3 p-4 text-left transition active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {copied ? (
              <Check className="h-5 w-5" strokeWidth={3} />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted-foreground">
              Murojaat raqami
            </span>
            <span className="block text-[18px] font-bold tabular-nums">
              {appeal.publicNo}
            </span>
          </span>

          <Copy className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        </button>

        {/* ── TAFSILOTLAR ─────────────────────────────────────── */}
        <section className="animate-fade-up card mt-3 w-full divide-y divide-border/60 px-4">
          <div className="flex items-start gap-3 py-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-[11px] text-muted-foreground">
                Muammo turi
              </span>
              <span className="mt-0.5 block text-[14px] font-medium">
                {appeal.categoryName}
              </span>
            </span>
          </div>

          {appeal.address ? (
            <div className="flex items-start gap-3 py-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-[11px] text-muted-foreground">
                  Joylashuv
                </span>
                <span className="mt-0.5 block text-[14px] font-medium">
                  {appeal.address}
                </span>
              </span>
            </div>
          ) : null}

          <div className="flex items-start gap-3 py-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-[11px] text-muted-foreground">
                Taxminiy javob muddati
              </span>
              <span className="mt-0.5 block text-[14px] font-medium">
                {slaLabel(appeal.slaHours)}
                {appeal.dueAt ? (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    ({formatDateTimeUz(appeal.dueAt)})
                  </span>
                ) : null}
              </span>
            </span>
          </div>
        </section>
      </main>

      {/* ── TUGMALAR ──────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-lg space-y-2 px-5 pb-6 pt-6 safe-bottom">
        <Button
          full
          size="lg"
          onClick={() => router.replace(`/appeals/detail?id=${appeal.id}`)}
        >
          Murojaat holatini kuzatish
        </Button>

        <Button
          full
          variant="ghost"
          icon={<Home className="h-[18px] w-[18px]" />}
          onClick={() => router.replace("/")}
        >
          Bosh sahifaga qaytish
        </Button>
      </div>
    </div>
  );
};
