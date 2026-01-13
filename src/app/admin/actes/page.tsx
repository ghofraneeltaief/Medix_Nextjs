"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableActe } from "@/components/Tables/actes/TableActe";
import { useEffect, useState } from "react";
import {
  Acte,
  getActes,
  createActe,
  updateActe,
  deleteActe,
} from "@/services/acteService";
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import Swal from "sweetalert2";

export default function ActesPage() {
  const [actes, setActes] = useState<Acte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 👉 modal ajout/édition
  const [showModal, setShowModal] = useState(false);
  const [newActe, setNewActe] = useState<Acte>({ Nom_Acte: "", Prix: 0 });
  const [editActe, setEditActe] = useState<Acte | null>(null);

  // Charger les actes depuis la base de données
  const loadActes = async () => {
    setIsLoading(true);
    try {
      console.log("Chargement des actes depuis la base de données...");
      const data = await getActes();
      setActes(data);
      console.log(`${data.length} acte(s) chargé(s) depuis la base de données`);
    } catch (err: any) {
      console.error("Erreur lors du chargement des actes:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de récupérer les actes depuis la base de données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // fetch des actes
  useEffect(() => {
    loadActes();
  }, []);

  // handleChange unique
  const handleChange = (field: keyof Acte, value: string | number) => {
    setNewActe((prev) => ({ ...prev, [field]: value }));
  };

  // Ajouter ou éditer
  const handleSaveActe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newActe.Nom_Acte.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Veuillez entrer le nom de l'acte",
      });
      return;
    }

    if (newActe.Prix < 0 || isNaN(Number(newActe.Prix))) {
      Swal.fire({
        icon: "warning",
        title: "Prix invalide",
        text: "Veuillez entrer un prix valide (nombre positif)",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editActe && editActe.Id_Acte != null) {
        console.log("Mise à jour de l'acte dans la base de données...");
        const updated = await updateActe(
          Number(editActe.Id_Acte),
          newActe.Nom_Acte.trim(),
          Number(newActe.Prix),
        );
        await loadActes(); // Recharger depuis la base de données
        console.log("Acte mis à jour avec succès");
        
        Swal.fire({
          icon: "success",
          title: "Modifié",
          text: `"${newActe.Nom_Acte}" a été modifié avec succès`,
        });
      } else {
        console.log("Création d'un nouvel acte dans la base de données...");
        const created = await createActe(
          newActe.Nom_Acte.trim(),
          Number(newActe.Prix),
        );
        await loadActes(); // Recharger depuis la base de données
        console.log("Acte créé avec succès");
        
        Swal.fire({
          icon: "success",
          title: "Ajouté",
          text: `"${newActe.Nom_Acte}" a été ajouté avec succès`,
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de sauvegarder l'acte",
      });
    } finally {
      setIsSaving(false);
      setShowModal(false);
      setEditActe(null);
      setNewActe({ Nom_Acte: "", Prix: 0 });
    }
  };

  const handleEdit = (acte: Acte) => {
    setEditActe(acte);
    setNewActe({ Nom_Acte: acte.Nom_Acte, Prix: Number(acte.Prix) });
    setShowModal(true);
  };

  // suppression
  const handleDelete = async (acte: Acte) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment supprimer "${acte.Nom_Acte}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed && acte.Id_Acte != null) {
      try {
        console.log("Suppression de l'acte de la base de données...");
        await deleteActe(Number(acte.Id_Acte));
        await loadActes(); // Recharger depuis la base de données
        console.log("Acte supprimé avec succès");
        
        Swal.fire({
          icon: "success",
          title: "Supprimé",
          text: `"${acte.Nom_Acte}" a été supprimé avec succès`,
        });
      } catch (err: any) {
        console.error("Erreur lors de la suppression:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err?.message || `Impossible de supprimer "${acte.Nom_Acte}"`,
        });
      }
    }
  };
  return (
    <>
      <Breadcrumb pageName="Gestion des Actes" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Liste des Actes ({actes.length})
            </h2>
          </div>
          <Button
            size="small"
            onClick={() => setShowModal(true)}
            label="+ Ajouter Acte"
            variant="outlinePrimary"
            shape="full"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Chargement des actes depuis la base de données...
              </p>
            </div>
          </div>
        ) : actes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Aucun acte trouvé dans la base de données.
            </p>
            <button
              onClick={loadActes}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              Actualiser
            </button>
          </div>
        ) : (
          <TableActe data={actes} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* Modal ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow dark:bg-gray-dark">
            <ShowcaseSection
              title={editActe ? "Modifier Acte" : "Ajouter Acte"}
              className="!p-6.5"
            >
              <form onSubmit={handleSaveActe}>
                <InputGroup
                  label="Nom de l'acte"
                  type="text"
                  placeholder="Entrer le nom de l'acte"
                  className="mb-4.5"
                  value={newActe.Nom_Acte}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("Nom_Acte", e.target.value)
                  }
                  required
                />

                <InputGroup
                  label="Prix (TND)"
                  type="number"
                  placeholder="Entrer le prix"
                  className="mb-4.5"
                  value={newActe.Prix.toString()}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("Prix", Number(e.target.value) || 0)
                  }
                  required
                  min="0"
                  step="0.01"
                />

                <div className="flex justify-end gap-3">
                  <button
                    className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditActe(null);
                      setNewActe({ Nom_Acte: "", Prix: 0 });
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
                    {isSaving ? "Enregistrement..." : editActe ? "Enregistrer" : "Ajouter"}
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
