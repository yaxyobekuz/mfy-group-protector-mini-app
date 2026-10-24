/**
 * QUERY KALITLARI — YAGONA MANBA.
 *
 * ⚠️ KALIT QO'LDA YOZILMAYDI — admin paneldagi bilan AYNI qoida va
 * AYNI sabab: `invalidateQueries` kalitni AYNAN topishi kerak va
 * qo'lda yozilgan kalitlar ajralib ketganda kesh JIM ishlamay
 * qoladi. Ilovada bu yanada sezilarliroq: murojaat yuborilgandan
 * keyin "Mening murojaatlarim" ro'yxati eski holatda qolsa, fuqaro
 * uni YUBORILMAGAN deb o'ylab, ikkinchi marta yozardi.
 */

type QueryParams = object;

export const queryKeys = {
  me: () => ["me"] as const,

  categories: () => ["categories"] as const,
  territory: () => ["territory"] as const,
  stats: () => ["stats"] as const,

  appeals: {
    all: () => ["appeals"] as const,
    list: (params?: QueryParams) => ["appeals", "list", params ?? {}] as const,
    detail: (id: string) => ["appeals", "detail", id] as const,
    map: (params?: QueryParams) => ["appeals", "map", params ?? {}] as const,
  },

  news: () => ["news"] as const,
  rating: (scope: string) => ["rating", scope] as const,
} as const;
