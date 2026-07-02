"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ResetPasswordState = { error?: string } | undefined;

export async function actualizarPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = (formData.get("password") as string) || "";
  const confirmacion = (formData.get("confirmacion") as string) || "";

  if (password.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres." };
  }
  if (password !== confirmacion) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      error: "El link de recuperación venció. Pedí uno nuevo desde 'Olvidé mi contraseña'.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "No se pudo cambiar la contraseña. Probá de nuevo." };
  }

  redirect("/");
}
