"use client";

import { Clock3, PencilLine, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ActivityLog, CoachSummary, HistoryEditDraft, SubjectStyle } from "../lib/tracker";

type NotesLogsProps = {
  sortedLogDays: string[];
  groupedLogs: Record<string, ActivityLog[]>;
  coachSummaries: CoachSummary[];
  getSubjectStyle: (subject: string) => SubjectStyle;
  formatDay: (value: Date) => string;
  formatTargetDate: (value: string) => string;
  formatTime: (value: string) => string;
  formatMeetingDate: (value: string) => string;
  setHistoryEdit: Dispatch<SetStateAction<HistoryEditDraft | null>>;
  onRemoveHistoryLog: (logId: string) => void;
};

export default function NotesLogs({
  sortedLogDays,
  groupedLogs,
  coachSummaries,
  getSubjectStyle,
  formatDay,
  formatTargetDate,
  formatTime,
  formatMeetingDate,
  setHistoryEdit,
  onRemoveHistoryLog
}: NotesLogsProps) {
  return (
    <section className="space-y-5">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
              Koç Görüşmeleri
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Yapılandırılmış haftalık görüşme özetleri</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            {coachSummaries.length} kayıt
          </span>
        </div>

        {coachSummaries.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Henüz koç görüşmesi kaydı yok.
          </article>
        ) : (
          <div className="space-y-3">
            {coachSummaries.map((summary) => (
              <article
                key={summary.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-[var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
                    {formatMeetingDate(summary.meetingDate)}
                  </p>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Kaydedildi: {formatTime(summary.updatedAt)}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Haftanın değerlendirmesi</p>
                    <p className="line-clamp-4 whitespace-pre-line">{summary.weeklyReview}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-100">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Zorlanılan konular</p>
                    <p className="line-clamp-4 whitespace-pre-line">{summary.blockers}</p>
                  </div>
                  <div className="rounded-xl bg-teal-50 p-3 text-sm text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Gelecek hafta hedefi</p>
                    <p className="line-clamp-4 whitespace-pre-line">{summary.nextWeekGoal}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>

      {sortedLogDays.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          Henüz geçmiş not bulunmuyor.
        </article>
      ) : (
        sortedLogDays.map((dayKey) => {
          const date = new Date(dayKey);

          return (
            <article
              key={dayKey}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              <h3 className="mb-4 font-[var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
                {formatDay(date)}
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
                              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${style.badge}`}>
                                {item.subject}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
                              {formatTime(item.timestamp)}
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
                              onClick={() => onRemoveHistoryLog(item.id)}
                              className="rounded-md p-1.5 text-rose-500 transition hover:bg-rose-100 dark:hover:bg-rose-500/20"
                              aria-label="Geçmiş kaydını sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                          {item.action === "created" ? "Yeni kayıt" : "Güncelleme"} · Hedef: {formatTargetDate(item.targetDate)}
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
  );
}
