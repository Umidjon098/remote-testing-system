import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Header, Logo } from "@/components/layout";
import { Button } from "@/components/ui";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("student");

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        logo={
          <Logo href="/student/tests">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">TestPro</span>
            </div>
          </Logo>
        }
        navigation={[
          { label: "Tests", href: "/student/tests" },
          { label: "Musobaqalar", href: "/student/competitions" },
          { label: "Results", href: "/student/results" },
        ]}
        actions={
          <>
            <Link href="/logout">
              <Button variant="ghost" size="sm">
                Logout
              </Button>
            </Link>
          </>
        }
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
