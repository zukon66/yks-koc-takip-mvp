"use client";

export type Book = {
  id: string;
  subject: string;
  bookName: string;
  solved: string;
  todo: string;
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  bookId: string;
  subject: string;
  bookName: string;
  solved: string;
  todo: string;
  targetDate: string;
  isCompleted: boolean;
  timestamp: string;
  action: "created" | "updated";
};

export type MockExamType = "TYT" | "AYT";

export type MockExam = {
  id: string;
  date: string;
  examType: MockExamType;
  turkce: number;
  sosyal: number;
  matematik: number;
  fen: number;
  totalNet: number;
  createdAt: string;
  updatedAt: string;
};

export type PomodoroMode = "study" | "break";

export type PomodoroSession = {
  id: string;
  mode: PomodoroMode;
  startedAt: string;
  endedAt: string;
  plannedMinutes: number;
  completed: boolean;
  createdAt: string;
};

export type CoachSummary = {
  id: string;
  meetingDate: string;
  weeklyReview: string;
  blockers: string;
  nextWeekGoal: string;
  createdAt: string;
  updatedAt: string;
};

export type StreakState = {
  current: number;
  lastCompletedDate: string | null;
};

export type BookDraft = {
  subject: string;
  bookName: string;
  solved: string;
  todo: string;
  targetDate: string;
};

export type EditDraft = {
  subject: string;
  bookName: string;
  solved: string;
  todo: string;
  targetDate: string;
  isCompleted: boolean;
};

export type HistoryEditDraft = ActivityLog;

export type MockExamDraft = {
  date: string;
  examType: MockExamType;
  turkce: string;
  sosyal: string;
  matematik: string;
  fen: string;
};

export type CoachSummaryDraft = {
  meetingDate: string;
  weeklyReview: string;
  blockers: string;
  nextWeekGoal: string;
};

export type Tab = "plan" | "books" | "notes" | "mockExams" | "pomodoro";
export type Theme = "light" | "dark";

export type Toast = {
  type: "success" | "error";
  message: string;
};

export type PersistedData = {
  books: Book[];
  logs: ActivityLog[];
  mockExams: MockExam[];
  pomodoroSessions: PomodoroSession[];
  coachSummaries: CoachSummary[];
  streak: StreakState;
};

export type SubjectStyle = {
  badge: string;
  border: string;
  progress: string;
};

export const STORAGE_KEY = "yks-koc-takip-data-v3";
export const PREVIOUS_STORAGE_KEY = "yks-koc-takip-data-v2";
export const LEGACY_STORAGE_KEY = "yks-koc-takip-books-v1";
export const THEME_STORAGE_KEY = "yks-koc-theme-v1";
export const BASE_DOCUMENT_TITLE = "YKS Koç Takip";

export const SUBJECT_OPTIONS = [
  "Matematik",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Edebiyat",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Diğer"
] as const;

export const SUBJECT_STYLES: Record<string, SubjectStyle> = {
  Matematik: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
    border: "border-l-blue-500",
    progress: "bg-blue-500"
  },
  Geometri: {
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200",
    border: "border-l-cyan-500",
    progress: "bg-cyan-500"
  },
  Fizik: {
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200",
    border: "border-l-violet-500",
    progress: "bg-violet-500"
  },
  Kimya: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
    border: "border-l-emerald-500",
    progress: "bg-emerald-500"
  },
  Biyoloji: {
    badge: "bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-200",
    border: "border-l-lime-500",
    progress: "bg-lime-500"
  },
  Türkçe: {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
    border: "border-l-rose-500",
    progress: "bg-rose-500"
  },
  Edebiyat: {
    badge: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200",
    border: "border-l-fuchsia-500",
    progress: "bg-fuchsia-500"
  },
  Tarih: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    border: "border-l-amber-500",
    progress: "bg-amber-500"
  },
  Coğrafya: {
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200",
    border: "border-l-teal-500",
    progress: "bg-teal-500"
  },
  Felsefe: {
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200",
    border: "border-l-indigo-500",
    progress: "bg-indigo-500"
  },
  Diğer: {
    badge: "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200",
    border: "border-l-slate-500",
    progress: "bg-slate-500"
  }
};

