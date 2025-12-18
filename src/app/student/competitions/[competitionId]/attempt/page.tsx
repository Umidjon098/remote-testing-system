import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CompetitionRunner } from "./CompetitionRunner";

interface PageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function CompetitionAttemptPage({ params }: PageProps) {
  const { competitionId } = await params;
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a participant
  const { data: participation } = await supabase
    .from("competition_participants")
    .select("*")
    .eq("competition_id", competitionId)
    .eq("student_id", user.id)
    .single();

  if (!participation) {
    redirect(`/student/competitions/${competitionId}?error=Not a participant`);
  }

  // If already completed, redirect to results
  if (participation.completed_at) {
    redirect(`/student/competitions/${competitionId}/results`);
  }

  // Fetch competition with test and questions
  const { data: competition } = await supabase
    .from("competitions")
    .select(
      `
      id,
      start_time,
      end_time,
      test:tests(
        id,
        time_limit_seconds,
        questions(
          id,
          question_text,
          options(
            id,
            option_text
          )
        )
      )
    `
    )
    .eq("id", competitionId)
    .single();

  if (!competition) {
    notFound();
  }

  // Check if competition is still active
  const now = new Date();
  const endDate = new Date(competition.end_time);

  if (now > endDate) {
    redirect(
      `/student/competitions/${competitionId}?error=Competition has ended`
    );
  }

  const testInfo = Array.isArray(competition.test)
    ? competition.test[0]
    : competition.test;

  const questions = testInfo?.questions || [];

  if (questions.length === 0) {
    redirect(
      `/student/competitions/${competitionId}?error=No questions available`
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CompetitionRunner
        competitionId={competitionId}
        questions={questions}
        timeLimitSeconds={testInfo?.time_limit_seconds || 600}
      />
    </div>
  );
}
