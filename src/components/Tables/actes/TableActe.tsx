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
import { Acte } from "@/services/acteService";

interface ActeTableProps {
  data: Acte[];
  onEdit: (acte: Acte) => void;
  onDelete: (acte: Acte) => void;
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

export function TableActe({ data, onEdit, onDelete }: ActeTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[155px] xl:pl-7.5">Nom de l'acte</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((acte, index) => (
            <TableRow 
              key={acte.Id_Acte || index} 
              className="border-[#eee] dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
            >
              <TableCell className="min-w-[150px] xl:pl-7.5 font-medium">
                {acte.Nom_Acte}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  {formatPrice(Number(acte.Prix))}
                </span>
              </TableCell>
              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button 
                    onClick={() => onEdit(acte)} 
                    className="hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <PencilSquareIcon />
                  </button>

                  <button 
                    onClick={() => onDelete(acte)} 
                    className="hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
