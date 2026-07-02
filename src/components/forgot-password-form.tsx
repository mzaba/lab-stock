"use client";

import { useActionState } from "react";
import { solicitarRecuperacion } from "@/app/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    solicitarRecuperacion,
    undefined,
  );

  if (state?.success) {
    return (
      <p className="text-sm text-emerald-600">
        Si ese email tiene una cuenta, te llegó un link para elegir una
        contraseña nueva. Revisá tu correo (y la carpeta de spam).
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar link de recuperación"}
      </Button>
    </form>
  );
}
