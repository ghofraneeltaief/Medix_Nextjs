"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

/**
 * Retourne l'URL de la page de paramètres selon le rôle de l'utilisateur
 */
function getSettingsUrl(role: string | null): string {
  const roleRoutes: Record<string, string> = {
    admin: "/admin/pages/settings",
    assistante: "/assistante/pages/settings",
    "médecin": "/medecin-externe/pages/settings",
    "médecin radiologue": "/radiologue/pages/settings",
    technicien: "/technicien/pages/settings",
  };

  return roleRoutes[role || ""] || "/admin/pages/settings";
}

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string,img: "/images/user/user-03.png", lastname: string} | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser({
        name: decoded.name,
        lastname: decoded.lastName,
        email: decoded.email,
        img: "/images/user/user-03.png",
      });
    }
    
    if (role) {
      setUserRole(role);
    }
  }, []);

  if (!user) return null;

  // ✅ Fonction de logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // supprimer JWT
    localStorage.removeItem("role"); // supprimer le rôle
    localStorage.removeItem("remember_me"); // si tu l'utilises
    
    // Supprimer les cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    router.push("/"); // redirige vers page de login
  };
  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">Mon Compte</span>

        <figure className="flex items-center gap-3">
          <Image
            src={user.img}
            className="size-12"
            alt={`Avatar de ${user.name}`}
            role="presentation"
            width={200}
            height={200}
          />
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{user.name+" "+user.lastname}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">Informations utilisateur</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={user.img}
            className="size-12"
            alt={`Avatar de ${user.name}`}
            role="presentation"
            width={200}
            height={200}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {user.name+" "+user.lastname}
            </div>

            <div className="leading-none text-gray-6">{user.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={getSettingsUrl(userRole)}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Paramètres du compte
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Se déconnecter</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
