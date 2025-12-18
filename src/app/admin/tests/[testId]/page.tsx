import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateTestAction } from "../actions";
import {
  addOptionAction,
  addQuestionAction,
  deleteOptionAction,
  deleteQuestionAction,
  setCorrectOptionAction,
} from "./actions";
import { PageHeader } from "@/components/layout";
import { Button, Input, Textarea, Card, Badge } from "@/components/ui";

export default async function AdminTestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { testId } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: test } = await supabase
    .from("tests")
    .select("id,title,description,time_limit_seconds,max_attempts,published")
    .eq("id", testId)
    .maybeSingle();

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card variant="bordered" padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Test Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              This test doesn&apos;t exist or has been deleted.
            </p>
            <Link href="/admin/tests">
              <Button variant="primary">Back to Tests</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id,test_id,prompt,position")
    .eq("test_id", testId)
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

  const correct: Array<{ question_id: string; option_id: string }> =
    questionIds.length
      ? (
          await supabase
            .from("correct_options")
            .select("question_id,option_id")
            .in("question_id", questionIds)
        ).data ?? []
      : [];

  const correctByQuestion = new Map<string, string>();
  correct.forEach((c) => correctByQuestion.set(c.question_id, c.option_id));

  const optionsByQuestion = new Map<
    string,
    Array<{ id: string; question_id: string; text: string; position: number }>
  >();
  options.forEach((o) => {
    const arr = optionsByQuestion.get(o.question_id) ?? [];
    arr.push(o);
    optionsByQuestion.set(o.question_id, arr);
  });

  return (
    <div>
      <PageHeader
        title="Edit Test"
        description={test.title}
        actions={
          <Link href="/admin/tests">
            <Button variant="outline" size="sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Tests
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-600">{decodeURIComponent(error)}</p>
        </div>
      )}

      {/* Test Settings */}
      <Card variant="bordered" padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Test Settings
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Configure test parameters and publish status
            </p>
          </div>
          {test.published ? (
            <Badge variant="success">Published</Badge>
          ) : (
            <Badge variant="default">Draft</Badge>
          )}
        </div>

        <form action={updateTestAction} className="space-y-4">
          <input type="hidden" name="test_id" value={test.id} />

          <Input
            name="title"
            label="Test Title"
            defaultValue={test.title}
            required
          />

          <Textarea
            name="description"
            label="Description"
            defaultValue={test.description ?? ""}
            rows={3}
            helperText="Describe what this test covers"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="time_limit_seconds"
              type="number"
              label="Time Limit (seconds)"
              min={1}
              defaultValue={test.time_limit_seconds}
              required
            />

            <Input
              name="max_attempts"
              type="number"
              label="Max Attempts"
              min={1}
              defaultValue={test.max_attempts}
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={test.published}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <div>
              <label
                htmlFor="published"
                className="font-medium text-slate-900 cursor-pointer"
              >
                Publish Test
              </label>
              <p className="text-sm text-slate-600">
                Make this test visible to students
              </p>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg">
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Questions Section */}
      <Card variant="bordered" padding="lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Questions
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {questions?.length || 0} question
                {questions?.length !== 1 ? "s" : ""} created
              </p>
            </div>
          </div>

          <form action={addQuestionAction} className="flex gap-2">
            <input type="hidden" name="test_id" value={test.id} />
            <input
              name="prompt"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter new question prompt..."
              required
            />
            <Button type="submit" variant="primary">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Question
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          {(questions ?? []).map((q, qIndex) => {
            const qOptions = optionsByQuestion.get(q.id) ?? [];
            const selected = correctByQuestion.get(q.id) ?? null;

            return (
              <Card key={q.id} variant="elevated" padding="lg">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold shrink-0">
                      {qIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-500 mb-1">
                        Question {q.position + 1}
                      </div>
                      <div className="text-lg font-medium text-slate-900">
                        {q.prompt}
                      </div>
                    </div>
                  </div>
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="test_id" value={test.id} />
                    <input type="hidden" name="question_id" value={q.id} />
                    <Button type="submit" variant="danger" size="sm">
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </form>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Answer Options
                    </h4>
                    {selected && (
                      <Badge variant="success" size="sm">
                        ✓ Correct answer set
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {qOptions.map((o, oIndex) => (
                      <div
                        key={o.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selected === o.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                          {String.fromCharCode(65 + oIndex)}
                        </div>

                        <div className="flex-1 text-slate-900">{o.text}</div>

                        <div className="flex items-center gap-2">
                          <form action={setCorrectOptionAction}>
                            <input
                              type="hidden"
                              name="test_id"
                              value={test.id}
                            />
                            <input
                              type="hidden"
                              name="question_id"
                              value={q.id}
                            />
                            <input
                              type="hidden"
                              name="option_id"
                              value={o.id}
                            />
                            <Button
                              type="submit"
                              variant={
                                selected === o.id ? "primary" : "outline"
                              }
                              size="sm"
                            >
                              {selected === o.id ? (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Correct
                                </>
                              ) : (
                                "Mark Correct"
                              )}
                            </Button>
                          </form>

                          <form action={deleteOptionAction}>
                            <input
                              type="hidden"
                              name="test_id"
                              value={test.id}
                            />
                            <input
                              type="hidden"
                              name="option_id"
                              value={o.id}
                            />
                            <Button type="submit" variant="ghost" size="sm">
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </Button>
                          </form>
                        </div>
                      </div>
                    ))}

                    {qOptions.length === 0 && (
                      <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <svg
                          className="w-8 h-8 mx-auto mb-2 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <p className="text-sm">
                          No options yet. Add your first option below.
                        </p>
                      </div>
                    )}
                  </div>

                  <form action={addOptionAction} className="flex gap-2 mt-4">
                    <input type="hidden" name="test_id" value={test.id} />
                    <input type="hidden" name="question_id" value={q.id} />
                    <input
                      name="text"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="Enter answer option..."
                      required
                    />
                    <Button type="submit" variant="secondary">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Option
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}

          {(!questions || questions.length === 0) && (
            <Card variant="bordered" padding="lg">
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
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
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No questions yet
                </h3>
                <p className="text-slate-600">
                  Add your first question using the form above to get started.
                </p>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
