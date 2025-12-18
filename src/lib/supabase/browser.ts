import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // IMPORTANT:
  // Do NOT override cookies in the browser.
  // In production, Supabase session cookies should be written server-side (HttpOnly)
  // by Server Actions / Route Handlers / Middleware.
  // Browser-side cookie writes can overwrite/clear those cookies and cause logout loops.
  return createBrowserClient(url, anonKey);
}
