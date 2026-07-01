"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ItemState = { error?: string } | undefined;
type ItemAction = (
  prevState: ItemState,
  formData: FormData,
) => Promise<ItemState>;

type Item = {
  id: string;
  nombre: string;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  proveedor: string | null;
  lead_time_dias: number | null;
};

export function ItemForm({
  action,
  item,
  submitLabel,
}: {
  action: ItemAction;
  item?: Item;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          defaultValue={item?.nombre}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="unidad">Unidad</Label>
        <Input
          id="unidad"
          name="unidad"
          placeholder="ej: unidades, ml, cajas"
          required
          defaultValue={item?.unidad}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="stock_actual">Stock actual</Label>
          <Input
            id="stock_actual"
            name="stock_actual"
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            required
            defaultValue={item?.stock_actual ?? 0}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="stock_minimo">Stock mínimo</Label>
          <Input
            id="stock_minimo"
            name="stock_minimo"
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            required
            defaultValue={item?.stock_minimo ?? 0}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="proveedor">Proveedor (opcional)</Label>
        <Input
          id="proveedor"
          name="proveedor"
          defaultValue={item?.proveedor ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lead_time_dias">
          Lead time estimado (días, opcional)
        </Label>
        <Input
          id="lead_time_dias"
          name="lead_time_dias"
          type="number"
          step="1"
          min="0"
          inputMode="numeric"
          defaultValue={item?.lead_time_dias ?? 7}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
