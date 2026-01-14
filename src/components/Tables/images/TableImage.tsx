"use client";

import { useState } from "react";
import { TrashIcon, PencilSquareIcon, EyeIcon, PlusIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Imagerie } from "@/services/imageService";
import { MedicalImageViewer } from "@/components/MedicalImageViewer/MedicalImageViewer";

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

interface ImagerieTableProps {
  data: RendezVousAvecImagerie[];
  onEdit?: (img: Imagerie) => void;
  onDelete?: (img: Imagerie) => void;
  onAddForRendezVous?: (rendezVousId: number) => void;
  readOnly?: boolean;
  onView?: (img: Imagerie, rendezVous: RendezVousAvecImagerie["rendezVous"]) => void;
}

export function TableImagerie({ 
  data, 
  onEdit, 
  onDelete, 
  onAddForRendezVous,
  readOnly = false,
  onView
}: ImagerieTableProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    url: string;
    patientName?: string;
    date?: string;
    acte?: string;
  } | null>(null);

  return (
    <div>
      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="xl:pl-7.5">Patient</TableHead>
            <TableHead>Date RDV</TableHead>
            <TableHead>Acte</TableHead>
            <TableHead>Aperçu</TableHead>
            {!readOnly && <TableHead className="text-right xl:pr-7.5">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.rendezVousId || index}
              className="border-[#eee] dark:border-dark-3"
            >
              {/* Patient */}
              <TableCell>{item.rendezVous?.nom_patient || "-"}</TableCell>

              {/* Date */}
              <TableCell>
                {item.rendezVous?.date
                  ? new Date(item.rendezVous.date).toLocaleDateString("fr-FR")
                  : "-"}
              </TableCell>

              {/* Acte */}
              <TableCell>{item.rendezVous?.acte?.Nom_Acte || "-"}</TableCell>

              {/* Aperçu */}
              <TableCell>
                {item.imagerie?.urlImage ? (
                  <button
                    onClick={() => {
                      if (onView && item.imagerie) {
                        onView(item.imagerie, item.rendezVous);
                      } else {
                      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${item.imagerie!.urlImage}`;
                      setPreviewData({
                        url: imageUrl,
                        patientName: item.rendezVous?.nom_patient,
                        date: item.rendezVous?.date,
                        acte: item.rendezVous?.acte?.Nom_Acte,
                      });
                      }
                    }}
                    className="hover:text-primary"
                    title="Visualiser l'image"
                  >
                    <EyeIcon />
                  </button>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>

              {/* Actions */}
              {!readOnly && (
              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  {item.imagerie ? (
                    <>
                        {onEdit && (
                      <button
                        onClick={() => onEdit(item.imagerie!)}
                        className="hover:text-primary"
                        title="Modifier"
                      >
                        <PencilSquareIcon />
                      </button>
                        )}
                        {onDelete && (
                      <button
                        onClick={() => onDelete(item.imagerie!)}
                        className="hover:text-red-500"
                        title="Supprimer"
                      >
                        <TrashIcon />
                      </button>
                        )}
                    </>
                  ) : (
                      onAddForRendezVous && (
                    <button
                      onClick={() => onAddForRendezVous(item.rendezVousId)}
                      className="hover:text-primary"
                      title="Ajouter une imagerie"
                    >
                      <PlusIcon />
                    </button>
                      )
                  )}
                </div>
              </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </div>
  );
}
