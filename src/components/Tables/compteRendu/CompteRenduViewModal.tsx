"use client";

import { RendezVousAvecImagerie, formatDateTime, generateDocumentReference } from "./utils";

interface CompteRenduViewModalProps {
  selectedRendezVous: RendezVousAvecImagerie;
  contenu: string;
  onClose: () => void;
}

export function CompteRenduViewModal({
  selectedRendezVous,
  contenu,
  onClose,
}: CompteRenduViewModalProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateCreation = (date?: string) => {
    if (!date) return formatDate(new Date().toISOString());
    return formatDate(date);
  };

  return (
    <>
      {/* Styles pour l'impression professionnelle */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #compte-rendu-print, #compte-rendu-print * {
            visibility: visible;
          }
          #compte-rendu-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 0;
            margin: 0;
            font-family: 'Times New Roman', serif;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
          #compte-rendu-print .print-header {
            background: #1e3a8a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #compte-rendu-print .print-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          #compte-rendu-print .print-border {
            border: 1px solid #000 !important;
          }
        }
      `}</style>

      {/* Document à imprimer (caché à l'écran, visible à l'impression) */}
      <div id="compte-rendu-print" style={{ display: "none" }}>
        {/* En-tête professionnel du centre */}
        <div className="print-header bg-blue-900 text-white p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">CENTRE DE RADIOLOGIE ET IMAGERIE MÉDICALE</h1>
          </div>
        </div>

        {/* Titre du document */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase mb-2 border-b-2 border-black pb-2 inline-block px-8">
            COMPTE RENDU D'EXAMEN
          </h2>
        </div>

        {/* Informations du patient */}
        <div className="print-section mb-6">
          <table className="w-full border-collapse print-border">
            <thead>
              <tr className="bg-gray-200">
                <th className="print-border p-3 text-left font-bold uppercase text-sm" colSpan={2}>
                  INFORMATIONS DU PATIENT
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="print-border p-3 font-semibold w-1/3">Nom du patient:</td>
                <td className="print-border p-3">{selectedRendezVous.rendezVous.nom_patient}</td>
              </tr>
              <tr>
                <td className="print-border p-3 font-semibold">Date de l'examen:</td>
                <td className="print-border p-3">
                  {formatDateTime(selectedRendezVous.rendezVous.date, selectedRendezVous.rendezVous.heure)}
                </td>
              </tr>
              <tr>
                <td className="print-border p-3 font-semibold">Type d'examen:</td>
                <td className="print-border p-3">
                  {selectedRendezVous.rendezVous.acte?.Nom_Acte || "Non spécifié"}
                </td>
              </tr>
              {selectedRendezVous.compteRendu?.medecin && (
                <tr>
                  <td className="print-border p-3 font-semibold">Médecin prescripteur:</td>
                  <td className="print-border p-3">
                    Dr. {selectedRendezVous.compteRendu.medecin.name}{" "}
                    {selectedRendezVous.compteRendu.medecin.lastName}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Compte rendu */}
        <div className="print-section mb-6">
          <div className="print-border">
            <div className="bg-gray-200 print-border-b p-3">
              <h3 className="font-bold uppercase text-sm">COMPTE RENDU</h3>
            </div>
            <div className="p-6 min-h-[200px]">
              <div
                className="whitespace-pre-wrap text-base leading-relaxed"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {contenu || "Aucun contenu disponible."}
              </div>
            </div>
          </div>
        </div>

        {/* Signature et date */}
        <div className="print-section mt-12">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold mb-2">Signature et cachet du médecin:</p>
              <div className="border-b-2 border-black pb-2 ">
                {selectedRendezVous.compteRendu?.medecin && (
                  <p className="text-sm font-medium">
                    Dr. {selectedRendezVous.compteRendu.medecin.name}{" "}
                    {selectedRendezVous.compteRendu.medecin.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-12 pt-4 border-t-2 border-black text-xs text-center space-y-1">
          <p className="font-semibold">DOCUMENT CONFIDENTIEL - USAGE MÉDICAL UNIQUEMENT</p>
          <p>Ce document est confidentiel et destiné uniquement à un usage médical.</p>
          <p>Toute reproduction ou diffusion non autorisée est strictement interdite.</p>
          <p className="mt-2">
            Document généré le{" "}
            {new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Modal d'affichage à l'écran */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-gray-dark">
          {/* En-tête professionnel */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">COMPTE RENDU MÉDICAL</h2>
                <p className="text-blue-100 text-sm">Centre de Radiologie et Imagerie Médicale</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors no-print"
                title="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Corps du document */}
          <div className="p-6 space-y-6">
            {/* Informations du patient */}
            <div className="bg-gray-50 dark:bg-dark-2 rounded-lg p-4 border-l-4 border-blue-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Informations du Patient
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Nom du Patient
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedRendezVous.rendezVous.nom_patient}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Date de l'Examen
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDateTime(selectedRendezVous.rendezVous.date, selectedRendezVous.rendezVous.heure)}
                  </p>
                </div>
              </div>
            </div>

            {/* Détails de l'examen */}
            <div className="bg-gray-50 dark:bg-dark-2 rounded-lg p-4 border-l-4 border-green-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Détails de l'Examen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Type d'Acte</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedRendezVous.rendezVous.acte?.Nom_Acte || "Non spécifié"}
                  </p>
                </div>
                {selectedRendezVous.compteRendu?.medecin && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Médecin Rédacteur
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      Dr. {selectedRendezVous.compteRendu.medecin.name}{" "}
                      {selectedRendezVous.compteRendu.medecin.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Compte rendu */}
            <div className="bg-white dark:bg-dark-3 rounded-lg p-6 border-2 border-gray-200 dark:border-dark-3 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
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
                <p>
                  Document généré le{" "}
                  {new Date().toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs">Document confidentiel - Usage médical uniquement</p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="bg-gray-50 dark:bg-dark-2 px-6 py-4 rounded-b-lg border-t border-gray-200 dark:border-dark-3 flex justify-end gap-3 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-dark-3 bg-white dark:bg-dark-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-3 transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimer
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
