"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Refresh the page on auth state changes to update server components
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        router.refresh();
      }
    });

    // Set up periodic token refresh check (every 30 minutes)
    const intervalId = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Check if token is about to expire (within 5 minutes)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

        if (timeUntilExpiry < 300) {
          // Less than 5 minutes
          await supabase.auth.refreshSession();
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [router]);

  return <>{children}</>;
}
