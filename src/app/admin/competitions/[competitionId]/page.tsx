import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateCompetitionAction } from "./actions";
import { Button, Input, Textarea, Card, Badge } from "@/components/ui";
import {
  CompetitionStatusBadge,
  LeaderboardTable,
  type LeaderboardEntry,
} from "@/components/competitions";

interface PageProps {
  params: Promise<{ competitionId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function CompetitionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { competitionId } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Fetch competition with test info
  const { data: competition } = await supabase
    .from("competitions")
    .select(
      `
      *,
      test:tests(
        id,
        title,
        time_limit_seconds,
        questions(count)
      )
    `
    )
    .eq("id", competitionId)
    .single();

  if (!competition) {
    notFound();
  }

  // Fetch participants with their results
  const { data: participants } = await supabase
    .from("competition_participants")
    .select(
      `
      student_id,
      score,
      rank,
      time_taken,
      completed_at,
      profiles:student_id(full_name)
    `
    )
    .eq("competition_id", competitionId)
    .not("completed_at", "is", null)
    .order("rank", { ascending: true });

  // Transform participants data to leaderboard entries
  const leaderboardEntries: LeaderboardEntry[] =
    participants?.map((p) => ({
      rank: p.rank || 0,
      studentName: Array.isArray(p.profiles)
        ? p.profiles[0]?.full_name || "Unknown"
        : (p.profiles as { full_name?: string })?.full_name || "Unknown",
      score: p.score || 0,
      timeTaken: p.time_taken || 0,
    })) || [];

  // Count total participants (including those who haven't completed)
  const { count: totalParticipants } = await supabase
    .from("competition_participants")
    .select("*", { count: "exact", head: true })
    .eq("competition_id", competitionId);

  const testInfo = Array.isArray(competition.test)
    ? competition.test[0]
    : competition.test;

  const questionCount = testInfo?.questions?.[0]?.count || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/competitions">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Musobaqalarga qaytish
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {competition.title}
            </h1>
            <div className="flex items-center gap-3">
              <CompetitionStatusBadge
                startTime={competition.start_time}
                endTime={competition.end_time}
              />
              {!competition.published && (
                <Badge variant="default">Ko&apos;rinmaydigan</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-600">{decodeURIComponent(error)}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Ishtirokchilar</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalParticipants || 0}
                {competition.max_participants &&
                  ` / ${competition.max_participants}`}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600"
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
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Yakunlagan</p>
              <p className="text-2xl font-bold text-slate-900">
                {leaderboardEntries.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Savollar</p>
              <p className="text-2xl font-bold text-slate-900">
                {questionCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Form */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Musobaqa Ma&apos;lumotlarini Tahrirlash
        </h2>
        <form action={updateCompetitionAction} className="space-y-4">
          <input type="hidden" name="id" value={competition.id} />

          <Input
            name="title"
            label="Musobaqa Nomi"
            defaultValue={competition.title}
            required
          />

          <Textarea
            name="description"
            label="Tavsif"
            defaultValue={competition.description || ""}
            rows={3}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="start_date"
              type="datetime-local"
              label="Boshlanish Sanasi"
              defaultValue={new Date(competition.start_time)
                .toISOString()
                .slice(0, 16)}
              required
            />

            <Input
              name="end_date"
              type="datetime-local"
              label="Tugash Sanasi"
              defaultValue={new Date(competition.end_time)
                .toISOString()
                .slice(0, 16)}
              required
            />
          </div>

          <Input
            name="max_participants"
            type="number"
            label="Maksimal Ishtirokchilar Soni"
            defaultValue={competition.max_participants || ""}
            placeholder="Bo'sh qoldiring (cheklovsiz)"
            min={1}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              defaultChecked={competition.published}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="published" className="text-sm text-slate-700">
              O&apos;quvchilarga ko&apos;rinsin
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg">
              O&apos;zgarishlarni saqlash
            </Button>
            <Link href={`/student/competitions/${competition.id}`}>
              <Button variant="outline" size="lg">
                O&apos;quvchi ko&apos;rinishi
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {/* Leaderboard */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Natijalar Jadvali
        </h2>
        <LeaderboardTable
          entries={leaderboardEntries}
          maxScore={questionCount}
        />
      </div>
    </div>
  );
}
