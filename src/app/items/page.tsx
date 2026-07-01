import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { desactivarItem, reactivarItem } from "@/app/items/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Item = {
  id: string;
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  proveedor: string | null;
  lead_time_dias: number | null;
  activo: boolean;
};

export default async function ItemsPage() {
  const supabase = await createClient();
  const { data: itemsData } = await supabase
    .from("items")
    .select("*")
    .order("activo", { ascending: false })
    .order("nombre");

  const items = (itemsData ?? []) as Item[];

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-lg font-semibold">Items</h1>
          <p className="text-xs text-zinc-500">
            Reactivos e insumos del laboratorio.
          </p>
        </div>
        <Button render={<Link href="/" />} nativeButton={false} variant="outline" size="sm">
          Volver
        </Button>
      </header>

      <Button render={<Link href="/items/nuevo" />} nativeButton={false}>
        + Agregar item
      </Button>

      {items.length === 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Todavía no hay items cargados.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Card key={item.id} size="sm" className={!item.activo ? "opacity-60" : undefined}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.nombre}</p>
                  {!item.activo && <Badge variant="secondary">Inactivo</Badge>}
                </div>
                <p className="text-xs text-zinc-500">
                  {item.stock_actual} {item.unidad} · mínimo {item.stock_minimo}
                  {item.proveedor ? ` · ${item.proveedor}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  render={<Link href={`/items/${item.id}`} />}
                  nativeButton={false}
                  variant="secondary"
                  size="sm"
                >
                  Editar
                </Button>
                <form action={item.activo ? desactivarItem : reactivarItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button
                    type="submit"
                    variant={item.activo ? "destructive" : "outline"}
                    size="sm"
                  >
                    {item.activo ? "Desactivar" : "Reactivar"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
