"use client";

/**
 * 2-QADAM: SURAT VA VIDEO.
 *
 * ⚠️ FAYL DARHOL YUKLANADI, oxirida emas. Besh ta suratni oxirgi
 * qadamda birdan yuborish mobil tarmoqda 30+ soniya kutish
 * berardi — va aynan o'sha paytda ilova yopilsa, hamma narsa
 * yo'qolardi. Darhol yuklash har suratni mustaqil qiladi.
 *
 * ⚠️ IKKI TUGMA: "Kameradan olish" va "Galereyadan tanlash".
 * Farqi — `capture` atributi. Bitta tugma qoldirilsa, telefon
 * tanlov oynasini o'zi chiqarardi, lekin ba'zi Android
 * mijozlarida u kamerani umuman taklif qilmaydi.
 */

import { Camera, ImagePlus, Loader2, Play, Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { useUploadFile } from "@/features/appeals/api";
import type { WizardFile } from "./wizard-state";
import { fileUrl } from "@/shared/api/client";
import { cn } from "@/shared/lib/cn";
import { haptic } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";

interface Props {
  files: WizardFile[];
  max: number;
  onChange: (files: WizardFile[]) => void;
}

/** Yuklanayotgan fayl — serverdan javob kelgunicha ko'rinadi. */
interface PendingFile {
  id: string;
  previewUrl: string;
}

export const StepMedia = ({ files, max, onChange }: Props) => {
  const upload = useUploadFile();
  const [pending, setPending] = useState<PendingFile[]>([]);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const total = files.length + pending.length;
  const remaining = Math.max(0, max - total);

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;

    // ⚠️ CHEGARADAN ORTIG'I KESILADI: foydalanuvchi galereyadan
    // 20 ta surat tanlashi mumkin va hammasini yuborish serverda
    // baribir rad etilardi — lekin tarmoq allaqachon yeb
    // bo'lingan bo'lardi.
    const chosen = Array.from(list).slice(0, remaining);

    for (const file of chosen) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // ⚠️ MAHALLIY KO'RINISH DARHOL QO'SHILADI: yuklash
      // tugashini kutib bo'sh joy ko'rsatish "bosildimi yoki
      // yo'qmi" degan savolni tug'dirardi.
      const previewUrl = URL.createObjectURL(file);
      setPending((prev) => [...prev, { id, previewUrl }]);

      try {
        const uploaded = await upload.mutateAsync(file);

        onChange([
          ...files,
          {
            id,
            token: uploaded.token,
            kind: uploaded.kind,
            url: fileUrl(uploaded.url) ?? uploaded.url,
          },
        ]);
        haptic.tap();
      } catch {
        // ⚠️ XABAR `useUploadFile` ICHIDA KO'RSATILGAN — bu
        // yerda takrorlanmaydi, aks holda bitta xato uchun
        // ikkita bildirishnoma chiqardi.
      } finally {
        setPending((prev) => prev.filter((item) => item.id !== id));
        // ⚠️ `blob:` MANZIL BO'SHATILADI: bo'shatilmasa, besh ta
        // 5 MB'lik surat brauzer xotirasida qolib ketardi.
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const remove = (id: string) => {
    haptic.tap();
    onChange(files.filter((file) => file.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* ── YUKLANGANLAR ──────────────────────────────────────── */}
      {total > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {files.map((file, index) => (
            <div
              key={file.id}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-muted",
                // Birinchi surat — asosiy, u kattaroq ko'rinadi.
                index === 0 && files.length > 1 && "col-span-2 row-span-2 aspect-auto",
              )}
            >
              {file.kind === "video" ? (
                <>
                  <video
                    src={file.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play className="h-7 w-7 fill-white text-white" />
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}

              <button
                type="button"
                aria-label="O'chirish"
                onClick={() => remove(file.id)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {pending.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt=""
                className="h-full w-full object-cover opacity-50"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </span>
            </div>
          ))}

          {remaining > 0 ? (
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                galleryRef.current?.click();
              }}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px] leading-tight">
                Yana qo&apos;shish
                <br />
                (maks. {max} ta)
              </span>
            </button>
          ) : null}
        </div>
      ) : (
        /* ── BO'SH HOLAT ────────────────────────────────────── */
        <button
          type="button"
          onClick={() => {
            haptic.tap();
            cameraRef.current?.click();
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/50 py-12 transition active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Camera className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold">Surat yoki video qo&apos;shing</span>
          <span className="max-w-[16rem] text-center text-xs text-muted-foreground">
            Surat murojaatni tezroq hal qilishga yordam beradi
          </span>
        </button>
      )}

      {/* ── TUGMALAR ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="secondary"
          icon={<Camera className="h-4.5 w-4.5" />}
          disabled={remaining === 0}
          onClick={() => cameraRef.current?.click()}
        >
          Kameradan
        </Button>
        <Button
          variant="secondary"
          icon={<ImagePlus className="h-4.5 w-4.5" />}
          disabled={remaining === 0}
          onClick={() => galleryRef.current?.click()}
        >
          Galereyadan
        </Button>
      </div>

      {/*
        ⚠️ `capture="environment"` — ORQA KAMERA: `user` bo'lsa
        selfi kamerasi ochilib, muammoning o'rniga fuqaroning
        yuzini suratga olardi.

        ⚠️ `accept` DA VIDEO HAM BOR, lekin serverda tur FAYL
        ICHIDAN tekshiriladi (`uploads.service.ts`): `accept` —
        qulaylik, himoya emas.
      */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          // ⚠️ QIYMAT TOZALANADI: aks holda AYNI faylni ikkinchi
          // marta tanlash `change` hodisasini UMUMAN bermasdi.
          event.target.value = "";
        }}
      />

      <p className="text-center text-xs text-muted-foreground">
        {/* ⚠️ "MAJBURIY EMAS" AYTILADI: fuqaro suratsiz murojaat
            yubora olmaydi deb o'ylab, oqimni tashlab ketishi
            mumkin. */}
        Surat majburiy emas — usiz ham davom etishingiz mumkin
      </p>
    </div>
  );
};
