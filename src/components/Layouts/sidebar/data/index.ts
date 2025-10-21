import * as Icons from "../icons";

// Mapping rôle -> URLs
const ROLE_URL_MAP: Record<string, Record<string, string>> = {
  admin: {
    Dashboard: "/admin",
    "Rendez-vous": "/admin/calendar",
    Profile: "/admin/pages/settings",
    Actes: "/admin/actes",
    Users: "/admin/users",
    Images: "/admin/image",
    "Comptes rendus": "/admin/compterendu",
    Factures: "/admin/factures",
  },
  assistante: {
    Dashboard: "/assistante",
    "Rendez-vous": "/assistante/calendar",
    Profile: "/assistante/pages/settings",
    Factures: "/assistante/factures",
  },
  médecin: {
    Dashboard: "/medecin-externe",
    Profile: "/medecin-externe/pages/settings",
    Images: "/medecin-externe/image",
    "Comptes rendus": "/medecin-externe/compterendu",
  },
  "médecin radiologue": {
    Dashboard: "/radiologue",
    Profile: "/radiologue/pages/settings",
    Images: "/radiologue/image",
    "Comptes rendus": "/radiologue/compterendu",
  },
  technicien: {
    Dashboard: "/technicien",
    Profile: "/technicien/pages/settings",
    Images: "/technicien/image",
  },
};

// Fonction pour générer NAV_DATA selon le rôle
export function getNavDataForRole(role: string) {
  const urls = ROLE_URL_MAP[role] || {};

  return [
    {
      label: "MAIN MENU",
      items: [
        { title: "Dashboard", icon: Icons.HomeIcon, items: [], url: urls["Dashboard"] },
        { title: "Rendez-vous", icon: Icons.Calendar, items: [], url: urls["Rendez-vous"] },
        { title: "Profile", icon: Icons.User, items: [], url: urls["Profile"] },
        { title: "Actes", icon: Icons.Alphabet, items: [], url: urls["Actes"] },
        { title: "Users", icon: Icons.User, items: [], url: urls["Users"] },
        { title: "Images", icon: Icons.Table, items: [], url: urls["Images"] },
        { title: "Comptes rendus", icon: Icons.Table, items: [], url: urls["Comptes rendus"] },
        { title: "Factures", icon: Icons.Table, items: [], url: urls["Factures"] },
      ].filter((item) => item.url), // supprime les items non autorisés
    },
  ];
}
