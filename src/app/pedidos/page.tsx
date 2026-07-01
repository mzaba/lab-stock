import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { marcarPedidoRecibido } from "@/app/pedidos/actions";
import { AvisarAlGrupo } from "@/components/avisar-al-grupo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PedidoRow = {
  id: string;
  cantidad: number;
  estado: "pendiente" | "recibido" | "atrasado" | "cancelado";
  fecha_pedido: string;
  fecha_estimada: string | null;
  fecha_recibido: string | null;
  items: { nombre: string; unidad: string; proveedor: string | null } | null;
};

type EstadoEfectivo = "pendiente" | "atrasado" | "recibido" | "cancelado";

const ESTADO_LABEL: Record<EstadoEfectivo, string> = {
  pendiente: "Pendiente",
  atrasado: "Atrasado",
  recibido: "Recibido",
  cancelado: "Cancelado",
};

function estadoEfectivo(pedido: PedidoRow): EstadoEfectivo {
  if (
    pedido.estado === "pendiente" &&
    pedido.fecha_estimada &&
    new Date(pedido.fecha_estimada) < new Date()
  ) {
    return "atrasado";
  }
  return pedido.estado;
}

function isActivo(estado: EstadoEfectivo) {
  return estado === "pendiente" || estado === "atrasado";
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: pedidosData } = await supabase
    .from("pedidos")
    .select("id, cantidad, estado, fecha_pedido, fecha_estimada, fecha_recibido, items(nombre, unidad, proveedor)")
    .order("fecha_pedido", { ascending: false });

  const pedidos = ((pedidosData ?? []) as unknown as PedidoRow[])
    .map((pedido) => ({ pedido, estado: estadoEfectivo(pedido) }))
    .sort((a, b) => {
      const aActivo = isActivo(a.estado) ? 0 : 1;
      const bActivo = isActivo(b.estado) ? 0 : 1;
      if (aActivo !== bActivo) return aActivo - bActivo;
      return (
        new Date(b.pedido.fecha_pedido).getTime() -
        new Date(a.pedido.fecha_pedido).getTime()
      );
    });

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-lg font-semibold">Pedidos</h1>
          <p className="text-xs text-zinc-500">
            Reabastecimiento de reactivos e insumos.
          </p>
        </div>
        <Button render={<Link href="/" />} nativeButton={false} variant="outline" size="sm">
          Volver
        </Button>
      </header>

      <Button render={<Link href="/pedidos/nuevo" />} nativeButton={false}>
        + Nuevo pedido
      </Button>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {pedidos.length === 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Todavía no hay pedidos registrados.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {pedidos.map(({ pedido, estado }) => {
          const activo = isActivo(estado);
          const nombre = pedido.items?.nombre ?? "Item eliminado";
          return (
            <Card key={pedido.id} size="sm" className={!activo ? "opacity-70" : undefined}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{nombre}</p>
                    <p className="text-xs text-zinc-500">
                      {pedido.cantidad} {pedido.items?.unidad ?? ""}
                      {pedido.items?.proveedor ? ` · ${pedido.items.proveedor}` : ""}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Pedido el {new Date(pedido.fecha_pedido).toLocaleDateString("es-AR")}
                      {pedido.fecha_estimada &&
                        ` · llega ~${new Date(pedido.fecha_estimada).toLocaleDateString("es-AR", { timeZone: "UTC" })}`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      estado === "atrasado"
                        ? "destructive"
                        : estado === "cancelado"
                          ? "secondary"
                          : "outline"
                    }
                    className={estado === "recibido" ? "border-emerald-500 text-emerald-600" : undefined}
                  >
                    {ESTADO_LABEL[estado]}
                  </Badge>
                </div>

                {activo && (
                  <>
                    <AvisarAlGrupo
                      nombre={nombre}
                      cantidad={pedido.cantidad}
                      proveedor={pedido.items?.proveedor ?? null}
                      fechaEstimada={pedido.fecha_estimada}
                    />
                    <form action={marcarPedidoRecibido}>
                      <input type="hidden" name="id" value={pedido.id} />
                      <Button type="submit" size="sm" className="w-full">
                        Marcar recibido
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
