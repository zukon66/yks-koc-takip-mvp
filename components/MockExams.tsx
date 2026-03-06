"use client";

import { BarChart3, Plus, Trash2 } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { MockExam, MockExamDraft } from "../lib/tracker";

type MockExamsProps = {
  draft: MockExamDraft;
  setDraft: Dispatch<SetStateAction<MockExamDraft>>;
  exams: MockExam[];
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (id: string) => void;
};

const numberInputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

export default function MockExams({ draft, setDraft, exams, onCreate, onRemove }: MockExamsProps) {
  return (
    <section className="space-y-5">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
            <BarChart3 size={18} />
          </span>
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
              Yeni Deneme Ekle
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              TYT veya AYT sonuçlarını sakla, toplam neti otomatik hesapla.
            </p>
          </div>
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Tarih</span>
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
              className={numberInputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Sınav Türü</span>
            <select
              value={draft.examType}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, examType: event.target.value as MockExamDraft["examType"] }))
              }
              className={numberInputClass}
            >
              <option value="TYT">TYT</option>
              <option value="AYT">AYT</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Türkçe Net</span>
            <input
              inputMode="decimal"
              value={draft.turkce}
              onChange={(event) => setDraft((prev) => ({ ...prev, turkce: event.target.value }))}
              className={numberInputClass}
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Sosyal Net</span>
            <input
              inputMode="decimal"
              value={draft.sosyal}
              onChange={(event) => setDraft((prev) => ({ ...prev, sosyal: event.target.value }))}
              className={numberInputClass}
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Matematik Net</span>
            <input
              inputMode="decimal"
              value={draft.matematik}
              onChange={(event) => setDraft((prev) => ({ ...prev, matematik: event.target.value }))}
              className={numberInputClass}
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Fen Net</span>
            <input
              inputMode="decimal"
              value={draft.fen}
              onChange={(event) => setDraft((prev) => ({ ...prev, fen: event.target.value }))}
              className={numberInputClass}
              placeholder="0"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              <Plus size={16} />
              Denemeyi Kaydet
            </button>
          </div>
        </form>
      </article>

      <section className="space-y-3">
        {exams.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Henüz deneme kaydı yok.
          </article>
        ) : (
          exams.map((exam) => (
            <article
              key={exam.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {exam.examType} · {exam.date}
                  </p>
                  <p className="mt-1 font-[var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white">
                    {exam.totalNet} net
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(exam.id)}
                  className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/20"
                  aria-label="Denemeyi sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-4">
                <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">Türkçe: {exam.turkce}</div>
                <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">Sosyal: {exam.sosyal}</div>
                <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">Matematik: {exam.matematik}</div>
                <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">Fen: {exam.fen}</div>
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
