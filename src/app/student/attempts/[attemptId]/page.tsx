import Link from "next/link";
import AttemptRunner from "./AttemptRunner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: attempt } = await supabase
    .from("attempts")
    .select("id,test_id,status,started_at")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt) {
    return (
      <div className="space-y-3">
        <p>Attempt not found.</p>
        <Link className="underline" href="/student/tests">
          Back
        </Link>
      </div>
    );
  }

  if (attempt.status !== "in_progress") {
    return (
      <div className="space-y-3">
        <p>This attempt is already finished.</p>
        <Link className="underline" href="/student/results">
          Go to results
        </Link>
      </div>
    );
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id,title,time_limit_seconds")
    .eq("id", attempt.test_id)
    .single();

  if (!test) {
    return (
      <div className="space-y-3">
        <p>Test not found.</p>
        <Link className="underline" href="/student/tests">
          Back
        </Link>
      </div>
    );
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id,prompt,position")
    .eq("test_id", attempt.test_id)
    .order("position", { ascending: true });

  const questionIds = (questions ?? []).map((q) => q.id);
  const options: Array<{
    id: string;
    question_id: string;
    text: string;
    position: number;
  }> = questionIds.length
    ? (
        await supabase
          .from("options")
          .select("id,question_id,text,position")
          .in("question_id", questionIds)
          .order("position", { ascending: true })
      ).data ?? []
    : [];

  const optionsByQuestion = new Map<
    string,
    Array<{ id: string; question_id: string; text: string; position: number }>
  >();
  options.forEach((o) => {
    const arr = optionsByQuestion.get(o.question_id) ?? [];
    arr.push(o);
    optionsByQuestion.set(o.question_id, arr);
  });

  const runnerQuestions = (questions ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: (optionsByQuestion.get(q.id) ?? []).map((o) => ({
      id: o.id,
      text: o.text,
    })),
  }));

  return (
    <div className="space-y-4">
      <Link className="underline" href="/student/tests">
        Back
      </Link>
      <AttemptRunner
        attemptId={attempt.id}
        testTitle={test.title}
        startedAt={attempt.started_at}
        timeLimitSeconds={test.time_limit_seconds}
        questions={runnerQuestions}
      />
    </div>
  );
}
