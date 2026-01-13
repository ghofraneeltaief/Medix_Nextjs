"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      // Rediriger vers la page d'accueil selon le rôle
      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        assistante: "/assistante/calendar",
        "médecin": "/medecin-externe/image",
        "médecin radiologue": "/radiologue/image",
        technicien: "/technicien/image",
      };

      const homeRoute = roleRoutes[role] || "/";
      router.push(homeRoute);
    }
  }, [router]);

  return <>{children}</>;
}
