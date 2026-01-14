"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import InputGroup from "../FormElements/InputGroup";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/services/authService";
import { Alert } from "../ui-elements/alert";

export default function SigninWithPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      
      // Stocker aussi dans les cookies pour le middleware
      document.cookie = `token=${res.access_token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${res.role}; path=/; max-age=86400; SameSite=Lax`;
      // alert de succès
      setAlert({
        variant: "success",
        title: "Connexion réussie !",
        description: "Vous êtes connecté avec succès.",
      });

      // 🔹 Redirection selon rôle ou vers la page demandée
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
      } else {
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
            router.push("/radiologue/image");
            break;
          case "technicien":
            router.push("/technicien/image");
            break;
          default:
            router.push("/"); // fallback
        }
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
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <InputGroup
            type="email"
            label="Adresse email"
            className="mb-4 [&_input]:py-[15px] [&_input]:rounded-lg [&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-primary/20"
            placeholder="votre.email@exemple.com"
            name="email"
            handleChange={handleChange}
            value={data.email}
            icon={<EmailIcon />}
          />
        </div>

        <div>
          <InputGroup
            type="password"
            label="Mot de passe"
            className="mb-5 [&_input]:py-[15px] [&_input]:rounded-lg [&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-primary/20"
            placeholder="••••••••"
            name="password"
            handleChange={handleChange}
            value={data.password}
            icon={<PasswordIcon />}
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Se connecter</span>
            </>
          )}
        </button>

        {/* Informations supplémentaires */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </form>
    </>
  );
}
