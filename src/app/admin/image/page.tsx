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
  uploadAndSaveImagerie,
} from "@/services/imageService";
import { getRendezVous } from "@/services/rendezvous.service";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import { UploadIcon } from "@/assets/icons";
import Swal from "sweetalert2";

// Structure pour un rendez-vous avec imagerie optionnelle
export interface RendezVousAvecImagerie {
  rendezVousId: number;
  rendezVous: {
    nom_patient: string;
    date: string;
    heure: string;
    acte?: {
      Nom_Acte: string;
    };
  };
  imagerie: Imagerie | null;
}

export default function ImageriesPage() {
  const [rendezVousAvecImageries, setRendezVousAvecImageries] = useState<RendezVousAvecImagerie[]>([]);

  // 👉 modal ajout/édition
  const [showModal, setShowModal] = useState(false);
  const [newImagerie, setNewImagerie] = useState<Imagerie>({
    type: "",
    urlImage: "",
    compteRenduId: 0,
    rendezVousId: 0,
  });
  const [editImagerie, setEditImagerie] = useState<Imagerie | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // fetch des rendez-vous et imageries
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les rendez-vous et toutes les imageries
        const [rendezVousData, imageriesData] = await Promise.all([
          getRendezVous(),
          getImageries(),
        ]);

        // Créer un map des imageries par rendezVousId
        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });

        // Combiner rendez-vous avec leurs imageries (ou null si pas d'imagerie)
        const combined: RendezVousAvecImagerie[] = rendezVousData.map((rv: any) => ({
          rendezVousId: rv.id,
          rendezVous: {
            nom_patient: rv.nom_patient,
            date: rv.date,
            heure: rv.heure,
            acte: rv.acte ? { Nom_Acte: rv.acte.Nom_Acte } : undefined,
          },
          imagerie: imageriesMap.get(rv.id) || null,
        }));

        setRendezVousAvecImageries(combined);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de récupérer les données",
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
    
    // Validation : pour un nouvel ajout, il faut soit un fichier soit une URL
    if (!editImagerie && !selectedFile && !newImagerie.urlImage) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez sélectionner un fichier image ou fournir une URL",
      });
      return;
    }
    
    try {
      if (editImagerie && editImagerie.id != null) {
        // Pour la modification, on peut modifier l'image via upload d'un nouveau fichier
        // Le type (acte) et le rendez-vous ne peuvent pas être modifiés
        
        // Récupérer le rendezVousId depuis l'imagerie existante
        let rendezVousId = editImagerie.rendezVousId || editImagerie.rendezVous?.id || newImagerie.rendezVousId;
        
        // Si toujours pas trouvé, chercher dans la liste des rendez-vous avec imageries
        if (!rendezVousId || rendezVousId === 0) {
          const rvAvecImg = rendezVousAvecImageries.find(
            (rv) => rv.imagerie?.id === editImagerie.id
          );
          rendezVousId = rvAvecImg?.rendezVousId;
        }
        
        if (!rendezVousId || rendezVousId === 0) {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Impossible de trouver le rendez-vous associé à cette imagerie",
          });
          return;
        }
        
        // Si un nouveau fichier est sélectionné, on doit l'uploader
        if (selectedFile) {
          // Uploader le nouveau fichier pour obtenir l'URL
          const uploaded = await uploadAndSaveImagerie(selectedFile, {
            type: editImagerie.type || currentRendezVous?.rendezVous?.acte?.Nom_Acte || "",
            rendezVousId: rendezVousId,
          });
          
          // Mettre à jour l'ancienne imagerie avec la nouvelle URL
          await updateImagerie(editImagerie.id, {
            urlImage: uploaded.urlImage,
          });
          
          // Supprimer la nouvelle imagerie créée (on ne garde que la mise à jour de l'existante)
          await deleteImagerie(uploaded.id!);
        } else {
          // Si pas de nouveau fichier, vérifier si l'URL a changé
          // Note: dans le formulaire actuel, on n'a pas de champ URL pour la modification
          // Donc on ne fait rien si pas de nouveau fichier
          Swal.fire({
            icon: "info",
            title: "Aucune modification",
            text: "Veuillez sélectionner un nouveau fichier pour modifier l'image",
          });
          return;
        }
        // Recharger les données pour mettre à jour la liste
        const [rendezVousData, imageriesData] = await Promise.all([
          getRendezVous(),
          getImageries(),
        ]);
        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });
        const combined: RendezVousAvecImagerie[] = rendezVousData.map((rv: any) => ({
          rendezVousId: rv.id,
          rendezVous: {
            nom_patient: rv.nom_patient,
            date: rv.date,
            heure: rv.heure,
            acte: rv.acte ? { Nom_Acte: rv.acte.Nom_Acte } : undefined,
          },
          imagerie: imageriesMap.get(rv.id) || null,
        }));
        setRendezVousAvecImageries(combined);
        Swal.fire({
          icon: "success",
          title: "Modifiée",
          text: `L'imagerie a été modifiée avec succès`,
        });
      } else {
        // Si un fichier est sélectionné, utiliser l'upload
        if (selectedFile) {
          await uploadAndSaveImagerie(selectedFile, {
            type: currentRendezVous?.rendezVous?.acte?.Nom_Acte || newImagerie.type || "",
            rendezVousId: newImagerie.rendezVousId || 0,
          });
        } else {
          // Sinon, utiliser la méthode classique avec URL
          await createImagerie({
            type: currentRendezVous?.rendezVous?.acte?.Nom_Acte || newImagerie.type || "",
            urlImage: newImagerie.urlImage,
            rendezVousId: newImagerie.rendezVousId || 0,
          });
        }
        // Recharger les données pour mettre à jour la liste
        const [rendezVousData, imageriesData] = await Promise.all([
          getRendezVous(),
          getImageries(),
        ]);
        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });
        const combined: RendezVousAvecImagerie[] = rendezVousData.map((rv: any) => ({
          rendezVousId: rv.id,
          rendezVous: {
            nom_patient: rv.nom_patient,
            date: rv.date,
            heure: rv.heure,
            acte: rv.acte ? { Nom_Acte: rv.acte.Nom_Acte } : undefined,
          },
          imagerie: imageriesMap.get(rv.id) || null,
        }));
        setRendezVousAvecImageries(combined);
        const acteNom = currentRendezVous?.rendezVous?.acte?.Nom_Acte || "l'imagerie";
        Swal.fire({
          icon: "success",
          title: "Ajoutée",
          text: `L'imagerie pour "${acteNom}" a été ajoutée avec succès`,
        });
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "Impossible de sauvegarder l'imagerie";
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMessage,
      });
    } finally {
      setShowModal(false);
      setEditImagerie(null);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setNewImagerie({ type: "", urlImage: "", compteRenduId: 0, rendezVousId: 0 });
    }
  };

  const handleEdit = (imagerie: Imagerie) => {
    setEditImagerie(imagerie);
    setNewImagerie(imagerie);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  // Ajouter une imagerie pour un rendez-vous qui n'en a pas
  const handleAddForRendezVous = (rendezVousId: number) => {
    setNewImagerie({ type: "", urlImage: "", compteRenduId: 0, rendezVousId });
    setEditImagerie(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  // Trouver le rendez-vous actuel pour afficher ses informations
  const getCurrentRendezVous = () => {
    if (newImagerie.rendezVousId) {
      return rendezVousAvecImageries.find(
        (rv) => rv.rendezVousId === newImagerie.rendezVousId
      );
    }
    return null;
  };

  const currentRendezVous = getCurrentRendezVous();

  // Gérer la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Créer une URL de prévisualisation
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // suppression
  const handleDelete = async (imagerie: Imagerie) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment supprimer l'imagerie "${imagerie.type || 'cette imagerie'}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed && imagerie.id != null) {
      try {
        await deleteImagerie(imagerie.id);
        // Recharger les données pour mettre à jour la liste
        const [rendezVousData, imageriesData] = await Promise.all([
          getRendezVous(),
          getImageries(),
        ]);
        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });
        const combined: RendezVousAvecImagerie[] = rendezVousData.map((rv: any) => ({
          rendezVousId: rv.id,
          rendezVous: {
            nom_patient: rv.nom_patient,
            date: rv.date,
            heure: rv.heure,
            acte: rv.acte ? { Nom_Acte: rv.acte.Nom_Acte } : undefined,
          },
          imagerie: imageriesMap.get(rv.id) || null,
        }));
        setRendezVousAvecImageries(combined);
        Swal.fire({
          icon: "success",
          title: "Supprimée",
          text: `L'imagerie "${imagerie.type || 'cette imagerie'}" a été supprimée`,
        });
      } catch (err: any) {
        console.error(err);
        const errorMessage = err?.message || `Impossible de supprimer "${imagerie.type || 'cette imagerie'}"`;
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: errorMessage,
        });
      }
    }
  };

  return (
    <>
      <Breadcrumb pageName="Imageries" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        
        <TableImagerie
          data={rendezVousAvecImageries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddForRendezVous={handleAddForRendezVous}
        />
      </div>

      {/* Modal ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow">
            <ShowcaseSection
              title={editImagerie ? "Modifier Imagerie" : "Ajouter Imagerie"}
              className="!p-6.5"
            >
                <form onSubmit={handleSaveImagerie}>
                  {/* Affichage de l'acte */}
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                      Acte
                    </label>
                    <div className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-2 px-5.5 py-3 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                      {currentRendezVous?.rendezVous?.acte?.Nom_Acte || "-"}
                    </div>
                  </div>

                  {/* Input file pour uploader l'image */}
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                      Image
                    </label>
                    <div className="relative block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="imageUpload"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
                      >
                        {previewUrl ? (
                          <div className="relative w-full max-w-xs">
                            <img
                              src={previewUrl}
                              alt="Aperçu"
                              className="w-full h-auto rounded-lg max-h-48 object-contain"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedFile(null);
                                if (previewUrl && previewUrl.startsWith('blob:')) {
                                  URL.revokeObjectURL(previewUrl);
                                }
                                setPreviewUrl(null);
                                const input = document.getElementById("imageUpload") as HTMLInputElement;
                                if (input) input.value = "";
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : editImagerie?.urlImage ? (
                          <div className="relative w-full max-w-xs">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${editImagerie.urlImage}`}
                              alt="Image actuelle"
                              className="w-full h-auto rounded-lg max-h-48 object-contain"
                            />
                            <p className="mt-2 text-xs text-gray-500">Image actuelle - Cliquez pour la remplacer</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                              <UploadIcon />
                            </div>
                            <p className="mt-2.5 text-body-sm font-medium">
                              <span className="text-primary">Cliquez pour uploader</span> ou glissez-déposez
                            </p>
                            <p className="mt-1 text-body-xs">
                              PNG, JPG, JPEG ou GIF
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Affichage du nom du patient */}
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                      Patient
                    </label>
                    <div className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-2 px-5.5 py-3 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                      {currentRendezVous?.rendezVous?.nom_patient || "-"}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditImagerie(null);
                        setSelectedFile(null);
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        setPreviewUrl(null);
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
          </div>
        </div>
      )}

    </>
  );
}
