"use client";

/**
 * 4-QADAM: TAVSIF VA QO'SHIMCHA BELGILAR.
 *
 * ⚠️ UCHALA BELGI — "HA/YO'Q", OG'IRLIK BALLI EMAS. Fuqaro belgisi
 * TAXMIN va undan avtomatik ustuvorlik chiqarish "shoshilinch"
 * tugmasini har kim bosadigan holatga olib kelardi. Panelda ular
 * faqat KO'RSATILADI; ustuvorlikni xodim qo'yadi
 * (`server/.../mobile.service.ts` izohi).
 *
 * ⚠️ "MUAMMO QACHON SODIR BO'LDI" `createdAt` DAN BOSHQA: murojaat
 * bugun yuborilgan bo'lishi, muammo esa bir oy avval boshlangan
 * bo'lishi mumkin.
 */

import { AlertTriangle, CalendarClock, History, RotateCcw } from "lucide-react";

import { BODY_MIN, BODY_SOFT_MAX, BODY_MAX } from "@/shared/config/limits";
import { Textarea, Toggle } from "@/shared/ui/field";
import { useT } from "@/shared/lib/i18n";

interface Props {
  body: string;
  isHazard: boolean;
  isLongStanding: boolean;
  isRepeatAppeal: boolean;
  occurredAt: string;
  onChange: (patch: {
    body?: string;
    isHazard?: boolean;
    isLongStanding?: boolean;
    isRepeatAppeal?: boolean;
    occurredAt?: string;
  }) => void;
}

export const StepDetails = ({
  body,
  isHazard,
  isLongStanding,
  isRepeatAppeal,
  occurredAt,
  onChange,
}: Props) => {
  const t = useT();
  const tooShort = body.trim().length > 0 && body.trim().length < BODY_MIN;

  return (
    <div className="space-y-5">
      <Textarea
        placeholder={t("details.placeholder")}
        value={body}
        // ⚠️ `maxLength` SERVER CHEGARASIDA (2000), sanoqchi esa
        // 500 da (`limits.ts` izohi): yozilgan matnni kesib
        // tashlash fuqaroning gapini yo'qotardi.
        maxLength={BODY_MAX}
        softMax={BODY_SOFT_MAX}
        onChange={(event) => onChange({ body: event.target.value })}
        hint={
          tooShort
            ? t("details.tooShort", { count: BODY_MIN })
            : t("details.hint")
        }
        className="min-h-[9rem]"
      />

      {/* ── QO'SHIMCHA BELGILAR ───────────────────────────────── */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-semibold">
          {t("details.extra")}
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({t("common.optional").toLowerCase()})
          </span>
        </h3>

        <Toggle
          label={t("details.hazard")}
          hint={t("details.hazardHint")}
          icon={<AlertTriangle className="h-5 w-5" />}
          checked={isHazard}
          onChange={(next) => onChange({ isHazard: next })}
        />

        <Toggle
          label={t("details.longStanding")}
          icon={<History className="h-5 w-5" />}
          checked={isLongStanding}
          onChange={(next) => onChange({ isLongStanding: next })}
        />

        <Toggle
          label={t("details.repeat")}
          hint={t("details.repeatHint")}
          icon={<RotateCcw className="h-5 w-5" />}
          checked={isRepeatAppeal}
          onChange={(next) => onChange({ isRepeatAppeal: next })}
        />
      </section>

      {/* ── SODIR BO'LGAN VAQT ────────────────────────────────── */}
      <label className="block space-y-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          {t("details.occurredAt")}
        </span>

        {/*
          ⚠️ `datetime-local` — BRAUZERNING O'Z TANLAGICHI, o'zimiz
          yozgan taqvim EMAS: telefonda tizim tanlagichi o'sha
          qurilmaning odatiy ko'rinishida chiqadi va foydalanuvchi
          uni allaqachon biladi.

          ⚠️ QIYMAT MAHALLIY VAQTDA KELADI (zonasiz) va u serverga
          yuborishdan oldin ISO'ga aylantiriladi (`wizard.tsx`).
        */}
        <input
          type="datetime-local"
          value={occurredAt}
          // ⚠️ KELAJAK TAQIQLANADI: muammo hali sodir bo'lmagan
          // bo'lsa, u haqda murojaat yozib bo'lmaydi.
          max={new Date().toISOString().slice(0, 16)}
          onChange={(event) => onChange({ occurredAt: event.target.value })}
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        <span className="block text-xs text-muted-foreground">
          {t("details.occurredAtHint")}
        </span>
      </label>
    </div>
  );
};
