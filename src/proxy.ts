import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Match everything and exclude assets inside updateSession instead of via
// this matcher's regex — under basePath, Next.js prepends basePath to the
// pattern, and a regex requiring a trailing "/" before the exclusion never
// matches the bare basePath root (e.g. "/lab-stock" with nothing after it),
// silently skipping the auth check for that one path. A plain string check
// on the (already basePath-stripped) pathname has no such edge case.
export const config = {
  matcher: ["/:path*"],
};
