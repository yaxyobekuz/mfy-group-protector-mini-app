"use client";

/**
 * SEHRGAR QOBIG'I — besh qadam, bitta holat.
 *
 * ⚠️ HAR QADAM ALOHIDA SAHIFA (`/new/1`, `/new/2`) EMAS, BITTA
 * KOMPONENT: holat URL orasida uzatilishi kerak bo'lardi yoki
 * global do'konda saqlanardi, va "orqaga" bosilganda brauzer
 * tarixi ilovaning o'z tarixi bilan chalkashardi.
 *
 * ⚠️ ORQAGA — TELEGRAM TUGMASI ORQALI (`showBackButton`): fuqaro
 * Telegram ichidagi barcha ilovalarda shu tugmani bosishga
 * o'rgangan. Ekranga ikkinchi "orqaga" chizish qaysi biri nima
 * qilishini noaniq qilardi.
 *
 * ⚠️ SEHRGARNI TASHLAB CHIQISH TASDIQ SO'RAYDI: to'rtta qadam
 * to'ldirib, tasodifan chiqib ketish hamma narsani yo'qotardi.
 * Qoralama saqlanadi, lekin fuqaro buni bilmaydi — shuning uchun
 * baribir so'raladi.
 */

import { ArrowRight, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCategories, useAnalyze, useCreateAppeal } from "@/features/appeals/api";
import { BODY_MIN, MAX_ATTACHMENTS } from "@/shared/config/limits";
import { WIZARD_STEPS } from "@/shared/config/labels";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/lib/i18n";
import { haptic, showBackButton } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";
import { Sheet } from "@/shared/ui/sheet";
import { StepCategory } from "./step-category";
import { StepDetails } from "./step-details";
import { StepLocation } from "./step-location";
import { StepMedia } from "./step-media";
import { StepReview } from "./step-review";
import { SuccessScreen } from "./success-screen";
import {
  EMPTY_STATE,
  clearDraft,
  hasContent,
  loadDraft,
  saveDraft,
  type WizardState,
} from "./wizard-state";
import type { CreatedAppeal } from "@/shared/api/types";

const LAST_STEP = WIZARD_STEPS.length - 1;

