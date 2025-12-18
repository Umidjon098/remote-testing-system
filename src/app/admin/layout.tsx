import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Header, Logo } from "@/components/layout";
import { Button } from "@/components/ui";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        logo={
          <Logo href="/admin/tests">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">Admin</span>
            </div>
          </Logo>
        }
        navigation={[
          { label: "Tests", href: "/admin/tests" },
          { label: "Results", href: "/admin/results" },
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
