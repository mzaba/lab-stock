"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type MovimientoState = { error?: string } | undefined;

export async function registrarMovimiento(
  _prevState: MovimientoState,
  formData: FormData,
): Promise<MovimientoState> {
  const itemId = formData.get("item_id") as string;
  const tipo = formData.get("tipo") as string;
  const cantidadRaw = formData.get("cantidad") as string;
  const nota = (formData.get("nota") as string) || null;

  if (!itemId) {
    return { error: "Elegí un item." };
  }
  if (!["uso", "ingreso", "ajuste"].includes(tipo)) {
    return { error: "Elegí un tipo de movimiento válido." };
  }

  const cantidad = Number(cantidadRaw);
  if (!Number.isFinite(cantidad) || cantidad < 0) {
    return { error: "La cantidad tiene que ser un número positivo." };
  }
  if (tipo !== "ajuste" && cantidad === 0) {
    return { error: "La cantidad tiene que ser mayor a cero." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { error } = await supabase.from("movimientos").insert({
    item_id: itemId,
    tipo,
    cantidad,
    nota,
    usuario_id: userData.user.id,
  });

  if (error) {
    return { error: "No se pudo registrar el movimiento. Probá de nuevo." };
  }

  revalidatePath("/");
  redirect("/");
}

export type UltimoMovimiento = {
  tipo: string;
  cantidad: number;
  created_at: string;
  nombre_usuario: string | null;
};

export async function getUltimoMovimiento(
  itemId: string,
): Promise<UltimoMovimiento | null> {
  if (!itemId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movimientos")
    .select("tipo, cantidad, created_at, usuario_id")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  // movimientos.usuario_id and profiles.id both reference auth.users(id)
  // independently, with no direct FK between the two tables — PostgREST
  // can't embed across that, so this is a second round-trip instead.
  let nombreUsuario: string | null = null;
  if (data.usuario_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", data.usuario_id)
      .maybeSingle();
    nombreUsuario = profile?.nombre ?? null;
  }

  return {
    tipo: data.tipo,
    cantidad: data.cantidad,
    created_at: data.created_at,
    nombre_usuario: nombreUsuario,
  };
}
