"use client";

import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_DOCUMENT_TITLE, type PomodoroMode, type PomodoroSession } from "../lib/tracker";

type PomodoroStatus = "idle" | "running" | "paused" | "finished";

type PomodoroProps = {
  sessions: PomodoroSession[];
  onSessionComplete: (session: Omit<PomodoroSession, "id" | "createdAt">) => void;
};

const MODE_OPTIONS: { label: string; mode: PomodoroMode; minutes: number }[] = [
  { label: "25 dk çalışma", mode: "study", minutes: 25 },
  { label: "5 dk mola", mode: "break", minutes: 5 }
];

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function Pomodoro({ sessions, onSessionComplete }: PomodoroProps) {
  const [selectedMode, setSelectedMode] = useState<PomodoroMode>("study");
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [status, setStatus] = useState<PomodoroStatus>("idle");
  const startedAtRef = useRef<string | null>(null);

  const sessionLabel = useMemo(
    () => MODE_OPTIONS.find((option) => option.mode === selectedMode)?.label ?? "25 dk çalışma",
    [selectedMode]
  );

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [status]);

  useEffect(() => {
    if (status === "finished") {
      document.title = `Süre bitti: ${sessionLabel}`;
      return;
    }

    document.title = BASE_DOCUMENT_TITLE;
  }, [sessionLabel, status]);

  useEffect(() => {
    if (status !== "finished" || remainingSeconds !== 0 || !startedAtRef.current) {
      return;
    }

    const startedAt = startedAtRef.current;
    startedAtRef.current = null;
    onSessionComplete({
      mode: selectedMode,
      startedAt,
      endedAt: new Date().toISOString(),
      plannedMinutes,
      completed: true
    });
  }, [onSessionComplete, plannedMinutes, remainingSeconds, selectedMode, status]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "finished") {
        document.title = BASE_DOCUMENT_TITLE;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);

  const selectMode = (mode: PomodoroMode, minutes: number) => {
    setSelectedMode(mode);
    setPlannedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setStatus("idle");
    startedAtRef.current = null;
    document.title = BASE_DOCUMENT_TITLE;
  };

  const startTimer = () => {
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }
    setStatus("running");
  };

  const pauseTimer = () => {
    setStatus("paused");
  };

  const resetTimer = () => {
    setStatus("idle");
    setRemainingSeconds(plannedMinutes * 60);
    startedAtRef.current = null;
    document.title = BASE_DOCUMENT_TITLE;
  };

  useEffect(() => {
    if (remainingSeconds === 0 && status === "running") {
      setStatus("finished");
    }
  }, [remainingSeconds, status]);

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft dark:border-slate-700">
        <div className="flex flex-wrap gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => selectMode(option.mode, option.minutes)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedMode === option.mode
                  ? "bg-teal-500 text-slate-950"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{sessionLabel}</p>
          <p className="mt-4 font-[var(--font-display)] text-6xl font-bold tracking-tight">{formatClock(remainingSeconds)}</p>
          <p className="mt-3 text-sm text-slate-400">
            Durum: {status === "idle" ? "Hazır" : status === "running" ? "Çalışıyor" : status === "paused" ? "Duraklatıldı" : "Tamamlandı"}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {status === "running" ? (
            <button
              type="button"
              onClick={pauseTimer}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <Pause size={16} />
              Duraklat
            </button>
          ) : (
            <button
              type="button"
              onClick={startTimer}
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              <Play size={16} />
              {status === "paused" ? "Devam Et" : "Başlat"}
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            <RotateCcw size={16} />
            Sıfırla
          </button>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
              Son Seanslar
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Tamamlanan odak ve mola oturumları burada saklanır.</p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <TimerReset size={18} />
          </span>
        </div>

        {sessions.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Henüz kaydedilmiş Pomodoro seansı yok.
          </article>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {session.mode === "study" ? "Çalışma" : "Mola"} · {session.plannedMinutes} dk
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(session.startedAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                  Tamamlandı
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
