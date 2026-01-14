import * as Icons from "../icons";

// Mapping rôle -> URLs
const ROLE_URL_MAP: Record<string, Record<string, string>> = {
  admin: {
    "Tableau de bord": "/admin",
    "Rendez-vous": "/admin/calendar",
    Actes: "/admin/actes",
    Utilisateurs: "/admin/users",
    Images: "/admin/image",
    "Comptes rendus": "/admin/compterendu",
    Factures: "/admin/factures",
    Profil: "/admin/pages/settings",
  },
  assistante: {
    "Rendez-vous": "/assistante/calendar",
    Factures: "/assistante/factures",
    Profil: "/assistante/pages/settings",
  },
  médecin: {
    Images: "/medecin-externe/image",
    "Comptes rendus": "/medecin-externe/compterendu",
    Profil: "/medecin-externe/pages/settings",
  },
  "médecin radiologue": {
    Images: "/radiologue/image",
    "Comptes rendus": "/radiologue/compterendu",
    Profil: "/radiologue/pages/settings",
  },
  technicien: {
    Images: "/technicien/image",
    Profil: "/technicien/pages/settings",
  },
};

// Fonction pour générer NAV_DATA selon le rôle
export function getNavDataForRole(role: string) {
  const urls = ROLE_URL_MAP[role] || {};

  return [
    {
      label: "MENU PRINCIPAL",
      items: [
        {
          title: "Tableau de bord",
          icon: Icons.HomeIcon,
          items: [],
          url: urls["Tableau de bord"],
        },
        {
          title: "Rendez-vous",
          icon: Icons.Calendar,
          items: [],
          url: urls["Rendez-vous"],
        },
        { title: "Profil", icon: Icons.User, items: [], url: urls["Profil"] },
        { title: "Actes", icon: Icons.Alphabet, items: [], url: urls["Actes"] },
        {
          title: "Utilisateurs",
          icon: Icons.User,
          items: [],
          url: urls["Utilisateurs"],
        },
        {
          title: "Images",
          icon: Icons.FourCircle,
          items: [],
          url: urls["Images"],
        },
        {
          title: "Comptes rendus",
          icon: Icons.Table,
          items: [],
          url: urls["Comptes rendus"],
        },
        {
          title: "Factures",
          icon: Icons.PieChart,
          items: [],
          url: urls["Factures"],
        },
      ].filter((item) => item.url), // supprime les items non autorisés
    },
  ];
}
