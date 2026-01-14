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
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import Swal from "sweetalert2";

type UserForm = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: "assistante" | "technicien" | "médecin" | "médecin radiologue";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  
  // Masquer le header quand le modal est ouvert
  useEffect(() => {
    if (showModal) {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
    } else {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    }
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, [showModal]);
  
  const [newUser, setNewUser] = useState<UserForm>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "assistante",
  });
  const [editUser, setEditUser] = useState<User | null>(null);

  // Charger les utilisateurs depuis la base de données
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log("Chargement des utilisateurs depuis la base de données...");
      const data = await getUsers();
      setUsers(data);
      console.log(`${data.length} utilisateur(s) chargé(s) depuis la base de données`);
    } catch (err: any) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de récupérer les utilisateurs depuis la base de données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (field: keyof UserForm, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newUser.name.trim() || !newUser.lastName.trim() || !newUser.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Champs requis",
        text: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    if (!editUser && !newUser.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Mot de passe requis",
        text: "Veuillez entrer un mot de passe pour le nouvel utilisateur",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Vous devez être connecté",
        });
        return;
      }

      if (editUser && editUser.id != null) {
        // Pour la modification, ne pas envoyer le mot de passe s'il est vide
        const updateData: any = {
          name: newUser.name,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        };
        
        if (newUser.password.trim()) {
          updateData.password = newUser.password;
        }

        console.log("Mise à jour de l'utilisateur dans la base de données...");
        const updated = await updateUser(token, editUser.id.toString(), updateData);
        await loadUsers(); // Recharger depuis la base de données
        console.log("Utilisateur mis à jour avec succès");
        
        Swal.fire({
          icon: "success",
          title: "Modifié",
          text: `${newUser.name} ${newUser.lastName} a été modifié avec succès`,
        });
      } else {
        console.log("Création d'un nouvel utilisateur dans la base de données...");
        const created = await createUser(newUser);
        await loadUsers(); // Recharger depuis la base de données
        console.log("Utilisateur créé avec succès");
        
        Swal.fire({
          icon: "success",
          title: "Ajouté",
          text: `${newUser.name} ${newUser.lastName} a été ajouté avec succès`,
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de sauvegarder l'utilisateur",
      });
    } finally {
      setIsSaving(false);
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

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment supprimer "${user.name} ${user.lastName}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed && user.id != null) {
      try {
        console.log("Suppression de l'utilisateur de la base de données...");
        await deleteUser(user.id);
        await loadUsers(); // Recharger depuis la base de données
        console.log("Utilisateur supprimé avec succès");
        
        Swal.fire({
          icon: "success",
          title: "Supprimé",
          text: `${user.name} ${user.lastName} a été supprimé avec succès`,
        });
      } catch (err: any) {
        console.error("Erreur lors de la suppression:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err?.message || `Impossible de supprimer "${user.name} ${user.lastName}"`,
        });
      }
    }
  };

  return (
    <>
      <Breadcrumb pageName="Gestion des Utilisateurs" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Liste des Utilisateurs ({users.length})
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={() => setShowModal(true)}
              label="+ Ajouter Utilisateur"
              variant="outlinePrimary"
              shape="full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Chargement des utilisateurs depuis la base de données...
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Aucun utilisateur trouvé dans la base de données.
            </p>
            <button
              onClick={loadUsers}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              Actualiser
            </button>
          </div>
        ) : (
          <TableUser data={users} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow dark:bg-gray-dark">
            <ShowcaseSection 
              title={editUser ? "Modifier Utilisateur" : "Ajouter Utilisateur"} 
              className="!p-6.5"
            >
              <form onSubmit={handleSaveUser}>
                <InputGroup
                  label="Prénom"
                  type="text"
                  placeholder="Entrer le prénom"
                  className="mb-4.5"
                  value={newUser.name}
                  handleChange={(e) => handleChange("name", e.target.value)}
                  required
                />
                <InputGroup
                  label="Nom"
                  type="text"
                  placeholder="Entrer le nom"
                  className="mb-4.5"
                  value={newUser.lastName}
                  handleChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
                <InputGroup
                  label="Email"
                  type="email"
                  placeholder="Entrer l'email"
                  className="mb-4.5"
                  value={newUser.email}
                  handleChange={(e) => handleChange("email", e.target.value)}
                  required
                />
                <InputGroup
                  label={editUser ? "Nouveau mot de passe (laisser vide pour ne pas modifier)" : "Mot de passe"}
                  type="password"
                  placeholder={editUser ? "Laisser vide pour ne pas modifier" : "Entrer le mot de passe"}
                  className="mb-4.5"
                  value={newUser.password}
                  handleChange={(e) => handleChange("password", e.target.value)}
                  required={!editUser}
                />
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Rôle
                  </label>
                  <select
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    value={newUser.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    required
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
                    disabled={isSaving}
                  >
                    Annuler
                  </button>
                  <button
                    className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-50"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? "Enregistrement..." : editUser ? "Enregistrer" : "Ajouter"}
                  </button>
                </div>
              </form>
            </ShowcaseSection>
          </div>
        </div>
      )}
    </>
  );
}
