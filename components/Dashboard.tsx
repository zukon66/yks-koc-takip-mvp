"use client";

import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Flame, NotebookPen, Sparkles } from "lucide-react";
import type { Book, MockExam, StreakState, SubjectStyle } from "../lib/tracker";

type DashboardProps = {
  selectedDayLabel: string;
  totalTaskCount: number;
  completedTaskCount: number;
  progressPercent: number;
  pendingDailyTasks: Book[];
  totalBooks: number;
  latestMockExam: MockExam | null;
  streak: StreakState;
  getSubjectStyle: (subject: string) => SubjectStyle;
  onMoveSelectedDate: (direction: "prev" | "next") => void;
  onToggleTaskComplete: (bookId: string, checked: boolean) => void;
  onOpenCoachSummary: () => void;
};

export default function Dashboard({
  selectedDayLabel,
  totalTaskCount,
  completedTaskCount,
  progressPercent,
  pendingDailyTasks,
  totalBooks,
  latestMockExam,
  streak,
  getSubjectStyle,
  onMoveSelectedDate,
  onToggleTaskComplete,
  onOpenCoachSummary
}: DashboardProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => onMoveSelectedDate("prev")}
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
          <p className="font-[var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
            {selectedDayLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onMoveSelectedDate("next")}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Sonraki gün"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900 md:col-span-2">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Bugün: {totalTaskCount} görevin {completedTaskCount}&apos;ü tamamlandı (%{progressPercent})
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tamamlanmamış görevler aşağıda, gün sonu çizgisine odaklan.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
              <Sparkles size={13} />
              Bugünlük odak
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent === 100 ? "bg-emerald-500" : "bg-teal-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {progressPercent === 100 && totalTaskCount > 0 ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={14} className="animate-pulse" />
              Harika, bugünkü tüm görevler tamamlandı.
            </p>
          ) : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
              <Flame size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Motivasyon Serisi
              </p>
              <p className="font-[var(--font-display)] text-2xl font-bold text-slate-900 dark:text-white">
                {streak.current} gün
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Streak yalnızca bir günde en az bir görev tamamlandığında artar.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200">
              <NotebookPen size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Hızlı Koç Görüşmesi
              </p>
              <p className="font-[var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
                Haftalık özeti kaydet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenCoachSummary}
            className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            Koç Görüşmesi Ekle
          </button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Kitap Özeti
          </p>
          <p className="mt-2 font-[var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white">
            {totalBooks}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Takipteki toplam kaynak sayısı</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Son Deneme
          </p>
          <p className="mt-2 font-[var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white">
            {latestMockExam ? latestMockExam.totalNet : "-"}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {latestMockExam ? `${latestMockExam.examType} · ${latestMockExam.date}` : "Henüz deneme kaydı yok"}
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
              Bugünkü Görevler
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Sadece tamamlanmamış görevler listelenir.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            {pendingDailyTasks.length} açık görev
          </span>
        </div>

        {pendingDailyTasks.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Bu gün için tamamlanmamış görev görünmüyor.
          </article>
        ) : (
          <ul className="space-y-3">
            {pendingDailyTasks.map((task) => {
              const style = getSubjectStyle(task.subject);

              return (
                <li
                  key={task.id}
                  className={`rounded-2xl border border-slate-200 border-l-4 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 ${style.border}`}
                >
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={(event) => onToggleTaskComplete(task.id, event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${style.badge}`}>
                          {task.subject}
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {task.bookName}
                        </p>
                      </div>
                      <p className="whitespace-pre-line text-sm text-slate-800 dark:text-slate-200">{task.todo}</p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}
