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
import { User } from "@/services/userService";

interface UserTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

// Fonction pour formater le rôle
const formatRole = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    "assistante": "Assistante",
    "technicien": "Technicien",
    "médecin": "Médecin",
    "médecin radiologue": "Médecin Radiologue",
  };
  return roleMap[role] || role;
};

export function TableUser({ data, onEdit, onDelete }: UserTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[155px] xl:pl-7.5">Nom complet</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((user, index) => (
            <TableRow 
              key={user.id || index} 
              className="border-[#eee] dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
            >
              <TableCell className="min-w-[150px] xl:pl-7.5 font-medium">
                {user.name} {user.lastName}
              </TableCell>

              <TableCell className="text-gray-600 dark:text-gray-400">
                {user.email}
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                  {formatRole(user.role || "")}
                </span>
              </TableCell>

              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button 
                    onClick={() => onEdit(user)} 
                    className="hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <PencilSquareIcon />
                  </button>

                  <button 
                    onClick={() => onDelete(user)} 
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