export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

export const todayDate = formatDateInput(new Date());

export const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  weekday: "long"
});

export const shortDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

export const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit"
});

export const emptyDraft: BookDraft = {
  subject: "Geometri",
  bookName: "",
  solved: "",
  todo: "",
  targetDate: todayDate
};

export const emptyMockExamDraft: MockExamDraft = {
  date: todayDate,
  examType: "TYT",
  turkce: "",
  sosyal: "",
  matematik: "",
  fen: ""
};

export const emptyCoachSummaryDraft: CoachSummaryDraft = {
  meetingDate: todayDate,
  weeklyReview: "",
  blockers: "",
  nextWeekGoal: ""
};

export const emptyStreak: StreakState = {
  current: 0,
  lastCompletedDate: null
};

const PAST_TENSE_VERBS = [
  "çözdüm",
  "bitirdim",
  "tamamladım",
  "kurdum",
  "test ettim",
  "yaptım",
  "ekledim",
  "düzenledim",
  "hazırladım",
  "kaydettim",
  "uyguladım",
  "yazdım"
];

const REPORT_FILLER_WORDS = new Set(["ve", "ile", "için", "bu", "şu", "bir", "olarak", "kadar", "de", "da"]);
const SHORT_LINE_FALLBACKS = ["ana sonucu kısa not aldım", "notu şablona göre kaydettim"];

const isString = (value: unknown): value is string => typeof value === "string";

export const isValidDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
export const isKnownSubject = (value: string) =>
  SUBJECT_OPTIONS.includes(value as (typeof SUBJECT_OPTIONS)[number]);
export const getSubjectStyle = (subject: string) => SUBJECT_STYLES[subject] ?? SUBJECT_STYLES.Diğer;

const toWords = (value: string): string[] =>
  value
    .split(/\s+/)
    .map((item) => item.replace(/[^\p{L}0-9-]/gu, "").trim())
    .filter(Boolean);

const isFormattedStudyReport = (value: string): boolean =>
  /^.+\n______\n[\s\S]*\ngeldiğime yere kadar bitirdim\nSon\nkalan:\s*.+\n△1$/u.test(value.trim());

const pickTitle = (note: string): string => {
  const normalized = note.toLocaleLowerCase("tr-TR");

  if (/\b(web|app|uygulama)\b/u.test(normalized)) {
    return "Web App not formatını kurdum";
  }

  const primaryPart =
    note
      .split(/[\n.!?]+/u)
      .map((line) => line.trim())
      .filter(Boolean)[0] ?? note;

  const words = toWords(primaryPart);
  const filteredWords = words.filter((word) => !REPORT_FILLER_WORDS.has(word.toLocaleLowerCase("tr-TR")));
  const topicWords = (filteredWords.length > 0 ? filteredWords : words).slice(0, 4);
  const topic = topicWords.join(" ").trim();

  if (!topic) {
    return "Çalışma notunu düzenledim";
  }

  const detectedVerb =
    PAST_TENSE_VERBS.find((verb) => normalized.includes(verb)) ??
    (() => {
      const maybeVerb = words[words.length - 1]?.toLocaleLowerCase("tr-TR") ?? "";
      return /(dım|dim|dum|düm|tım|tim|tum|tüm)$/u.test(maybeVerb) ? maybeVerb : "";
    })();

  const finalVerb = detectedVerb || "tamamladım";
  const title =
    topic.toLocaleLowerCase("tr-TR").includes(finalVerb) || !finalVerb
      ? topic
      : `${topic} ${finalVerb}`;

  return title.split(/\s+/).slice(0, 6).join(" ");
};

