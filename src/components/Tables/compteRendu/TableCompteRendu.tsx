"use client";

import { useEffect, useState } from "react";
import { TrashIcon, EyeIcon, PlusIcon, PencilSquareIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getImageries, Imagerie } from "@/services/imageService";
import { getRendezVous } from "@/services/rendezvous.service";
import { getComptesRendus, createCompteRendu, updateCompteRendu, deleteCompteRendu, CompteRendu } from "@/services/compteRenduService";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "@/services/userService";
import { MedicalImageViewer } from "@/components/MedicalImageViewer/MedicalImageViewer";

interface RendezVousAvecImagerie {
  rendezVousId: number;
  rendezVous: {
    id: number;
    nom_patient: string;
    date: string;
    heure: string;
    acte?: {
      Id_Acte: number;
      Nom_Acte: string;
    };
  };
  imagerie: Imagerie | null;
  compteRendu: CompteRendu | null;
}

export function TableCompteRendu() {
  const [data, setData] = useState<RendezVousAvecImagerie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVousAvecImagerie | null>(null);
  const [contenu, setContenu] = useState("");
  const [medecinId, setMedecinId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    url: string;
    patientName?: string;
    date?: string;
    acte?: string;
  } | null>(null);

  // Détecter le rôle de l'utilisateur
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  // Masquer le header quand un modal est ouvert
  useEffect(() => {
    const isModalOpen = showViewModal || showModal;
    
    if (isModalOpen) {
      // Masquer directement le header
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
    } else {
      // Réafficher le header
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    }

    // Nettoyage lors du démontage
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, [showViewModal, showModal]);

  // Mode lecture seule pour le médecin externe
  const isReadOnly = userRole === "médecin";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Récupérer l'ID du médecin connecté
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const profile = await getProfile(token);
            // Le backend retourne userId dans le profil
            setMedecinId(Number(profile.id) || null);
          } catch (err) {
            console.error("Erreur lors de la récupération du profil:", err);
            // Si getProfile échoue, décoder le token directement
            const decoded: any = jwtDecode(token);
            // Le JWT contient 'sub' comme clé pour l'ID utilisateur
            setMedecinId(decoded.sub || decoded.userId || decoded.id || null);
          }
        }

        // Récupérer toutes les données
        const [rendezVousData, imageriesData, comptesRendusData] = await Promise.all([
          getRendezVous(),
          getImageries(),
          getComptesRendus(),
        ]);

        // Créer des maps pour faciliter la recherche
        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });

        const comptesRendusMap = new Map<number, CompteRendu>();
        comptesRendusData.forEach((cr: CompteRendu) => {
          const rvId = cr.id_rv || cr.rendezVous?.id;
          if (rvId) {
            comptesRendusMap.set(rvId, cr);
          }
        });

        // Filtrer pour ne garder que les rendez-vous avec images
        const combined: RendezVousAvecImagerie[] = rendezVousData
          .filter((rv: any) => imageriesMap.has(rv.id))
          .map((rv: any) => ({
            rendezVousId: rv.id,
            rendezVous: {
              id: rv.id,
              nom_patient: rv.nom_patient,
              date: rv.date,
              heure: rv.heure,
              acte: rv.acte ? { Id_Acte: rv.acte.Id_Acte, Nom_Acte: rv.acte.Nom_Acte } : undefined,
            },
            imagerie: imageriesMap.get(rv.id) || null,
            compteRendu: comptesRendusMap.get(rv.id) || null,
          }));

        setData(combined);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de récupérer les données",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddCompteRendu = (item: RendezVousAvecImagerie) => {
    setSelectedRendezVous(item);
    setContenu(item.compteRendu?.contenu || "");
    setShowModal(true);
  };

  const handleSaveCompteRendu = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRendezVous) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Rendez-vous non sélectionné",
      });
      return;
    }

    // Récupérer l'ID du médecin si pas encore chargé
    let currentMedecinId: number | null = medecinId;
    if (!currentMedecinId) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await getProfile(token);
          currentMedecinId = Number(profile.id);
          console.log("ID récupéré depuis getProfile:", currentMedecinId);
        } catch (err) {
          console.error("Erreur getProfile, décodage du token:", err);
          const decoded: any = jwtDecode(token);
          currentMedecinId = decoded.sub || decoded.userId || decoded.id || null;
          console.log("ID récupéré depuis token décodé:", currentMedecinId, "Token décodé:", decoded);
        }
      }
    } else {
      console.log("ID déjà chargé:", currentMedecinId);
    }

    if (!currentMedecinId) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de récupérer l'ID de l'utilisateur. Veuillez vous reconnecter.",
      });
      return;
    }

    console.log("Tentative de création de compte rendu avec ID utilisateur:", currentMedecinId);

    if (!contenu.trim()) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez saisir le contenu du compte rendu",
      });
      return;
    }

    try {
      if (selectedRendezVous.compteRendu?.id) {
        // Mettre à jour le compte rendu existant
        await updateCompteRendu(selectedRendezVous.compteRendu.id, {
          contenu: contenu,
        });
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Le compte rendu a été modifié avec succès",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Créer un nouveau compte rendu
        await createCompteRendu({
          id_rv: selectedRendezVous.rendezVousId,
          id_medecin: currentMedecinId,
          id_acte: selectedRendezVous.rendezVous.acte?.Id_Acte || 0,
          nom_patient: selectedRendezVous.rendezVous.nom_patient,
          contenu: contenu,
        });
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Le compte rendu a été créé avec succès",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      // Recharger les données
      const [rendezVousData, imageriesData, comptesRendusData] = await Promise.all([
        getRendezVous(),
        getImageries(),
        getComptesRendus(),
      ]);

      const imageriesMap = new Map<number, Imagerie>();
      imageriesData.forEach((img: Imagerie) => {
        const rvId = img.rendezVousId || img.rendezVous?.id;
        if (rvId) {
          imageriesMap.set(rvId, img);
        }
      });

      const comptesRendusMap = new Map<number, CompteRendu>();
      comptesRendusData.forEach((cr: CompteRendu) => {
        const rvId = cr.id_rv || cr.rendezVous?.id;
        if (rvId) {
          comptesRendusMap.set(rvId, cr);
        }
      });

      const combined: RendezVousAvecImagerie[] = rendezVousData
        .filter((rv: any) => imageriesMap.has(rv.id))
        .map((rv: any) => ({
          rendezVousId: rv.id,
          rendezVous: {
            id: rv.id,
            nom_patient: rv.nom_patient,
            date: rv.date,
            heure: rv.heure,
            acte: rv.acte ? { Id_Acte: rv.acte.Id_Acte, Nom_Acte: rv.acte.Nom_Acte } : undefined,
          },
          imagerie: imageriesMap.get(rv.id) || null,
          compteRendu: comptesRendusMap.get(rv.id) || null,
        }));

      setData(combined);
      setShowModal(false);
      setSelectedRendezVous(null);
      setContenu("");
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde du compte rendu:", err);
      let errorMessage = "Impossible de sauvegarder le compte rendu";
      
      // Essayer d'extraire le message d'erreur de la réponse
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response) {
        try {
          const errorData = await err.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = err.response.statusText || errorMessage;
        }
      }
      
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMessage,
      });
    }
  };

  const handleDeleteCompteRendu = async (id: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await deleteCompteRendu(id);
        Swal.fire({
          icon: "success",
          title: "Supprimé",
          text: "Le compte rendu a été supprimé",
          timer: 1500,
          showConfirmButton: false,
        });

        // Recharger les données
        const [rendezVousData, imageriesData, comptesRendusData] = await Promise.all([
          getRendezVous(),
          getImageries(),
          getComptesRendus(),
        ]);

        const imageriesMap = new Map<number, Imagerie>();
        imageriesData.forEach((img: Imagerie) => {
          const rvId = img.rendezVousId || img.rendezVous?.id;
          if (rvId) {
            imageriesMap.set(rvId, img);
          }
        });

        const comptesRendusMap = new Map<number, CompteRendu>();
        comptesRendusData.forEach((cr: CompteRendu) => {
          const rvId = cr.id_rv || cr.rendezVous?.id;
          if (rvId) {
            comptesRendusMap.set(rvId, cr);
          }
        });

        const combined: RendezVousAvecImagerie[] = rendezVousData
          .filter((rv: any) => imageriesMap.has(rv.id))
          .map((rv: any) => ({
            rendezVousId: rv.id,
            rendezVous: {
              id: rv.id,
              nom_patient: rv.nom_patient,
              date: rv.date,
              heure: rv.heure,
              acte: rv.acte ? { Id_Acte: rv.acte.Id_Acte, Nom_Acte: rv.acte.Nom_Acte } : undefined,
            },
            imagerie: imageriesMap.get(rv.id) || null,
            compteRendu: comptesRendusMap.get(rv.id) || null,
          }));

        setData(combined);
      } catch (err: any) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err.message || "Impossible de supprimer le compte rendu",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead className="xl:pl-7.5">Patient</TableHead>
              <TableHead>Date RDV</TableHead>
              <TableHead>Acte</TableHead>
              <TableHead>Aperçu compte rendu</TableHead>
              <TableHead>Compte rendu</TableHead>
              <TableHead className="text-right xl:pr-7.5">{isReadOnly ? "Consultation" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="border-[#eee] dark:border-dark-3">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Aucun rendez-vous avec image disponible
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.rendezVousId}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="xl:pl-7.5">
                    {item.rendezVous.nom_patient}
                  </TableCell>
                  <TableCell>
                    {new Date(item.rendezVous.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    {item.rendezVous.acte?.Nom_Acte || "-"}
                  </TableCell>
                  <TableCell>
                    {item.compteRendu ? (
                      <button
                        onClick={() => {
                          setSelectedRendezVous(item);
                          setContenu(item.compteRendu?.contenu || "");
                          setShowViewModal(true);
                        }}
                        className="hover:text-primary"
                        title="Afficher le compte rendu"
                      >
                        <EyeIcon />
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.compteRendu ? (
                      <button
                        onClick={() => {
                          setSelectedRendezVous(item);
                          setContenu(item.compteRendu?.contenu || "");
                          setShowViewModal(true);
                        }}
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 transition cursor-pointer"
                        title="Cliquez pour afficher le compte rendu"
                      >
                        Existant
                      </button>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        À créer
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      {isReadOnly ? (
                        // Mode consultation seule pour le médecin externe
                        item.compteRendu ? (
                          <button
                            onClick={() => {
                              setSelectedRendezVous(item);
                              setContenu(item.compteRendu?.contenu || "");
                              setShowViewModal(true);
                            }}
                            className="hover:text-primary"
                            title="Consulter le compte rendu"
                          >
                            <EyeIcon />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun compte rendu</span>
                        )
                      ) : (
                        // Mode édition pour les autres rôles
                        item.compteRendu ? (
                          <>
                            <button
                              onClick={() => handleAddCompteRendu(item)}
                              className="hover:text-primary"
                              title="Modifier le compte rendu"
                            >
                              <PencilSquareIcon />
                            </button>
                            <button
                              onClick={() => item.compteRendu?.id && handleDeleteCompteRendu(item.compteRendu.id)}
                              className="hover:text-red-500"
                              title="Supprimer le compte rendu"
                            >
                              <TrashIcon />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAddCompteRendu(item)}
                            className="hover:text-primary"
                            title="Ajouter un compte rendu"
                          >
                            <PlusIcon />
                          </button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Visualiseur d'images médicales */}
      {previewData && (
        <MedicalImageViewer
          imageUrl={previewData.url}
          patientName={previewData.patientName}
          date={previewData.date}
          acte={previewData.acte}
          onClose={() => setPreviewData(null)}
        />
      )}

      {/* Modal pour ajouter/modifier un compte rendu */}
      {showModal && selectedRendezVous && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded bg-white shadow dark:bg-gray-dark">
            <ShowcaseSection
              title={selectedRendezVous.compteRendu ? "Modifier le compte rendu" : "Ajouter un compte rendu"}
              className="!p-6.5"
            >
              <form onSubmit={handleSaveCompteRendu}>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Patient
                  </label>
                  <input
                    type="text"
                    value={selectedRendezVous.rendezVous.nom_patient}
                    disabled
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5.5 py-3 text-dark outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Date du rendez-vous
                  </label>
                  <input
                    type="text"
                    value={`${new Date(selectedRendezVous.rendezVous.date).toLocaleDateString("fr-FR")} ${selectedRendezVous.rendezVous.heure}`}
                    disabled
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5.5 py-3 text-dark outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Acte
                  </label>
                  <input
                    type="text"
                    value={selectedRendezVous.rendezVous.acte?.Nom_Acte || "N/A"}
                    disabled
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5.5 py-3 text-dark outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Contenu du compte rendu <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={10}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    placeholder="Saisissez le contenu du compte rendu..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-primary px-6 py-2.5 text-center font-medium text-primary hover:bg-primary/10 transition"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRendezVous(null);
                      setContenu("");
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 transition"
                  >
                    {selectedRendezVous.compteRendu ? "Modifier" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </ShowcaseSection>
          </div>
        </div>
      )}

      {/* Modal pour consulter un compte rendu (mode lecture seule) - Format professionnel */}
      {showViewModal && selectedRendezVous && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-gray-dark">
            {/* En-tête professionnel */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">COMPTE RENDU MÉDICAL</h2>
                  <p className="text-blue-100 text-sm">Centre de Radiologie</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRendezVous(null);
                    setContenu("");
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                  title="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Corps du document */}
            <div className="p-6 space-y-6">
              {/* Informations du patient */}
              <div className="bg-gray-50 dark:bg-dark-2 rounded-lg p-4 border-l-4 border-blue-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations du Patient
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Nom du Patient</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {selectedRendezVous.rendezVous.nom_patient}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Date de l'Examen</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(selectedRendezVous.rendezVous.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })} à {selectedRendezVous.rendezVous.heure}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails de l'examen */}
              <div className="bg-gray-50 dark:bg-dark-2 rounded-lg p-4 border-l-4 border-green-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Détails de l'Examen
                </h3>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Type d'Acte</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedRendezVous.rendezVous.acte?.Nom_Acte || "Non spécifié"}
                  </p>
                </div>
              </div>

              {/* Compte rendu */}
              <div className="bg-white dark:bg-dark-3 rounded-lg p-6 border-2 border-gray-200 dark:border-dark-3 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Compte Rendu
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-base">
                    {contenu || "Aucun contenu disponible."}
                  </div>
                </div>
              </div>

              {/* Pied de page */}
              <div className="border-t border-gray-200 dark:border-dark-3 pt-4 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <p>Document généré le {new Date().toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p>
                  <p className="text-xs">Document confidentiel - Usage médical uniquement</p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="bg-gray-50 dark:bg-dark-2 px-6 py-4 rounded-b-lg border-t border-gray-200 dark:border-dark-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-dark-3 bg-white dark:bg-dark-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-3 transition"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRendezVous(null);
                  setContenu("");
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
