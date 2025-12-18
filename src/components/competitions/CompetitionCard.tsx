import Link from "next/link";
import { Card, Button } from "@/components/ui";
import {
  CompetitionStatusBadge,
  getCompetitionStatus,
} from "./CompetitionStatus";

interface CompetitionCardProps {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  testTitle: string;
  participantCount: number;
  maxParticipants?: number | null;
  hasJoined?: boolean;
  hasCompleted?: boolean;
  userRole: "admin" | "student";
}

export function CompetitionCard({
  id,
  title,
  description,
  startTime,
  endTime,
  testTitle,
  participantCount,
  maxParticipants,
  hasJoined = false,
  hasCompleted = false,
  userRole,
}: CompetitionCardProps) {
  const status = getCompetitionStatus(startTime, endTime);
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionButton = () => {
    const isAdmin = userRole === "admin";

    if (isAdmin) {
      return (
        <Link href={`/admin/competitions/${id}`}>
          <Button variant="outline" fullWidth>
            Ko&apos;rish
          </Button>
        </Link>
      );
    }

    if (hasCompleted) {
      return (
        <Link href={`/student/competitions/${id}/results`}>
          <Button variant="outline" fullWidth>
            Natijalar
          </Button>
        </Link>
      );
    }

    if (status === "active") {
      if (hasJoined) {
        return (
          <Link href={`/student/competitions/${id}/attempt`}>
            <Button variant="primary" fullWidth>
              Boshlash
            </Button>
          </Link>
        );
      }
      return (
        <Link href={`/student/competitions/${id}`}>
          <Button variant="primary" fullWidth>
            Qatnashish
          </Button>
        </Link>
      );
    }

    if (status === "ended") {
      return (
        <Link href={`/student/competitions/${id}`}>
          <Button variant="outline" fullWidth>
            Natijalarni ko&apos;rish
          </Button>
        </Link>
      );
    }

    return (
      <Link href={`/student/competitions/${id}`}>
        <Button variant="outline" fullWidth>
          Tafsilotlar
        </Button>
      </Link>
    );
  };

  return (
    <Card
      variant="bordered"
      padding="lg"
      className="hover:shadow-lg transition-all duration-200"
    >
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <CompetitionStatusBadge startTime={startTime} endTime={endTime} />
          {hasJoined && (
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
              Qatnashgan
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 line-clamp-2 min-h-10">
          {description || "Musobaqa tavsifi yo'q"}
        </p>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-slate-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Test: {testTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">
            {formatDateTime(startDate)} - {formatDateTime(endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>
            {participantCount}
            {maxParticipants ? ` / ${maxParticipants}` : ""} ishtirokchi
          </span>
        </div>
      </div>

      {getActionButton()}
    </Card>
  );
}
