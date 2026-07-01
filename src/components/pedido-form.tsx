"use client";

import { useActionState, useState } from "react";
import { crearPedido } from "@/app/pedidos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Item = { id: string; nombre: string; unidad: string };

export function PedidoForm({
  items,
  defaultItemId,
}: {
  items: Item[];
  defaultItemId?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    crearPedido,
    undefined,
  );
  const [itemId, setItemId] = useState(defaultItemId ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="item_id">Item</Label>
        <Select
          name="item_id"
          value={itemId}
          onValueChange={(value) => setItemId(value ?? "")}
          required
        >
          <SelectTrigger id="item_id" className="w-full">
            <SelectValue placeholder="Elegí un item">
              {(value: string | null) => {
                const selected = items.find((item) => item.id === value);
                return selected ? `${selected.nombre} (${selected.unidad})` : "Elegí un item";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nombre} ({item.unidad})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cantidad">Cantidad</Label>
        <Input
          id="cantidad"
          name="cantidad"
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha_estimada">Fecha estimada de llegada (opcional)</Label>
        <Input id="fecha_estimada" name="fecha_estimada" type="date" />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Crear pedido"}
      </Button>
    </form>
  );
}
