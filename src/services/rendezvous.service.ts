const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export interface RendezVousPayload {
  nom_patient: string;
  date: string;
  heure: string;
  id_acte: number;
  id_medecin: number;
}

export async function getRendezVous() {
  const res = await fetch(`${API_URL}/rendezvous`);
  if (!res.ok) throw new Error("Impossible de récupérer les rendez-vous");
  return res.json();
}

export async function createRendezVous(payload: RendezVousPayload) {
  console.log("Payload envoyé à l'API :", payload); // debug

  const res = await fetch(`${API_URL}/rendezvous`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Erreur createRendezVous :", res.status, errText);
    throw new Error("Impossible de créer le rendez-vous");
  }

  return res.json();
}

export async function getRendezVousById(id: number) {
  const res = await fetch(`${API_URL}/rendezvous/${id}`);
  if (!res.ok) throw new Error("Rendez-vous introuvable");
  return res.json();
}

export async function updateRendezVous(id: number, updateData: Partial<RendezVousPayload>) {
  try {
    console.log(`Mise à jour du rendez-vous ${id}:`, updateData);
    
    const res = await fetch(`${API_URL}/rendezvous/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      let errorMessage = "Impossible de mettre à jour le rendez-vous";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const errorText = await res.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
      console.error("Erreur updateRendezVous:", res.status, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log("Rendez-vous mis à jour avec succès:", data);
    return data;
  } catch (error) {
    console.error("Erreur dans updateRendezVous:", error);
    throw error;
  }
}

export async function deleteRendezVous(id: number) {
  const res = await fetch(`${API_URL}/rendezvous/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Impossible de supprimer le rendez-vous");
  return true;
}

// services/rendezvous.service.ts

export async function getRendezVousOverviewData(timeFrame?: "monthly" | "yearly") {
  // Récupérer tous les rendez-vous
  const rendezVous = await getRendezVous();

  // Initialiser les mois et le compteur
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const counts = Array(12).fill(0);

  // Parcourir les rendez-vous
  rendezVous.forEach((rdv: { date: string }) => {
    const date = new Date(rdv.date);

    // Si on veut les stats annuelles, on pourrait filtrer par année ici
    // Exemple : if (timeFrame === "yearly" && date.getFullYear() !== 2025) return;

    const monthIndex = date.getMonth(); // 0 = Jan, 11 = Dec
    counts[monthIndex]++;
  });

  // Construire le format ApexCharts
  const chartData = months.map((m, i) => ({ x: m, y: counts[i] }));

  return {
    total: counts.reduce((acc, val) => acc + val, 0),
    chart: chartData,
  };
}
