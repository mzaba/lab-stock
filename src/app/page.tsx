import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-sm text-zinc-600">
        Sesión iniciada como <strong>{user?.email}</strong>
      </p>
      <p className="text-zinc-400 text-xs">
        Dashboard real llega en PR 2 — esto solo confirma que el login funciona.
      </p>
      <form action={logout}>
        <Button type="submit" variant="outline">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
