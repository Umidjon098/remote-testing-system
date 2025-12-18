"use client";

import { useEffect, useState } from "react";

interface CompetitionTimerProps {
  endTime: number; // Unix timestamp in milliseconds
  onTimeout: () => void;
}

export function CompetitionTimer({
  endTime,
  onTimeout,
}: CompetitionTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = endTime - now;
      const remainingMs = Math.max(0, timeLeft);
      setRemaining(remainingMs);

      if (remainingMs === 0 && !hasTimedOut) {
        setHasTimedOut(true);
        onTimeout();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);

    return () => clearInterval(interval);
  }, [endTime, onTimeout, hasTimedOut]);

  const seconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  const getColorClass = () => {
    if (seconds < 60) return "bg-red-100 text-red-700 border-red-300";
    if (seconds < 300) return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">
            Musobaqa vaqti
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold border-2 ${getColorClass()}`}
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
      </div>
    </div>
  );
}
