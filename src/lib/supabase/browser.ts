import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(url, anonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        return document.cookie
          .split("; ")
          .filter((cookie) => cookie.length > 0)
          .map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            const value = rest.join("=");
            return { name, value };
          });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (typeof document === "undefined") return;

          let cookie = `${name}=${encodeURIComponent(value)}`;

          const maxAge = options?.maxAge ?? 60 * 60 * 24 * 7; // 7 days default
          cookie += `; max-age=${maxAge}`;
          cookie += `; path=${options?.path || "/"}`;
          cookie += `; samesite=${options?.sameSite || "lax"}`;

          // Always set secure in production or if explicitly requested
          if (
            options?.secure ||
            (typeof window !== "undefined" &&
              window.location.protocol === "https:")
          ) {
            cookie += `; secure`;
          }

          // Don't set domain - let browser handle it automatically
          // This works better with Vercel/Netlify subdomains

          document.cookie = cookie;
        });
      },
    },
  });
}
