import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getRequestOrigin(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host) {
    // Best-effort fallback if proxy headers aren't present.
    const url = new URL(request.url);
    return `${url.protocol}//${host}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // IMPORTANT: use the public origin (proxy headers) to avoid cross-origin redirects
  // on platforms like Netlify where request.url may contain an internal/branch host.
  return NextResponse.redirect(new URL("/login", getRequestOrigin(request)));
}
