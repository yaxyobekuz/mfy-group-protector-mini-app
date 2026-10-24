"use client";

/**
 * YUKLASH, BO'SHLIK VA XATO HOLATLARI.
 *
 * ⚠️ UCHALASI BIR JOYDA: ro'yxat sahifalari ularni har safar qayta
 * yozsa, bir ekranda "Yuklanmoqda…", boshqasida aylanayotgan doira
 * bo'lib qolardi.
 *
 * ⚠️ BO'SHLIK HOLATI — MATN EMAS, TAKLIF. "Ma'lumot yo'q" degan
 * yozuv foydalanuvchiga nima qilishni aytmaydi; "Birinchi
 * murojaatingizni yuboring" aytadi.
 */

import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { Button } from "./button";

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} />
);

export const LoadingBlock = ({ label = "Yuklanmoqda…" }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <Spinner className="h-7 w-7 text-primary" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

/**
 * SKELET.
 *
 * ⚠️ RO'YXAT UCHUN AYLANAYOTGAN DOIRA EMAS, SKELET: kartalar
 * joyini oldindan egallaydi va ma'lumot kelganda sahifa
 * "sakramaydi". Telefon ekranida bu sakrash bosmoqchi bo'lgan
 * tugmani ko'chirib yuborardi.
 */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-xl bg-muted", className)} />
);

export const CardSkeleton = () => (
  <div className="card space-y-3 p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-2 w-full" />
  </div>
);

interface EmptyProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon, title, hint, action }: EmptyProps) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
      {icon ?? <Inbox className="h-6 w-6" />}
    </div>
    <h3 className="text-base font-semibold">{title}</h3>
    {hint ? <p className="max-w-[18rem] text-sm text-muted-foreground">{hint}</p> : null}
    {action ? (
      <Button size="md" className="mt-2" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null}
  </div>
);

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorProps) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
      <AlertCircle className="h-6 w-6" />
    </div>
    <h3 className="text-base font-semibold">Xatolik yuz berdi</h3>
    {/* ⚠️ SERVER MATNI KO'RSATILADI: u o'zbek tilida va fuqaroga
        mo'ljallangan ("Bir kunda 10 tadan ko'p…"). Uni yashirib
        "Xatolik" deyish foydalanuvchini nima qilishni bilmay
        qoldirardi. */}
    <p className="max-w-[18rem] text-sm text-muted-foreground">
      {message ?? "Internetni tekshirib, qaytadan urinib ko'ring"}
    </p>
    {onRetry ? (
      <Button variant="secondary" className="mt-2" onClick={onRetry}>
        Qaytadan urinish
      </Button>
    ) : null}
  </div>
);
