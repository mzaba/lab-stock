"use client";

import { useActionState, useEffect, useState } from "react";
import {
  registrarMovimiento,
  getUltimoMovimiento,
  type UltimoMovimiento,
} from "@/app/movimientos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

type Item = { id: string; nombre: string; unidad: string };
type MovimientoState = { error?: string } | undefined;

const TIPO_LABELS: Record<string, string> = {
  uso: "Uso",
  ingreso: "Ingreso",
  ajuste: "Ajuste",
};

async function submitMovimiento(
  prevState: MovimientoState,
  formData: FormData,
) {
  return registrarMovimiento(prevState, formData);
}

export function MovimientoForm({
  items,
  defaultItemId,
}: {
  items: Item[];
  defaultItemId?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitMovimiento,
    undefined,
  );
  const [itemId, setItemId] = useState(defaultItemId ?? "");
  const [tipo, setTipo] = useState("uso");
  // Controlled (not just for validation) so a failed submission doesn't wipe
  // them — React/Next.js resets uncontrolled fields after every form action,
  // success or failure, which would otherwise violate the "never lose input
  // on error" requirement from the design doc.
  const [cantidad, setCantidad] = useState("");
  const [nota, setNota] = useState("");
  // Keyed by itemId so a slow fetch for a previous item can never render as
  // if it belongs to whatever item is currently selected.
  const [ultimoMovimiento, setUltimoMovimiento] = useState<{
    itemId: string;
    data: UltimoMovimiento | null;
  } | null>(null);

  useEffect(() => {
    if (tipo !== "ajuste" || !itemId) {
      return;
    }
    let cancelled = false;
    getUltimoMovimiento(itemId).then((data) => {
      if (!cancelled) {
        setUltimoMovimiento({ itemId, data });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tipo, itemId]);

  const loadingUltimo = tipo === "ajuste" && !!itemId && ultimoMovimiento?.itemId !== itemId;
  const ultimoMovimientoData =
    ultimoMovimiento?.itemId === itemId ? ultimoMovimiento.data : null;

  const cantidadLabel =
    tipo === "ajuste" ? "Nuevo stock total" : "Cantidad";

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
        <Label>Tipo de movimiento</Label>
        <RadioGroup
          name="tipo"
          value={tipo}
          onValueChange={setTipo}
          className="flex gap-4"
        >
          {Object.entries(TIPO_LABELS).map(([value, label]) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem value={value} id={`tipo-${value}`} />
              <Label htmlFor={`tipo-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {tipo === "ajuste" && itemId && (
        <Card size="sm">
          <CardContent className="text-sm text-muted-foreground">
            {loadingUltimo && "Buscando el último movimiento..."}
            {!loadingUltimo && ultimoMovimientoData && (
              <>
                Último movimiento sobre este item:{" "}
                <strong>{TIPO_LABELS[ultimoMovimientoData.tipo]}</strong> de{" "}
                {ultimoMovimientoData.cantidad} por{" "}
                {ultimoMovimientoData.nombre_usuario ?? "alguien"}, el{" "}
                {new Date(ultimoMovimientoData.created_at).toLocaleString("es-AR")}
                . Confirmá que no estás pisando ese registro.
              </>
            )}
            {!loadingUltimo && !ultimoMovimientoData && "No hay movimientos previos para este item."}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="cantidad">{cantidadLabel}</Label>
        <Input
          id="cantidad"
          name="cantidad"
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          required
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nota">Nota (opcional)</Label>
        <Textarea
          id="nota"
          name="nota"
          rows={2}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Registrar"}
      </Button>
    </form>
  );
}