const pickShortLines = (note: string): string[] => {
  const candidates = note
    .split(/[\n.!?]+/u)
    .map((line) => line.trim())
    .filter(Boolean);

  const lines: string[] = [];

  for (const candidate of candidates) {
    const words = toWords(candidate).slice(0, 8);
    if (words.length < 3) {
      continue;
    }

    const line = words.join(" ");
    const normalizedLine = line.toLocaleLowerCase("tr-TR");
    if (normalizedLine === "geldiğime yere kadar bitirdim" || normalizedLine === "son") {
      continue;
    }

    lines.push(normalizedLine);
    if (lines.length === 2) {
      break;
    }
  }

  for (const fallbackLine of SHORT_LINE_FALLBACKS) {
    if (lines.length === 2) {
      break;
    }
    lines.push(fallbackLine);
  }

  return lines;
};

const formatStudyReport = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (isFormattedStudyReport(trimmed)) {
    return trimmed;
  }

  const matches = Array.from(trimmed.matchAll(/\d+(?:[.,]\d+)?/g));
  const remaining = matches.length > 0 ? matches[matches.length - 1][0] : "?";
  const title = pickTitle(trimmed);
  const shortLines = pickShortLines(trimmed);

  return [title, "______", ...shortLines, "geldiğime yere kadar bitirdim", "Son", `kalan: ${remaining}`, "△1"].join(
    "\n"
  );
};

export const normalizeRuntimeError = (err: unknown): string => {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }

  if (typeof err === "string") {
    return err;
  }

  if (err && typeof err === "object") {
    const eventLike = err as { type?: unknown; message?: unknown };
    if (typeof eventLike.message === "string" && eventLike.message.trim()) {
      return eventLike.message;
    }
    if (typeof eventLike.type === "string" && eventLike.type.trim()) {
      return `Event error: ${eventLike.type}`;
    }
    const asString = String(err);
    if (asString === "[object Event]") {
      return "Event error";
    }
    try {
      return JSON.stringify(err);
    } catch {
      return asString;
    }
  }

  return "Unknown runtime error";
};

const safeFormatStudyReport = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return formatStudyReport(trimmed);
  } catch (err) {
    const normalized = normalizeRuntimeError(err);
    if (process.env.NODE_ENV !== "production") {
      console.error("[StudyReportFormatter]", normalized, err);
    } else {
      console.error("[StudyReportFormatter]", normalized);
    }
    return trimmed;
  }
};

export const formatOptionalStudyReport = (value: string): string => {
  const trimmed = value.trim();
  return trimmed ? safeFormatStudyReport(trimmed) : "";
};

export const normalizeBook = (value: unknown): Book | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const id = isString(item.id) ? item.id : crypto.randomUUID();
  const subject = isString(item.subject) ? item.subject : "Diğer";
  const bookName = isString(item.bookName) ? item.bookName : "";

  if (!bookName.trim()) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id,
    subject: subject.trim() || "Diğer",
    bookName,
    solved: isString(item.solved) ? item.solved : "",
    todo: isString(item.todo) ? item.todo : "",
    targetDate: isString(item.targetDate) && isValidDateInput(item.targetDate) ? item.targetDate : todayDate,
    isCompleted: typeof item.isCompleted === "boolean" ? item.isCompleted : false,
    createdAt: isString(item.createdAt) ? item.createdAt : now,
    updatedAt: isString(item.updatedAt) ? item.updatedAt : now
  };
};

export const normalizeLog = (value: unknown): ActivityLog | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const subject = isString(item.subject) ? item.subject : "Diğer";
  const bookName = isString(item.bookName) ? item.bookName : "";

  if (!bookName.trim()) {
    return null;
  }

  return {
    id: isString(item.id) ? item.id : crypto.randomUUID(),
    bookId: isString(item.bookId) ? item.bookId : "",
    subject: subject.trim() || "Diğer",
    bookName,
    solved: isString(item.solved) ? item.solved : "",
    todo: isString(item.todo) ? item.todo : "",
    targetDate: isString(item.targetDate) && isValidDateInput(item.targetDate) ? item.targetDate : todayDate,
    isCompleted: typeof item.isCompleted === "boolean" ? item.isCompleted : false,
    timestamp: isString(item.timestamp) ? item.timestamp : new Date().toISOString(),
    action: item.action === "created" ? "created" : "updated"
  };
};

