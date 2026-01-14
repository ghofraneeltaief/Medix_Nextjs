/**
 * Utilitaires pour la gestion des comptes rendus
 */

import { Imagerie } from "@/services/imageService";
import { CompteRendu } from "@/services/compteRenduService";

export interface RendezVousAvecImagerie {
  rendezVousId: number;
  rendezVous: {
    id: number;
    nom_patient: string;
    date: string;
    heure: string;
    acte?: {
      Id_Acte: number;
      Nom_Acte: string;
    };
  };
  imagerie: Imagerie | null;
  compteRendu: CompteRendu | null;
}

/**
 * Crée une map des imageries indexée par rendez-vous ID
 */
export function createImageriesMap(imageries: Imagerie[]): Map<number, Imagerie> {
  const map = new Map<number, Imagerie>();
  imageries.forEach((img) => {
    const rvId = img.rendezVousId || img.rendezVous?.id;
    if (rvId) {
      map.set(rvId, img);
    }
  });
  return map;
}

/**
 * Crée une map des comptes rendus indexée par rendez-vous ID
 */
export function createComptesRendusMap(comptesRendus: CompteRendu[]): Map<number, CompteRendu> {
  const map = new Map<number, CompteRendu>();
  comptesRendus.forEach((cr) => {
    const rvId = cr.id_rv || cr.rendezVous?.id;
    if (rvId) {
      map.set(rvId, cr);
    }
  });
  return map;
}

/**
 * Combine les données de rendez-vous, imageries et comptes rendus
 */
export function combineRendezVousData(
  rendezVousData: any[],
  imageriesMap: Map<number, Imagerie>,
  comptesRendusMap: Map<number, CompteRendu>
): RendezVousAvecImagerie[] {
  return rendezVousData
    .filter((rv) => imageriesMap.has(rv.id))
    .map((rv) => ({
      rendezVousId: rv.id,
      rendezVous: {
        id: rv.id,
        nom_patient: rv.nom_patient,
        date: rv.date,
        heure: rv.heure,
        acte: rv.acte
          ? { Id_Acte: rv.acte.Id_Acte, Nom_Acte: rv.acte.Nom_Acte }
          : undefined,
      },
      imagerie: imageriesMap.get(rv.id) || null,
      compteRendu: comptesRendusMap.get(rv.id) || null,
    }));
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: string, includeTime = false): string {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (includeTime) {
    return dateObj.toLocaleDateString("fr-FR", options);
  }
  return dateObj.toLocaleDateString("fr-FR");
}

/**
 * Formate une date avec heure pour l'affichage
 */
export function formatDateTime(date: string, heure: string): string {
  const formattedDate = formatDate(date, true);
  return `${formattedDate} à ${heure}`;
}

/**
 * Génère une référence de document à partir d'un ID
 */
export function generateDocumentReference(id: number): string {
  return `CR-${id.toString().padStart(6, "0")}`;
}
