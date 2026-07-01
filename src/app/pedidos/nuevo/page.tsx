import { createClient } from "@/lib/supabase/server";
import { PedidoForm } from "@/components/pedido-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NuevoPedidoPage({
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
          <CardTitle>Nuevo pedido</CardTitle>
          <CardDescription>Pedile stock a un proveedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <PedidoForm items={items ?? []} defaultItemId={item} />
        </CardContent>
      </Card>
    </div>
  );
}
