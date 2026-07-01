import { crearItem } from "@/app/items/actions";
import { ItemForm } from "@/components/item-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NuevoItemPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Agregar item</CardTitle>
          <CardDescription>
            Reactivo o insumo nuevo para trackear stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemForm action={crearItem} submitLabel="Crear item" />
        </CardContent>
      </Card>
    </div>
  );
}
