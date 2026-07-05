import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback for Google OAuth's authorization code — the only login method
// now that email/password + recovery-by-mail got replaced (Supabase's
// built-in email service rate-limits recovery mails too aggressively for a
// team that shares a login flow, and there's no registro público to worry
// about anyway).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const fallback = request.nextUrl.clone();
  fallback.pathname = "/login";
  fallback.search = "";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const metadata = data.user.user_metadata as Record<string, unknown>;
        const nombre =
          (metadata.full_name as string | undefined) ||
          (metadata.name as string | undefined) ||
          data.user.email ||
          "Sin nombre";
        await supabase.from("profiles").insert({ id: data.user.id, nombre });
      }

      const redirectTo = next ? new URL(next, request.url) : new URL("/", request.url);
      return NextResponse.redirect(redirectTo);
    }
  }

  fallback.searchParams.set(
    "error",
    "No se pudo iniciar sesión con Google. Probá de nuevo.",
  );
  return NextResponse.redirect(fallback);
}
