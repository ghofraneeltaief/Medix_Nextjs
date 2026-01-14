const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Facture {
  id?: number;
  id_rendez_vous?: number;
  id_acte?: number;
  nom_patient: string;
  montant: number;
  date_facture: string;
  statut: string;
  date_creation?: string;
  rendezVous?: {
    id: number;
    nom_patient: string;
    date: string;
    heure: string;
  };
  acte?: {
    Id_Acte: number;
    Nom_Acte: string;
    Prix: number;
  };
}

export async function getFactures(): Promise<Facture[]> {
  const res = await fetch(`${API_URL}/factures`);
  if (!res.ok) throw new Error("Impossible de récupérer les factures");
  return res.json();
}

export async function getFactureById(id: number): Promise<Facture> {
  const res = await fetch(`${API_URL}/factures/${id}`);
  if (!res.ok) throw new Error("Facture introuvable");
  return res.json();
}

export async function createFacture(data: {
  id_rendez_vous: number;
  id_acte: number;
  nom_patient: string;
  montant: number;
  date_facture: string;
  statut?: string;
}): Promise<Facture> {
  const res = await fetch(`${API_URL}/factures`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Impossible de créer la facture" }));
    throw new Error(error.message || "Impossible de créer la facture");
  }
  return res.json();
}

export async function updateFacture(
  id: number,
  data: Partial<Facture> & { id_acte?: number; id_rendez_vous?: number }
): Promise<Facture> {
  const res = await fetch(`${API_URL}/factures/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Impossible de mettre à jour la facture" }));
    throw new Error(error.message || "Impossible de mettre à jour la facture");
  }
  return res.json();
}

export async function deleteFacture(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/factures/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Impossible de supprimer la facture");
}
