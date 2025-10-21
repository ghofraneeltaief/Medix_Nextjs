"use client";
import { CallIcon, EmailIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui-elements/alert";
import { getProfile, updateUser, UserProfile } from "@/services/userService";

export function PersonalInfoForm() {
 const [formData, setFormData] = useState<UserProfile>({
    id: "",
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

  const [alert, setAlert] = useState<{
    variant: "error" | "success";
    title: string;
    description: string;
  } | null>(null);

  // Charger le profil
  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token")!;
      const profile = await getProfile(token);
      setFormData(profile);
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: "Impossible de charger le profil",
      });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token")!;
      const updated = await updateUser(token, formData.id, formData);
      setFormData(updated);
      setAlert({
        variant: "success",
        title: "Succès",
        description: "Profil mis à jour",
      });
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Erreur",
        description: "Mise à jour échouée",
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
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          description={alert.description}
          className="mb-4"
        />
      )}
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
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
          >
            Cancel
          </button>

          <button
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
