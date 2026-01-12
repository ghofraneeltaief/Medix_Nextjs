"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableImagerie } from "@/components/Tables/images/TableImage";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Imagerie, getImageries, deleteImagerie } from "@/services/imageService";
import { Button } from "@/components/ui-elements/button";

export default function ImageriesPage() {
  const [imageries, setImageries] = useState<Imagerie[]>([]);

  // Fetch imageries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getImageries();
        setImageries(data);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de récupérer les imageries",
        });
      }
    };
    fetchData();
  }, []);

  // Edit temporaire
  const handleEdit = async (img: Imagerie) => {
  const { value: formValues } = await Swal.fire({
    title: "Modifier l’imagerie",
    html: `
      <input id="swal-type" class="swal2-input" placeholder="Type" value="${img.type}">
      <input id="swal-url" class="swal2-input" placeholder="URL de l'image" value="${img.urlImage}">
      <img id="swal-preview" src="${img.urlImage}" alt="Aperçu" style="margin-top:10px; max-height:100px; border-radius:5px; display:block;" />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Modifier",
    cancelButtonText: "Annuler",
    didOpen: () => {
      const urlInput = document.getElementById("swal-url") as HTMLInputElement;
      const previewImg = document.getElementById("swal-preview") as HTMLImageElement;
      urlInput.addEventListener("input", () => {
        previewImg.src = urlInput.value;
      });
    },
    preConfirm: () => {
      const type = (document.getElementById("swal-type") as HTMLInputElement).value;
      const urlImage = (document.getElementById("swal-url") as HTMLInputElement).value;
      if (!type || !urlImage) {
        Swal.showValidationMessage("Tous les champs sont requis");
        return null;
      }
      return { type, urlImage };
    },
  });

  if (formValues) {
    try {
      // 🔹 Appel API pour modifier l’imagerie
      // await updateImagerie(img.id!, formValues);

      // 🔹 Mise à jour locale
      setImageries((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, ...formValues } : i))
      );

      Swal.fire({
        icon: "success",
        title: "Modifié",
        text: "L’imagerie a été modifiée",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de modifier l’imagerie",
      });
    }
  }
};


  // Delete
  const handleDelete = async (img: Imagerie) => {
    const result = await Swal.fire({
      title: `Supprimer "${img.type}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteImagerie(img.id!);
      setImageries((prev) => prev.filter((i) => i.id !== img.id));

      Swal.fire({
        icon: "success",
        title: "Supprimé",
        text: "L’imagerie a été supprimée",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de supprimer l’imagerie",
      });
    }
  };

  // Ajouter une imagerie
  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Ajouter une imagerie",
      html:
        '<input id="swal-type" class="swal2-input" placeholder="Type">' +
        '<input id="swal-url" class="swal2-input" placeholder="URL">',
      focusConfirm: false,
      preConfirm: () => {
        const type = (document.getElementById("swal-type") as HTMLInputElement).value;
        const urlImage = (document.getElementById("swal-url") as HTMLInputElement).value;
        if (!type || !urlImage) {
          Swal.showValidationMessage("Tous les champs sont requis");
          return null;
        }
        return { type, urlImage };
      },
    });

    if (formValues) {
      try {
        // const newImg = await createImagerie(formValues); // activer si API
        const newImg = { id: Date.now(), ...formValues, compteRenduId: 1, rendezVousId: 1 };
        setImageries((prev) => [...prev, newImg]);

        Swal.fire({
          icon: "success",
          title: "Ajouté",
          text: "L’imagerie a été ajoutée",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible d’ajouter l’imagerie",
        });
      }
    }
  };

  return (
    <>
      <Breadcrumb pageName="Imageries Médicales" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-end">
          <Button
            size="small"
            onClick={handleAdd}
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
    </>
  );
}
