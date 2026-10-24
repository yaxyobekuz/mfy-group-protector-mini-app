/**
 * SERVER JAVOBLARINING TURLARI.
 *
 * ⚠️ QO'LDA YOZILGAN va serverdagi turlar bilan QO'LDA sinxron —
 * admin paneldagi bilan AYNI almashuv (`admin/src/shared/api/
 * types.ts` izohi): generatsiya qurilish bosqichida server ishga
 * tushishini talab qilardi.
 *
 * ⚠️ PANELDAGI FAYLDAN NUSXA OLINMAYDI: ikkisi BOSHQA javoblarni
 * tasvirlaydi. Panel `IssueDetail` ni ko'radi (ichki izohlar,
 * ijrochi, audit), ilova esa faqat fuqaroga ko'rinadigan qismini.
 * Umumiy fayl ikkalasiga ham ortiqcha maydon olib kelardi.
 */

export type AppealStatus = "new" | "in_progress" | "resolved" | "rejected";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Ref {
  id: string;
  name: string;
}

// ═══════════════════════════════════════════════════════════════════
//  FUQARO
// ═══════════════════════════════════════════════════════════════════

export interface CitizenProfile {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  photoUrl: string | null;
  languageCode: string;
  districtId: string | null;
  districtName: string | null;
  mahallaId: string | null;
  mahallaName: string | null;
  points: number;
  createdAt: string;
  stats: { total: number; open: number; resolved: number };
}

export interface LoginResponse {
  token: string;
  citizen: Omit<CitizenProfile, "stats">;
}

// ═══════════════════════════════════════════════════════════════════
//  MA'LUMOTNOMALAR
// ═══════════════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  /** `shared/config/icons.tsx` dagi kalit. */
  icon: string | null;
  slaHours: number;
  orgName: string | null;
}

export interface Territory {
  districts: Ref[];
  mahallas: (Ref & { districtId: string })[];
}

export interface HomeStats {
  total: number;
  resolved: number;
  last30: number;
}

// ═══════════════════════════════════════════════════════════════════
//  MUROJAAT
// ═══════════════════════════════════════════════════════════════════

export interface TimelineStep {
  key: string;
  label: string;
  done: boolean;
}

export interface AppealListItem {
  id: string;
  publicNo: string;
  title: string;
  status: AppealStatus;
  address: string | null;
  createdAt: string;
  resolvedAt: string | null;
  dueAt: string | null;
  category: { id: string; name: string; color: string | null; icon: string | null };
  /** Nisbiy manzillar — `fileUrl()` orqali to'ldiriladi. */
  photos: string[];
  commentCount: number;
  timeline: TimelineStep[];
}

export interface AppealListResponse extends Paginated<AppealListItem> {
  counts: { all: number; open: number; resolved: number; rejected: number };
}

export interface AppealComment {
  id: string;
  body: string;
  createdAt: string;
  /** Fuqaroning o'zi yozganmi. */
  mine: boolean;
  author: string;
}

export interface AppealDetail {
  id: string;
  publicNo: string;
  title: string;
  body: string;
  status: AppealStatus;
  address: string | null;
  lat: number | null;
  lng: number | null;
  isHazard: boolean;
  isLongStanding: boolean;
  isRepeatAppeal: boolean;
  occurredAt: string | null;
  createdAt: string;
  dueAt: string | null;
  resolvedAt: string | null;
  resolution: string | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    orgName: string | null;
  };
  mahallaName: string | null;
  districtName: string | null;
  attachments: { id: string; kind: string; url: string; mimeType: string }[];
  comments: AppealComment[];
  timeline: TimelineStep[];
}

export interface CreatedAppeal {
  id: string;
  publicNo: string;
  createdAt: string;
  dueAt: string | null;
  categoryName: string;
  orgName: string | null;
  slaHours: number;
  address: string | null;
}

/** `POST /mobile/uploads` javobi. */
export interface UploadedFile {
  /** ⚠️ IMZOLANGAN HAVOLA — murojaat yaratishda shu qaytariladi. */
  token: string;
  kind: "photo" | "video";
  url: string;
  size: number;
}

/** `POST /mobile/appeals/analyze` javobi. */
export interface AnalysisResponse {
  suggestion: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string | null;
    confidence: number;
    priority: Priority;
    slaHours: number;
    orgName: string | null;
  } | null;
  /** ⚠️ SERVER IMZOSI — `POST /mobile/appeals` ga shundayligicha uzatiladi. */
  token: string | null;
}

// ═══════════════════════════════════════════════════════════════════
//  XARITA, YANGILIK, REYTING
// ═══════════════════════════════════════════════════════════════════

export interface MapPoint {
  id: string;
  lat: number | null;
  lng: number | null;
  status: AppealStatus;
  createdAt: string;
  category: { id: string; name: string; color: string | null; icon: string | null };
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  coverUrl: string | null;
  isPinned: boolean;
  publishedAt: string | null;
  viewCount: number;
  districtName: string | null;
}

export interface RatingRow {
  rank: number;
  id: string;
  name: string;
  photoUrl: string | null;
  points: number;
  appeals: number;
  districtName: string | null;
}
