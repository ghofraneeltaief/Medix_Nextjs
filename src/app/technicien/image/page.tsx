"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableImagerie } from "@/components/Tables/images/TableImage";
import { useEffect, useState } from "react";
import {
  Imagerie,
  getImageries,
  createImagerie,
  updateImagerie,
  deleteImagerie,
} from "@/services/imageService";
import { Alert } from "@/components/ui-elements/alert";
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";

export default function ImageriesPage() {
  const [imageries, setImageries] = useState<Imagerie[]>([]);
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "warning";
    title: string;
    description: string;
  } | null>(null);
  const [imagerieToDelete, setImagerieToDelete] = useState<Imagerie | null>(
    null,
  );

  // 👉 modal ajout/édition
  const [showModal, setShowModal] = useState(false);
  const [newImagerie, setNewImagerie] = useState<Imagerie>({
    type: "",
    urlImage: "",
    compteRenduId: 0,
    rendezVousId: 0,
  });
  const [editImagerie, setEditImagerie] = useState<Imagerie | null>(null);

  // fetch des imageries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getImageries();
        setImageries(data);
      } catch (err) {
        console.error(err);
        setAlert({
          variant: "error",
          title: "Erreur",
          description: "Impossible de récupérer les imageries",
        });
      }
    };
    fetchData();
  }, []);

  // handleChange unique
  const handleChange = (field: keyof Imagerie, value: string | number) => {
    setNewImagerie((prev) => ({ ...prev, [field]: value }));
  };

  // Ajouter ou éditer
  const handleSaveImagerie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editImagerie && editImagerie.id != null) {
        const updated = await updateImagerie(editImagerie.id, newImagerie);
        setImageries(
          imageries.map((i) => (i.id === editImagerie.id ? updated : i)),
        );
        setAlert({
          variant: "success",
          title: "Modifiée",
          description: `L’imagerie "${newImagerie.type}" a été modifiée avec succès`,
        });
      } else {
        const created = await createImagerie(newImagerie);
        setImageries([...imageries, created]);
        setAlert({
          variant: "success",
          title: "Ajoutée",
          description: `L’imagerie "${newImagerie.type}" a été ajoutée avec succès`,
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder l’imagerie",
      });
    } finally {
      setShowModal(false);
      setEditImagerie(null);
      setNewImagerie({ type: "", urlImage: "", compteRenduId: 0, rendezVousId: 0 });
    }
  };

  const handleEdit = (imagerie: Imagerie) => {
    setEditImagerie(imagerie);
    setNewImagerie(imagerie);
    setShowModal(true);
  };

  // suppression
  const handleDelete = (imagerie: Imagerie) => {
    setImagerieToDelete(imagerie);
    setShowModal(true); // ouvrir modal suppression
  };

  const confirmDelete = async () => {
    if (!imagerieToDelete || imagerieToDelete.id == null) return;
    try {
      await deleteImagerie(imagerieToDelete.id);
      setImageries(imageries.filter((i) => i.id !== imagerieToDelete.id));
      setAlert({
        variant: "success",
        title: "Supprimée",
        description: `L’imagerie "${imagerieToDelete.type}" a été supprimée`,
      });
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: `Impossible de supprimer "${imagerieToDelete.type}"`,
      });
    } finally {
      setImagerieToDelete(null);
      setShowModal(false);
    }
  };

  const cancelDelete = () => {
    setImagerieToDelete(null);
    setShowModal(false);
  };

  // ✅ Auto-hide alert après 10 secondes
  useEffect(() => {
    if (alert && alert.variant !== "warning") {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <>
      <Breadcrumb pageName="Imageries" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-end">
          <Button
            size="small"
            onClick={() => setShowModal(true)}
            label="Ajouter Imagerie"
            variant="outlinePrimary"
            shape="full"
          />
        </div>
        <TableImagerie
          data={imageries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal ajout/édition ou suppression */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow">
            {/* Si suppression */}
            {imagerieToDelete ? (
              <div className="p-6">
                <h3 className="mb-4 text-lg font-medium">Supprimer l’imagerie</h3>
                <p className="mb-4">
                  Voulez-vous vraiment supprimer "{imagerieToDelete.type}" ?
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
                title={editImagerie ? "Modifier Imagerie" : "Ajouter Imagerie"}
                className="!p-6.5"
              >
                <form onSubmit={handleSaveImagerie}>
                  <InputGroup
                    label="Type"
                    type="text"
                    placeholder="Entrer le type d’imagerie"
                    className="mb-4.5"
                    value={newImagerie.type}
                    handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("type", e.target.value)
                    }
                  />

                  <InputGroup
                    label="URL de l’image"
                    type="text"
                    placeholder="Entrer l’URL de l’image"
                    className="mb-4.5"
                    value={newImagerie.urlImage}
                    handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("urlImage", e.target.value)
                    }
                  />

                  <InputGroup
                    label="ID Compte Rendu"
                    type="number"
                    placeholder="Entrer l’ID du compte rendu"
                    className="mb-4.5"
                    value={newImagerie.compteRenduId.toString()}
                    handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("compteRenduId", Number(e.target.value))
                    }
                  />

                  <InputGroup
                    label="ID Rendez-vous"
                    type="number"
                    placeholder="Entrer l’ID du rendez-vous"
                    className="mb-4.5"
                    value={newImagerie.rendezVousId.toString()}
                    handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("rendezVousId", Number(e.target.value))
                    }
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditImagerie(null);
                        setNewImagerie({
                          type: "",
                          urlImage: "",
                          compteRenduId: 0,
                          rendezVousId: 0,
                        });
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                      type="submit"
                    >
                      {editImagerie ? "Enregistrer" : "Ajouter"}
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
