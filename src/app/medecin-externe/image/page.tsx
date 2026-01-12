"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableImage } from "@/components/Tables/images/TableImage"; // on peut créer TableImageries
import { useEffect, useState } from "react";
import { Imagerie, getImageries, deleteImagerie } from "@/services/imageService";
import { Alert } from "@/components/ui-elements/alert";
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function ImageriesPage() {
  const [imageries, setImageries] = useState<Imagerie[]>([]);
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "warning";
    title: string;
    description: string;
  } | null>(null);
  const [imagerieToDelete, setImagerieToDelete] = useState<Imagerie | null>(null);

  const [showModal, setShowModal] = useState(false);

  // Fetch imageries
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

  // Supprimer
  const handleDelete = (img: Imagerie) => {
    setImagerieToDelete(img);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!imagerieToDelete || !imagerieToDelete.id) return;
    try {
      await deleteImagerie(imagerieToDelete.id);
      setImageries(imageries.filter((i) => i.id !== imagerieToDelete.id));
      setAlert({
        variant: "success",
        title: "Supprimé",
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

  return (
    <>
      <Breadcrumb pageName="Imageries Médicales" />

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
        <TableImage data={users} onEdit={handleEdit} onDelete={handleDelete}/>
      </div>
    </>
  );
}
