"use client";

/**
 * KIRITISH MAYDONLARI.
 *
 * ⚠️ `font-size: 16px` GLOBAL CSS'DA MAJBURLANGAN (`globals.css`):
 * iOS Safari undan kichik maydonga fokus tushganda sahifani
 * AVTOMATIK kattalashtiradi va qaytmaydi.
 */

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { cn } from "../lib/cn";
import { haptic } from "../lib/telegram";

const BASE =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground " +
  "placeholder:text-muted-foreground/70 outline-none transition " +
  "focus:border-primary focus:ring-4 focus:ring-primary/10";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

export const Field = ({ label, hint, error, icon, className, ...props }: FieldProps) => (
  <label className="block space-y-1.5">
    {label ? <span className="text-sm font-medium">{label}</span> : null}

    <span className="relative block">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <input
        className={cn(BASE, icon && "pl-11", error && "border-destructive", className)}
        {...props}
      />
    </span>

    {error ? (
      <span className="block text-xs text-destructive">{error}</span>
    ) : hint ? (
      <span className="block text-xs text-muted-foreground">{hint}</span>
    ) : null}
  </label>
);

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  /** Sanoqchi uchun — `maxLength` dan ALOHIDA (`limits.ts` izohi). */
  softMax?: number;
}

export const Textarea = ({
  label,
  hint,
  softMax,
  className,
  value,
  ...props
}: TextareaProps) => {
  const length = typeof value === "string" ? value.length : 0;
  // ⚠️ CHEGARA OSHGANDA MAYDON BLOKLANMAYDI, FAQAT SANOQCHI
  // QIZARADI (`limits.ts` izohi): yozilgan matnni kesib tashlash
  // fuqaroning gapini yo'qotardi.
  const over = softMax !== undefined && length > softMax;

  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-sm font-medium">{label}</span> : null}

      <textarea
        className={cn(BASE, "min-h-[7rem] resize-none leading-relaxed", className)}
        value={value}
        {...props}
      />

      <span className="flex items-center justify-between gap-3">
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : <span />}
        {softMax !== undefined ? (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              over ? "font-semibold text-warning" : "text-muted-foreground",
            )}
          >
            {length}/{softMax}
          </span>
        ) : null}
      </span>
    </label>
  );
};

interface ToggleProps {
  label: string;
  hint?: string;
  icon?: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
}

/**
 * ⚠️ `<input type="checkbox">` USTIGA QURILGAN, `div` EMAS:
 * klaviatura bilan boshqarish va ekran o'quvchisi uchun shu kerak.
 * Toza `div` + `onClick` "nima bu" degan savolga javob bermaydi.
 */
export const Toggle = ({ label, hint, icon, checked, onChange }: ToggleProps) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3.5">
    {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}

    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-medium leading-tight">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </span>

    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={(event) => {
        haptic.select();
        onChange(event.target.checked);
      }}
    />

    <span
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-6" : "left-1",
        )}
      />
    </span>
  </label>
);
