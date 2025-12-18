"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { submitAttemptAction } from "@/app/student/tests/[testId]/actions";
import { Button, Card } from "@/components/ui";

type Question = {
  id: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
};

export default function AttemptRunner(props: {
  attemptId: string;
  testTitle: string;
  startedAt: string;
  timeLimitSeconds: number;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const startedAtMs = useMemo(
    () => new Date(props.startedAt).getTime(),
    [props.startedAt]
  );
  const [nowMs, setNowMs] = useState(() => Date.now());

  const remainingMs = Math.max(
    0,
    startedAtMs + props.timeLimitSeconds * 1000 - nowMs
  );
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const selectedCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, props.questions.length - selectedCount);

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (remainingMs !== 0) return;
    // Auto-submit once on timeout
    startTransition(async () => {
      await submitAttemptAction({
        attempt_id: props.attemptId,
        answers,
        expired: true,
      });
      window.location.href = "/student/results";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  function submit(expired: boolean) {
    setMessage(null);
    startTransition(async () => {
      const res = await submitAttemptAction({
        attempt_id: props.attemptId,
        answers,
        expired,
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      window.location.href = "/student/results";
    });
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Test Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{props.testTitle}</h1>
        <p className="text-slate-600 mt-1">Focus and do your best</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Questions Section */}
        <section className="lg:col-span-8 space-y-6">
          {props.questions.map((q, idx) => (
            <Card key={q.id} variant="bordered" padding="lg">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      Question {idx + 1} of {props.questions.length}
                    </span>
                  </div>
                  <p className="text-lg text-slate-900 leading-relaxed">
                    {q.prompt}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {q.options.map((o) => {
                  const active = answers[q.id] === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        active
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      } ${
                        pending || remainingMs === 0
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={o.id}
                        checked={active}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: o.id }))
                        }
                        disabled={pending || remainingMs === 0}
                        className="mt-0.5 w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      />
                      <span
                        className={`flex-1 text-base ${
                          active
                            ? "text-indigo-900 font-medium"
                            : "text-slate-700"
                        }`}
                      >
                        {o.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}

          {message && (
            <Card variant="bordered" padding="md">
              <p className="text-red-600">{message}</p>
            </Card>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            {/* Timer Card */}
            <Card variant="bordered" padding="md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Time Remaining
                </span>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                    remainingSeconds < 60
                      ? "bg-red-100 text-red-700"
                      : remainingSeconds < 300
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {mm}:{ss}
                </div>
              </div>
            </Card>

            {/* Progress Card */}
            <Card variant="bordered" padding="md">
              <h3 className="text-sm font-medium text-slate-700 mb-4">
                Your Progress
              </h3>

              <div className="grid grid-cols-8 gap-2 mb-4">
                {props.questions.map((q, idx) => {
                  const done = Boolean(answers[q.id]);
                  return (
                    <div
                      key={q.id}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium border-2 transition-all ${
                        done
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      title={done ? "Answered" : "Not answered"}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {selectedCount}
                  </div>
                  <div className="text-xs text-slate-600">Answered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {unansweredCount}
                  </div>
                  <div className="text-xs text-slate-600">Remaining</div>
                </div>
              </div>
            </Card>

            {/* Submit Card */}
            <Card variant="bordered" padding="md">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => submit(false)}
                disabled={pending || remainingMs === 0}
              >
                {pending ? "Submitting..." : "Submit Test"}
              </Button>
              <p className="text-xs text-center text-slate-500 mt-3">
                Make sure you&apos;ve answered all questions
              </p>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
