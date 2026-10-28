"use client";

/**
 * PROFIL.
 *
 * ⚠️ "CHIQISH" TUGMASI YO'Q: fuqaro Telegram hisobi bilan kirgan
 * va chiqish uni darhol QAYTA kiritardi (ilova ochilishi bilan
 * avtomatik kiradi). Bunday tugma faqat chalkashlik tug'dirardi.
 *
 * ⚠️ ISM VA RASM TAHRIRLANMAYDI: ular TELEGRAM'dan keladi va har
 * kirishda qayta yoziladi (`mobile-auth.service.ts#upsertAndIssue`).
 * Ilovada tahrirlash tugmasi qo'yilsa, kiritilgan ism keyingi
 * ochishda jimgina yo'qolardi.
 */

import { Award, FileText, MapPin, Phone, Save } from "lucide-react";
import { useMemo, useState } from "react";

import { useSession } from "@/entities/session/session-provider";
import { useTerritory } from "@/features/appeals/api";
import { useUpdateProfile } from "@/features/profile/api";
import { LanguagePicker } from "@/features/profile/language-picker";
import { fileUrl } from "@/shared/api/client";
import { cn } from "@/shared/lib/cn";
import { useLocale } from "@/shared/lib/i18n";
import { formatDateUz } from "@/shared/lib/date";
import { haptic } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Sheet } from "@/shared/ui/sheet";
import { BottomNav } from "@/widgets/bottom-nav/bottom-nav";
import { PageHeader } from "@/widgets/page-header/page-header";

export default function ProfilePage() {
  const { citizen } = useSession();
  const territory = useTerritory();
  const update = useUpdateProfile();
  const { locale, t } = useLocale();

  const [phone, setPhone] = useState(citizen.phone ?? "");
  const [picking, setPicking] = useState<"district" | "mahalla" | null>(null);

  const photo = fileUrl(citizen.photoUrl);
  const fullName = [citizen.firstName, citizen.lastName].filter(Boolean).join(" ");

  const mahallas = useMemo(
    () =>
      (territory.data?.mahallas ?? []).filter(
        (mahalla) => mahalla.districtId === citizen.districtId,
      ),
    [territory.data, citizen.districtId],
  );

  const phoneChanged = phone.trim() !== (citizen.phone ?? "").trim();

  return (
    <div className="min-h-screen pb-nav">
      <PageHeader title={t("profile.title")} />

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {/* ── SHAXS ─────────────────────────────────────────── */}
        <section className="card flex items-center gap-3.5 p-4">
          {photo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photo}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
              {citizen.firstName.charAt(0)}
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[17px] font-bold">{fullName}</span>
            {citizen.username ? (
              <span className="block truncate text-[12px] text-muted-foreground">
                @{citizen.username}
              </span>
            ) : null}
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {t("profile.since", { date: formatDateUz(citizen.createdAt, locale) })}
            </span>
          </span>
        </section>

        {/* ── SANOQLAR ──────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-2.5">
          {[
            { value: citizen.stats.total, label: t("profile.stat.appeals"), icon: FileText },
            { value: citizen.stats.resolved, label: t("profile.stat.resolved"), icon: FileText },
            { value: citizen.points, label: t("profile.stat.points"), icon: Award },
          ].map((item, index) => (
            <div key={index} className="card p-3 text-center">
              <p className="text-[20px] font-bold leading-none tabular-nums">
                {item.value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        {/* ── HUDUD ─────────────────────────────────────────── */}
        <section className="card divide-y divide-border/60">
          <button
            type="button"
            onClick={() => {
              haptic.tap();
              setPicking("district");
            }}
            className="flex w-full items-center gap-3 p-4 text-left"
          >
            <MapPin className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-muted-foreground">
                {t("location.district")}
              </span>
              <span className="mt-0.5 block truncate text-[14px] font-medium">
                {citizen.districtName ?? t("common.notSelected")}
              </span>
            </span>
          </button>

          <button
            type="button"
            disabled={!citizen.districtId}
            onClick={() => {
              haptic.tap();
              setPicking("mahalla");
            }}
            className="flex w-full items-center gap-3 p-4 text-left disabled:opacity-50"
          >
            <MapPin className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-muted-foreground">
                {t("location.mahalla")}
              </span>
              <span className="mt-0.5 block truncate text-[14px] font-medium">
                {citizen.mahallaName ?? t("common.notSelected")}
              </span>
            </span>
          </button>
        </section>

        {/* ── TIL ───────────────────────────────────────────── */}
        <section className="card">
          <LanguagePicker />
        </section>

        {/* ── TELEFON ───────────────────────────────────────── */}
        <section className="card space-y-3 p-4">
          <Field
            label={t("profile.phone")}
            placeholder="+998 __ ___ __ __"
            value={phone}
            inputMode="tel"
            maxLength={32}
            onChange={(event) => setPhone(event.target.value)}
            icon={<Phone className="h-4 w-4" />}
            hint={t("profile.phoneHint")}
          />

          {phoneChanged ? (
            <Button
              full
              icon={<Save className="h-[18px] w-[18px]" />}
              pending={update.isPending}
              onClick={() => update.mutate({ phone: phone.trim() })}
            >
              {t("common.save")}
            </Button>
          ) : null}
        </section>
      </main>

      {/* ── HUDUD TANLASH ─────────────────────────────────────── */}
      <Sheet
        open={picking === "district"}
        onClose={() => setPicking(null)}
        title={t("location.pickDistrict")}
        tall
      >
        <div className="space-y-1.5">
          {(territory.data?.districts ?? []).map((district) => (
            <button
              key={district.id}
              type="button"
              onClick={() => {
                haptic.select();
                // ⚠️ MFY TOZALANADI: eski MFY yangi tumanga
                // tegishli emas va server uni rad etardi.
                update.mutate({ districtId: district.id });
                setPicking(null);
              }}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-left text-[15px]",
                citizen.districtId === district.id
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "bg-secondary/50",
              )}
            >
              {district.name}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={picking === "mahalla"}
        onClose={() => setPicking(null)}
        title={t("location.pickMahalla")}
        tall
      >
        <div className="space-y-1.5">
          {mahallas.map((mahalla) => (
            <button
              key={mahalla.id}
              type="button"
              onClick={() => {
                haptic.select();
                update.mutate({ mahallaId: mahalla.id });
                setPicking(null);
              }}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-left text-[15px]",
                citizen.mahallaId === mahalla.id
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "bg-secondary/50",
              )}
            >
              {mahalla.name}
            </button>
          ))}
        </div>
      </Sheet>

      <BottomNav />
    </div>
  );
}
