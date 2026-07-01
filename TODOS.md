# TODOS

## Botón "Cerrar guardia" — resumen de handoff por WhatsApp

**What:** Un botón en el dashboard que, al cerrar un turno de guardia, genera un texto de WhatsApp resumiendo todo lo que cambió durante ese turno (movimientos registrados, pedidos creados/recibidos) — listo para copiar y pegar al grupo.

**Why:** El problema real que resuelve no es el stock en sí, sino la ansiedad del handoff entre turnos: "¿qué necesito saber que el turno anterior sabía y yo no?". Surgió como idea lateral de una segunda opinión durante /office-hours (2026-07-01) y encaja con el mismo patrón de "generar texto para copiar" ya elegido para pedidos.

**Pros:**
- Reusa el patrón de generación de texto ya construido para "Avisar al grupo" (pedidos) — bajo costo incremental una vez que ese patrón exista.
- Ataca un problema real distinto al de stock (coordinación de turno), ampliando el valor del producto sin sumar tecnología nueva.

**Cons:**
- Requiere lógica para trackear "desde el último cierre de guardia" — no es trivial, necesita un marcador de "guardia cerrada" en algún lado (nueva tabla o campo).
- No tiene validación de que sea necesario — nadie pidió esto todavía, es una hipótesis de una segunda opinión, no de Caro.

**Context:** Ver design doc completo en `~/.gstack/projects/lab-stock/zeta-master-design-20260701-001736.md`, sección "What Makes This Cool" y Next Steps #9. Quedó explícitamente fuera del MVP (Approach B elegido) para no construir features sin validar el núcleo primero.

**Depends on / blocked by:** Validar el MVP actual (dashboard + registrar movimiento + pedidos) con uso real de Caro antes de considerar esto — no tiene sentido diseñar el trigger de "cierre de guardia" sin saber si el ritmo real de turnos lo justifica.
