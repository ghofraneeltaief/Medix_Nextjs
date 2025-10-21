const API_URL = process.env.NEXT_PUBLIC_API_URL ;
export interface Acte {
  Id_Acte?: string | number;
  Nom_Acte: string;
  Prix: number;
}
export async function getActes() {
  const res = await fetch(`${API_URL}/actes`);
  if (!res.ok) throw new Error("Impossible de récupérer les actes");
  return res.json();
}

export async function getActeById(id: number) {
  const res = await fetch(`${API_URL}/actes/${id}`);
  if (!res.ok) throw new Error("Acte introuvable");
  return res.json();
}

export async function createActe(nom: string, prix: number) {
  const res = await fetch(`${API_URL}/actes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Nom_Acte: nom, Prix: prix }),
  });

  if (!res.ok) throw new Error("Impossible de créer l’acte");
  return res.json();
}

export async function updateActe(id: number, nom: string, prix: number) {
  const res = await fetch(`${API_URL}/actes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Nom_Acte: nom, Prix: prix }),
  });

  if (!res.ok) throw new Error("Impossible de mettre à jour l’acte");
  return res.json();
}

export async function deleteActe(id: number) {
  const res = await fetch(`${API_URL}/actes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Impossible de supprimer l’acte");
  return true;
}
