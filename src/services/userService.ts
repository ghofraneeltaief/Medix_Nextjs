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
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erreur getProfile:", res.status, text);
    throw new Error("Erreur récupération profil");
  }

  const data = await res.json();
  return {
    id: data.userId,
    name: data.name,
    lastName: data.lastName,
    email: data.email,
    password: "********",
    role: data.role,
  };
}

// ---------------------------
// Mettre à jour un utilisateur
// ---------------------------
export async function updateUser(
  token: string,
  id: string,
  user: Partial<Omit<User, "id">>
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Erreur updateUser:", res.status, text);
    throw new Error("Impossible de mettre à jour l’utilisateur");
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
