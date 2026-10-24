"use client";

/**
 * MUROJAAT SO'ROVLARI.
 *
 * ⚠️ KALITLAR `query-keys.ts` DAN: qo'lda yozilgan kalit
 * `invalidateQueries` bilan mos kelmay, yangi yuborilgan murojaat
 * ro'yxatda ko'rinmay qolardi — va fuqaro uni ikkinchi marta
 * yozardi.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/query-keys";
import type {
  AnalysisResponse,
  AppealDetail,
  AppealListResponse,
  AppealStatus,
  Category,
  CreatedAppeal,
  HomeStats,
  MapPoint,
  Territory,
  UploadedFile,
} from "@/shared/api/types";
import { haptic } from "@/shared/lib/telegram";

// ═══════════════════════════════════════════════════════════════════
//  MA'LUMOTNOMALAR
// ═══════════════════════════════════════════════════════════════════

/**
 * ⚠️ `staleTime` UZUN (10 daqiqa): yo'nalishlar va hudud ro'yxati
 * kuniga bir marta ham o'zgarmaydi, lekin sehrgarning HAR qadamida
 * kerak bo'ladi. Qayta so'rash har qadamda kutish paydo qilardi.
 */
export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => api.get<Category[]>("/mobile/categories"),
    staleTime: 10 * 60_000,
  });

export const useTerritory = () =>
  useQuery({
    queryKey: queryKeys.territory(),
    queryFn: () => api.get<Territory>("/mobile/territory"),
    staleTime: 10 * 60_000,
  });

export const useHomeStats = () =>
  useQuery({
    queryKey: queryKeys.stats(),
    queryFn: () => api.get<HomeStats>("/mobile/stats"),
    staleTime: 5 * 60_000,
  });

// ═══════════════════════════════════════════════════════════════════
//  MUROJAATLAR
// ═══════════════════════════════════════════════════════════════════

export const useMyAppeals = (status?: AppealStatus) =>
  useQuery({
    queryKey: queryKeys.appeals.list({ status }),
    queryFn: () => api.get<AppealListResponse>("/mobile/appeals", { status }),
    // ⚠️ ESKI MA'LUMOT SAQLANADI: tab almashganda ro'yxat bo'sh
    // bo'lib qolmaydi va ekran "sakramaydi".
    placeholderData: (previous) => previous,
  });

export const useAppeal = (id: string) =>
  useQuery({
    queryKey: queryKeys.appeals.detail(id),
    queryFn: () => api.get<AppealDetail>(`/mobile/appeals/${id}`),
    enabled: Boolean(id),
  });

export const useMapPoints = (params: { categoryId?: string; status?: AppealStatus }) =>
  useQuery({
    queryKey: queryKeys.appeals.map(params),
    queryFn: () => api.get<MapPoint[]>("/mobile/appeals/map", { ...params }),
    staleTime: 2 * 60_000,
  });

// ═══════════════════════════════════════════════════════════════════
//  YARATISH OQIMI
// ═══════════════════════════════════════════════════════════════════

/**
 * FAYL YUKLASH.
 *
 * ⚠️ HAR FAYL ALOHIDA SO'ROV: bitta so'rovda 5 ta fayl yuborilsa,
 * oxirgisidagi xato (hajm, format) HAMMASINI bekor qilardi va
 * fuqaro to'rtta to'g'ri suratini qayta tanlashga majbur bo'lardi.
 *
 * ⚠️ XATO `toast` BILAN KO'RSATILADI, lekin oqim TO'XTAMAYDI:
 * qolgan suratlar yuklanaveradi.
 */
export const useUploadFile = () =>
  useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return api.upload<UploadedFile>("/mobile/uploads", form);
    },
    onError: (error) => {
      haptic.error();
      toast.error(error instanceof ApiError ? error.message : "Fayl yuklanmadi");
    },
  });

/**
 * AI TAHLILI (5-qadam).
 *
 * ⚠️ XATO KO'RSATILMAYDI: taklif — QULAYLIK va usiz ham oqim
 * davom etadi (fuqaro yo'nalishni 1-qadamda o'zi tanlagan).
 * "AI ishlamadi" degan xabar fuqaroni nima qilishini bilmay
 * qoldirardi.
 */
export const useAnalyze = () =>
  useMutation({
    mutationFn: (body: string) =>
      api.post<AnalysisResponse>("/mobile/appeals/analyze", { body }),
  });

export interface CreateAppealInput {
  categoryId: string;
  body: string;
  districtId?: string;
  mahallaId?: string;
  lat?: number;
  lng?: number;
  address?: string;
  isHazard?: boolean;
  isLongStanding?: boolean;
  isRepeatAppeal?: boolean;
  occurredAt?: string;
  attachments?: string[];
  analysisToken?: string;
}

export const useCreateAppeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppealInput) =>
      api.post<CreatedAppeal>("/mobile/appeals", input),

    onSuccess: () => {
      haptic.success();

      // ⚠️ RO'YXAT VA PROFIL IKKALASI BEKOR QILINADI: profilda
      // sanoq ("3 ta murojaat") va ball ko'rinadi va ular ham
      // o'zgargan.
      void queryClient.invalidateQueries({ queryKey: queryKeys.appeals.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.me() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },

    onError: (error) => {
      haptic.error();
      toast.error(error instanceof ApiError ? error.message : "Yuborilmadi");
    },
  });
};

export const useAddComment = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) =>
      api.post(`/mobile/appeals/${id}/comments`, { body }),

    onSuccess: () => {
      haptic.success();
      toast.success("Qo'shimcha yuborildi");
      void queryClient.invalidateQueries({ queryKey: queryKeys.appeals.detail(id) });
    },

    onError: (error) => {
      haptic.error();
      toast.error(error instanceof ApiError ? error.message : "Yuborilmadi");
    },
  });
};
