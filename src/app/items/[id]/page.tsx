import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarItem, desactivarItem, reactivarItem } from "@/app/items/actions";
import { ItemForm } from "@/components/item-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditarItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!item) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Editar item</CardTitle>
          <CardDescription>{item.nombre}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ItemForm
            action={actualizarItem}
            item={item}
            submitLabel="Guardar cambios"
          />
          <form action={item.activo ? desactivarItem : reactivarItem}>
            <input type="hidden" name="id" value={item.id} />
            <Button
              type="submit"
              variant={item.activo ? "destructive" : "outline"}
              className="w-full"
            >
              {item.activo ? "Desactivar item" : "Reactivar item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
