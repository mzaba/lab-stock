import { loginWithGoogle } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Lab Stock</CardTitle>
          <CardDescription>Ingresá para registrar movimientos de stock.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <form action={loginWithGoogle}>
            <Button type="submit" className="w-full">
              Ingresar con Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
