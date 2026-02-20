"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Moon,
  PencilLine,
  Plus,
  Save,
  Sun,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Book = {
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

type ActivityLog = {
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

type BookDraft = {
  subject: string;
  bookName: string;
  solved: string;
  todo: string;
  targetDate: string;
};

type EditDraft = {
  subject: string;
  bookName: string;
  solved: string;
  todo: string;
  targetDate: string;
  isCompleted: boolean;
};

type HistoryEditDraft = {
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

type Tab = "plan" | "books" | "notes";
type Theme = "light" | "dark";

type Toast = {
  type: "success" | "error";
  message: string;
};

type PersistedData = {
  books: Book[];
  logs: ActivityLog[];
};

type SubjectStyle = {
  badge: string;
  border: string;
  progress: string;
};

const STORAGE_KEY = "yks-koc-takip-data-v2";
const LEGACY_STORAGE_KEY = "yks-koc-takip-books-v1";
const THEME_STORAGE_KEY = "yks-koc-theme-v1";

const SUBJECT_OPTIONS = [
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

const SUBJECT_STYLES: Record<string, SubjectStyle> = {
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

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const isValidDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isKnownSubject = (value: string) => SUBJECT_OPTIONS.includes(value as (typeof SUBJECT_OPTIONS)[number]);

const todayDate = formatDateInput(new Date());

const emptyDraft: BookDraft = {
  subject: "Geometri",
  bookName: "",
  solved: "",
  todo: "",
  targetDate: todayDate
};

const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  weekday: "long"
});

const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit"
});

const isString = (value: unknown): value is string => typeof value === "string";
const getSubjectStyle = (subject: string) => SUBJECT_STYLES[subject] ?? SUBJECT_STYLES.Diğer;

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
const REPORT_FILLER_WORDS = new Set([
  "ve",
  "ile",
  "için",
  "bu",
  "şu",
  "bir",
  "olarak",
  "kadar",
  "de",
  "da"
]);
const SHORT_LINE_FALLBACKS = ["ana sonucu kısa not aldım", "notu şablona göre kaydettim"];

const toWords = (value: string): string[] =>
  value
    .split(/\s+/)
    .map((item) => item.replace(/[^0-9A-Za-zÇĞİÖŞÜçğıöşü-]/g, "").trim())
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

  return [
    title,
    "______",
    ...shortLines,
    "geldiğime yere kadar bitirdim",
    "Son",
    `kalan: ${remaining}`,
    "△1"
  ].join("\n");
};

