"use client";

/**
 * PASTDAN CHIQADIGAN OYNA (bottom sheet).
 *
 * ⚠️ MARKAZDAGI MODAL EMAS: telefonda barmoq ekranning PASTIDA
 * bo'ladi va markazdagi oynaning tugmalariga yetish uchun qo'lni
 * qayta joylashtirish kerak bo'lardi.
 *
 * ⚠️ RADIX ISHLATILMADI (panelda ishlatilgan): u `Dialog` bilan
 * birga fokus tutqichi va `aria` ni olib keladi, lekin pastdan
 * chiqadigan oyna uchun uning animatsiyasini qayta yozish kerak
 * bo'lardi — qo'shilgan bog'liqlik bergan foydadan ko'p.
 */

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { haptic } from "../lib/telegram";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** To'liq balandlik — ro'yxat uzun bo'lsa. */
  tall?: boolean;
}

export const Sheet = ({ open, onClose, title, children, tall = false }: SheetProps) => {
  /**
   * ⚠️ ORQA FON SURILISHI TO'XTATILADI: usiz oyna ichidagi ro'yxat
   * oxiriga yetganda ORTIDAGI sahifa sura boshlaydi va foydalanuvchi
   * "oyna yopilib ketdi" deb o'ylardi.
   */
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /** ⚠️ `Escape` — brauzerda sinash uchun (Telegram'da klaviatura yo'q). */
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <button
        type="button"
        aria-label="Yopish"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in"
        onClick={() => {
          haptic.tap();
          onClose();
        }}
      />

      <div
        className={cn(
          "relative w-full rounded-t-[1.75rem] bg-card shadow-lift",
          "animate-in slide-in-from-bottom duration-300",
          tall ? "max-h-[88vh]" : "max-h-[75vh]",
          "flex flex-col",
        )}
      >
        {/* Tortish chizig'i — "bu oyna harakatlanadi" belgisi. */}
        <div className="flex shrink-0 justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {title ? (
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              type="button"
              aria-label="Yopish"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"
              onClick={() => {
                haptic.tap();
                onClose();
              }}
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : null}

        {/* ⚠️ `safe-bottom`: iPhone'ning pastki chizig'i oynaning
            oxirgi tugmasini bosib qolardi. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 safe-bottom">
          {children}
        </div>
      </div>
    </div>
  );
};
