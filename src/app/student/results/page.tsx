import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout";
import { Card, Badge, Button } from "@/components/ui";

export default async function StudentResultsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: attempts } = await supabase
    .from("attempts")
    .select("id,test_id,status,score,started_at,finished_at")
    .order("started_at", { ascending: false });

  const testIds = Array.from(new Set((attempts ?? []).map((a) => a.test_id)));
  const tests: Array<{ id: string; title: string }> = testIds.length
    ? (await supabase.from("tests").select("id,title").in("id", testIds))
        .data ?? []
    : [];

  const titleById = new Map<string, string>();
  tests.forEach((t) => titleById.set(t.id, t.title));

  return (
    <div>
      <PageHeader
        title="Mening natijalarim"
        description="Test tarixingiz va ballaringizni ko'ring"
        actions={
          <Link href="/student/tests">
            <Button variant="outline">Testlarga qaytish</Button>
          </Link>
        }
      />

      <div className="grid gap-4">
        {(attempts ?? []).map((a) => (
          <Card key={a.id} variant="bordered" padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {titleById.get(a.test_id) ?? a.test_id}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>{new Date(a.started_at).toLocaleString()}</span>
                  <span>•</span>
                  {a.status === "in_progress" && (
                    <Badge variant="warning" size="sm">
                      Jarayonda
                    </Badge>
                  )}
                  {a.status === "completed" && (
                    <Badge variant="success" size="sm">
                      Yakunlangan
                    </Badge>
                  )}
                  {a.status === "expired" && (
                    <Badge variant="danger" size="sm">
                      Muddati o&apos;tgan
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {a.score !== null && (
                  <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="text-xs text-slate-600">Ball</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {a.score}
                    </div>
                  </div>
                )}
                {a.status === "in_progress" && (
                  <Link href={`/student/attempts/${a.id}`}>
                    <Button variant="primary">Davom ettirish</Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}

        {(!attempts || attempts.length === 0) && (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Hali urinishlar yo&apos;q
              </h3>
              <p className="text-slate-600 mb-6">
                Natijalaringizni ko&apos;rish uchun testlarni yechishni boshlang
              </p>
              <Link href="/student/tests">
                <Button variant="primary">Testlarni ko&apos;rish</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
