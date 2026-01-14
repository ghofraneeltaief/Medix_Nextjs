"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { RendezVousAvecImagerie } from "./utils";

interface CompteRenduModalProps {
  selectedRendezVous: RendezVousAvecImagerie;
  contenu: string;
  setContenu: (value: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CompteRenduModal({
  selectedRendezVous,
  contenu,
  setContenu,
  onSave,
  onClose,
}: CompteRenduModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded bg-white shadow dark:bg-gray-dark">
        <ShowcaseSection
          title={selectedRendezVous.compteRendu ? "Modifier le compte rendu" : "Ajouter un compte rendu"}
          className="!p-6.5"
        >
          <form onSubmit={onSave}>
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
                onClick={onClose}
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
  );
}