const normalizeRuntimeError = (err: unknown): string => {
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

const formatOptionalStudyReport = (value: string): string => {
  const trimmed = value.trim();
  return trimmed ? safeFormatStudyReport(trimmed) : "";
};

const SubjectBadge = ({ subject }: { subject: string }) => {
  const style = getSubjectStyle(subject);
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${style.badge}`}>
      {subject}
    </span>
  );
};

const normalizeBook = (value: unknown): Book | null => {
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

const normalizeLog = (value: unknown): ActivityLog | null => {
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

const createLogFromBook = (book: Book, action: "created" | "updated", timestamp: string): ActivityLog => ({
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

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [books, setBooks] = useState<Book[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [draft, setDraft] = useState<BookDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<string, EditDraft>>({});
  const [historyEdit, setHistoryEdit] = useState<HistoryEditDraft | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        const parsed = JSON.parse(rawData) as Partial<PersistedData>;

        const loadedBooks = Array.isArray(parsed.books)
          ? parsed.books.map(normalizeBook).filter((item): item is Book => Boolean(item))
          : [];

        const loadedLogs = Array.isArray(parsed.logs)
          ? parsed.logs.map(normalizeLog).filter((item): item is ActivityLog => Boolean(item))
          : [];

        setBooks(loadedBooks);
        setLogs(loadedLogs);
        setIsReady(true);
        return;
      }

      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacyRaw) {
        setIsReady(true);
        return;
      }

      const parsedLegacy = JSON.parse(legacyRaw) as unknown;
      if (!Array.isArray(parsedLegacy)) {
        setIsReady(true);
        return;
      }

      const now = new Date().toISOString();
      const migratedBooks: Book[] = parsedLegacy
        .map(normalizeBook)
        .filter((item): item is Book => Boolean(item))
        .map((book) => ({
          ...book,
          createdAt: now,
          updatedAt: now
        }));

      const migratedLogs = migratedBooks.map((book) => createLogFromBook(book, "created", now));
      setBooks(migratedBooks);
      setLogs(migratedLogs);
    } catch {
      setBooks([]);
      setLogs([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const data: PersistedData = { books, logs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [books, logs, isReady]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const onRuntimeError = (source: "error" | "unhandledrejection", err: unknown) => {
      const normalized = normalizeRuntimeError(err);
      if (process.env.NODE_ENV !== "production") {
        console.error(`[Runtime:${source}]`, normalized, err);
      } else {
        console.error(`[Runtime:${source}]`, normalized);
      }
      setToast((prev) => prev ?? { type: "error", message: "Beklenmeyen bir hata yakalandı." });
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (!event.error && !event.message) {
        return;
      }
      onRuntimeError("error", event.error ?? event);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      onRuntimeError("unhandledrejection", event.reason ?? event);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const groupedBooks = useMemo(() => {
    return books.reduce<Record<string, Book[]>>((acc, item) => {
      const key = item.subject.trim() || "Diğer";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [books]);

  const sortedSubjects = useMemo(
    () => Object.keys(groupedBooks).sort((a, b) => a.localeCompare(b, "tr")),
    [groupedBooks]
  );

  const groupedLogs = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sorted.reduce<Record<string, ActivityLog[]>>((acc, item) => {
      const date = new Date(item.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    }, {});
  }, [logs]);

  const sortedLogDays = useMemo(
    () => Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [groupedLogs]
  );

  const dailyTasks = useMemo(
    () =>
      books
        .filter((book) => book.targetDate === selectedDate && book.todo.trim().length > 0)
        .sort((a, b) => {
          const subjectCompare = a.subject.localeCompare(b.subject, "tr");
          if (subjectCompare !== 0) {
            return subjectCompare;
          }
          return a.bookName.localeCompare(b.bookName, "tr");
        }),
    [books, selectedDate]
  );

  const completedTaskCount = useMemo(
    () => dailyTasks.filter((task) => task.isCompleted).length,
    [dailyTasks]
  );

  const totalTaskCount = dailyTasks.length;
  const progressPercent = totalTaskCount === 0 ? 0 : Math.round((completedTaskCount / totalTaskCount) * 100);

  const selectedDayLabel = useMemo(() => dayFormatter.format(parseLocalDate(selectedDate)), [selectedDate]);

  const moveSelectedDate = (direction: "prev" | "next") => {
    const base = parseLocalDate(selectedDate);
    const moved = new Date(base);
    moved.setDate(base.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(formatDateInput(moved));
  };

  const startEditing = (book: Book) => {
    setEditingId(book.id);
    setEditDrafts((prev) => ({
      ...prev,
      [book.id]: {
        subject: book.subject,
        bookName: book.bookName,
        solved: book.solved,
        todo: book.todo,
        targetDate: book.targetDate,
        isCompleted: book.isCompleted
      }
    }));
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = draft.subject.trim() || "Diğer";
    const bookName = draft.bookName.trim();

    if (!bookName) {
      return;
    }

    const timestamp = new Date().toISOString();
    const solvedReport = formatOptionalStudyReport(draft.solved);
    const todoReport = formatOptionalStudyReport(draft.todo);
    const nextBook: Book = {
      id: crypto.randomUUID(),
      subject,
      bookName,
      solved: solvedReport,
      todo: todoReport,
      targetDate: isValidDateInput(draft.targetDate) ? draft.targetDate : todayDate,
      isCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setBooks((prev) => [nextBook, ...prev]);
    setLogs((prev) => [createLogFromBook(nextBook, "created", timestamp), ...prev]);
    setDraft({ ...emptyDraft, targetDate: selectedDate, subject });
    setToast({ type: "success", message: "Kitap eklendi." });
  };

  const saveEditing = (bookId: string) => {
    const book = books.find((item) => item.id === bookId);
    const editDraft = editDrafts[bookId];

    if (!book || !editDraft) {
      return;
    }

    const nextSubject = editDraft.subject.trim() || "Diğer";
    const nextBookName = editDraft.bookName.trim();

    if (!nextBookName) {
      setToast({ type: "error", message: "Kitap adı boş bırakılamaz." });
      return;
    }

    const nextBook: Book = {
      ...book,
      subject: nextSubject,
      bookName: nextBookName,
      solved: formatOptionalStudyReport(editDraft.solved),
      todo: formatOptionalStudyReport(editDraft.todo),
      targetDate: isValidDateInput(editDraft.targetDate) ? editDraft.targetDate : todayDate,
      isCompleted: editDraft.isCompleted,
      updatedAt: new Date().toISOString()
    };

    setBooks((prev) => prev.map((item) => (item.id === bookId ? nextBook : item)));
    setLogs((prev) => [createLogFromBook(nextBook, "updated", nextBook.updatedAt), ...prev]);
    setEditingId(null);
    setToast({ type: "success", message: "Kitap notları güncellendi." });
  };

  const removeBook = (id: string) => {
    const approved = window.confirm("Bu kitabı ve bağlı kayıtları silmek istediğine emin misin?");
    if (!approved) {
      return;
    }

    setBooks((prev) => prev.filter((item) => item.id !== id));
    setLogs((prev) => prev.filter((item) => item.bookId !== id));
    if (editingId === id) {
      setEditingId(null);
    }
    setToast({ type: "success", message: "Kitap silindi." });
  };

  const toggleTaskComplete = (bookId: string, checked: boolean) => {
    let updatedBook: Book | null = null;

    setBooks((prev) =>
      prev.map((item) => {
        if (item.id !== bookId) {
          return item;
        }

        updatedBook = {
          ...item,
          isCompleted: checked,
          updatedAt: new Date().toISOString()
        };

        return updatedBook;
      })
    );

    if (updatedBook) {
      setLogs((prev) => [createLogFromBook(updatedBook as Book, "updated", (updatedBook as Book).updatedAt), ...prev]);
    }
  };

  const exportData = () => {
    const data = {
      version: 4,
      exportedAt: new Date().toISOString(),
      books,
      logs,
      theme
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "yks-takip-yedek.json";
    link.click();
    URL.revokeObjectURL(url);
    setToast({ type: "success", message: "Yedek indirildi." });
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      if (Array.isArray(parsed)) {
        const now = new Date().toISOString();
        const importedLegacyBooks = parsed
          .map(normalizeBook)
          .filter((item): item is Book => Boolean(item))
          .map((book) => ({
            ...book,
            createdAt: now,
            updatedAt: now
          }));

        setBooks(importedLegacyBooks);
        setLogs(importedLegacyBooks.map((book) => createLogFromBook(book, "created", now)));
        setEditingId(null);
        setEditDrafts({});
        setHistoryEdit(null);
        setToast({ type: "success", message: "Veriler başarıyla yüklendi." });
        return;
      }

      if (!parsed || typeof parsed !== "object") {
        throw new Error("invalid");
      }

      const payload = parsed as Partial<PersistedData> & { theme?: Theme };
      if (!Array.isArray(payload.books) || !Array.isArray(payload.logs)) {
        throw new Error("invalid");
      }

      const importedBooks = payload.books
        .map(normalizeBook)
        .filter((item): item is Book => Boolean(item));

      const importedLogs = payload.logs
        .map(normalizeLog)
        .filter((item): item is ActivityLog => Boolean(item));

      setBooks(importedBooks);
      setLogs(importedLogs);
      if (payload.theme === "light" || payload.theme === "dark") {
        setTheme(payload.theme);
      }
      setEditingId(null);
      setEditDrafts({});
      setHistoryEdit(null);
      setToast({ type: "success", message: "Veriler başarıyla yüklendi." });
    } catch {
      setToast({ type: "error", message: "Hatalı dosya." });
    } finally {
      event.target.value = "";
    }
  };

  const removeHistoryLog = (logId: string) => {
    const approved = window.confirm("Bu geçmiş kaydını silmek istediğine emin misin?");
    if (!approved) {
      return;
    }

    setLogs((prev) => prev.filter((item) => item.id !== logId));
    setToast({ type: "success", message: "Geçmiş kaydı silindi." });
  };

  const saveHistoryEdit = () => {
    if (!historyEdit) {
      return;
    }

    const nextBookName = historyEdit.bookName.trim();
    if (!nextBookName) {
      setToast({ type: "error", message: "Kitap adı boş bırakılamaz." });
      return;
    }

    const updatedLog: ActivityLog = {
      ...historyEdit,
      subject: historyEdit.subject.trim() || "Diğer",
      bookName: nextBookName,
      solved: formatOptionalStudyReport(historyEdit.solved),
      todo: formatOptionalStudyReport(historyEdit.todo),
      targetDate: isValidDateInput(historyEdit.targetDate) ? historyEdit.targetDate : todayDate
    };

    setLogs((prev) => prev.map((item) => (item.id === updatedLog.id ? updatedLog : item)));

    if (updatedLog.bookId) {
      setBooks((prev) =>
        prev.map((item) => {
          if (item.id !== updatedLog.bookId) {
            return item;
          }

          return {
            ...item,
            subject: updatedLog.subject,
            bookName: updatedLog.bookName,
            solved: updatedLog.solved,
            todo: updatedLog.todo,
            targetDate: updatedLog.targetDate,
            isCompleted: updatedLog.isCompleted,
            updatedAt: new Date().toISOString()
          };
        })
      );
    }

    setHistoryEdit(null);
    setToast({ type: "success", message: "Geçmiş kaydı güncellendi." });
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 text-slate-900 dark:text-slate-100">
      <header className="mb-4 rounded-2xl border border-teal-200/70 bg-white/90 p-5 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="inline-flex rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning dark:bg-amber-500/20 dark:text-amber-200">
            YKS Koç Görüşme Panosu
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              aria-label="Tema değiştir"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={exportData}
              className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-500/20 dark:text-teal-100"
            >
              <Download size={14} />
              Yedek Al
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Upload size={14} />
              Yedeği Yükle
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importData}
            />
          </div>
        </div>

        <h1 className="font-[var(--font-display)] text-2xl font-bold leading-tight text-slate-900 dark:text-white">
          Kitap taşıma derdi olmadan ilerlemeyi göster.
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Günlük plana odaklan, kitaplarını takip et, geçmiş görüşme notlarını tek ekranda yönet.
        </p>
      </header>

      <nav className="mb-5 grid grid-cols-3 rounded-xl border border-slate-200 bg-white p-1.5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab("plan")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === "plan"
              ? "bg-teal-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          Günlük Plan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("books")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === "books"
              ? "bg-teal-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          Kitap İşlemleri
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === "notes"
              ? "bg-teal-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          Geçmiş Notlar
        </button>
      </nav>

      {activeTab === "plan" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => moveSelectedDate("prev")}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Önceki gün"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-center">
              <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/20 dark:text-teal-100">
                <CalendarDays size={13} />
                Seçilen Gün
              </p>
              <p className="font-[var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">{selectedDayLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => moveSelectedDate("next")}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Sonraki gün"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Bugün: {totalTaskCount} görevin {completedTaskCount}&apos;ü tamamlandı (%{progressPercent})
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full transition-all duration-300 ${progressPercent === 100 ? "bg-emerald-500" : "bg-teal-500"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && totalTaskCount > 0 && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 size={14} className="animate-pulse" />
                Harika, bugünkü tüm görevler tamamlandı!
              </p>
            )}
          </article>

          {dailyTasks.length === 0 ? (
            <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              Bu gün için görev görünmüyor.
            </article>
          ) : (
            <ul className="space-y-3">
              {dailyTasks.map((task) => {
                const style = getSubjectStyle(task.subject);
                return (
                  <li
                    key={task.id}
                    className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900 ${style.border}`}
                  >
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={(event) => toggleTaskComplete(task.id, event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <SubjectBadge subject={task.subject} />
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {task.bookName}
                          </p>
                        </div>
                        <p
                          className={`whitespace-pre-line text-sm text-slate-800 transition dark:text-slate-200 ${
                            task.isCompleted ? "text-slate-400 line-through dark:text-slate-500" : ""
                          }`}
                        >
                          {task.todo}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {activeTab === "books" && (
        <section>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Yeni Kitap Ekle
            </h2>
            <form className="space-y-3" onSubmit={handleCreate}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Ders</span>
                <select
                  value={draft.subject}
                  onChange={(event) => setDraft((prev) => ({ ...prev, subject: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {SUBJECT_OPTIONS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Kitap Adı</span>
                <input
                  required
                  value={draft.bookName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, bookName: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="3D Yayınları Soru Bankası"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Hedef Tarih</span>
                <input
                  type="date"
                  value={draft.targetDate}
                  onChange={(event) => setDraft((prev) => ({ ...prev, targetDate: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Çözülen Yerler</span>
                <textarea
                  rows={2}
                  value={draft.solved}
                  onChange={(event) => setDraft((prev) => ({ ...prev, solved: event.target.value }))}
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Sayfa 10-45 bitti"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Boş Kalan / Ödevlik Yerler</span>
                <textarea
                  rows={2}
                  value={draft.todo}
                  onChange={(event) => setDraft((prev) => ({ ...prev, todo: event.target.value }))}
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-amber-500 transition focus:border-amber-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Fonksiyonlar testi boş, Sayfa 46-60"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
              >
                <Plus size={16} />
                Kitabı Kaydet
              </button>
            </form>
          </div>

          <section className="space-y-5">
            {sortedSubjects.length === 0 ? (
              <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                Henüz kitap eklenmedi. Yukarıdaki formdan ilk kitabını ekleyebilirsin.
              </article>
            ) : (
              sortedSubjects.map((subject) => (
                <article key={subject} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <SubjectBadge subject={subject} />
                    <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                      {subject}
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {groupedBooks[subject].map((book) => {
                      const style = getSubjectStyle(book.subject);
                      const editing = editingId === book.id;
                      const editDraft = editDrafts[book.id] ?? {
                        subject: book.subject,
                        bookName: book.bookName,
                        solved: book.solved,
                        todo: book.todo,
                        targetDate: book.targetDate,
                        isCompleted: book.isCompleted
                      };

                      return (
                        <div
                          key={book.id}
                          className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900 ${style.border}`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <h4 className="font-[var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
                              {book.bookName}
                            </h4>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => (editing ? cancelEditing() : startEditing(book))}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                aria-label="Düzenle"
                              >
                                <PencilLine size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBook(book.id)}
                                className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/20"
                                aria-label="Sil"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </div>

                          {editing ? (
                            <div className="space-y-3">
                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                  Ders
                                </span>
                                <select
                                  value={editDraft.subject}
                                  onChange={(event) =>
                                    setEditDrafts((prev) => ({
                                      ...prev,
                                      [book.id]: { ...editDraft, subject: event.target.value }
                                    }))
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                >
                                  {!isKnownSubject(editDraft.subject) && (
                                    <option value={editDraft.subject}>{editDraft.subject} (Eski)</option>
                                  )}
                                  {SUBJECT_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                  Kitap Adı
                                </span>
                                <input
                                  value={editDraft.bookName}
                                  onChange={(event) =>
                                    setEditDrafts((prev) => ({
                                      ...prev,
                                      [book.id]: { ...editDraft, bookName: event.target.value }
                                    }))
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                  Hedef Tarih
                                </span>
                                <input
                                  type="date"
                                  value={editDraft.targetDate}
                                  onChange={(event) =>
                                    setEditDrafts((prev) => ({
                                      ...prev,
                                      [book.id]: { ...editDraft, targetDate: event.target.value }
                                    }))
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                                  Çözülen Yerler
                                </span>
                                <textarea
                                  rows={2}
                                  value={editDraft.solved}
                                  onChange={(event) =>
                                    setEditDrafts((prev) => ({
                                      ...prev,
                                      [book.id]: { ...editDraft, solved: event.target.value }
                                    }))
                                  }
                                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                  Boş / Ödevlik Yerler
                                </span>
                                <textarea
                                  rows={2}
                                  value={editDraft.todo}
                                  onChange={(event) =>
                                    setEditDrafts((prev) => ({
                                      ...prev,
                                      [book.id]: { ...editDraft, todo: event.target.value }
                                    }))
                                  }
                                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 transition focus:border-amber-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                              </label>

                              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={editDraft.isCompleted}
                                  onChange={(event) =>
                                    setEditDrafts((prev) => ({
                                      ...prev,
                                      [book.id]: { ...editDraft, isCompleted: event.target.checked }
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                Günlük planda tamamlandı olarak işaretle
                              </label>

                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveEditing(book.id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  <Save size={14} />
                                  Kaydet
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                                >
                                  <X size={14} />
                                  Vazgeç
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2">
                                <SubjectBadge subject={book.subject} />
                              </div>
                              <p className="whitespace-pre-line rounded-xl bg-teal-50 p-3 text-teal-900 dark:bg-teal-500/20 dark:text-teal-100">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-200">
                                  Çözülen Yerler
                                </span>
                                {book.solved || "Henüz not girilmedi."}
                              </p>
                              <p className="whitespace-pre-line rounded-xl bg-amber-50 p-3 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
                                  Boş / Ödevlik Yerler
                                </span>
                                {book.todo || "Henüz not girilmedi."}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-300">
                                Hedef: {dayFormatter.format(parseLocalDate(book.targetDate))}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                                Son güncelleme: {timeFormatter.format(new Date(book.updatedAt))}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      )}

      {activeTab === "notes" && (
        <section className="space-y-5">
          {sortedLogDays.length === 0 ? (
            <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              Henüz geçmiş not bulunmuyor.
            </article>
          ) : (
            sortedLogDays.map((dayKey) => {
              const date = new Date(dayKey);
              return (
                <article key={dayKey} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="mb-4 font-[var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
                    {dayFormatter.format(date)}
                  </h3>

                  <ol className="space-y-4">
                    {groupedLogs[dayKey].map((item) => {
                      const style = getSubjectStyle(item.subject);
                      return (
                        <li key={item.id} className="relative pl-8">
                          <span className="absolute left-0 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-100">
                            <Clock3 size={12} />
                          </span>
                          <div
                            className={`rounded-xl border border-slate-200 border-l-4 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70 ${style.border}`}
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.bookName}</p>
                                <div className="mt-1">
                                  <SubjectBadge subject={item.subject} />
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
                                  {timeFormatter.format(new Date(item.timestamp))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setHistoryEdit({ ...item })}
                                  className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                                  aria-label="Geçmiş kaydını düzenle"
                                >
                                  <PencilLine size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeHistoryLog(item.id)}
                                  className="rounded-md p-1.5 text-rose-500 transition hover:bg-rose-100 dark:hover:bg-rose-500/20"
                                  aria-label="Geçmiş kaydını sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                              {item.action === "created" ? "Yeni kayıt" : "Güncelleme"} · Hedef: {dayFormatter.format(parseLocalDate(item.targetDate))}
                            </p>

                            <p className="mb-2 whitespace-pre-line rounded-lg bg-teal-50 p-2 text-xs text-teal-900 dark:bg-teal-500/20 dark:text-teal-100">
                              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-200">
                                Çözülen Yerler
                              </span>
                              {item.solved || "Henüz not girilmedi."}
                            </p>
                            <p className="whitespace-pre-line rounded-lg bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
                                Boş / Ödevlik Yerler
                              </span>
                              {item.todo || "Henüz not girilmedi."}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </article>
              );
            })
          )}
        </section>
      )}

      {historyEdit && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/35 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-[var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
                Geçmiş Kaydını Düzenle
              </h3>
              <button
                type="button"
                onClick={() => setHistoryEdit(null)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Ders</span>
                <select
                  value={historyEdit.subject}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, subject: event.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {!isKnownSubject(historyEdit.subject) && (
                    <option value={historyEdit.subject}>{historyEdit.subject} (Eski)</option>
                  )}
                  {SUBJECT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Kitap</span>
                <input
                  value={historyEdit.bookName}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, bookName: event.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Hedef Tarih</span>
                <input
                  type="date"
                  value={historyEdit.targetDate}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, targetDate: event.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">Çözülen Yerler</span>
                <textarea
                  rows={2}
                  value={historyEdit.solved}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, solved: event.target.value } : prev))
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Boş / Ödevlik Yerler
                </span>
                <textarea
                  rows={2}
                  value={historyEdit.todo}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, todo: event.target.value } : prev))
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 transition focus:border-amber-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={historyEdit.isCompleted}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, isCompleted: event.target.checked } : prev))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Tamamlandı
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={saveHistoryEdit}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Save size={14} />
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setHistoryEdit(null)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <X size={14} />
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg ${
            toast.type === "success" ? "bg-teal-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </main>
  );
}
