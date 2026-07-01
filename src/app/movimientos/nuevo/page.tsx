import { createClient } from "@/lib/supabase/server";
import { MovimientoForm } from "@/components/movimiento-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NuevoMovimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("items")
    .select("id, nombre, unidad")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Registrar movimiento</CardTitle>
          <CardDescription>Uso, ingreso o ajuste de stock.</CardDescription>
        </CardHeader>
        <CardContent>
          <MovimientoForm items={items ?? []} defaultItemId={item} />
        </CardContent>
      </Card>
    </div>
  );
}
