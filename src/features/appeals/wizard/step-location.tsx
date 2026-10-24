"use client";

/**
 * 3-QADAM: JOY.
 *
 * ⚠️ IKKI YO'L BIRGA: xaritada nuqta VA matnli manzil. Faqat
 * koordinata bo'lsa, panelda xodim uni ochmaguncha "qayerda" degan
 * savolga javob yo'q; faqat matn bo'lsa, xarita ishlamaydi.
 *
 * ⚠️ MFY MAJBURIY EMAS: fuqaro o'z mahallasining RASMIY nomini
 * bilmasligi mumkin ("12-mavze" deb yuradi) va uni majburiy
 * qilish murojaatni butunlay to'xtatardi. Hududi biriktirilmagan
 * murojaat panelda ko'rinadi va MFY ni xodim qo'yadi.
 *
 * ⚠️ TESKARI GEOKODLASH (koordinata → manzil) ISHLATILMADI:
 * Nominatim bepul, lekin so'rov chegarasi qattiq (sekundiga 1) va
 * uni ilovadan to'g'ridan-to'g'ri chaqirish ularning qoidalarini
 * buzadi. Manzilni fuqaro YOZADI — u qaysi uyni nazarda
 * tutayotganini undan yaxshi hech kim bilmaydi.
 */

import { Crosshair, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useTerritory } from "@/features/appeals/api";
import { useSession } from "@/entities/session/session-provider";
import { ADDRESS_MAX, DEFAULT_CENTER } from "@/shared/config/limits";
import { cn } from "@/shared/lib/cn";
import { haptic } from "@/shared/lib/telegram";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Sheet } from "@/shared/ui/sheet";
import { MapView } from "@/widgets/map/map-view";

interface Props {
  lat: number | null;
  lng: number | null;
  address: string;
  districtId: string | null;
  mahallaId: string | null;
  onChange: (patch: {
    lat?: number | null;
    lng?: number | null;
    address?: string;
    districtId?: string | null;
    mahallaId?: string | null;
  }) => void;
}

