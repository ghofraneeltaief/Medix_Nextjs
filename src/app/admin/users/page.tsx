"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableUser } from "@/components/Tables/users/TableUser";
import { useEffect, useState } from "react";
import {
  User,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/userService";
import { Alert } from "@/components/ui-elements/alert";
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";

type UserForm = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: "assistante" | "technicien" | "médecin" | "médecin radiologue";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "warning";
    title: string;
    description: string;
  } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState<UserForm>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "assistante",
  });
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Erreur",
          description: "Impossible de récupérer les utilisateurs",
        });
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (field: keyof UserForm, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUser && editUser.id != null) {
        const updated = await updateUser(editUser.id, newUser);
        setUsers(users.map((u) => (u.id === editUser.id ? updated : u)));
        setAlert({
          variant: "success",
          title: "Modifié",
          description: `"${newUser.name}{" "}${newUser.lastName}" a été modifié avec succès`,
        });
      } else {
        const created = await createUser(newUser);
        setUsers([...users, created]);
        setAlert({
          variant: "success",
          title: "Ajouté",
          description: `"${newUser.name}{" "}${newUser.lastName}" a été ajouté avec succès`,
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder l'utilisateur",
      });
    } finally {
      setShowModal(false);
      setEditUser(null);
      setNewUser({
        name: "",
        lastName: "",
        email: "",
        password: "",
        role: "assistante",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setNewUser({
      name: user.name,
      lastName: user.lastName || "",
      email: user.email,
      password: "",
      role: user.role as UserForm["role"],
    });
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete || userToDelete.id == null) return;
    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setAlert({
        variant: "success",
        title: "Supprimé",
        description: `"${userToDelete.name}{" "}${userToDelete.lastName}" a été supprimé`,
      });
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: `Impossible de supprimer "${userToDelete.name}{" "}${userToDelete.lastName}"`,
      });
    } finally {
      setUserToDelete(null);
      setShowModal(false);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
    setShowModal(false);
  };

  // Auto-hide alert après 10 secondes
  useEffect(() => {
    if (alert && alert.variant !== "warning") {
      const timer = setTimeout(() => setAlert(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <>
      <Breadcrumb pageName="Utilisateurs" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-end">
          <Button
            size="small"
            onClick={() => setShowModal(true)}
            label="Ajouter Utilisateur"
            variant="outlinePrimary"
            shape="full"
          />
        </div>
        <TableUser data={users} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow">
            {userToDelete ? (
              <div className="p-6">
                <h3 className="mb-4 text-lg font-medium">Supprimer l'utilisateur</h3>
                <p className="mb-4">
                  Voulez-vous vraiment supprimer "{userToDelete.name}{" "}{userToDelete.lastName}" ?
                </p>
                <div className="flex justify-end gap-3">
                  <button className="rounded bg-gray-200 px-4 py-1" onClick={cancelDelete}>
                    Annuler
                  </button>
                  <button className="rounded bg-red-500 px-4 py-1 text-white" onClick={confirmDelete}>
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <ShowcaseSection title={editUser ? "Modifier Utilisateur" : "Ajouter Utilisateur"} className="!p-6.5">
                <form onSubmit={handleSaveUser}>
                  <InputGroup
                    label="Nom"
                    type="text"
                    placeholder="Entrer le nom"
                    className="mb-4.5"
                    value={newUser.name}
                    handleChange={(e) => handleChange("name", e.target.value)}
                  />
                  <InputGroup
                    label="Prénom"
                    type="text"
                    placeholder="Entrer le prénom"
                    className="mb-4.5"
                    value={newUser.lastName}
                    handleChange={(e) => handleChange("lastName", e.target.value)}
                  />
                  <InputGroup
                    label="Email"
                    type="email"
                    placeholder="Entrer l'email"
                    className="mb-4.5"
                    value={newUser.email}
                    handleChange={(e) => handleChange("email", e.target.value)}
                  />
                  <InputGroup
                    label="Mot de passe"
                    type="password"
                    placeholder="Entrer le mot de passe"
                    className="mb-4.5"
                    value={newUser.password}
                    handleChange={(e) => handleChange("password", e.target.value)}
                  />
                  <div className="mb-4.5">
                    <label className="mb-2 block font-medium">Rôle</label>
                    <select
                      className="w-full rounded border px-3 py-2"
                      value={newUser.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                    >
                      <option value="assistante">Assistante</option>
                      <option value="technicien">Technicien</option>
                      <option value="médecin">Médecin</option>
                      <option value="médecin radiologue">Médecin Radiologue</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditUser(null);
                        setNewUser({
                          name: "",
                          lastName: "",
                          email: "",
                          password: "",
                          role: "assistante",
                        });
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                      type="submit"
                    >
                      {editUser ? "Enregistrer" : "Ajouter"}
                    </button>
                  </div>
                </form>
              </ShowcaseSection>
            )}
          </div>
        </div>
      )}

      {alert && alert.variant !== "warning" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded shadow">
            <Alert variant={alert.variant} title={alert.title} description={alert.description} />
          </div>
        </div>
      )}
    </>
  );
}
