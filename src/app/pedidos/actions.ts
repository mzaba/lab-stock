"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type PedidoState = { error?: string } | undefined;

export async function crearPedido(
  _prevState: PedidoState,
  formData: FormData,
): Promise<PedidoState> {
  const itemId = formData.get("item_id") as string;
  const cantidadRaw = formData.get("cantidad") as string;
  const fechaEstimadaRaw = (formData.get("fecha_estimada") as string) || "";

  if (!itemId) {
    return { error: "Elegí un item." };
  }

  const cantidad = Number(cantidadRaw);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return { error: "La cantidad tiene que ser un número mayor a cero." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Tu sesión expiró. Volvé a iniciar sesión." };
  }

  const { error } = await supabase.from("pedidos").insert({
    item_id: itemId,
    cantidad,
    fecha_estimada: fechaEstimadaRaw || null,
    usuario_id: userData.user.id,
  });

  if (error) {
    return { error: "No se pudo crear el pedido. Probá de nuevo." };
  }

  revalidatePath("/pedidos");
  redirect("/pedidos");
}

// Atomic guard against double-processing: the UPDATE only matches rows still
// in 'pendiente'/'atrasado', so two concurrent "marcar recibido" clicks on the
// same pedido can't both succeed — Postgres row locking makes the check and
// the transition happen as one operation, no separate read-then-write race.
export async function marcarPedidoRecibido(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    redirect("/pedidos?error=" + encodeURIComponent("Pedido inválido."));
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(
      "/pedidos?error=" +
        encodeURIComponent("Tu sesión expiró. Volvé a iniciar sesión."),
    );
  }

  const { data: pedido, error: updateError } = await supabase
    .from("pedidos")
    .update({ estado: "recibido", fecha_recibido: new Date().toISOString() })
    .eq("id", id)
    .in("estado", ["pendiente", "atrasado"])
    .select("item_id, cantidad")
    .maybeSingle();

  if (updateError) {
    redirect(
      "/pedidos?error=" +
        encodeURIComponent("No se pudo marcar el pedido como recibido. Probá de nuevo."),
    );
  }

  if (!pedido) {
    redirect(
      "/pedidos?error=" +
        encodeURIComponent(
          "Ese pedido ya no está pendiente (alguien más lo marcó, o fue cancelado).",
        ),
    );
  }

  const { error: movimientoError } = await supabase.from("movimientos").insert({
    item_id: pedido.item_id,
    tipo: "ingreso",
    cantidad: pedido.cantidad,
    nota: "Ingreso por pedido recibido",
    usuario_id: userData.user!.id,
  });

  revalidatePath("/pedidos");
  revalidatePath("/");

  if (movimientoError) {
    redirect(
      "/pedidos?error=" +
        encodeURIComponent(
          "El pedido quedó marcado como recibido, pero no se pudo actualizar el stock automáticamente. Registrá un ingreso manual desde 'Registrar movimiento'.",
        ),
    );
  }

  redirect("/pedidos");
}
