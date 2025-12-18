import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { startAttemptAction } from "./actions";
import { Button, Card, Badge } from "@/components/ui";

export default async function StudentTestDetailPage({
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

  if (!test || !test.published) {
    return (
      <div className="max-w-2xl mx-auto">
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
              Test topilmadi
            </h2>
            <p className="text-slate-600 mb-6">
              Bu test mavjud emas yoki nashr qilinmagan.
            </p>
            <Link href="/student/tests">
              <Button variant="primary">Testlarga qaytish</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id")
    .eq("test_id", testId);

  const questionCount = questions?.length ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/student/tests">
          <Button variant="ghost" size="sm">
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
            Testlarga qaytish
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-600">{decodeURIComponent(error)}</p>
        </div>
      )}

      <Card variant="elevated" padding="lg">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <svg
              className="w-8 h-8 text-white"
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
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {test.title}
            </h1>
            {test.description && (
              <p className="text-slate-600 leading-relaxed">
                {test.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {questionCount}
            </div>
            <div className="text-sm text-slate-600">Savollar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(test.time_limit_seconds / 60)}
            </div>
            <div className="text-sm text-slate-600">Daqiqa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {test.max_attempts}
            </div>
            <div className="text-sm text-slate-600">Maksimal urinishlar</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Boshlashdan oldin:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Internet aloqangiz barqaror ekanligiga ishonch hosil qiling
            </li>
            <li>
              • Testni yakunlash uchun{" "}
              {Math.round(test.time_limit_seconds / 60)} daqiqa vaqtingiz bor
            </li>
            <li>• Jarayoningiz avtomatik saqlanadi</li>
            <li>
              • Bu testni {test.max_attempts} marta topshirishingiz mumkin
            </li>
          </ul>
        </div>

        <form action={startAttemptAction}>
          <input type="hidden" name="test_id" value={test.id} />
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Testni boshlash
          </Button>
        </form>
      </Card>
    </div>
  );
}
