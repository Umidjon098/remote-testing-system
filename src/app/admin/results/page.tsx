import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout";
import { Card, Badge } from "@/components/ui";

export default async function AdminResultsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: attempts } = await supabase
    .from("attempts")
    .select("id,student_id,test_id,status,score,started_at,finished_at")
    .order("started_at", { ascending: false })
    .limit(200);

  const testIds = Array.from(new Set((attempts ?? []).map((a) => a.test_id)));
  const studentIds = Array.from(
    new Set((attempts ?? []).map((a) => a.student_id))
  );

  const tests: Array<{ id: string; title: string }> = testIds.length
    ? (await supabase.from("tests").select("id,title").in("id", testIds))
        .data ?? []
    : [];
  const students: Array<{
    user_id: string;
    email: string | null;
    full_name: string | null;
  }> = studentIds.length
    ? (
        await supabase
          .from("profiles")
          .select("user_id,email,full_name")
          .in("user_id", studentIds)
      ).data ?? []
    : [];

  const testTitle = new Map<string, string>();
  tests.forEach((t) => testTitle.set(t.id, t.title));

  const studentLabel = new Map<string, string>();
  students.forEach((s) =>
    studentLabel.set(s.user_id, s.full_name || s.email || s.user_id)
  );

  return (
    <div>
      <PageHeader
        title="Student Results"
        description="View and analyze student test attempts"
      />

      <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          Showing the last 200 test attempts
        </p>
      </div>

      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Test
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Score
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Started
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Finished
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(attempts ?? []).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900">
                    {studentLabel.get(a.student_id) ?? a.student_id}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {testTitle.get(a.test_id) ?? a.test_id}
                  </td>
                  <td className="px-6 py-4">
                    {a.status === "completed" && (
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                    )}
                    {a.status === "in_progress" && (
                      <Badge variant="warning" size="sm">
                        In Progress
                      </Badge>
                    )}
                    {a.status === "expired" && (
                      <Badge variant="danger" size="sm">
                        Expired
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {a.score !== null ? (
                      <span className="font-semibold text-slate-900">
                        {a.score}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {new Date(a.started_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {a.finished_at
                      ? new Date(a.finished_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {(!attempts || attempts.length === 0) && (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-slate-500"
                    colSpan={6}
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-slate-300 mb-3"
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
                      <p>No results yet</p>
                      <p className="text-sm mt-1">
                        Student attempts will appear here
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
