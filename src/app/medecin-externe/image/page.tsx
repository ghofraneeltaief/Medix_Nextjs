"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableImagerie } from "@/components/Tables/images/TableImage";
import { useEffect, useState } from "react";
import {
  Imagerie,
  getImageries,
} from "@/services/imageService";
import { getRendezVous } from "@/services/rendezvous.service";
import { MedicalImageViewer } from "@/components/MedicalImageViewer/MedicalImageViewer";
import Swal from "sweetalert2";

// Structure pour un rendez-vous avec imagerie optionnelle
export interface RendezVousAvecImagerie {
  rendezVousId: number;
  rendezVous: {
    nom_patient: string;
    date: string;
    heure: string;
    acte?: {
      Nom_Acte: string;
    };
  };
  imagerie: Imagerie | null;
}

export default function ImageriesPage() {
  const [rendezVousAvecImageries, setRendezVousAvecImageries] = useState<RendezVousAvecImagerie[]>([]);
  const [previewData, setPreviewData] = useState<{
    url: string;
    patientName?: string;
    date?: string;
    acte?: string;
  } | null>(null);

  // Fetch des rendez-vous et imageries
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les rendez-vous et toutes les imageries
        const [rendezVousData, imageriesData] = await Promise.all([
          getRendezVous(),
          getImageries(),
        ]);

        // Créer un map des imageries par rendezVousId
        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });

        // Combiner rendez-vous avec leurs imageries (ou null si pas d'imagerie)
        // Filtrer pour ne garder que les rendez-vous avec images
        const combined: RendezVousAvecImagerie[] = rendezVousData
          .filter((rv: any) => imageriesMap.has(rv.id))
          .map((rv: any) => ({
            rendezVousId: rv.id,
            rendezVous: {
              nom_patient: rv.nom_patient,
              date: rv.date,
              heure: rv.heure,
              acte: rv.acte ? { Nom_Acte: rv.acte.Nom_Acte } : undefined,
            },
            imagerie: imageriesMap.get(rv.id) || null,
          }));

        setRendezVousAvecImageries(combined);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de récupérer les données",
        });
      }
    };
    fetchData();
  }, []);

  // Fonction pour visualiser l'image (consultation seule)
  const handleView = (imagerie: Imagerie, rendezVous: RendezVousAvecImagerie["rendezVous"]) => {
    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${imagerie.urlImage}`;
    setPreviewData({
      url: imageUrl,
      patientName: rendezVous.nom_patient,
      date: rendezVous.date,
      acte: rendezVous.acte?.Nom_Acte,
      });
  };

  // Fonctions vides pour les actions non autorisées (consultation seule)
  const handleEdit = () => {
    // Non autorisé pour le médecin externe
  };

  const handleDelete = () => {
    // Non autorisé pour le médecin externe
  };

  const handleAddForRendezVous = () => {
    // Non autorisé pour le médecin externe
  };

  return (
    <>
      <Breadcrumb pageName="Consultation des Images Médicales" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Consultez les images médicales des patients. Mode consultation uniquement.
          </p>
        </div>

        {rendezVousAvecImageries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Aucune image médicale disponible pour consultation.
            </p>
          </div>
        ) : (
        <TableImagerie
            data={rendezVousAvecImageries}
          onEdit={handleEdit}
          onDelete={handleDelete}
            onAddForRendezVous={handleAddForRendezVous}
            readOnly={true}
            onView={handleView}
        />
        )}
      </div>

      {/* Visualiseur d'images médicales */}
      {previewData && (
        <MedicalImageViewer
          imageUrl={previewData.url}
          patientName={previewData.patientName}
          date={previewData.date}
          acte={previewData.acte}
          onClose={() => setPreviewData(null)}
        />
      )}
    </>
  );
}
