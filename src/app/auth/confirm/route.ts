import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const fallback = request.nextUrl.clone();
  fallback.pathname = "/forgot-password";
  fallback.search = "";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const redirectTo = next ? new URL(next, request.url) : new URL("/", request.url);
      return NextResponse.redirect(redirectTo);
    }
  }

  fallback.searchParams.set(
    "error",
    "El link de recuperación es inválido o expiró. Pedí uno nuevo.",
  );
  return NextResponse.redirect(fallback);
}
