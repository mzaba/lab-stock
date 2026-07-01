"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ItemState = { error?: string } | undefined;

type ItemInput = {
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  proveedor: string | null;
  lead_time_dias: number | null;
};

function parseItemInput(formData: FormData): ItemInput | { error: string } {
  const nombre = ((formData.get("nombre") as string) || "").trim();
  const unidad = ((formData.get("unidad") as string) || "").trim();
  const proveedor = ((formData.get("proveedor") as string) || "").trim() || null;
  const stockActualRaw = formData.get("stock_actual") as string;
  const stockMinimoRaw = formData.get("stock_minimo") as string;
  const leadTimeRaw = (formData.get("lead_time_dias") as string) || "";

  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }
  if (!unidad) {
    return { error: "La unidad es obligatoria." };
  }

  const stockActual = Number(stockActualRaw);
  if (!Number.isFinite(stockActual) || stockActual < 0) {
    return { error: "El stock actual tiene que ser un número mayor o igual a cero." };
  }

  const stockMinimo = Number(stockMinimoRaw);
  if (!Number.isFinite(stockMinimo) || stockMinimo < 0) {
    return { error: "El stock mínimo tiene que ser un número mayor o igual a cero." };
  }

  let leadTimeDias: number | null = null;
  if (leadTimeRaw !== "") {
    const parsed = Number(leadTimeRaw);
    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
      return { error: "El lead time tiene que ser un número entero de días mayor o igual a cero." };
    }
    leadTimeDias = parsed;
  }

  return {
    nombre,
    unidad,
    stock_actual: stockActual,
    stock_minimo: stockMinimo,
    proveedor,
    lead_time_dias: leadTimeDias,
  };
}

export async function crearItem(
  _prevState: ItemState,
  formData: FormData,
): Promise<ItemState> {
  const parsed = parseItemInput(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { error } = await supabase.from("items").insert(parsed);

  if (error) {
    if (error.code === "23505") {
      return {
        error: `Ya existe un item llamado "${parsed.nombre}". Si dejó de usarse, buscalo en la lista y reactivalo en vez de crear uno nuevo.`,
      };
    }
    return { error: "No se pudo crear el item. Probá de nuevo." };
  }

  revalidatePath("/items");
  revalidatePath("/");
  redirect("/items");
}

export async function actualizarItem(
  _prevState: ItemState,
  formData: FormData,
): Promise<ItemState> {
  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Item inválido." };
  }

  const parsed = parseItemInput(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { error } = await supabase.from("items").update(parsed).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        error: `Ya existe un item llamado "${parsed.nombre}". Elegí otro nombre.`,
      };
    }
    return { error: "No se pudo guardar el item. Probá de nuevo." };
  }

  revalidatePath("/items");
  revalidatePath("/");
  redirect("/items");
}

async function setActivo(formData: FormData, activo: boolean) {
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("items").update({ activo }).eq("id", id);

  revalidatePath("/items");
  revalidatePath("/");
  redirect("/items");
}

// Never a hard delete — items keep their movimientos/pedidos history. See
// design doc Edge Cases: "Borrado de items."
export async function desactivarItem(formData: FormData) {
  await setActivo(formData, false);
}

export async function reactivarItem(formData: FormData) {
  await setActivo(formData, true);
}
