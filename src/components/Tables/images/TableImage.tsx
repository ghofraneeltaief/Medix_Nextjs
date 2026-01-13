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
  onEdit: (img: Imagerie) => void;
  onDelete: (img: Imagerie) => void;
  onAddForRendezVous: (rendezVousId: number) => void;
}

export function TableImagerie({ data, onEdit, onDelete, onAddForRendezVous }: ImagerieTableProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
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
                    onClick={() =>
                      setPreviewImage(`http://localhost:4000${item.imagerie!.urlImage}`)
                    }
                    className="hover:text-primary"
                  >
                    <EyeIcon />
                  </button>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  {item.imagerie ? (
                    <>
                      <button
                        onClick={() => onEdit(item.imagerie!)}
                        className="hover:text-primary"
                        title="Modifier"
                      >
                        <PencilSquareIcon />
                      </button>
                      <button
                        onClick={() => onDelete(item.imagerie!)}
                        className="hover:text-red-500"
                        title="Supprimer"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onAddForRendezVous(item.rendezVousId)}
                      className="hover:text-primary"
                      title="Ajouter une imagerie"
                    >
                      <PlusIcon />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer"
        >
          <div className="relative">
            {/* Bouton fermer X */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white text-xl font-bold z-50"
            >
              &times;
            </button>

            {/* Image */}
            <img
              src={previewImage}
              alt="Aperçu imagerie médicale"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-lg"
              onClick={(e) => e.stopPropagation()} // empêcher fermeture si clic sur l’image
            />
          </div>
        </div>
      )}
    </div>
  );
}
