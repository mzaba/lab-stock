"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type ForgotPasswordState = { error?: string; success?: boolean } | undefined;

export async function solicitarRecuperacion(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = ((formData.get("email") as string) || "").trim();
  if (!email) {
    return { error: "Ingresá tu email." };
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const origin = `${protocol}://${host}${basePath}`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  // Always report success, whether or not the email is registered — this
  // avoids leaking which addresses have accounts.
  return { success: true };
}
