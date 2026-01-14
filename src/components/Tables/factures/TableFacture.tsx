"use client";

import { TrashIcon, PencilSquareIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Facture } from "@/services/factureService";

interface FactureTableProps {
  data: Facture[];
  onEdit?: (facture: Facture) => void;
  onDelete?: (facture: Facture) => void;
}

// Fonction pour formater le prix
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Fonction pour formater le statut
const formatStatut = (statut: string): { text: string; className: string } => {
  if (statut === "payee") {
    return {
      text: "Payée",
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    };
  }
  return {
    text: "Non payée",
    className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  };
};

export function TableFacture({ data, onEdit, onDelete }: FactureTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[155px] xl:pl-7.5">Patient</TableHead>
            <TableHead>Date facture</TableHead>
            <TableHead>Acte</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            {(onEdit || onDelete) && (
              <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onEdit || onDelete ? 6 : 5} className="text-center py-8 text-gray-500">
                Aucune facture trouvée
              </TableCell>
            </TableRow>
          ) : (
            data.map((facture, index) => {
              const statutInfo = formatStatut(facture.statut);
              return (
                <TableRow
                  key={facture.id || index}
                  className="border-[#eee] dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                >
                  <TableCell className="min-w-[150px] xl:pl-7.5 font-medium">
                    {facture.nom_patient}
                  </TableCell>
                  <TableCell>
                    {facture.date_facture
                      ? new Date(facture.date_facture).toLocaleDateString("fr-FR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {facture.acte?.Nom_Acte || "Acte inconnu"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                      {formatPrice(Number(facture.montant))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statutInfo.className}`}>
                      {statutInfo.text}
                    </span>
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="xl:pr-7.5">
                      <div className="flex items-center justify-end gap-x-3.5">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(facture)}
                            className="hover:text-primary transition-colors"
                            title="Modifier"
                          >
                            <PencilSquareIcon />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(facture)}
                            className="hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
