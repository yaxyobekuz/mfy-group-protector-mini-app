"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/query-keys";
import type { CitizenProfile } from "@/shared/api/types";
import { haptic } from "@/shared/lib/telegram";

export interface UpdateProfileInput {
  phone?: string;
  districtId?: string;
  mahallaId?: string;
  languageCode?: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api.patch<CitizenProfile>("/mobile/me", input),

    onSuccess: (profile) => {
      haptic.success();
      toast.success("Saqlandi");

      /**
       * ⚠️ JAVOB KESHGA TO'G'RIDAN-TO'G'RI YOZILADI
       * (`setQueryData`), keyin bekor qilinmaydi: server to'liq
       * profilni qaytaradi va qo'shimcha so'rov yuborish ekranni
       * bir lahza eski qiymat bilan ko'rsatardi.
       */
      queryClient.setQueryData(queryKeys.me(), profile);

      // ⚠️ YANGILIKLAR HAM: ular TUMAN bo'yicha filtrlanadi va
      // tuman o'zgarsa ro'yxat boshqa bo'ladi.
      void queryClient.invalidateQueries({ queryKey: queryKeys.news() });
      void queryClient.invalidateQueries({ queryKey: ["rating"] });
    },

    onError: (error) => {
      haptic.error();
      toast.error(error instanceof ApiError ? error.message : "Saqlanmadi");
    },
  });
};
