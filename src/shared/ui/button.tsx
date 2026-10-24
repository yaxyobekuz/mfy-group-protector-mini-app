"use client";

/**
 * TUGMA.
 *
 * ⚠️ HAPTIK JAVOB TUGMANING O'ZIDA, chaqiruv joyida emas: har
 * `onClick` ichida `haptic.tap()` yozish kerak bo'lsa, amalda
 * yarmi unutilardi va ilova "ba'zan tebranadi" degan tartibsiz
 * taassurot qoldirardi.
 *
 * ⚠️ `pending` HOLATI KIRITILGAN: mobil tarmoqda so'rov 2–3 soniya
 * ketadi va ko'rsatkichsiz foydalanuvchi tugmani QAYTA bosadi —
 * natijada ikkita bir xil murojaat yuborilardi.
 */

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";
import { haptic } from "../lib/telegram";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  pending?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground shadow-card hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "bg-transparent text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  md: "min-h-[3rem] px-5 text-[15px]",
  lg: "min-h-[3.5rem] px-6 text-base",
};

export const Button = ({
  variant = "primary",
  size = "md",
  pending = false,
  full = false,
  icon,
  className,
  children,
  disabled,
  onClick,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    // ⚠️ `pending` HAM O'CHIRADI: aks holda ko'rsatkich aylanayotgan
    // paytda ikkinchi bosish o'tib ketardi.
    disabled={disabled || pending}
    onClick={(event) => {
      haptic.tap();
      onClick?.(event);
    }}
    className={cn(
      "btn-base",
      VARIANTS[variant],
      SIZES[size],
      full && "w-full",
      className,
    )}
    {...props}
  >
    {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
    {children}
  </button>
);
