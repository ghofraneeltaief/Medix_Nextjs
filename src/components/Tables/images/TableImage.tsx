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

interface ImagerieTableProps {
  data: Imagerie[];
  onEdit: (img: Imagerie) => void;
  onDelete: (img: Imagerie) => void;
}

export function TableImagerie({ data, onEdit, onDelete }: ImagerieTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[155px] xl:pl-7.5">Type</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Aperçu</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((img, index) => (
            <TableRow key={img.id || index} className="border-[#eee] dark:border-dark-3">
              <TableCell className="min-w-[150px] xl:pl-7.5">{img.type}</TableCell>

              <TableCell className="truncate max-w-[200px]">{img.urlImage}</TableCell>

              <TableCell>
                <img
                  src={img.urlImage}
                  alt={img.type}
                  className="h-12 w-12 rounded object-cover"
                />
              </TableCell>

              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
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
    </div>
  );
}
