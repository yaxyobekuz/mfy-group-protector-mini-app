"use client";

/**
 * TIL TANLASH.
 *
 * ⚠️ PROFILDA, ALOHIDA SAHIFADA EMAS: til bir marta tanlanadigan
 * sozlama va unga pastki menyuda joy ajratish har kungi amallar
 * (xarita, yangiliklar) bilan teng og'irlik berardi.
 *
 * ⚠️ TANLANGANDAN KEYIN OYNA DARHOL YOPILADI va "saqlash" tugmasi
 * YO'Q: natija butun ekranda bir zumda ko'rinadi, ya'ni tasdiq
 * tugmasi hech qanday ma'lumot qo'shmasdi.
 */

import { Check, Languages } from "lucide-react";
import { useState } from "react";

import { LOCALES, LOCALE_DEFS } from "@/shared/config/locales";
import { cn } from "@/shared/lib/cn";
import { useLocale } from "@/shared/lib/i18n";
import { haptic } from "@/shared/lib/telegram";
import { Sheet } from "@/shared/ui/sheet";

export const LanguagePicker = () => {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          haptic.tap();
          setOpen(true);
        }}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <Languages className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] text-muted-foreground">
            {t("language.title")}
          </span>
          <span className="mt-0.5 block truncate text-[14px] font-medium">
            {LOCALE_DEFS[locale].nativeName}
          </span>
        </span>

        <span className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-[11px] font-bold text-muted-foreground">
          {LOCALE_DEFS[locale].short}
        </span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("language.pick")}>
        <div className="space-y-1.5">
          {LOCALES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                haptic.select();
                setLocale(item);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] transition active:scale-[0.99]",
                locale === item
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "bg-secondary/50",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                    locale === item
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground",
                  )}
                >
                  {LOCALE_DEFS[item].short}
                </span>
                {LOCALE_DEFS[item].nativeName}
              </span>

              {locale === item ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
};
