import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from "@/components/ui";
import { PageHeader } from "@/components/layout";

export default async function StudentTestsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: tests } = await supabase
    .from("tests")
    .select("id,title,description,time_limit_seconds,max_attempts")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Available Tests"
        description="Choose a test to begin your assessment"
      />

      {/* Filters - Optional enhancement */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Badge variant="primary" className="cursor-pointer">
          All Tests
        </Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-slate-200">
          Recent
        </Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-slate-200">
          Popular
        </Badge>
      </div>

      {/* Tests Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(tests ?? []).map((t) => (
          <Card
            key={t.id}
            variant="bordered"
            className="hover:shadow-lg transition-all duration-200"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <svg
                    className="w-7 h-7 text-white"
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
                <Badge variant="success" size="sm">
                  Free
                </Badge>
              </div>
              <CardTitle className="text-lg">{t.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-10">
                {t.description || "Test your knowledge and skills"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-slate-600">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    {Math.round(t.time_limit_seconds / 60)} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-sm">{t.max_attempts} attempts</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <div className="flex gap-2 w-full">
                <Link href={`/student/tests/${t.id}`} className="flex-1">
                  <Button variant="outline" size="md" fullWidth>
                    Details
                  </Button>
                </Link>
                <Link href={`/student/tests/${t.id}`} className="flex-1">
                  <Button variant="primary" size="md" fullWidth>
                    Start Test
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}

        {(!tests || tests.length === 0) && (
          <div className="col-span-full">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No tests available
                </h3>
                <p className="text-slate-600">
                  Check back later for new tests to practice with
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
