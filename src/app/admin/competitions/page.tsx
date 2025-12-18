import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCompetitionAction, deleteCompetitionAction } from "./actions";
import { PageHeader } from "@/components/layout";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { CompetitionStatusBadge } from "@/components/competitions";
import { DeleteButton } from "./DeleteButton";

export default async function AdminCompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Fetch all competitions with test info and participant counts
  const { data: competitions } = await supabase
    .from("competitions")
    .select(
      `
      id,
      title,
      description,
      start_time,
      end_time,
      published,
      max_participants,
      created_at,
      test:tests(id, title),
      participant_count:competition_participants(count)
    `
    )
    .order("start_time", { ascending: false });

  // Fetch all tests for the dropdown
  const { data: tests } = await supabase
    .from("tests")
    .select("id, title")
    .eq("published", true)
    .order("title");

  return (
    <div>
      <PageHeader
        title="Musobaqalar"
        description="O'quvchilar uchun musobaqalar yarating va boshqaring"
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-600">{decodeURIComponent(error)}</p>
        </div>
      )}

      {/* Create Competition Form */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Yangi Musobaqa Yaratish
        </h2>
        <form action={createCompetitionAction} className="space-y-4">
          <Input
            name="title"
            label="Musobaqa Nomi"
            placeholder="Masalan: Matematika Olimpiadasi 2024"
            required
          />

          <Textarea
            name="description"
            label="Tavsif"
            placeholder="Musobaqa haqida qisqacha ma'lumot"
            rows={3}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="start_date"
              type="datetime-local"
              label="Boshlanish Sanasi"
              required
            />

            <Input
              name="end_date"
              type="datetime-local"
              label="Tugash Sanasi"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Test <span className="text-red-500">*</span>
              </label>
              <select
                name="test_id"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Testni tanlang</option>
                {tests?.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              name="max_participants"
              type="number"
              label="Maksimal Ishtirokchilar Soni"
              placeholder="Bo'sh qoldiring (cheklovsiz)"
              min={1}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="published" className="text-sm text-slate-700">
              O&apos;quvchilarga ko&apos;rinsin
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg">
            Musobaqa Yaratish
          </Button>
        </form>
      </Card>

      {/* Competitions List */}
      <Card variant="bordered" padding="none">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Barcha Musobaqalar
          </h2>
          <p className="text-slate-600 mt-1">
            Yaratilgan musobaqalarni ko&apos;ring va tahrirlang
          </p>
        </div>

        {!competitions || competitions.length === 0 ? (
          <div className="p-12 text-center">
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
              Musobaqalar yo&apos;q
            </h3>
            <p className="text-slate-600">
              Yuqoridagi forma orqali birinchi musobaqangizni yarating
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Nomi
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Test
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Holat
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Ishtirokchilar
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Sanalar
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {competitions.map((competition) => {
                  const participantCount =
                    competition.participant_count?.[0]?.count || 0;

                  return (
                    <tr key={competition.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {competition.title}
                          </div>
                          {!competition.published && (
                            <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                              Ko&apos;rinmaydigan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {Array.isArray(competition.test)
                          ? competition.test[0]?.title
                          : (competition.test as { title?: string })?.title}
                      </td>
                      <td className="px-6 py-4">
                        <CompetitionStatusBadge
                          startTime={competition.start_time}
                          endTime={competition.end_time}
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {participantCount}
                        {competition.max_participants &&
                          ` / ${competition.max_participants}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>
                          {new Date(competition.start_time).toLocaleString(
                            "uz-UZ",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            }
                          )}
                        </div>
                        <div className="text-slate-500">
                          {new Date(competition.end_time).toLocaleString(
                            "uz-UZ",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/competitions/${competition.id}`}>
                            <Button variant="outline" size="sm">
                              Ko&apos;rish
                            </Button>
                          </Link>
                          <DeleteButton
                            competitionId={competition.id}
                            deleteAction={deleteCompetitionAction}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
