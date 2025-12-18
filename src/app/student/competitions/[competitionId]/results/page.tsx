import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button, Card } from "@/components/ui";
import {
  LeaderboardTable,
  type LeaderboardEntry,
} from "@/components/competitions";

interface PageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function CompetitionResultsPage({ params }: PageProps) {
  const { competitionId } = await params;
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a participant and has completed
  const { data: participation } = await supabase
    .from("competition_participants")
    .select("*")
    .eq("competition_id", competitionId)
    .eq("student_id", user.id)
    .single();

  if (!participation) {
    redirect(`/student/competitions/${competitionId}?error=Not a participant`);
  }

  if (!participation.completed_at) {
    redirect(
      `/student/competitions/${competitionId}?error=Competition not completed`
    );
  }

  // Fetch competition info
  const { data: competition } = await supabase
    .from("competitions")
    .select(
      `
      id,
      title,
      test:tests(
        id,
        title,
        questions(count)
      )
    `
    )
    .eq("id", competitionId)
    .single();

  if (!competition) {
    notFound();
  }

  // Fetch all participants for leaderboard
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

  const leaderboardEntries: LeaderboardEntry[] =
    participants?.map((p) => ({
      rank: p.rank || 0,
      studentName: Array.isArray(p.profiles)
        ? p.profiles[0]?.full_name || "Unknown"
        : (p.profiles as { full_name?: string })?.full_name || "Unknown",
      score: p.score || 0,
      timeTaken: p.time_taken || 0,
      isCurrentUser: p.student_id === user.id,
    })) || [];

  const testInfo = Array.isArray(competition.test)
    ? competition.test[0]
    : competition.test;
  const maxScore = testInfo?.questions?.[0]?.count || 0;

  const userRank = participation.rank || 0;
  const userScore = participation.score || 0;

  const getRankBadge = () => {
    if (userRank === 1)
      return {
        emoji: "🥇",
        text: "1-o'rin",
        color: "bg-yellow-100 text-yellow-800",
      };
    if (userRank === 2)
      return {
        emoji: "🥈",
        text: "2-o'rin",
        color: "bg-gray-100 text-gray-800",
      };
    if (userRank === 3)
      return {
        emoji: "🥉",
        text: "3-o'rin",
        color: "bg-orange-100 text-orange-800",
      };
    return null;
  };

  const rankBadge = getRankBadge();

  return (
    <div>
      <div className="mb-8">
        <Link href="/student/competitions">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Musobaqalarga qaytish
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {competition.title}
        </h1>
        <p className="text-slate-600">Sizning natijangiz</p>
      </div>

      {/* User Result Card */}
      <Card
        variant="bordered"
        padding="lg"
        className={`mb-8 ${
          rankBadge ? "bg-linear-to-br from-indigo-50 to-purple-50" : ""
        }`}
      >
        <div className="text-center">
          {rankBadge && (
            <div className="mb-4">
              <span className="text-6xl">{rankBadge.emoji}</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Tabriklaymiz!
          </h2>
          <p className="text-slate-600 mb-6">
            Siz musobaqani muvaffaqiyatli yakunladingiz
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">
                Sizning o&apos;rningiz
              </p>
              <div className="flex items-center justify-center gap-2">
                {rankBadge && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${rankBadge.color}`}
                  >
                    {rankBadge.text}
                  </span>
                )}
                <p className="text-3xl font-bold text-indigo-600">
                  #{userRank}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Sizning ballingiz</p>
              <p className="text-3xl font-bold text-slate-900">
                {userScore}
                <span className="text-lg text-slate-500"> / {maxScore}</span>
              </p>
              <p className="text-sm text-slate-600 mt-2">
                {Math.round((userScore / maxScore) * 100)}% to&apos;g&apos;ri
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Vaqt</p>
              <p className="text-3xl font-bold text-slate-900">
                {Math.floor((participation.time_taken || 0) / 60)}:
                {String((participation.time_taken || 0) % 60).padStart(2, "0")}
              </p>
              <p className="text-sm text-slate-600 mt-2">daqiqa</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Umumiy Natijalar
        </h2>
        <LeaderboardTable entries={leaderboardEntries} maxScore={maxScore} />
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center">
        <Link href="/student/competitions">
          <Button variant="primary" size="lg">
            Boshqa musobaqalarni ko&apos;rish
          </Button>
        </Link>
      </div>
    </div>
  );
}
