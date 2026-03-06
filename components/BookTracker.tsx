"use client";

import { PencilLine, Plus, Save, Trash2, X } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Book, BookDraft, EditDraft, SubjectStyle } from "../lib/tracker";

type BookTrackerProps = {
  draft: BookDraft;
  setDraft: Dispatch<SetStateAction<BookDraft>>;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  subjectOptions: readonly string[];
  sortedSubjects: string[];
  groupedBooks: Record<string, Book[]>;
  editingId: string | null;
  editDrafts: Record<string, EditDraft>;
  setEditDrafts: Dispatch<SetStateAction<Record<string, EditDraft>>>;
  isKnownSubject: (value: string) => boolean;
  getSubjectStyle: (subject: string) => SubjectStyle;
  formatTargetDate: (value: string) => string;
  formatUpdatedAt: (value: string) => string;
  onStartEditing: (book: Book) => void;
  onCancelEditing: () => void;
  onSaveEditing: (bookId: string) => void;
  onRemoveBook: (bookId: string) => void;
};

export default function BookTracker({
  draft,
  setDraft,
  onCreate,
  subjectOptions,
  sortedSubjects,
  groupedBooks,
  editingId,
  editDrafts,
  setEditDrafts,
  isKnownSubject,
  getSubjectStyle,
  formatTargetDate,
  formatUpdatedAt,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onRemoveBook
}: BookTrackerProps) {
  return (
    <section>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
          Yeni Kitap Ekle
        </h2>
        <form className="space-y-3" onSubmit={onCreate}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Ders</span>
            <select
              value={draft.subject}
              onChange={(event) => setDraft((prev) => ({ ...prev, subject: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-teal-500 transition focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {subjectOptions.map((subject) => (
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
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Boş Kalan / Ödevlik Yerler
            </span>
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
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${getSubjectStyle(subject).badge}`}
                >
                  {subject}
                </span>
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
                            onClick={() => (editing ? onCancelEditing() : onStartEditing(book))}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label="Düzenle"
                          >
                            <PencilLine size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveBook(book.id)}
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
                              {!isKnownSubject(editDraft.subject) ? (
                                <option value={editDraft.subject}>{editDraft.subject} (Eski)</option>
                              ) : null}
                              {subjectOptions.map((item) => (
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
                              onClick={() => onSaveEditing(book.id)}
                              className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
                            >
                              <Save size={14} />
                              Kaydet
                            </button>
                            <button
                              type="button"
                              onClick={onCancelEditing}
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
                            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${style.badge}`}>
                              {book.subject}
                            </span>
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
                            Hedef: {formatTargetDate(book.targetDate)}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400">
                            Son güncelleme: {formatUpdatedAt(book.updatedAt)}
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
  );
}
