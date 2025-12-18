import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTestAction, deleteTestAction } from "./actions";
import { PageHeader } from "@/components/layout";
import { Button, Input, Textarea, Card, Badge } from "@/components/ui";

export default async function AdminTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("id,title,published,time_limit_seconds,max_attempts,created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Test Management"
        description="Create and manage tests for your students"
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-600">{decodeURIComponent(error)}</p>
        </div>
      )}

      {/* Create Test Form */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Create New Test
        </h2>
        <form action={createTestAction} className="space-y-4">
          <Input
            name="title"
            label="Test Title"
            placeholder="Enter test title"
            required
          />

          <Textarea
            name="description"
            label="Description"
            placeholder="Describe what this test covers"
            rows={3}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="time_limit_seconds"
              type="number"
              label="Time Limit (seconds)"
              placeholder="600"
              min={1}
              defaultValue={600}
              required
            />

            <Input
              name="max_attempts"
              type="number"
              label="Max Attempts"
              placeholder="1"
              min={1}
              defaultValue={1}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg">
            Create Test
          </Button>
        </form>
      </Card>

      {/* Tests List */}
      <Card variant="bordered" padding="none">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Existing Tests
          </h2>
          <p className="text-slate-600 mt-1">
            Manage and edit your created tests
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Title
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Time Limit
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Max Attempts
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(tests ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                      href={`/admin/tests/${t.id}`}
                    >
                      {t.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {t.published ? (
                      <Badge variant="success" size="sm">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        Draft
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {t.time_limit_seconds}s
                  </td>
                  <td className="px-6 py-4 text-slate-600">{t.max_attempts}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/tests/${t.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <form action={deleteTestAction}>
                        <input type="hidden" name="test_id" value={t.id} />
                        <Button type="submit" variant="danger" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!tests || tests.length === 0) && (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-slate-500"
                    colSpan={5}
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>No tests created yet</p>
                      <p className="text-sm mt-1">
                        Create your first test to get started
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
