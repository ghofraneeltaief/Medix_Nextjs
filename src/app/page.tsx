import Signin from "@/components/Signin";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RedirectIfAuthenticated from "@/components/Signin/RedirectIfAuthenticated";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function SignIn() {
  return (
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-6xl">
          <div className="bg-white dark:bg-gray-dark rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap items-stretch min-h-[600px]">
              {/* Section formulaire de connexion */}
              <div className="w-full xl:w-1/2 flex items-center">
                <div className="w-full p-8 sm:p-12 xl:p-16">
                  {/* Logo et titre */}
                  <div className="mb-8">
                    <Link className="inline-block mb-6" href="/">
                      <Image
                        className="dark:hidden h-10 w-auto"
                        src={"/images/logo_pl_radiologie.png"}
                        alt="Logo Centre de Radiologie"
                        width={200}
                        height={40}
                        priority
                      />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Bienvenue
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Connectez-vous à votre espace professionnel
                    </p>
                  </div>

                  <Signin />
                </div>
              </div>

              {/* Section visuelle */}
              <div className="hidden xl:flex xl:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
                {/* Motifs décoratifs */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
                </div>

                {/* Contenu de la section visuelle */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
                  <div>
                    <h2 className="text-4xl font-bold mb-4">
                      Centre de Radiologie
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                      Système de gestion médicale
                    </p>
                  </div>

                  {/* Icônes et informations */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Gestion complète</h3>
                        <p className="text-blue-100 text-sm">Rendez-vous, imageries et comptes rendus</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Sécurisé</h3>
                        <p className="text-blue-100 text-sm">Protection des données médicales</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Rapide et efficace</h3>
                        <p className="text-blue-100 text-sm">Interface intuitive et moderne</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer de la section */}
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <p className="text-blue-100 text-sm">
                      © 2025 Centre de Radiologie. Tous droits réservés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
