// dashboardService.ts
export type OverviewData = {
  actes: { value: number };
  medecins: { value: number };
  techniciens: { value: number };
  radiologues: { value: number };
};
// Récupérer l'URL depuis l'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL;
/**
 * Récupère les données de l'overview depuis le backend NestJS
 */
export async function getOverviewData(): Promise<OverviewData> {
  const res = await fetch(`${API_URL}/dashboard/overview`, {
    method: "GET",
    cache: "no-store", // toujours récupérer les dernières données
  });

  if (!res.ok) {
    throw new Error("Impossible de récupérer les données de l'overview");
  }

  return res.json();
}
