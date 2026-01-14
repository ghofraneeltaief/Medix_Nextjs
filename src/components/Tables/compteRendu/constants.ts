/**
 * Constantes pour les comptes rendus
 */

export const SWAL_CONFIG = {
  success: {
    icon: "success" as const,
    timer: 1500,
    showConfirmButton: false,
  },
  error: {
    icon: "error" as const,
    title: "Erreur",
  },
  warning: {
    icon: "warning" as const,
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  },
} as const;

export const ERROR_MESSAGES = {
  LOAD_DATA: "Impossible de récupérer les données",
  SAVE: "Impossible de sauvegarder le compte rendu",
  DELETE: "Impossible de supprimer le compte rendu",
  NO_RENDEZ_VOUS: "Rendez-vous non sélectionné",
  NO_CONTENT: "Veuillez saisir le contenu du compte rendu",
  NO_USER_ID: "Impossible de récupérer l'ID de l'utilisateur. Veuillez vous reconnecter.",
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: "Le compte rendu a été créé avec succès",
  UPDATED: "Le compte rendu a été modifié avec succès",
  DELETED: "Le compte rendu a été supprimé",
} as const;
