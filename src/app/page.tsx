import Link from "next/link";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth";
import { Button } from "@/components/ui";

export default async function Home() {
  const user = await getCurrentUser();
  const role = await getCurrentUserRole();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">TestPro</span>
          </div>

          {!user ? (
            <Link href="/login">
              <Button variant="outline" size="md">
                Kirish
              </Button>
            </Link>
          ) : (
            <Link href="/logout">
              <Button variant="ghost" size="md">
                Chiqish
              </Button>
            </Link>
          )}
        </nav>

        <main className="py-20 lg:py-32">
          {!user ? (
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                Dunyo bo&apos;ylab 10,000+ talaba ishonadi
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Testlaringizni o&apos;zlashtirasiz,
                <br />
                <span className="text-indigo-600">Mukammallikka erishing</span>
              </h1>

              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                Talabalar va ta&apos;lim muassasalari uchun mo&apos;ljallangan
                aqlli, ishonchli platforma. Testlarni ishonch bilan topshiring,
                rivojlanishingizni kuzating va maqsadlaringizga erishing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="min-w-50">
                    Bepul boshlash
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="min-w-50">
                  Demo ko&apos;rish
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mt-24">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Oson test yechish
                  </h3>
                  <p className="text-slate-600">
                    Diqqat va samaradorlik uchun toza, chalg&apos;itmaydigan
                    interfeys
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-purple-600"
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
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Vaqt nazorati
                  </h3>
                  <p className="text-slate-600">
                    Real vaqtda taymer va jarayon kuzatuvi sizni o&apos;z
                    tempoizda ushlab turadi
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Aniq taraqqiyot
                  </h3>
                  <p className="text-slate-600">
                    Yaxshilanishni kuzatish uchun tezkor natijalar va batafsil
                    tahlil
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Xush kelibsiz!
              </h1>

              <p className="text-lg text-slate-600 mb-8">
                Tizimga kirgan:{" "}
                <span className="font-medium text-slate-900">
                  {user.email ?? user.id}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {role === "admin" ? (
                  <Link href="/admin/tests">
                    <Button variant="primary" size="lg" className="min-w-50">
                      Admin paneli
                    </Button>
                  </Link>
                ) : (
                  <Link href="/student/tests">
                    <Button variant="primary" size="lg" className="min-w-50">
                      Talaba paneli
                    </Button>
                  </Link>
                )}
                <Link href="/logout">
                  <Button variant="outline" size="lg" className="min-w-50">
                    Chiqish
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
