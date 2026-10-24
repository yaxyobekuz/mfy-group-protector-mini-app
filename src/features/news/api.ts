"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/query-keys";
import type { NewsItem, RatingRow } from "@/shared/api/types";

export const useNews = () =>
  useQuery({
    queryKey: queryKeys.news(),
    queryFn: () => api.get<NewsItem[]>("/mobile/news", { limit: 30 }),
    staleTime: 5 * 60_000,
  });

/**
 * ⚠️ KO'RISH SANOG'I — "OT VA UNUT" (`onError` yo'q). Bu
 * ko'rsatkich, hisobot emas: uning yiqilishi fuqaroga xato
 * ko'rsatishga arzimaydi va ro'yxat keshini bekor qilish ham
 * kerak emas — sanoq ilovada ko'rinmaydi.
 */
export const useMarkNewsViewed = () =>
  useMutation({
    mutationFn: (id: string) => api.post(`/mobile/news/${id}/view`),
  });

export const useRating = (scope: "province" | "district") =>
  useQuery({
    queryKey: queryKeys.rating(scope),
    queryFn: () =>
      api.get<RatingRow[]>("/mobile/rating", {
        scope: scope === "district" ? "district" : undefined,
      }),
    staleTime: 5 * 60_000,
  });
