"use client";

/**
 * TELEFON TALABI — SEHRGARDAN OLDIN.
 *
 * ── NIMA UCHUN OLDIN, OXIRIDA EMAS ────────────────────────────────────
 *
 * ⚠️ SERVER TELEFONSIZ MUROJAATNI RAD ETADI
 * (`mobile.service.ts#create`). Agar raqam OXIRGI qadamda so'ralsa,
 * fuqaro besh qadamni to'ldirib, surat qo'yib, joyini belgilab
 * bo'lgandan keyin to'siqqa urilardi — ko'pchilik o'sha yerda
 * tashlab ketadi.
 *
 * ── NIMA UCHUN ALOHIDA EKRAN, SEHRGAR QADAMI EMAS ─────────────────────
 *
 * ⚠️ QADAM QO'SHILSA, U HAMMAGA KO'RINARDI — raqami allaqachon bor
 * fuqaroga ham ("6 qadamdan 1-si: telefon"). Bu esa qayta murojaat
 * yozayotgan odamni har safar ortiqcha ekrandan o'tkazardi.
 *
 * ⚠️ SHUNING UCHUN BU — SHART: raqam bo'lsa, ekran UMUMAN
 * ko'rsatilmaydi va sehrgar odatdagidek ochiladi.
 *
 * ── TALAB SERVERDAN KELADI ────────────────────────────────────────────
 *
 * ⚠️ `phoneNeeded` ILOVADA HISOBLANMAYDI: u `Settings.requirePhone`
 * sozlamasiga bog'liq va panelda o'zgarishi mumkin. Ilovada qotib
 * qolsa, sozlama o'chirilgandan keyin ham ekran chiqib turardi.
 */

import { Phone } from "lucide-react";
import { useState } from "react";

import { useSession } from "@/entities/session/session-provider";
import { useUpdateProfile } from "@/features/profile/api";
import { useT } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

/**
 * ⚠️ TEKSHIRUV SERVERDA (`common/phone.ts`): bu yerda faqat ENG
 * QO'POL filtr — tugma bo'sh maydonda bosilmasligi uchun. Ikkinchi
 * nusxa yozilsa, ikkisi albatta ajralib ketardi va ilova qabul
 * qilgan raqam serverda rad etilardi.
 */
const MIN_DIGITS = 9;

export const PhoneGate = ({ onDone }: { onDone: () => void }) => {
  const { citizen, refetch } = useSession();
  const update = useUpdateProfile();
  const t = useT();

  const [phone, setPhone] = useState(citizen.phone ?? "");

  const digits = phone.replace(/\D/g, "").length;
  const canSave = digits >= MIN_DIGITS;

  const save = () => {
    update.mutate(
      { phone: phone.trim() },
      {
        onSuccess: () => {
          /**
           * ⚠️ PROFIL QAYTA O'QILADI: `phoneNeeded` SERVERDA
           * hisoblanadi va keshdagi eski qiymat qolsa, ekran
           * saqlangandan keyin ham ochiq turardi.
           */
          void refetch();
          onDone();
        },
      },
    );
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-6 px-4 safe-top">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Phone className="h-7 w-7" />
        </span>

        <h1 className="text-[21px] font-bold leading-tight">{t("phoneGate.title")}</h1>
        <p className="text-[14px] leading-snug text-muted-foreground">
          {t("phoneGate.hint")}
        </p>
      </div>

      <Field
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        placeholder={t("phoneGate.placeholder")}
        onChange={(event) => setPhone(event.target.value)}
      />

      <Button disabled={!canSave || update.isPending} onClick={save}>
        {t("phoneGate.save")}
      </Button>
    </div>
  );
};