export const StepLocation = ({
  lat,
  lng,
  address,
  districtId,
  mahallaId,
  onChange,
}: Props) => {
  const { citizen } = useSession();
  const territory = useTerritory();
  const [picking, setPicking] = useState<"district" | "mahalla" | null>(null);
  const [locating, setLocating] = useState(false);

  /**
   * ⚠️ BOSHLANG'ICH QIYMAT — FUQARONING PROFILIDAN: u ko'pincha
   * o'z hududidagi muammo haqida yozadi va har safar tumanni
   * qaytadan tanlash ortiqcha ish bo'lardi.
   */
  useEffect(() => {
    if (districtId === null && citizen.districtId) {
      onChange({ districtId: citizen.districtId, mahallaId: citizen.mahallaId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const center = useMemo<[number, number]>(
    () => (lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER),
    [lat, lng],
  );

  const districts = territory.data?.districts ?? [];
  const mahallas = useMemo(
    () =>
      (territory.data?.mahallas ?? []).filter(
        (mahalla) => !districtId || mahalla.districtId === districtId,
      ),
    [territory.data, districtId],
  );

  const districtName = districts.find((item) => item.id === districtId)?.name;
  const mahallaName = mahallas.find((item) => item.id === mahallaId)?.name;

  /**
   * JORIY JOYLASHUV.
   *
   * ⚠️ XATO HOLATLARI ALOHIDA AYTILADI: "ruxsat berilmagan" va
   * "signal yo'q" — BOSHQA muammolar va "joylashuv topilmadi"
   * degan umumiy xabar foydalanuvchiga nima qilishni
   * ko'rsatmasdi.
   */
  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Qurilmangiz joylashuvni aniqlay olmaydi");
      return;
    }

    setLocating(true);
    haptic.tap();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        haptic.success();
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setLocating(false);
        haptic.error();

        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Joylashuvga ruxsat berilmagan — xaritadan qo'lda belgilang"
            : "Joylashuv aniqlanmadi — xaritadan qo'lda belgilang",
        );
      },
      // ⚠️ `enableHighAccuracy` YOQILGAN, lekin MUDDAT bilan:
      // aniqlik GPS'ni ishga tushiradi va u ichkarida 30+
      // soniya izlashi mumkin — bu paytda ilova "qotib
      // qolgan"day ko'rinardi.
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    );
  };

  return (
    <div className="space-y-4">
      {/* ── XARITA ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div className="h-56">
          <MapView
            className="h-full w-full"
            center={center}
            picker
            onMove={(nextLat, nextLng) => onChange({ lat: nextLat, lng: nextLng })}
          />
        </div>

        {/* Tanlangan joy — xarita ustida, mockup'dagidek. */}
        {lat !== null && lng !== null ? (
          <div className="pointer-events-none absolute left-3 right-3 top-3">
            <div className="rounded-xl bg-card/95 px-3 py-2 shadow-card backdrop-blur">
              <p className="text-[11px] font-semibold text-muted-foreground">
                Tanlangan joy
              </p>
              <p className="truncate text-[13px] font-medium">
                {address.trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Joriy joylashuv"
          onClick={locate}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary shadow-lift transition active:scale-95"
        >
          <Crosshair className={cn("h-5 w-5", locating && "animate-spin")} />
        </button>
      </div>

      <Button
        full
        variant="secondary"
        icon={<MapPin className="h-4.5 w-4.5" />}
        pending={locating}
        onClick={locate}
      >
        Joriy joylashuvni ishlatish
      </Button>

      {/* ── MANZIL MATNI ──────────────────────────────────────── */}
      <Field
        label="Manzil"
        placeholder="Masalan: Bobur ko'chasi, 12-uy"
        value={address}
        maxLength={ADDRESS_MAX}
        onChange={(event) => onChange({ address: event.target.value })}
        icon={<MapPin className="h-4 w-4" />}
        hint="Uy raqami yoki mo'ljal — ijrochiga joyni topishda yordam beradi"
      />

      {/* ── HUDUD ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            haptic.tap();
            setPicking("district");
          }}
          className="rounded-xl border border-input bg-card px-4 py-3 text-left"
        >
          <span className="block text-[11px] text-muted-foreground">Tuman</span>
          <span className="mt-0.5 block truncate text-[14px] font-medium">
            {districtName ?? "Tanlang"}
          </span>
        </button>

        <button
          type="button"
          disabled={!districtId}
          onClick={() => {
            haptic.tap();
            setPicking("mahalla");
          }}
          className="rounded-xl border border-input bg-card px-4 py-3 text-left disabled:opacity-50"
        >
          <span className="block text-[11px] text-muted-foreground">MFY</span>
          <span className="mt-0.5 block truncate text-[14px] font-medium">
            {mahallaName ?? "Ixtiyoriy"}
          </span>
        </button>
      </div>

      {/* ── TANLASH OYNALARI ──────────────────────────────────── */}
      <Sheet
        open={picking === "district"}
        onClose={() => setPicking(null)}
        title="Tumanni tanlang"
        tall
      >
        <div className="space-y-1.5">
          {districts.map((district) => (
            <button
              key={district.id}
              type="button"
              onClick={() => {
                haptic.select();
                // ⚠️ TUMAN O'ZGARSA MFY TOZALANADI: eski MFY
                // yangi tumanga tegishli emas va server uni
                // baribir rad etardi ("MFY tanlangan tumanga
                // tegishli emas").
                onChange({ districtId: district.id, mahallaId: null });
                setPicking(null);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px]",
                districtId === district.id
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
        title="MFY ni tanlang"
        tall
      >
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              haptic.select();
              onChange({ mahallaId: null });
              setPicking(null);
            }}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-left text-[15px]",
              mahallaId === null
                ? "bg-accent font-semibold text-accent-foreground"
                : "bg-secondary/50",
            )}
          >
            Bilmayman
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Hududni ma&apos;muriyat o&apos;zi aniqlaydi
            </span>
          </button>

          {mahallas.map((mahalla) => (
            <button
              key={mahalla.id}
              type="button"
              onClick={() => {
                haptic.select();
                onChange({ mahallaId: mahalla.id });
                setPicking(null);
              }}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-left text-[15px]",
                mahallaId === mahalla.id
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "bg-secondary/50",
              )}
            >
              {mahalla.name}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
};
