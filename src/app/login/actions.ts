"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function loginWithGoogle() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const origin = `${protocol}://${host}${basePath}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(`${basePath}/`)}`,
    },
  });

  if (error || !data.url) {
    redirect(
      "/login?error=" + encodeURIComponent("No se pudo iniciar sesión con Google. Probá de nuevo."),
    );
  }

  redirect(data.url);
}