const normalizeNumberField = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const calculateTotalNet = (exam: Pick<MockExam, "turkce" | "sosyal" | "matematik" | "fen">) =>
  Number((exam.turkce + exam.sosyal + exam.matematik + exam.fen).toFixed(2));

export const normalizeMockExam = (value: unknown): MockExam | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const date = isString(item.date) && isValidDateInput(item.date) ? item.date : todayDate;
  const examType: MockExamType = item.examType === "AYT" ? "AYT" : "TYT";
  const now = new Date().toISOString();
  const normalized: MockExam = {
    id: isString(item.id) ? item.id : crypto.randomUUID(),
    date,
    examType,
    turkce: normalizeNumberField(item.turkce),
    sosyal: normalizeNumberField(item.sosyal),
    matematik: normalizeNumberField(item.matematik),
    fen: normalizeNumberField(item.fen),
    totalNet: 0,
    createdAt: isString(item.createdAt) ? item.createdAt : now,
    updatedAt: isString(item.updatedAt) ? item.updatedAt : now
  };
  normalized.totalNet = calculateTotalNet(normalized);
  return normalized;
};

export const normalizePomodoroSession = (value: unknown): PomodoroSession | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const now = new Date().toISOString();

  return {
    id: isString(item.id) ? item.id : crypto.randomUUID(),
    mode: item.mode === "break" ? "break" : "study",
    startedAt: isString(item.startedAt) ? item.startedAt : now,
    endedAt: isString(item.endedAt) ? item.endedAt : now,
    plannedMinutes: normalizeNumberField(item.plannedMinutes) || 25,
    completed: typeof item.completed === "boolean" ? item.completed : false,
    createdAt: isString(item.createdAt) ? item.createdAt : now
  };
};

export const normalizeCoachSummary = (value: unknown): CoachSummary | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const weeklyReview = isString(item.weeklyReview) ? item.weeklyReview.trim() : "";
  const blockers = isString(item.blockers) ? item.blockers.trim() : "";
  const nextWeekGoal = isString(item.nextWeekGoal) ? item.nextWeekGoal.trim() : "";
  if (!weeklyReview || !blockers || !nextWeekGoal) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: isString(item.id) ? item.id : crypto.randomUUID(),
    meetingDate: isString(item.meetingDate) && isValidDateInput(item.meetingDate) ? item.meetingDate : todayDate,
    weeklyReview,
    blockers,
    nextWeekGoal,
    createdAt: isString(item.createdAt) ? item.createdAt : now,
    updatedAt: isString(item.updatedAt) ? item.updatedAt : now
  };
};

export const normalizeStreak = (value: unknown): StreakState => {
  if (!value || typeof value !== "object") {
    return { ...emptyStreak };
  }

  const item = value as Record<string, unknown>;
  return {
    current: Math.max(0, Math.trunc(normalizeNumberField(item.current))),
    lastCompletedDate:
      isString(item.lastCompletedDate) && isValidDateInput(item.lastCompletedDate) ? item.lastCompletedDate : null
  };
};

export const createLogFromBook = (book: Book, action: "created" | "updated", timestamp: string): ActivityLog => ({
  id: crypto.randomUUID(),
  bookId: book.id,
  subject: book.subject,
  bookName: book.bookName,
  solved: book.solved,
  todo: book.todo,
  targetDate: book.targetDate,
  isCompleted: book.isCompleted,
  timestamp,
  action
});

export const parseNumericInput = (value: string): number => {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const updateStreakForCompletion = (streak: StreakState, completionDate: string): StreakState => {
  if (streak.lastCompletedDate === completionDate) {
    return streak;
  }

  if (!streak.lastCompletedDate) {
    return { current: 1, lastCompletedDate: completionDate };
  }

  const previousDate = parseLocalDate(streak.lastCompletedDate);
  const nextDate = parseLocalDate(completionDate);
  const diffDays = Math.round((nextDate.getTime() - previousDate.getTime()) / 86400000);

  if (diffDays === 1) {
    return { current: streak.current + 1, lastCompletedDate: completionDate };
  }

  return { current: 1, lastCompletedDate: completionDate };
};
