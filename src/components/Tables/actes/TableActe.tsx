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

export function TableActe({ data, onEdit, onDelete }: ActeTableProps) {
  return (
    <div >
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[155px] xl:pl-7.5">Nom Acte</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((acte, index) => (
            <TableRow key={acte.Id_Acte || index} className="border-[#eee] dark:border-dark-3">
              <TableCell className="min-w-[150px] xl:pl-7.5">{acte.Nom_Acte}</TableCell>
              <TableCell>{acte.Prix}</TableCell>
              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button onClick={() => onEdit(acte)} className="hover:text-primary">
                    <PencilSquareIcon />
                  </button>

                  <button onClick={() => onDelete(acte)} className="hover:text-primary">
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
