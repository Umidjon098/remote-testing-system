"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export async function joinCompetitionAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const competitionId = formData.get("competition_id") as string;

  if (!competitionId) {
    redirect("/student/competitions?error=Missing competition ID");
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from("competition_participants")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("student_id", user.id)
    .single();

  if (existing) {
    redirect(
      `/student/competitions/${competitionId}?error=Already joined this competition`
    );
  }

  // Check competition status and participant limit
  const { data: competition } = await supabase
    .from("competitions")
    .select("id, start_time, end_time, max_participants, test_id")
    .eq("id", competitionId)
    .single();

  if (!competition) {
    redirect("/student/competitions?error=Competition not found");
  }

  // Check if user has already completed this test before
  const { data: previousAttempt } = await supabase
    .from("attempts")
    .select("id")
    .eq("test_id", competition.test_id)
    .eq("student_id", user.id)
    .not("submitted_at", "is", null)
    .single();

  if (previousAttempt) {
    redirect(
      `/student/competitions/${competitionId}?error=${encodeURIComponent(
        "Siz bu testni avval bajargansiz. Musobaqaga faqat yangi ishtirokchilar qatnasha oladi."
      )}`
    );
  }

  const now = new Date();
  const startDate = new Date(competition.start_time);
  const endDate = new Date(competition.end_time);

  if (now < startDate) {
    redirect(
      `/student/competitions/${competitionId}?error=Competition hasn't started yet`
    );
  }

  if (now > endDate) {
    redirect(
      `/student/competitions/${competitionId}?error=Competition has ended`
    );
  }

  // Check participant limit
  if (competition.max_participants) {
    const { count } = await supabase
      .from("competition_participants")
      .select("*", { count: "exact", head: true })
      .eq("competition_id", competitionId);

    if (count && count >= competition.max_participants) {
      redirect(
        `/student/competitions/${competitionId}?error=Competition is full`
      );
    }
  }

  // Join competition
  const { error } = await supabase.from("competition_participants").insert({
    competition_id: competitionId,
    student_id: user.id,
  });

  if (error) {
    // If already joined (duplicate key), redirect to attempt page
    if (error.code === "23505") {
      revalidatePath(`/student/competitions/${competitionId}`);
      redirect(`/student/competitions/${competitionId}/attempt`);
    }

    redirect(
      `/student/competitions/${competitionId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/student/competitions/${competitionId}`);
  revalidatePath(`/student/competitions/${competitionId}/attempt`);
  revalidatePath("/student/competitions");
  redirect(`/student/competitions/${competitionId}/attempt`);
}

export async function submitCompetitionAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const competitionId = formData.get("competition_id") as string;
  const answers = formData.get("answers") as string;

  if (!competitionId || !answers) {
    redirect("/student/competitions?error=Missing required data");
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parse answers
  const answerMap = JSON.parse(answers) as Record<string, string>;

  // Get competition info
  const { data: competition } = await supabase
    .from("competitions")
    .select("id, test_id")
    .eq("id", competitionId)
    .single();

  if (!competition) {
    redirect("/student/competitions?error=Competition not found");
  }

  // Use service client to get questions and correct answers
  const supabaseService = createSupabaseServiceClient();

  const { data: questions, error: questionsError } = await supabaseService
    .from("questions")
    .select("id")
    .eq("test_id", competition.test_id);

  if (questionsError || !questions || questions.length === 0) {
    console.error("Questions fetch error:", questionsError);
    redirect(
      `/student/competitions/${competitionId}?error=${encodeURIComponent(
        questionsError?.message || "No questions found"
      )}`
    );
  }

  // Get correct answers
  const { data: correctAnswers, error: correctError } = await supabaseService
    .from("correct_options")
    .select("question_id, option_id")
    .in(
      "question_id",
      questions.map((q) => q.id)
    );

  if (correctError) {
    console.error("Correct answers fetch error:", correctError);
    redirect(
      `/student/competitions/${competitionId}?error=${encodeURIComponent(
        correctError.message
      )}`
    );
  }

  // Calculate score
  let score = 0;
  correctAnswers?.forEach((correct) => {
    if (answerMap[correct.question_id] === correct.option_id) {
      score++;
    }
  });

  // Get start time from participant record
  const { data: participant } = await supabase
    .from("competition_participants")
    .select("joined_at")
    .eq("competition_id", competitionId)
    .eq("student_id", user.id)
    .single();

  if (!participant) {
    redirect("/student/competitions?error=Not a participant");
  }

  const timeTaken = Math.floor(
    (Date.now() - new Date(participant.joined_at).getTime()) / 1000
  );

  // Update participant record
  const { error } = await supabase
    .from("competition_participants")
    .update({
      score,
      time_taken: timeTaken,
      completed_at: new Date().toISOString(),
    })
    .eq("competition_id", competitionId)
    .eq("student_id", user.id);

  if (error) {
    redirect(
      `/student/competitions/${competitionId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  // Trigger rank update (the database function will handle this)
  await supabase.rpc("update_competition_ranks", {
    comp_id: competitionId,
  });

  revalidatePath(`/student/competitions/${competitionId}`);
  redirect(`/student/competitions/${competitionId}/results`);
}
