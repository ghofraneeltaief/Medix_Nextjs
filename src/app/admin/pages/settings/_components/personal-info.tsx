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

  // Charger le profil
  const loadProfile = async () => {
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

      const profile = await getProfile(token);
      setFormData({
        ...profile,
        password: "********", // masquer le mot de passe
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger le profil",
      });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Gestion du submit
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
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

    // Si le mot de passe est "********", on ne l’envoie pas pour éviter de l’écraser
    const submitData = {
      ...formData,
      password: formData.password === "********" ? undefined : formData.password,
    };

    const updatedRaw = await updateUser(token, formData.id, submitData);

    // ⚡ Transformer id en string pour TypeScript
    const updated: UserProfile = {
      ...updatedRaw,
      id: updatedRaw.id?.toString() || "",
      password: "********", // masquer le mot de passe
    };

    setFormData(updated);

    Swal.fire({
      icon: "success",
      title: "Succès",
      text: "Profil mis à jour avec succès",
    });
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Mise à jour échouée",
    });
  }
};


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ShowcaseSection title="Personal Information" className="!p-7">
      <form onSubmit={handleSubmit}>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="name"
            label="Name"
            value={formData.name}
            handleChange={handleInputChange}
            placeholder="name"
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            handleChange={handleInputChange}
            placeholder="last name"
            icon={<CallIcon />}
            iconPosition="left"
            height="sm"
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email Address"
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
          label="Password"
          value={formData.password}
          handleChange={handleInputChange}
          placeholder="password"
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            onClick={loadProfile}
          >
            Reload
          </button>

          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
          >
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
