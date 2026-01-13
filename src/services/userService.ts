// services/user.service.ts

export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

// Récupérer l'URL depuis l'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ---------------------------
// Profil utilisateur
// ---------------------------
export async function getProfile(token: string): Promise<UserProfile> {
  try {
    console.log("Chargement du profil depuis la base de données...");
    
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Erreur getProfile:", res.status, text);
      throw new Error(`Erreur récupération profil: ${res.status}`);
    }

    const data = await res.json();
    console.log("Données du profil récupérées depuis la base de données:", {
      userId: data.userId,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
    });

    const profile: UserProfile = {
      id: data.userId?.toString() || "",
      name: data.name || "",
      lastName: data.lastName || "",
      email: data.email || "",
      password: "********",
      role: data.role || "",
    };

    console.log("Profil formaté:", profile);
    return profile;
  } catch (error) {
    console.error("Erreur dans getProfile:", error);
    throw error;
  }
}

// ---------------------------
// Mettre à jour un utilisateur
// ---------------------------
export async function updateUser(
  token: string,
  id: string,
  user: Partial<Omit<User, "id">>
): Promise<User> {
  // Créer un objet propre sans les champs undefined ou vides
  const cleanUser: any = {};
  
  if (user.name !== undefined && user.name.trim() !== "") {
    cleanUser.name = user.name;
  }
  if (user.lastName !== undefined && user.lastName.trim() !== "") {
    cleanUser.lastName = user.lastName;
  }
  if (user.email !== undefined && user.email.trim() !== "") {
    cleanUser.email = user.email;
  }
  if (user.role !== undefined && user.role.trim() !== "") {
    cleanUser.role = user.role;
  }
  // Le mot de passe n'est inclus QUE s'il est explicitement fourni et non vide
  if (user.password !== undefined && user.password.trim() !== "") {
    cleanUser.password = user.password;
    console.log("Mot de passe inclus dans la mise à jour");
  } else {
    console.log("Mot de passe exclu de la mise à jour (non modifié)");
  }

  console.log("Données envoyées au serveur:", {
    ...cleanUser,
    password: cleanUser.password ? "[PRÉSENT]" : "[ABSENT]",
  });

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanUser),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erreur updateUser:", res.status, text);
    throw new Error("Impossible de mettre à jour l'utilisateur");
  }

  return res.json();
}
export interface User {
  id?: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}


// ---------------------------
// Utilisateurs CRUD
// ---------------------------

// Récupérer tous les utilisateurs
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Impossible de récupérer les utilisateurs");
  return res.json();
}

// Récupérer un utilisateur par ID
export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) throw new Error("Utilisateur introuvable");
  return res.json();
}

// Créer un utilisateur
export async function createUser(user: Omit<User, "id">): Promise<User> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
  const errorText = await res.text();
  console.error("Erreur API createUser:", res.status, errorText);
  throw new Error("Impossible de créer l’utilisateur");
}

  return res.json();
}

// Supprimer un utilisateur
export async function deleteUser(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Impossible de supprimer l’utilisateur");
  return true;
}

// ---------------------------
// Recherche par nom/prénom
// ---------------------------
export const findUserByName = async (name: string, lastName: string): Promise<User[]> => {
  const res = await fetch(`${API_URL}/users/search?name=${name}&lastName=${lastName}`);
  if (!res.ok) throw new Error("Erreur recherche utilisateur");
  return res.json();
};
// ---------------------------
// Récupérer uniquement les médecins
// ---------------------------
export async function getMedecins(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Impossible de récupérer les utilisateurs");

  const users: User[] = await res.json();

  // Garder seulement les médecins
  return users.filter((u) => u.role?.toLowerCase() === "médecin");
}
