"use client";

import { useState } from "react";
import { TrashIcon, EyeIcon, PlusIcon, PencilSquareIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createCompteRendu, updateCompteRendu, deleteCompteRendu } from "@/services/compteRenduService";
import Swal from "sweetalert2";
import { useCompteRenduData, useMedecinId, useHeaderVisibility, useUserRole } from "./hooks";
import { RendezVousAvecImagerie } from "./utils";
import { SWAL_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import { CompteRenduModal } from "./CompteRenduModal";
import { CompteRenduViewModal } from "./CompteRenduViewModal";

export function TableCompteRendu() {
  const { data, isLoading, reloadData } = useCompteRenduData();
  const { getCurrentMedecinId } = useMedecinId();
  const { isReadOnly } = useUserRole();

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVousAvecImagerie | null>(null);
  const [contenu, setContenu] = useState("");

  useHeaderVisibility(showModal, showViewModal);

  const handleAddCompteRendu = (item: RendezVousAvecImagerie) => {
    setSelectedRendezVous(item);
    setContenu(item.compteRendu?.contenu || "");
    setShowModal(true);
  };

  const handleViewCompteRendu = (item: RendezVousAvecImagerie) => {
    setSelectedRendezVous(item);
    setContenu(item.compteRendu?.contenu || "");
    setShowViewModal(true);
  };

  const handleSaveCompteRendu = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRendezVous) {
      Swal.fire({
        ...SWAL_CONFIG.error,
        text: ERROR_MESSAGES.NO_RENDEZ_VOUS,
      });
      return;
    }

    const currentMedecinId = await getCurrentMedecinId();
    if (!currentMedecinId) {
      Swal.fire({
        ...SWAL_CONFIG.error,
        text: ERROR_MESSAGES.NO_USER_ID,
      });
      return;
    }

    if (!contenu.trim()) {
      Swal.fire({
        ...SWAL_CONFIG.error,
        text: ERROR_MESSAGES.NO_CONTENT,
      });
      return;
    }

    try {
      if (selectedRendezVous.compteRendu?.id) {
        await updateCompteRendu(selectedRendezVous.compteRendu.id, { contenu });
        Swal.fire({
          ...SWAL_CONFIG.success,
          title: "Succès",
          text: SUCCESS_MESSAGES.UPDATED,
        });
      } else {
        await createCompteRendu({
          id_rv: selectedRendezVous.rendezVousId,
          id_medecin: currentMedecinId,
          id_acte: selectedRendezVous.rendezVous.acte?.Id_Acte || 0,
          nom_patient: selectedRendezVous.rendezVous.nom_patient,
          contenu,
        });
        Swal.fire({
          ...SWAL_CONFIG.success,
          title: "Succès",
          text: SUCCESS_MESSAGES.CREATED,
        });
      }

      await reloadData();
      handleCloseModal();
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde du compte rendu:", err);
      const errorMessage = err.message || ERROR_MESSAGES.SAVE;
      Swal.fire({
        ...SWAL_CONFIG.error,
        text: errorMessage,
      });
    }
  };

  const handleDeleteCompteRendu = async (id: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible",
      ...SWAL_CONFIG.warning,
    });

    if (result.isConfirmed) {
      try {
        await deleteCompteRendu(id);
        Swal.fire({
          ...SWAL_CONFIG.success,
          title: "Supprimé",
          text: SUCCESS_MESSAGES.DELETED,
        });
        await reloadData();
      } catch (err: any) {
        console.error("Erreur lors de la suppression:", err);
        Swal.fire({
          ...SWAL_CONFIG.error,
          text: err.message || ERROR_MESSAGES.DELETE,
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowViewModal(false);
    setSelectedRendezVous(null);
    setContenu("");
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
              <TableHead className="text-right xl:pr-7.5">
                {isReadOnly ? "Consultation" : "Actions"}
              </TableHead>
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
                <TableRow key={item.rendezVousId} className="border-[#eee] dark:border-dark-3">
                  <TableCell className="xl:pl-7.5">{item.rendezVous.nom_patient}</TableCell>
                  <TableCell>
                    {new Date(item.rendezVous.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>{item.rendezVous.acte?.Nom_Acte || "-"}</TableCell>
                  <TableCell>
                    {item.compteRendu ? (
                      <button
                        onClick={() => handleViewCompteRendu(item)}
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
                        onClick={() => handleViewCompteRendu(item)}
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
                        item.compteRendu ? (
                          <button
                            onClick={() => handleViewCompteRendu(item)}
                            className="hover:text-primary"
                            title="Consulter le compte rendu"
                          >
                            <EyeIcon />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun compte rendu</span>
                        )
                      ) : (
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

      {showModal && selectedRendezVous && (
        <CompteRenduModal
          selectedRendezVous={selectedRendezVous}
          contenu={contenu}
          setContenu={setContenu}
          onSave={handleSaveCompteRendu}
          onClose={handleCloseModal}
        />
      )}

      {showViewModal && selectedRendezVous && (
        <CompteRenduViewModal
          selectedRendezVous={selectedRendezVous}
          contenu={contenu}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
