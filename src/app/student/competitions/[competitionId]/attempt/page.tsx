import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
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

  // Fetch competition basic info
  const { data: competition } = await supabase
    .from("competitions")
    .select("id, start_time, end_time, test_id")
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

  // Fetch test basic info
  const { data: test } = await supabase
    .from("tests")
    .select("id, time_limit_seconds")
    .eq("id", competition.test_id)
    .single();

  if (!test) {
    redirect(`/student/competitions/${competitionId}?error=Test not found`);
  }

  // Use service client to fetch questions (bypass RLS issues)
  const supabaseService = createSupabaseServiceClient();

  // Fetch questions without options first
  const { data: questionsData } = await supabaseService
    .from("questions")
    .select("id, prompt")
    .eq("test_id", competition.test_id);

  if (!questionsData || questionsData.length === 0) {
    redirect(
      `/student/competitions/${competitionId}?error=No questions available`
    );
  }

  // Fetch options for each question
  const questionsWithOptions = await Promise.all(
    questionsData.map(async (q) => {
      const { data: options } = await supabaseService
        .from("options")
        .select("id, text")
        .eq("question_id", q.id)
        .order("position");

      return {
        ...q,
        options: options || [],
      };
    })
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <CompetitionRunner
          competitionId={competitionId}
          questions={questionsWithOptions}
          timeLimitSeconds={test.time_limit_seconds || 600}
        />
      </div>
    </div>
  );
}
