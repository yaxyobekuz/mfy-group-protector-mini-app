"use client";

/**
 * BIRINCHI KIRISH — HUDUDNI TANLASH.
 *
 * ⚠️ NIMA UCHUN BU EKRAN BOR: murojaat to'g'ri MFY ga yo'nalishi uchun
 * fuqaroning hududi KERAK. Uni Profil'da ixtiyoriy qoldirsak, ko'p
 * fuqaro hech qachon to'ldirmasdi va murojaatlar "hududsiz" tushardi.
 * Shuning uchun BIRINCHI kirishda (hudud bo'sh bo'lsa) shu ekran
 * chiqadi va tuman + MFY tanlanmaguncha davom etilmaydi.
 *
 * ⚠️ FAQAT BIR MARTA: tanlangach `citizen.districtId`/`mahallaId`
 * serverda saqlanadi (`PATCH /mobile/me`) va keyingi ochishlarda bu
 * ekran UMUMAN chiqmaydi (`SessionProvider` tekshiruvi). Keyin
 * o'zgartirish Profil'da.
 *
 * ⚠️ IKKALASI HAM MAJBURIY: tuman tanlanmasa MFY ro'yxati ochilmaydi,
 * MFY tanlanmasa "Davom etish" o'chiq turadi.
 */

import { ArrowRight, Check, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import { useTerritory } from "@/features/appeals/api";
import { useUpdateProfile } from "@/features/profile/api";
import { cn } from "@/shared/lib/cn";
import { useT } from "@/shared/lib/i18n";
import { haptic } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";
import { LoadingBlock } from "@/shared/ui/states";

interface Props {
  firstName: string;
  /** Hudud saqlangach chaqiriladi (sessiyani yangilaydi). */
  onDone: () => void;
}

type Stage = "district" | "mahalla";

export const Onboarding = ({ firstName, onDone }: Props) => {
  const territory = useTerritory();
  const update = useUpdateProfile();
  const t = useT();

  const [stage, setStage] = useState<Stage>("district");
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [mahallaId, setMahallaId] = useState<string | null>(null);

  const districts = territory.data?.districts ?? [];
  const mahallas = useMemo(
    () => (territory.data?.mahallas ?? []).filter((m) => m.districtId === districtId),
    [territory.data, districtId],
  );

  if (territory.isLoading) {
    return <LoadingBlock label={t("onboarding.loading")} />;
  }

  const handleSave = () => {
    if (!districtId || !mahallaId) return;
    haptic.success();
    // ⚠️ IKKALASI BIRGA YUBORILADI: alohida yuborilsa, tuman saqlanib,
    // MFY yuborilmay qolsa holat yarim bo'lib qolardi.
    update.mutate(
      { districtId, mahallaId },
      {
        // Server to'liq profilni qaytaradi va `setQueryData` keshni
        // yangilaydi (`profile/api.ts`). `onDone` sessiyani qayta
        // o'qiydi — hudud endi bo'sh emas, ekran yopiladi.
        onSuccess: () => onDone(),
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background safe-top">
      {/* ── SARLAVHA ──────────────────────────────────────────── */}
      <header className="px-5 pb-4 pt-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MapPin className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-[22px] font-bold leading-tight">
          {t("onboarding.welcome", { name: firstName })}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {t("onboarding.body")}
        </p>

        {/* Ikki qadamli jarayon chizig'i. */}
        <div className="mt-4 flex gap-1.5">
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              stage === "mahalla" || mahallaId ? "bg-primary" : "bg-border",
            )}
          />
        </div>
      </header>

      {/* ── RO'YXAT ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pb-40">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {stage === "district"
            ? t("onboarding.pickDistrict")
            : t("onboarding.pickMahalla")}
        </p>

        <div className="space-y-1.5">
          {stage === "district"
            ? districts.map((district) => (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => {
                    haptic.select();
                    setDistrictId(district.id);
                    // Tuman o'zgarsa eski MFY bekor qilinadi.
                    setMahallaId(null);
                    setStage("mahalla");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] transition active:scale-[0.99]",
                    districtId === district.id
                      ? "bg-accent font-semibold text-accent-foreground"
                      : "bg-secondary/50",
                  )}
                >
                  {district.name}
                  {districtId === district.id ? <Check className="h-4 w-4" /> : null}
                </button>
              ))
            : mahallas.length > 0
              ? mahallas.map((mahalla) => (
                  <button
                    key={mahalla.id}
                    type="button"
                    onClick={() => {
                      haptic.select();
                      setMahallaId(mahalla.id);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] transition active:scale-[0.99]",
                      mahallaId === mahalla.id
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "bg-secondary/50",
                    )}
                  >
                    {mahalla.name}
                    {mahallaId === mahalla.id ? <Check className="h-4 w-4" /> : null}
                  </button>
                ))
              : (
                  <p className="rounded-xl bg-secondary/50 px-4 py-6 text-center text-[13px] text-muted-foreground">
                    {t("onboarding.noMahalla")}
                  </p>
                )}
        </div>

        {/* MFY bosqichida tumanni qayta tanlash. */}
        {stage === "mahalla" ? (
          <button
            type="button"
            onClick={() => {
              haptic.tap();
              setStage("district");
            }}
            className="mt-3 px-1 text-[13px] font-medium text-primary"
          >
            {t("onboarding.changeDistrict")}
          </button>
        ) : null}
      </main>

      {/* ── PASTKI TUGMA ──────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto max-w-lg px-4 py-3">
          <Button
            full
            size="lg"
            disabled={!districtId || !mahallaId}
            pending={update.isPending}
            icon={<ArrowRight className="h-[18px] w-[18px]" />}
            onClick={handleSave}
          >
            {t("common.continue")}
          </Button>
        </div>
      </div>
    </div>
  );
};