export const Wizard = () => {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(EMPTY_STATE);
  const [confirmExit, setConfirmExit] = useState(false);
  const [created, setCreated] = useState<CreatedAppeal | null>(null);
  const t = useT();

  const categories = useCategories();
  const analyze = useAnalyze();
  const create = useCreateAppeal();

  const patch = useCallback(
    (next: Partial<WizardState>) => setState((prev) => ({ ...prev, ...next })),
    [],
  );

  // ── QORALAMANI TIKLASH ───────────────────────────────────────
  useEffect(() => {
    const draft = loadDraft();
    if (draft) setState(draft);
  }, []);

  /**
   * ⚠️ QORALAMA HAR O'ZGARISHDA SAQLANADI, "saqlash" tugmasi
   * bilan emas: fuqaro bunday tugmani bosmaydi va ilova
   * kutilmaganda yopilganda qoralama baribir kerak bo'ladi.
   *
   * ⚠️ YUBORILGANDAN KEYIN SAQLANMAYDI (`created` tekshiruvi):
   * aks holda muvaffaqiyat ekranida turib, qoralama yana
   * yozilardi va keyingi safar yarim to'ldirilgan shakl
   * ochilardi.
   */
  useEffect(() => {
    if (created) return;
    if (hasContent(state)) saveDraft(state);
  }, [state, created]);

  const category = useMemo(
    () => categories.data?.find((item) => item.id === state.categoryId),
    [categories.data, state.categoryId],
  );

  // ── QADAM O'TISH SHARTLARI ───────────────────────────────────
  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(state.categoryId);
      // ⚠️ SURAT VA JOY MAJBURIY EMAS: ularni talab qilish
      // suratga ololmagan yoki joyni bilmagan fuqaroni
      // butunlay to'xtatardi.
      case 1:
      case 2:
        return true;
      case 3:
        return state.body.trim().length >= BODY_MIN;
      default:
        return true;
    }
  }, [step, state]);

  const exit = useCallback(() => {
    if (hasContent(state) && !created) {
      setConfirmExit(true);
      return;
    }
    router.replace("/");
  }, [state, created, router]);

  const goBack = useCallback(() => {
    if (step === 0) {
      exit();
      return;
    }
    haptic.tap();
    setStep((prev) => prev - 1);
  }, [step, exit]);

  /**
   * ⚠️ TELEGRAM "ORQAGA" TUGMASI HAR QADAMDA QAYTA BOG'LANADI:
   * tutqich `step` ni yopib oladi (closure) va bir marta
   * bog'lansa, u har doim birinchi qadamga qaytarardi.
   */
  useEffect(() => {
    if (created) return;
    return showBackButton(goBack);
  }, [goBack, created]);

  // ── AI TAHLILI — 4-QADAMDAN 5-GA O'TISHDA ───────────────────
  /**
   * ⚠️ TAHLIL BIR MARTA ISHGA TUSHADI: foydalanuvchi 5-qadamdan
   * orqaga qaytib, yana oldinga kelsa, yangi AI so'rovi ketardi —
   * ya'ni har "orqaga-oldinga" pul sarflardi.
   */
  const analyzedFor = useRef<string | null>(null);

  const next = async () => {
    if (step < LAST_STEP) {
      haptic.tap();
      const target = step + 1;
      setStep(target);

      if (target === LAST_STEP) {
        const body = state.body.trim();

        if (analyzedFor.current !== body) {
          analyzedFor.current = body;
          try {
            const result = await analyze.mutateAsync(body);
            patch({ analysis: result });
          } catch {
            // ⚠️ JIM: taklif qulaylik va usiz ham davom etiladi
            // (`api.ts#useAnalyze` izohi).
            patch({ analysis: null });
          }
        }
      }
      return;
    }

    // ── YUBORISH ──────────────────────────────────────────────
    if (!state.categoryId) return;

    const result = await create.mutateAsync({
      categoryId: state.categoryId,
      body: state.body.trim(),
      districtId: state.districtId ?? undefined,
      mahallaId: state.mahallaId ?? undefined,
      lat: state.lat ?? undefined,
      lng: state.lng ?? undefined,
      address: state.address.trim() || undefined,
      isHazard: state.isHazard,
      isLongStanding: state.isLongStanding,
      isRepeatAppeal: state.isRepeatAppeal,
      // ⚠️ MAHALLIY VAQT ISO'GA AYLANTIRILADI: `datetime-local`
      // zonasiz qiymat beradi ("2026-10-19T14:30") va uni
      // shundayligicha yuborish serverda UTC deb o'qilib, sana
      // besh soatga siljib ketardi.
      occurredAt: state.occurredAt
        ? new Date(state.occurredAt).toISOString()
        : undefined,
      attachments: state.files.map((file) => file.token),
      analysisToken: state.analysis?.token ?? undefined,
    });

    clearDraft();
    setCreated(result);
  };

  // ── MUVAFFAQIYAT EKRANI ──────────────────────────────────────
  if (created) {
    return <SuccessScreen appeal={created} />;
  }

  const current = WIZARD_STEPS[step]!;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── SARLAVHA VA JARAYON ───────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md safe-top">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label={t("common.close")}
              onClick={exit}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* ⚠️ SANOQ RO'YXAT UZUNLIGIDAN HISOBLANADI
                (`labels.ts` izohi): qo'lda yozilsa, qadam
                qo'shilganda beshta joyni tuzatish kerak bo'lardi. */}
            <span className="text-[13px] font-semibold tabular-nums text-muted-foreground">
              {step + 1}/{WIZARD_STEPS.length}
            </span>
          </div>

          <h1 className="mt-3 text-[21px] font-bold leading-tight">
            {t(current.title)}
          </h1>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
            {t(current.hint)}
          </p>

          {/* Jarayon chizig'i — qadamlar soniga qarab. */}
          <div className="mt-3 flex gap-1.5">
            {WIZARD_STEPS.map((item, index) => (
              <span
                key={item.key}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  index <= step ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ── QADAM ─────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-40">
        {/* ⚠️ `key` QADAM BO'YICHA: usiz React eski qadamning
            DOM'ini qayta ishlatib, kiritish maydonlarida eski
            qiymat qolib ketardi. */}
        <div key={current.key} className="animate-slide-in">
          {step === 0 ? (
            <StepCategory
              value={state.categoryId}
              onChange={(categoryId) => patch({ categoryId })}
            />
          ) : null}

          {step === 1 ? (
            <StepMedia
              files={state.files}
              max={MAX_ATTACHMENTS}
              onChange={(files) => patch({ files })}
            />
          ) : null}

          {step === 2 ? (
            <StepLocation
              lat={state.lat}
              lng={state.lng}
              address={state.address}
              districtId={state.districtId}
              mahallaId={state.mahallaId}
              onChange={patch}
            />
          ) : null}

          {step === 3 ? (
            <StepDetails
              body={state.body}
              isHazard={state.isHazard}
              isLongStanding={state.isLongStanding}
              isRepeatAppeal={state.isRepeatAppeal}
              occurredAt={state.occurredAt}
              onChange={patch}
            />
          ) : null}

          {step === LAST_STEP ? (
            <StepReview
              category={category}
              files={state.files}
              address={state.address}
              body={state.body}
              analysis={state.analysis}
              analyzing={analyze.isPending}
              onAcceptSuggestion={(categoryId) => patch({ categoryId })}
            />
          ) : null}
        </div>
      </main>

      {/* ── PASTKI TUGMA ──────────────────────────────────────── */}
      {/*
        ⚠️ TUGMA `fixed`: uzun qadamda (tavsif, yo'nalishlar
        ro'yxati) u ekran ostida qolib ketardi va fuqaro "davom
        etish qayerda" deb ro'yxatni oxirigacha aylantirardi.
      */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto max-w-lg px-4 py-3">
          <Button
            full
            size="lg"
            disabled={!canContinue}
            pending={create.isPending}
            icon={
              step === LAST_STEP ? (
                <Send className="h-[18px] w-[18px]" />
              ) : undefined
            }
            onClick={() => void next()}
          >
            {step === LAST_STEP ? t("wizard.submit") : t("common.continue")}
            {step < LAST_STEP ? <ArrowRight className="h-[18px] w-[18px]" /> : null}
          </Button>
        </div>
      </div>

      {/* ── CHIQISH TASDIG'I ──────────────────────────────────── */}
      <Sheet
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title={t("wizard.exit.title")}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("wizard.exit.body")}
        </p>

        <div className="mt-5 space-y-2">
          <Button full variant="secondary" onClick={() => setConfirmExit(false)}>
            {t("common.continue")}
          </Button>
          <Button
            full
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              // ⚠️ QORALAMA O'CHIRILADI: foydalanuvchi "tashlab
              // ketaman" dedi va keyingi ochishda yarim
              // to'ldirilgan shaklni ko'rish "men buni
              // o'chirgandim-ku" degan savolni tug'dirardi.
              clearDraft();
              router.replace("/");
            }}
          >
            {t("wizard.exit.leave")}
          </Button>
        </div>
      </Sheet>
    </div>
  );
};
