const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CompteRendu {
  id?: number;
  id_rv?: number;
  id_medecin?: number;
  id_acte?: number;
  nom_patient: string;
  contenu: string;
  date_creation?: string;
  rendezVous?: {
    id?: number;
    nom_patient: string;
    date: string;
    heure: string;
  };
  medecin?: {
    id?: number;
    nom: string;
    prenom: string;
  };
  acte?: {
    Id_Acte?: number;
    Nom_Acte: string;
  };
}

// Récupérer tous les comptes rendus
export async function getComptesRendus(): Promise<CompteRendu[]> {
  const res = await fetch(`${API_URL}/compterendu`, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de récupérer les comptes rendus");
  return res.json();
}

// Récupérer un compte rendu par ID
export async function getCompteRenduById(id: number): Promise<CompteRendu> {
  const res = await fetch(`${API_URL}/compterendu/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de récupérer le compte rendu");
  return res.json();
}

// Créer un compte rendu
export async function createCompteRendu(data: {
  id_rv: number;
  id_medecin: number;
  id_acte: number;
  nom_patient: string;
  contenu: string;
}): Promise<CompteRendu> {
  const res = await fetch(`${API_URL}/compterendu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Impossible de créer le compte rendu";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

// Mettre à jour un compte rendu
export async function updateCompteRendu(
  id: number,
  data: Partial<CompteRendu>
): Promise<CompteRendu> {
  const res = await fetch(`${API_URL}/compterendu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erreur lors de la mise à jour du compte rendu" }));
    throw new Error(errorData.message || "Impossible de mettre à jour le compte rendu");
  }

  return res.json();
}

// Supprimer un compte rendu
export async function deleteCompteRendu(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/compterendu/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erreur lors de la suppression du compte rendu" }));
    throw new Error(errorData.message || "Impossible de supprimer le compte rendu");
  }
}
