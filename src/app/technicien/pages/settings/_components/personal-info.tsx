"use client";
import { CallIcon, EmailIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getProfile, updateUser, UserProfile } from "@/services/userService";

export function PersonalInfoForm() {
  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    name: "",
    lastName: "",
    email: "",
    password: "********",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalPassword, setOriginalPassword] = useState<string>("********");

  // Charger le profil depuis la base de données
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Vous devez être connecté",
        });
        return;
      }

      console.log("Chargement du profil depuis la base de données...");
      const profile = await getProfile(token);
      setFormData({
        ...profile,
        password: "********", // masquer le mot de passe
      });
      setOriginalPassword("********"); // Stocker le mot de passe masqué comme référence
      console.log("Profil chargé avec succès depuis la base de données");
    } catch (err: any) {
      console.error("Erreur lors du chargement du profil:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de charger le profil depuis la base de données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Vous devez être connecté",
        });
        return;
      }

      // Préparer les données à envoyer
      // Exclure le mot de passe sauf s'il a été explicitement modifié
      const submitData: any = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      };

      // Ne inclure le mot de passe QUE s'il a été modifié (pas "********" et pas vide)
      const passwordChanged = 
        formData.password !== "********" && 
        formData.password.trim() !== "" &&
        formData.password !== originalPassword;

      if (passwordChanged) {
        submitData.password = formData.password;
        console.log("Mot de passe modifié - sera mis à jour dans la base de données");
      } else {
        console.log("Mot de passe non modifié - ne sera pas envoyé au serveur");
      }

      console.log("Mise à jour du profil dans la base de données...", {
        ...submitData,
        password: passwordChanged ? "[MODIFIÉ]" : "[NON INCLUS]",
      });

      const updatedRaw = await updateUser(token, formData.id, submitData);

      // Transformer id en string pour TypeScript
      const updated: UserProfile = {
        ...updatedRaw,
        id: updatedRaw.id?.toString() || "",
        password: "********", // masquer le mot de passe
      };

      setFormData(updated);
      setOriginalPassword("********"); // Réinitialiser la référence du mot de passe
      console.log("Profil mis à jour avec succès dans la base de données");

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Profil mis à jour avec succès dans la base de données",
      });
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Mise à jour échouée",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <ShowcaseSection title="Informations Personnelles" className="!p-7">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Chargement des données depuis la base de données...
            </p>
          </div>
        </div>
      ) : (
        <>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <InputGroup
                className="w-full sm:w-1/2"
                type="text"
                name="name"
                label="Prénom"
                value={formData.name}
                handleChange={handleInputChange}
                placeholder="Prénom"
                icon={<UserIcon />}
                iconPosition="left"
                height="sm"
              />

              <InputGroup
                className="w-full sm:w-1/2"
                type="text"
                name="lastName"
                label="Nom"
                value={formData.lastName}
                handleChange={handleInputChange}
                placeholder="Nom"
                icon={<CallIcon />}
                iconPosition="left"
                height="sm"
              />
            </div>

            <InputGroup
              className="mb-5.5"
              type="email"
              name="email"
              label="Adresse Email"
              value={formData.email}
              handleChange={handleInputChange}
              placeholder="email"
              icon={<EmailIcon />}
              iconPosition="left"
              height="sm"
            />

            <InputGroup
              className="mb-5.5"
              type="password"
              name="password"
              label="Mot de passe"
              value={formData.password}
              handleChange={handleInputChange}
              placeholder="Laissez vide pour ne pas modifier"
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                onClick={loadProfile}
                disabled={isLoading || isSaving}
              >
                Recharger
              </button>

              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-50"
                disabled={isLoading || isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </>
      )}
    </ShowcaseSection>
  );
}
