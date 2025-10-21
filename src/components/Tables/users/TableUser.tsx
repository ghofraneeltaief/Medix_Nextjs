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
export function TableUser({ data, onEdit, onDelete }: UserTableProps) {

  return (
    <div >
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
          <TableHead className="min-w-[155px] xl:pl-7.5">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((user, index) => (
            <TableRow key={user.id || index} className="border-[#eee] dark:border-dark-3">
              <TableCell className="min-w-[150px] xl:pl-7.5">
                {user.name} {user.lastName}
              </TableCell>

              <TableCell>{user.email}</TableCell>

              <TableCell>{user.role}</TableCell>

              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button onClick={() => onEdit(user)} className="hover:text-primary">
                    <PencilSquareIcon />
                  </button>

                  <button onClick={() => onDelete(user)} className="hover:text-primary">
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
