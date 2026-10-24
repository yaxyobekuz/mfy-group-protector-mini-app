"use client";

/**
 * SAHIFA SARLAVHASI.
 *
 * ⚠️ `sticky` VA FONI BULANIQ: ro'yxat aylantirilganda sarlavha
 * ekranda qoladi — telefonda "men qayerdaman" degan savolga javob
 * yuqorida turishi kerak, aks holda uzun ro'yxatda yo'qolib
 * qolinadi.
 *
 * ⚠️ TELEGRAM O'Z SARLAVHA PANELINI CHIZADI (ilova nomi, `⋯`),
 * shuning uchun bu yerda ILOVA NOMI TAKRORLANMAYDI — faqat sahifa
 * nomi.
 */

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface PageHeaderProps {
  title: string;
  /** O'ng tomondagi amal (filtr, qo'shish). */
  action?: ReactNode;
  /** Sarlavha ostidagi qator — tab yoki filtr. */
  below?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, action, below, className }: PageHeaderProps) => (
  <header
    className={cn(
      "sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md safe-top",
      className,
    )}
  >
    <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
      <h1 className="truncate text-[22px] font-bold tracking-tight">{title}</h1>
      {action}
    </div>

    {below ? <div className="mx-auto max-w-lg px-4 pb-3">{below}</div> : null}
  </header>
);
