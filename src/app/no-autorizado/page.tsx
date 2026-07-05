import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NoAutorizadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sin acceso</CardTitle>
          <CardDescription>
            Tu cuenta de Google inició sesión correctamente, pero no está
            autorizada para usar Lab Stock. Pedile a quien administra la app
            que agregue tu email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/login" />} nativeButton={false} className="w-full">
            Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
