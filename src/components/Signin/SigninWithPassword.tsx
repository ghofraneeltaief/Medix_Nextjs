"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import { Alert } from "../ui-elements/alert";

export default function SigninWithPassword() {
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "warning";
    title: string;
    description: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(data.email, data.password);
      // 🔑 ici tu récupères ton token et role
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("role", res.role);
      // alert de succès
      setAlert({
        variant: "success",
        title: "Connexion réussie !",
        description: "Vous êtes connecté avec succès.",
      });

      // 🔹 Redirection selon rôle
      switch (res.role) {
        case "admin":
          router.push("/admin");
          break;
        case "assistante":
          router.push("/assistante/calendar");
          break;
        case "médecin":
          router.push("/medecin-externe/image");
          break;
        case "médecin radiologue":
          router.push("/radiologue");
          break;
        case "technicien":
          router.push("/technicien");
          break;
        default:
          router.push("/"); // fallback
      }
    } catch (err: any) {
      setAlert({
        variant: "error",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          description={alert.description}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit}>
        <InputGroup
          type="email"
          label="Email"
          className="mb-4 [&_input]:py-[15px]"
          placeholder="Enter your email"
          name="email"
          handleChange={handleChange}
          value={data.email}
          icon={<EmailIcon />}
        />

        <InputGroup
          type="password"
          label="Password"
          className="mb-5 [&_input]:py-[15px]"
          placeholder="Enter your password"
          name="password"
          handleChange={handleChange}
          value={data.password}
          icon={<PasswordIcon />}
        />

        <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
          <Link
            href="/auth/forgot-password"
            className="hover:text-primary dark:text-white dark:hover:text-primary"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="mb-4.5">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
            disabled={loading}
          >
            Sign In
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
            )}
          </button>
        </div>
      </form>
    </>
  );
}
