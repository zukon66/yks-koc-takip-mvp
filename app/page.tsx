"use client";

import { AlertCircle, CheckCircle2, Download, Moon, Save, Sun, Upload, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import BookTracker from "../components/BookTracker";
import Dashboard from "../components/Dashboard";
import MockExams from "../components/MockExams";
import NotesLogs from "../components/NotesLogs";
import Pomodoro from "../components/Pomodoro";
import {
  LEGACY_STORAGE_KEY,
  PREVIOUS_STORAGE_KEY,
  STORAGE_KEY,
  SUBJECT_OPTIONS,
  THEME_STORAGE_KEY,
  createLogFromBook,
  dayFormatter,
  emptyCoachSummaryDraft,
  emptyDraft,
  emptyMockExamDraft,
  emptyStreak,
  formatDateInput,
  formatOptionalStudyReport,
  getSubjectStyle,
  isKnownSubject,
  isValidDateInput,
  normalizeBook,
  normalizeCoachSummary,
  normalizeLog,
  normalizeMockExam,
  normalizePomodoroSession,
  normalizeRuntimeError,
  normalizeStreak,
  parseLocalDate,
  parseNumericInput,
  timeFormatter,
  todayDate,
  updateStreakForCompletion,
  type ActivityLog,
  type Book,
  type CoachSummary,
  type CoachSummaryDraft,
  type EditDraft,
  type HistoryEditDraft,
  type MockExam,
  type MockExamDraft,
  type PersistedData,
  type PomodoroSession,
  type StreakState,
  type Tab,
  type Theme,
  type Toast
} from "../lib/tracker";

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [books, setBooks] = useState<Book[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [coachSummaries, setCoachSummaries] = useState<CoachSummary[]>([]);
  const [streak, setStreak] = useState<StreakState>(emptyStreak);
  const [draft, setDraft] = useState(emptyDraft);
  const [mockExamDraft, setMockExamDraft] = useState<MockExamDraft>(emptyMockExamDraft);
  const [coachSummaryDraft, setCoachSummaryDraft] = useState<CoachSummaryDraft>(emptyCoachSummaryDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<string, EditDraft>>({});
  const [historyEdit, setHistoryEdit] = useState<HistoryEditDraft | null>(null);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
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
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const loadPersistedData = () => {
      const rawV3 = localStorage.getItem(STORAGE_KEY);
      if (rawV3) {
        const parsed = JSON.parse(rawV3) as Partial<PersistedData>;
        return {
          books: Array.isArray(parsed.books) ? parsed.books.map(normalizeBook).filter((item): item is Book => Boolean(item)) : [],
          logs: Array.isArray(parsed.logs) ? parsed.logs.map(normalizeLog).filter((item): item is ActivityLog => Boolean(item)) : [],
          mockExams: Array.isArray(parsed.mockExams) ? parsed.mockExams.map(normalizeMockExam).filter((item): item is MockExam => Boolean(item)) : [],
          pomodoroSessions: Array.isArray(parsed.pomodoroSessions) ? parsed.pomodoroSessions.map(normalizePomodoroSession).filter((item): item is PomodoroSession => Boolean(item)) : [],
          coachSummaries: Array.isArray(parsed.coachSummaries) ? parsed.coachSummaries.map(normalizeCoachSummary).filter((item): item is CoachSummary => Boolean(item)) : [],
          streak: normalizeStreak(parsed.streak),
          theme: null as Theme | null
        };
      }

      const rawV2 = localStorage.getItem(PREVIOUS_STORAGE_KEY);
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as Partial<PersistedData> & { theme?: Theme };
        return {
          books: Array.isArray(parsed.books) ? parsed.books.map(normalizeBook).filter((item): item is Book => Boolean(item)) : [],
          logs: Array.isArray(parsed.logs) ? parsed.logs.map(normalizeLog).filter((item): item is ActivityLog => Boolean(item)) : [],
          mockExams: [],
          pomodoroSessions: [],
          coachSummaries: [],
          streak: emptyStreak,
          theme: parsed.theme ?? null
        };
      }

      return null;
    };

    try {
      const persisted = loadPersistedData();
      if (persisted) {
        setBooks(persisted.books);
        setLogs(persisted.logs);
        setMockExams(persisted.mockExams);
        setPomodoroSessions(persisted.pomodoroSessions);
        setCoachSummaries(persisted.coachSummaries);
        setStreak(persisted.streak);
        if (persisted.theme === "dark" || persisted.theme === "light") {
          setTheme(persisted.theme);
        }
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

      setBooks(migratedBooks);
      setLogs(migratedBooks.map((book) => createLogFromBook(book, "created", now)));
      setStreak(emptyStreak);
    } catch {
      setBooks([]);
      setLogs([]);
      setMockExams([]);
      setPomodoroSessions([]);
      setCoachSummaries([]);
      setStreak(emptyStreak);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const data: PersistedData = {
      books,
      logs,
      mockExams,
      pomodoroSessions,
      coachSummaries,
      streak
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [books, logs, mockExams, pomodoroSessions, coachSummaries, streak, isReady]);

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

  const groupedBooks = useMemo(
    () =>
      books.reduce<Record<string, Book[]>>((acc, item) => {
        const key = item.subject.trim() || "Diğer";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {}),
    [books]
  );

  const sortedSubjects = useMemo(
    () => Object.keys(groupedBooks).sort((a, b) => a.localeCompare(b, "tr")),
    [groupedBooks]
  );

  const groupedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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

  const sortedMockExams = useMemo(
    () =>
      [...mockExams].sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) {
          return dateDiff;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [mockExams]
  );

  const sortedPomodoroSessions = useMemo(
    () => [...pomodoroSessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
    [pomodoroSessions]
  );

  const sortedCoachSummaries = useMemo(
    () =>
      [...coachSummaries].sort((a, b) => {
        const meetingDiff = new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime();
        if (meetingDiff !== 0) {
          return meetingDiff;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [coachSummaries]
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

  const pendingDailyTasks = useMemo(() => dailyTasks.filter((task) => !task.isCompleted), [dailyTasks]);
  const completedTaskCount = useMemo(() => dailyTasks.filter((task) => task.isCompleted).length, [dailyTasks]);
  const totalTaskCount = dailyTasks.length;
  const progressPercent = totalTaskCount === 0 ? 0 : Math.round((completedTaskCount / totalTaskCount) * 100);
  const selectedDayLabel = useMemo(() => dayFormatter.format(parseLocalDate(selectedDate)), [selectedDate]);
  const latestMockExam = sortedMockExams[0] ?? null;

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
    const nextBook: Book = {
      id: crypto.randomUUID(),
      subject,
      bookName,
      solved: formatOptionalStudyReport(draft.solved),
      todo: formatOptionalStudyReport(draft.todo),
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

    const nextBookName = editDraft.bookName.trim();
    if (!nextBookName) {
      setToast({ type: "error", message: "Kitap adı boş bırakılamaz." });
      return;
    }

    const nextBook: Book = {
      ...book,
      subject: editDraft.subject.trim() || "Diğer",
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
    if (!window.confirm("Bu kitabı ve bağlı kayıtları silmek istediğine emin misin?")) {
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
    let completedNow = false;

    setBooks((prev) =>
      prev.map((item) => {
        if (item.id !== bookId) {
          return item;
        }

        completedNow = checked && !item.isCompleted;
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

    if (completedNow) {
      setStreak((prev) => updateStreakForCompletion(prev, formatDateInput(new Date())));
    }
  };

  const handleCreateMockExam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const timestamp = new Date().toISOString();
    const nextMockExam: MockExam = {
      id: crypto.randomUUID(),
      date: isValidDateInput(mockExamDraft.date) ? mockExamDraft.date : formatDateInput(new Date()),
      examType: mockExamDraft.examType,
      turkce: parseNumericInput(mockExamDraft.turkce),
      sosyal: parseNumericInput(mockExamDraft.sosyal),
      matematik: parseNumericInput(mockExamDraft.matematik),
      fen: parseNumericInput(mockExamDraft.fen),
      totalNet: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    nextMockExam.totalNet = Number(
      (nextMockExam.turkce + nextMockExam.sosyal + nextMockExam.matematik + nextMockExam.fen).toFixed(2)
    );

    setMockExams((prev) => [nextMockExam, ...prev]);
    setMockExamDraft(emptyMockExamDraft);
    setToast({ type: "success", message: "Deneme kaydedildi." });
  };

  const removeMockExam = (id: string) => {
    if (!window.confirm("Bu deneme kaydını silmek istediğine emin misin?")) {
      return;
    }
    setMockExams((prev) => prev.filter((item) => item.id !== id));
    setToast({ type: "success", message: "Deneme silindi." });
  };

  const handlePomodoroComplete = (session: Omit<PomodoroSession, "id" | "createdAt">) => {
    const timestamp = new Date().toISOString();
    setPomodoroSessions((prev) => [{ id: crypto.randomUUID(), createdAt: timestamp, ...session }, ...prev]);
    setToast({ type: "success", message: "Pomodoro seansı kaydedildi." });
  };

  const handleCreateCoachSummary = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const weeklyReview = coachSummaryDraft.weeklyReview.trim();
    const blockers = coachSummaryDraft.blockers.trim();
    const nextWeekGoal = coachSummaryDraft.nextWeekGoal.trim();
    if (!weeklyReview || !blockers || !nextWeekGoal) {
      setToast({ type: "error", message: "Tüm koç görüşmesi alanları zorunlu." });
      return;
    }

    const timestamp = new Date().toISOString();
    const nextSummary: CoachSummary = {
      id: crypto.randomUUID(),
      meetingDate: isValidDateInput(coachSummaryDraft.meetingDate) ? coachSummaryDraft.meetingDate : todayDate,
      weeklyReview,
      blockers,
      nextWeekGoal,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setCoachSummaries((prev) => [nextSummary, ...prev]);
    setCoachSummaryDraft(emptyCoachSummaryDraft);
    setIsCoachModalOpen(false);
    setToast({ type: "success", message: "Koç görüşmesi kaydedildi." });
  };

  const exportData = () => {
    const data = {
      version: 5,
      exportedAt: new Date().toISOString(),
      books,
      logs,
      mockExams,
      pomodoroSessions,
      coachSummaries,
      streak,
      theme
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
        setMockExams([]);
        setPomodoroSessions([]);
        setCoachSummaries([]);
        setStreak(emptyStreak);
        setToast({ type: "success", message: "Eski veri formatı başarıyla yüklendi." });
        return;
      }

      if (!parsed || typeof parsed !== "object") {
        throw new Error("invalid");
      }

      const payload = parsed as Partial<PersistedData> & { theme?: Theme };
      setBooks(Array.isArray(payload.books) ? payload.books.map(normalizeBook).filter((item): item is Book => Boolean(item)) : []);
      setLogs(Array.isArray(payload.logs) ? payload.logs.map(normalizeLog).filter((item): item is ActivityLog => Boolean(item)) : []);
      setMockExams(Array.isArray(payload.mockExams) ? payload.mockExams.map(normalizeMockExam).filter((item): item is MockExam => Boolean(item)) : []);
      setPomodoroSessions(Array.isArray(payload.pomodoroSessions) ? payload.pomodoroSessions.map(normalizePomodoroSession).filter((item): item is PomodoroSession => Boolean(item)) : []);
      setCoachSummaries(Array.isArray(payload.coachSummaries) ? payload.coachSummaries.map(normalizeCoachSummary).filter((item): item is CoachSummary => Boolean(item)) : []);
      setStreak(normalizeStreak(payload.streak));
      if (payload.theme === "dark" || payload.theme === "light") {
        setTheme(payload.theme);
      }
      setToast({ type: "success", message: "Veriler başarıyla yüklendi." });
    } catch {
      setToast({ type: "error", message: "Hatalı dosya." });
    } finally {
      setEditingId(null);
      setEditDrafts({});
      setHistoryEdit(null);
      setIsCoachModalOpen(false);
      event.target.value = "";
    }
  };

  const removeHistoryLog = (logId: string) => {
    if (!window.confirm("Bu geçmiş kaydını silmek istediğine emin misin?")) {
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
        prev.map((item) =>
          item.id === updatedLog.bookId
            ? {
                ...item,
                subject: updatedLog.subject,
                bookName: updatedLog.bookName,
                solved: updatedLog.solved,
                todo: updatedLog.todo,
                targetDate: updatedLog.targetDate,
                isCompleted: updatedLog.isCompleted,
                updatedAt: new Date().toISOString()
              }
            : item
        )
      );
    }

    setHistoryEdit(null);
    setToast({ type: "success", message: "Geçmiş kaydı güncellendi." });
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6 text-slate-900 dark:text-slate-100">
      <header className="mb-4 rounded-2xl border border-teal-200/70 bg-white/90 p-5 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning dark:bg-amber-500/20 dark:text-amber-200">
              YKS Koç Görüşme Panosu
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              İlerlemeyi, denemeleri ve odak seanslarını tek merkezde tut.
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Dashboard ile güne bak, kitapları yönet, deneme sonuçlarını kaydet ve çalışma ritmini Pomodoro ile koru.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
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

        <nav className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950/40 sm:grid-cols-5">
          {[
            { id: "plan", label: "Dashboard" },
            { id: "books", label: "Books" },
            { id: "notes", label: "Notes" },
            { id: "mockExams", label: "Mock Exams" },
            { id: "pomodoro", label: "Pomodoro" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === "plan" && (
        <Dashboard
          selectedDayLabel={selectedDayLabel}
          totalTaskCount={totalTaskCount}
          completedTaskCount={completedTaskCount}
          progressPercent={progressPercent}
          pendingDailyTasks={pendingDailyTasks}
          totalBooks={books.length}
          latestMockExam={latestMockExam}
          streak={streak}
          getSubjectStyle={getSubjectStyle}
          onMoveSelectedDate={moveSelectedDate}
          onToggleTaskComplete={toggleTaskComplete}
          onOpenCoachSummary={() => setIsCoachModalOpen(true)}
        />
      )}

      {activeTab === "books" && (
        <BookTracker
          draft={draft}
          setDraft={setDraft}
          onCreate={handleCreate}
          subjectOptions={SUBJECT_OPTIONS}
          sortedSubjects={sortedSubjects}
          groupedBooks={groupedBooks}
          editingId={editingId}
          editDrafts={editDrafts}
          setEditDrafts={setEditDrafts}
          isKnownSubject={isKnownSubject}
          getSubjectStyle={getSubjectStyle}
          formatTargetDate={(value) => dayFormatter.format(parseLocalDate(value))}
          formatUpdatedAt={(value) => timeFormatter.format(new Date(value))}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSaveEditing={saveEditing}
          onRemoveBook={removeBook}
        />
      )}

      {activeTab === "notes" && (
        <NotesLogs
          sortedLogDays={sortedLogDays}
          groupedLogs={groupedLogs}
          coachSummaries={sortedCoachSummaries}
          getSubjectStyle={getSubjectStyle}
          formatDay={(value) => dayFormatter.format(value)}
          formatTargetDate={(value) => dayFormatter.format(parseLocalDate(value))}
          formatTime={(value) => timeFormatter.format(new Date(value))}
          formatMeetingDate={(value) => dayFormatter.format(parseLocalDate(value))}
          setHistoryEdit={setHistoryEdit}
          onRemoveHistoryLog={removeHistoryLog}
        />
      )}

      {activeTab === "mockExams" && (
        <MockExams
          draft={mockExamDraft}
          setDraft={setMockExamDraft}
          exams={sortedMockExams}
          onCreate={handleCreateMockExam}
          onRemove={removeMockExam}
        />
      )}

      {activeTab === "pomodoro" && (
        <Pomodoro sessions={sortedPomodoroSessions} onSessionComplete={handlePomodoroComplete} />
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
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Ders
                </span>
                <select
                  value={historyEdit.subject}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, subject: event.target.value } : prev))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {!isKnownSubject(historyEdit.subject) ? (
                    <option value={historyEdit.subject}>{historyEdit.subject} (Eski)</option>
                  ) : null}
                  {SUBJECT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Kitap
                </span>
                <input
                  value={historyEdit.bookName}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, bookName: event.target.value } : prev))
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
                  value={historyEdit.targetDate}
                  onChange={(event) =>
                    setHistoryEdit((prev) => (prev ? { ...prev, targetDate: event.target.value } : prev))
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

      {isCoachModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/35 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-[var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
                Koç Görüşme Özeti
              </h3>
              <button
                type="button"
                onClick={() => setIsCoachModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleCreateCoachSummary}>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Görüşme Tarihi
                </span>
                <input
                  type="date"
                  value={coachSummaryDraft.meetingDate}
                  onChange={(event) =>
                    setCoachSummaryDraft((prev) => ({ ...prev, meetingDate: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Haftanın Değerlendirmesi
                </span>
                <textarea
                  rows={4}
                  value={coachSummaryDraft.weeklyReview}
                  onChange={(event) =>
                    setCoachSummaryDraft((prev) => ({ ...prev, weeklyReview: event.target.value }))
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 transition focus:border-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Zorlanılan Konular
                </span>
                <textarea
                  rows={4}
                  value={coachSummaryDraft.blockers}
                  onChange={(event) => setCoachSummaryDraft((prev) => ({ ...prev, blockers: event.target.value }))}
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-amber-500 transition focus:border-amber-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                  Gelecek Haftanın Hedefi
                </span>
                <textarea
                  rows={4}
                  value={coachSummaryDraft.nextWeekGoal}
                  onChange={(event) =>
                    setCoachSummaryDraft((prev) => ({ ...prev, nextWeekGoal: event.target.value }))
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Save size={14} />
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setIsCoachModalOpen(false)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  <X size={14} />
                  Vazgeç
                </button>
              </div>
            </form>
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
