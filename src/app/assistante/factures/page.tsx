"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableFacture } from "@/components/Tables/factures/TableFacture";
import { useEffect, useState } from "react";
import {
  Facture,
  getFactures,
  createFacture,
  updateFacture,
  deleteFacture,
} from "@/services/factureService";
import { Button } from "@/components/ui-elements/button";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import { getRendezVous } from "@/services/rendezvous.service";
import { getActes } from "@/services/acteService";
import Swal from "sweetalert2";

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
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
  
  const [editFacture, setEditFacture] = useState<Facture | null>(null);
  const [rendezVous, setRendezVous] = useState<any[]>([]);
  const [actes, setActes] = useState<any[]>([]);
  const [searchRendezVous, setSearchRendezVous] = useState("");
  const [showRendezVousDropdown, setShowRendezVousDropdown] = useState(false);
  const [formData, setFormData] = useState({
    id_rendez_vous: "",
    id_acte: "",
    nom_patient: "",
    montant: "",
    date_facture: "",
    statut: "non_payee",
  });

  const loadFactures = async () => {
    setIsLoading(true);
    try {
      const data = await getFactures();
      setFactures(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des factures:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de récupérer les factures",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFactures();
    const loadData = async () => {
      try {
        const [rdvs, actesData] = await Promise.all([
          getRendezVous(),
          getActes(),
        ]);
        setRendezVous(rdvs);
        setActes(actesData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.rendez-vous-search-container')) {
        setShowRendezVousDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Si on change le rendez-vous, mettre à jour le patient et l'acte
    if (field === "id_rendez_vous" && value) {
      const rv = rendezVous.find((r) => r.id === Number(value));
      if (rv) {
        setFormData((prev) => ({
          ...prev,
          nom_patient: rv.nom_patient || "",
          id_acte: rv.acte?.Id_Acte ? String(rv.acte.Id_Acte) : prev.id_acte,
          montant: rv.acte?.Prix ? String(rv.acte.Prix) : prev.montant,
        }));
        setSearchRendezVous(`${rv.nom_patient} - ${new Date(rv.date).toLocaleDateString("fr-FR")} ${rv.heure}`);
        setShowRendezVousDropdown(false);
      }
    }
  };

  const filteredRendezVous = rendezVous.filter((rv) => {
    const searchLower = searchRendezVous.toLowerCase();
    const nomPatient = rv.nom_patient?.toLowerCase() || "";
    const dateStr = new Date(rv.date).toLocaleDateString("fr-FR");
    const heure = rv.heure || "";
    const acteNom = rv.acte?.Nom_Acte?.toLowerCase() || "";
    
    return (
      nomPatient.includes(searchLower) ||
      dateStr.includes(searchLower) ||
      heure.includes(searchLower) ||
      acteNom.includes(searchLower)
    );
  });

  const selectedRendezVous = rendezVous.find((r) => r.id === Number(formData.id_rendez_vous));

  const handleSaveFacture = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_rendez_vous || !formData.id_acte || !formData.nom_patient || !formData.montant || !formData.date_facture) {
      Swal.fire({
        icon: "warning",
        title: "Champs requis",
        text: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    setIsSaving(true);
    try {
      const factureData = {
        id_rendez_vous: Number(formData.id_rendez_vous),
        id_acte: Number(formData.id_acte),
        nom_patient: formData.nom_patient,
        montant: Number(formData.montant),
        date_facture: formData.date_facture,
        statut: formData.statut,
      };

      if (editFacture && editFacture.id) {
        await updateFacture(editFacture.id, factureData);
        Swal.fire({
          icon: "success",
          title: "Modifiée",
          text: "La facture a été modifiée avec succès",
        });
      } else {
        await createFacture(factureData);
        Swal.fire({
          icon: "success",
          title: "Ajoutée",
          text: "La facture a été ajoutée avec succès",
        });
      }

      await loadFactures();
      setShowModal(false);
      setEditFacture(null);
      setSearchRendezVous("");
      setShowRendezVousDropdown(false);
      setFormData({
        id_rendez_vous: "",
        id_acte: "",
        nom_patient: "",
        montant: "",
        date_facture: "",
        statut: "non_payee",
      });
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de sauvegarder la facture",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (facture: Facture) => {
    setEditFacture(facture);
    const rvId = facture.id_rendez_vous || facture.rendezVous?.id;
    const selectedRv = rendezVous.find((r) => r.id === rvId);
    setFormData({
      id_rendez_vous: String(rvId || ""),
      id_acte: String(facture.id_acte || facture.acte?.Id_Acte || ""),
      nom_patient: facture.nom_patient,
      montant: String(facture.montant),
      date_facture: facture.date_facture,
      statut: facture.statut,
    });
    if (selectedRv) {
      setSearchRendezVous(`${selectedRv.nom_patient} - ${new Date(selectedRv.date).toLocaleDateString("fr-FR")} ${selectedRv.heure}`);
    }
    setShowRendezVousDropdown(false);
    setShowModal(true);
  };

  const handleDelete = async (facture: Facture) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment supprimer la facture de "${facture.nom_patient}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed && facture.id) {
      try {
        await deleteFacture(facture.id);
        await loadFactures();
        Swal.fire({
          icon: "success",
          title: "Supprimée",
          text: "La facture a été supprimée avec succès",
        });
      } catch (err: any) {
        console.error("Erreur lors de la suppression:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err?.message || "Impossible de supprimer la facture",
        });
      }
    }
  };

  return (
    <>
      <Breadcrumb pageName="Factures" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Liste des Factures ({factures.length})
            </h2>
          </div>
          <Button
            size="small"
            onClick={() => {
              setEditFacture(null);
              setSearchRendezVous("");
              setShowRendezVousDropdown(false);
              setFormData({
                id_rendez_vous: "",
                id_acte: "",
                nom_patient: "",
                montant: "",
                date_facture: new Date().toISOString().split('T')[0],
                statut: "non_payee",
              });
              setShowModal(true);
            }}
            label="+ Ajouter Facture"
            variant="outlinePrimary"
            shape="full"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Chargement des factures...
              </p>
            </div>
          </div>
        ) : (
          <TableFacture data={factures} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-white shadow dark:bg-gray-dark">
            <ShowcaseSection
              title={editFacture ? "Modifier Facture" : "Ajouter Facture"}
              className="!p-6.5"
            >
              <form onSubmit={handleSaveFacture}>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Rendez-vous
                  </label>
                  <div className="relative rendez-vous-search-container">
                    <input
                      type="text"
                      placeholder="Rechercher un rendez-vous (nom, date, heure, acte)..."
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      value={searchRendezVous}
                      onChange={(e) => {
                        setSearchRendezVous(e.target.value);
                        setShowRendezVousDropdown(true);
                        if (!e.target.value) {
                          setFormData((prev) => ({ ...prev, id_rendez_vous: "" }));
                        }
                      }}
                      onFocus={() => setShowRendezVousDropdown(true)}
                      required={!formData.id_rendez_vous}
                    />
                    {showRendezVousDropdown && searchRendezVous && filteredRendezVous.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-dark-3 dark:bg-dark-2">
                        {filteredRendezVous.map((rv) => (
                          <div
                            key={rv.id}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-3"
                            onClick={() => {
                              handleChange("id_rendez_vous", String(rv.id));
                            }}
                          >
                            <div className="font-medium text-dark dark:text-white">
                              {rv.nom_patient}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(rv.date).toLocaleDateString("fr-FR")} {rv.heure} - {rv.acte?.Nom_Acte || "Acte inconnu"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedRendezVous && (
                      <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary dark:bg-primary/20">
                        <span className="font-medium">Sélectionné :</span> {selectedRendezVous.nom_patient} - {new Date(selectedRendezVous.date).toLocaleDateString("fr-FR")} {selectedRendezVous.heure}
                      </div>
                    )}
                  </div>
                </div>

                <InputGroup
                  label="Nom du patient"
                  type="text"
                  placeholder="Nom du patient"
                  className="mb-4.5"
                  value={formData.nom_patient}
                  handleChange={(e) => handleChange("nom_patient", e.target.value)}
                  required
                />

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Acte
                  </label>
                  <select
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    value={formData.id_acte}
                    onChange={(e) => handleChange("id_acte", e.target.value)}
                    required
                  >
                    <option value="">-- Sélectionner un acte --</option>
                    {actes.map((acte) => (
                      <option key={acte.Id_Acte} value={acte.Id_Acte}>
                        {acte.Nom_Acte} - {acte.Prix} TND
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Montant (TND)
                  </label>
                  <input
                    type="number"
                    placeholder="Montant"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    value={formData.montant}
                    onChange={(e) => handleChange("montant", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <InputGroup
                  label="Date de facture"
                  type="date"
                  placeholder="Date de facture"
                  className="mb-4.5"
                  value={formData.date_facture}
                  handleChange={(e) => handleChange("date_facture", e.target.value)}
                  required
                />

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
                    Statut
                  </label>
                  <select
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    value={formData.statut}
                    onChange={(e) => handleChange("statut", e.target.value)}
                    required
                  >
                    <option value="non_payee">Non payée</option>
                    <option value="payee">Payée</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditFacture(null);
                      setSearchRendezVous("");
                      setShowRendezVousDropdown(false);
                      setFormData({
                        id_rendez_vous: "",
                        id_acte: "",
                        nom_patient: "",
                        montant: "",
                        date_facture: "",
                        statut: "non_payee",
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
                    {isSaving ? "Enregistrement..." : editFacture ? "Enregistrer" : "Ajouter"}
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

