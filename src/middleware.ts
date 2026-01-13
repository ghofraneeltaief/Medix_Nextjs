import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/', '/signin', '/signup'];

// Routes protégées par rôle
const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  assistante: ['/assistante'],
  'médecin': ['/medecin-externe'],
  'médecin radiologue': ['/radiologue'],
  technicien: ['/technicien'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Si pas de token, rediriger vers la page de connexion
  if (!token) {
    const signInUrl = new URL('/', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Vérifier si l'utilisateur a accès à cette route selon son rôle
  if (role && roleRoutes[role]) {
    const hasAccess = roleRoutes[role].some((route) => pathname.startsWith(route));
    if (!hasAccess) {
      // Rediriger vers la page d'accueil de son rôle
      const homeUrl = new URL(roleRoutes[role][0] || '/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

// Configurer les routes à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
