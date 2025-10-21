const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Imagerie {
  id?: number;
  type: string;
  urlImage: string;
  compteRenduId: number;
  rendezVousId: number;
}

// Récupérer toutes les imageries
export async function getImageries(): Promise<Imagerie[]> {
  const res = await fetch(`${API_URL}/imageries`, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de récupérer les imageries");
  return res.json();
}

// Récupérer une imagerie par ID
export async function getImagerieById(id: number): Promise<Imagerie> {
  const res = await fetch(`${API_URL}/imageries/${id}`);
  if (!res.ok) throw new Error("Imagerie introuvable");
  return res.json();
}

// Créer une nouvelle imagerie
export async function createImagerie(data: {
  type: string;
  urlImage: string;
  compteRenduId: number;
  rendezVousId: number;
}): Promise<Imagerie> {
  const res = await fetch(`${API_URL}/imageries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Impossible de créer l’imagerie");
  return res.json();
}

// Mettre à jour une imagerie
export async function updateImagerie(
  id: number,
  data: Partial<{
    type: string;
    urlImage: string;
    compteRenduId: number;
    rendezVousId: number;
  }>
): Promise<Imagerie> {
  const res = await fetch(`${API_URL}/imageries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Impossible de mettre à jour l’imagerie");
  return res.json();
}

// Supprimer une imagerie
export async function deleteImagerie(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/imageries/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Impossible de supprimer l’imagerie");
  return true;
}
