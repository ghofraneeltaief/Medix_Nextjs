"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Vérifier le token dans localStorage
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      // Si pas de token, rediriger vers la page de connexion
      if (!token) {
        router.push(`/?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Si des rôles sont spécifiés, vérifier que l'utilisateur a le bon rôle
      if (allowedRoles && allowedRoles.length > 0) {
        if (!role || !allowedRoles.includes(role)) {
          // Rediriger vers la page d'accueil de son rôle ou la page de connexion
          const roleRoutes: Record<string, string> = {
            admin: "/admin",
            assistante: "/assistante/calendar",
            "médecin": "/medecin-externe/image",
            "médecin radiologue": "/radiologue/image",
            technicien: "/technicien/image",
          };

          const homeRoute = roleRoutes[role] || "/";
          router.push(homeRoute);
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname, allowedRoles]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si autorisé, afficher le contenu
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Sinon, ne rien afficher (la redirection est en cours)
  return null;
}
