/**
 * Hooks personnalisés pour la gestion des comptes rendus
 */

import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "@/services/userService";
import { getRendezVous } from "@/services/rendezvous.service";
import { getImageries } from "@/services/imageService";
import { getComptesRendus } from "@/services/compteRenduService";
import {
  createImageriesMap,
  createComptesRendusMap,
  combineRendezVousData,
  RendezVousAvecImagerie,
} from "./utils";

/**
 * Hook pour gérer le chargement et la mise à jour des données
 */
export function useCompteRenduData() {
  const [data, setData] = useState<RendezVousAvecImagerie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rendezVousData, imageriesData, comptesRendusData] = await Promise.all([
        getRendezVous(),
        getImageries(),
        getComptesRendus(),
      ]);

      const imageriesMap = createImageriesMap(imageriesData);
      const comptesRendusMap = createComptesRendusMap(comptesRendusData);
      const combined = combineRendezVousData(rendezVousData, imageriesMap, comptesRendusMap);

      setData(combined);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, reloadData: loadData };
}

/**
 * Hook pour gérer l'authentification et récupérer l'ID du médecin
 */
export function useMedecinId() {
  const [medecinId, setMedecinId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMedecinId = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const profile = await getProfile(token);
        setMedecinId(Number(profile.id) || null);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        try {
          const decoded: any = jwtDecode(token);
          setMedecinId(decoded.sub || decoded.userId || decoded.id || null);
        } catch (decodeError) {
          console.error("Erreur lors du décodage du token:", decodeError);
        }
      }
    };

    fetchMedecinId();
  }, []);

  const getCurrentMedecinId = useCallback(async (): Promise<number | null> => {
    if (medecinId) return medecinId;

    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const profile = await getProfile(token);
      const id = Number(profile.id);
      if (id) setMedecinId(id);
      return id || null;
    } catch (error) {
      try {
        const decoded: any = jwtDecode(token);
        const id = decoded.sub || decoded.userId || decoded.id || null;
        if (id) setMedecinId(id);
        return id;
      } catch {
        return null;
      }
    }
  }, [medecinId]);

  return { medecinId, getCurrentMedecinId };
}

/**
 * Hook pour gérer l'affichage/masquage du header lors de l'ouverture des modals
 */
export function useHeaderVisibility(showModal: boolean, showViewModal: boolean) {
  useEffect(() => {
    const isModalOpen = showViewModal || showModal;
    const header = document.querySelector("header");

    if (header) {
      header.style.display = isModalOpen ? "none" : "";
    }

    return () => {
      if (header) {
        header.style.display = "";
      }
    };
  }, [showViewModal, showModal]);
}

/**
 * Hook pour gérer le rôle de l'utilisateur
 */
export function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const isReadOnly = userRole === "médecin";

  return { userRole, isReadOnly };
}
