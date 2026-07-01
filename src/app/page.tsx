import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type StockCritico = {
  id: string;
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  lead_time_dias: number | null;
  dias_restantes: number | null;
};

type Semaforo = "rojo" | "amarillo" | "verde";

const SEMAFORO_ORDER: Record<Semaforo, number> = { rojo: 0, amarillo: 1, verde: 2 };
const SEMAFORO_LABEL: Record<Semaforo, string> = {
  rojo: "Stock bajo",
  amarillo: "Se acerca la fecha de reposición",
  verde: "OK",
};

function getSemaforo(item: StockCritico): Semaforo {
  if (item.stock_actual < item.stock_minimo) return "rojo";
  if (
    item.dias_restantes != null &&
    item.lead_time_dias != null &&
    item.dias_restantes < item.lead_time_dias
  ) {
    return "amarillo";
  }
  return "verde";
}

export default async function Home() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data: itemsData } = await supabase
    .from("stock_critico")
    .select("*");

  const items = ((itemsData ?? []) as StockCritico[])
    .map((item) => ({ item, semaforo: getSemaforo(item) }))
    .sort((a, b) => {
      const diff = SEMAFORO_ORDER[a.semaforo] - SEMAFORO_ORDER[b.semaforo];
      return diff !== 0 ? diff : a.item.nombre.localeCompare(b.item.nombre);
    });

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-lg font-semibold">Lab Stock</h1>
          <p className="text-xs text-zinc-500">
            {user.user?.email}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </header>

      <div className="flex gap-2">
        <Button
          render={<Link href="/movimientos/nuevo" />}
          nativeButton={false}
          className="flex-1"
        >
          + Registrar movimiento
        </Button>
        <Button
          render={<Link href="/items" />}
          nativeButton={false}
          variant="outline"
        >
          Items
        </Button>
        <Button
          render={<Link href="/pedidos" />}
          nativeButton={false}
          variant="outline"
        >
          Pedidos
        </Button>
      </div>

      {items.length === 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Todavía no hay items cargados.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map(({ item, semaforo }) => (
          <Card key={item.id} size="sm">
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.nombre}</p>
                <p className="text-xs text-zinc-500">
                  {item.stock_actual} {item.unidad} · mínimo {item.stock_minimo}
                </p>
                <Badge
                  variant={semaforo === "rojo" ? "destructive" : "outline"}
                  className={
                    semaforo === "amarillo"
                      ? "border-amber-500 text-amber-600"
                      : semaforo === "verde"
                        ? "border-emerald-500 text-emerald-600"
                        : undefined
                  }
                >
                  {SEMAFORO_LABEL[semaforo]}
                </Badge>
              </div>
              <Button
                render={<Link href={`/movimientos/nuevo?item=${item.id}`} />}
                nativeButton={false}
                variant="secondary"
                size="sm"
              >
                Registrar uso
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
