"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function buildMensaje({
  nombre,
  cantidad,
  proveedor,
  fechaEstimada,
}: {
  nombre: string;
  cantidad: number;
  proveedor: string | null;
  fechaEstimada: string | null;
}) {
  let mensaje = `Pedido: ${nombre} x${cantidad}`;
  if (proveedor) {
    mensaje += ` a ${proveedor}`;
  }
  if (fechaEstimada) {
    // fecha_estimada is a date, not a moment — cast to timestamptz it lands
    // on UTC midnight, so format in UTC or a local timezone can roll it back
    // a day.
    const formatted = new Date(fechaEstimada).toLocaleDateString("es-AR", {
      timeZone: "UTC",
    });
    mensaje += `, llega ~${formatted}`;
  }
  return mensaje;
}

export function AvisarAlGrupo({
  nombre,
  cantidad,
  proveedor,
  fechaEstimada,
}: {
  nombre: string;
  cantidad: number;
  proveedor: string | null;
  fechaEstimada: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const mensaje = buildMensaje({ nombre, cantidad, proveedor, fechaEstimada });

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Card size="sm" className="bg-muted/50">
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm whitespace-pre-wrap select-all">{mensaje}</p>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={copiar}>
            Copiar
          </Button>
          {status === "copied" && (
            <span className="text-xs text-emerald-600">¡Copiado!</span>
          )}
          {status === "failed" && (
            <span className="text-xs text-amber-600">
              No se pudo copiar solo — seleccioná el texto de arriba.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
