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
    cookies: {
      get(name: string) {
        const value = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${name}=`))
          ?.split("=")[1];
        return value ? decodeURIComponent(value) : null;
      },
      set(name: string, value: string, options: any) {
        let cookie = `${name}=${encodeURIComponent(value)}`;

        if (options?.maxAge) {
          cookie += `; max-age=${options.maxAge}`;
        }
        if (options?.path) {
          cookie += `; path=${options.path}`;
        }
        if (options?.sameSite) {
          cookie += `; samesite=${options.sameSite}`;
        }
        if (options?.secure) {
          cookie += `; secure`;
        }

        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        document.cookie = `${name}=; path=${options?.path || "/"}; max-age=0`;
      },
    },
  });
}
