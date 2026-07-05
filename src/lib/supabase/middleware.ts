import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTHORIZED_EMAILS } from "@/lib/authorized-emails";

const PUBLIC_PATHS = ["/login", "/auth/confirm", "/no-autorizado"];

const ASSET_EXTENSIONS = /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/;

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/") ||
    ASSET_EXTENSIONS.test(pathname)
  );
}

export async function updateSession(request: NextRequest) {
  if (isAssetPath(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not remove this call. It refreshes the auth token,
  // which keeps Caro's session alive mid-guardia instead of silently expiring.
  const { data: { user } } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  // No hay registro público — solo entra el equipo de la allowlist. Un
  // Google login válido pero no autorizado se cierra en el acto en vez de
  // dejarlo pasar con una sesión activa pero sin acceso a nada útil.
  if (user && !AUTHORIZED_EMAILS.includes(user.email ?? "")) {
    await supabase.auth.signOut();
    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = "/no-autorizado";
    return NextResponse.redirect(deniedUrl);
  }

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
