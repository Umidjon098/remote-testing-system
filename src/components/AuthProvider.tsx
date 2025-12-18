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
    } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("Auth state changed:", event);

      // Refresh the page on auth state changes to update server components
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        router.refresh();
      }

      // Handle token expiry
      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully");
      }

      if (event === "SIGNED_OUT") {
        // Clear any cached data
        router.push("/login");
      }
    });

    // Set up periodic token refresh check (every 5 minutes)
    const intervalId = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Check if token is about to expire (within 10 minutes)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

        if (timeUntilExpiry < 600) {
          // Less than 10 minutes
          console.log("Token expiring soon, refreshing...");
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error("Failed to refresh token:", error);
          }
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [router]);

  return <>{children}</>;
}
