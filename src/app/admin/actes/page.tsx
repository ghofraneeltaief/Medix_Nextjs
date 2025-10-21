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
import { Alert } from "@/components/ui-elements/alert";
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";

export default function ActesPage() {
  const [actes, setActes] = useState<Acte[]>([]);
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "warning";
    title: string;
    description: string;
  } | null>(null);
  const [acteToDelete, setActeToDelete] = useState<Acte | null>(null);

  // 👉 modal ajout/édition
  const [showModal, setShowModal] = useState(false);
  const [newActe, setNewActe] = useState<Acte>({ Nom_Acte: "", Prix: 0 });
  const [editActe, setEditActe] = useState<Acte | null>(null);

  // fetch des actes
  useEffect(() => {
    const fetchActes = async () => {
      try {
        const data = await getActes();
        setActes(data);
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Erreur",
          description: "Impossible de récupérer les actes",
        });
      }
    };
    fetchActes();
  }, []);

  // handleChange unique
  const handleChange = (field: keyof Acte, value: string | number) => {
    setNewActe((prev) => ({ ...prev, [field]: value }));
  };

  // Ajouter ou éditer
  const handleSaveActe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editActe && editActe.Id_Acte != null) {
        const updated = await updateActe(
          Number(editActe.Id_Acte),
          newActe.Nom_Acte,
          Number(newActe.Prix),
        );
        setActes(
          actes.map((a) => (a.Id_Acte === editActe.Id_Acte ? updated : a)),
        );
        setAlert({
          variant: "success",
          title: "Modifié",
          description: `"${newActe.Nom_Acte}" a été modifié avec succès`,
        });
      } else {
        const created = await createActe(
          newActe.Nom_Acte,
          Number(newActe.Prix),
        );
        setActes([...actes, created]);
        setAlert({
          variant: "success",
          title: "Ajouté",
          description: `"${newActe.Nom_Acte}" a été ajouté avec succès`,
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder l'acte",
      });
    } finally {
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
  const handleDelete = (acte: Acte) => {
    setActeToDelete(acte);
    setShowModal(true); // ouvrir modal suppression
  };

  const confirmDelete = async () => {
    if (!acteToDelete || acteToDelete.Id_Acte == null) return;
    try {
      await deleteActe(Number(acteToDelete.Id_Acte));
      setActes(actes.filter((a) => a.Id_Acte !== acteToDelete.Id_Acte));
      setAlert({
        variant: "success",
        title: "Supprimé",
        description: `"${acteToDelete.Nom_Acte}" a été supprimé`,
      });
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: `Impossible de supprimer "${acteToDelete.Nom_Acte}"`,
      });
    } finally {
      setActeToDelete(null);
      setShowModal(false);
    }
  };

  const cancelDelete = () => {
    setActeToDelete(null);
    setShowModal(false);
  };
  // ✅ Auto-hide alert après 10 secondes
  useEffect(() => {
    if (alert && alert.variant !== "warning") {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 1000); // 10000 ms = 10 secondes
      return () => clearTimeout(timer); // nettoyer le timer si alert change avant la fin
    }
  }, [alert]);
  return (
    <>
      <Breadcrumb pageName="Actes" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-end">
          <Button
            size="small"
            onClick={() => setShowModal(true)}
            label="Ajouter Acte"
            variant="outlinePrimary"
            shape="full"
          />
        </div>
        <TableActe data={actes} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      {/* Modal ajout/édition ou suppression */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow">
            {/* Si suppression */}
            {acteToDelete ? (
              <div className="p-6">
                <h3 className="mb-4 text-lg font-medium">Supprimer l'acte</h3>
                <p className="mb-4">
                  Voulez-vous vraiment supprimer "{acteToDelete.Nom_Acte}" ?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="rounded bg-gray-200 px-4 py-1"
                    onClick={cancelDelete}
                  >
                    Annuler
                  </button>
                  <button
                    className="rounded bg-red-500 px-4 py-1 text-white"
                    onClick={confirmDelete}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              /* Formulaire ajout/édition */
              <ShowcaseSection
                title={editActe ? "Modifier Acte" : "Ajouter Acte"}
                className="!p-6.5"
              >
                <form onSubmit={handleSaveActe}>
                  <InputGroup
                    label="Nom Acte"
                    type="text"
                    placeholder="Entrer le nom de l'acte"
                    className="mb-4.5"
                    value={newActe.Nom_Acte}
                    handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("Nom_Acte", e.target.value)
                    }
                  />

                  <InputGroup
                    label="Prix"
                    type="number"
                    placeholder="Entrer le prix"
                    className="mb-4.5"
                    value={newActe.Prix.toString()}
                    handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("Prix", Number(e.target.value))
                    }
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
                    >
                      Annuler
                    </button>
                    <button
                      className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                      type="submit"
                    >
                      {editActe ? "Enregistrer" : "Ajouter"}
                    </button>
                  </div>
                </form>
              </ShowcaseSection>
            )}
          </div>
        </div>
      )}

      {/* Modal alert global success / error */}
      {alert && alert.variant !== "warning" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded shadow">
            <Alert
              variant={alert.variant}
              title={alert.title}
              description={alert.description}
            />
          </div>
        </div>
      )}
    </>
  );
}
