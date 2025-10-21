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
import { Imagerie } from "@/services/imageService";

interface Props {
  data: Imagerie[];
  onEdit: (img: Imagerie) => void;
  onDelete: (img: Imagerie) => void;
}

export function TableImagerie({ data, onEdit, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#F7F9FC] dark:bg-dark-2">
          <TableHead>Type</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Aperçu</TableHead>
          <TableHead>Compte Rendu</TableHead>
          <TableHead>Rendez-vous</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((img) => (
          <TableRow key={img.id}>
            <TableCell>{img.type}</TableCell>
            <TableCell className="truncate max-w-[200px]">{img.urlImage}</TableCell>
            <TableCell>
              <img src={img.urlImage} alt={img.type} className="h-12 w-12 rounded object-cover" />
            </TableCell>
            <TableCell>{img.compteRenduId}</TableCell>
            <TableCell>{img.rendezVousId}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(img)} className="hover:text-primary">
                  <PencilSquareIcon />
                </button>
                <button onClick={() => onDelete(img)} className="hover:text-red-500">
                  <TrashIcon />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
