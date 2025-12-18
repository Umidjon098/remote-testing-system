import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout";
import { CompetitionCard } from "@/components/competitions";

export default async function StudentCompetitionsPage() {
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch published competitions with test info and participant counts
  const { data: competitions } = await supabase
    .from("competitions")
    .select(
      `
      id,
      title,
      description,
      start_time,
      end_time,
      max_participants,
      test:tests(id, title),
      participant_count:competition_participants(count)
    `
    )
    .eq("published", true)
    .order("start_time", { ascending: false });

  // Separate query to get user's participations
  const { data: userParticipations } = await supabase
    .from("competition_participants")
    .select("competition_id, completed_at")
    .eq("student_id", user.id);

  const userParticipationMap = new Map(
    userParticipations?.map((p) => [p.competition_id, p.completed_at]) || []
  );

  return (
    <div>
      <PageHeader
        title="Musobaqalar"
        description="Musobaqalarda ishtirok eting va o'z bilimingizni sinab ko'ring"
      />

      {!competitions || competitions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Musobaqalar yo&apos;q
          </h3>
          <p className="text-slate-600">
            Hozircha faol musobaqalar mavjud emas
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => {
            const participantCount =
              competition.participant_count?.[0]?.count || 0;
            const hasJoined = userParticipationMap.has(competition.id);
            const hasCompleted = userParticipationMap.get(competition.id);

            return (
              <CompetitionCard
                key={competition.id}
                id={competition.id}
                title={competition.title}
                description={competition.description || ""}
                startTime={competition.start_time}
                endTime={competition.end_time}
                testTitle={
                  Array.isArray(competition.test)
                    ? competition.test[0]?.title || ""
                    : (competition.test as { title?: string })?.title || ""
                }
                participantCount={participantCount}
                maxParticipants={competition.max_participants}
                hasJoined={hasJoined}
                hasCompleted={!!hasCompleted}
                userRole="student"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
