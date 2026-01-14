"use client";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import { getActes } from "@/services/acteService";
import { getMedecins } from "@/services/userService";
import {
  getRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  deleteRendezVous,
} from "@/services/rendezvous.service";

type Acte = { id: number; nom: string };
type Medecin = { id: number; nom: string };
type RendezVous = {
  id?: number; // optionnel si venant de la base
  nom_patient: string;
  date: string; // YYYY-MM-DD
  heure: string;
  id_acte: number;
  id_medecin: number;
};

const CalendarBox = () => {
  const [showModal, setShowModal] = useState(false);
  
  // Masquer le header quand le modal est ouvert
  useEffect(() => {
    if (showModal) {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
    } else {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    }
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, [showModal]);
  
  const [editingRdvId, setEditingRdvId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nom_patient: "",
    date: "",
    heure: "",
    id_acte: "",
    id_medecin: "",
  });
  const [actes, setActes] = useState<Acte[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear(),
  );

  // Charger actes, medecins et rendez-vous depuis API
  useEffect(() => {
    async function fetchData() {
      try {
        const actesData = await getActes();
        setActes(
          actesData.map((a: any) => ({ id: a.Id_Acte, nom: a.Nom_Acte })),
        );
        console.log("11111111111111111111",actesData);
        const users = await getMedecins();
        const medecinsOnly = users.filter(
          (u: any) => u.role?.toLowerCase() === "médecin",
        );
        setMedecins(
          medecinsOnly.map((u: any) => ({
            id: u.id,
            nom: `${u.name} ${u.lastName}`,
          })),
        );
        const rdvs = await getRendezVous();

setRendezvous(
  rdvs.map((r: any) => ({
    id: r.id,
    nom_patient: r.nom_patient,
    date: r.date,
    heure: r.heure,
    id_acte: r.acte?.Id_Acte || r.id_acte,
    id_medecin: r.medecin?.id || r.id_medecin,
  }))
);

      } catch (err) {
        console.error("Erreur fetch:", err);
      }
    }
    fetchData();
  }, []);

  // Gestion mois
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay(); // 0=dim

  // Click sur jour pour ajout
  const handleDayClick = (day: number) => {
    const dayDate = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dayDate < today || dayDate.getDay() === 0) return; // désactivé pour passé et dimanche

    setFormData({
      nom_patient: "",
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      heure: "",
      id_acte: "",
      id_medecin: "",
    });
    setEditingRdvId(null);
    setShowModal(true);
  };

  // Click sur RDV pour modification
  const handleRdvClick = (rdv: RendezVous) => {
    if (!rdv.id) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de modifier ce rendez-vous (ID manquant)",
      });
      return;
    }

    // Trouver le rendez-vous dans la liste pour s'assurer d'avoir les bonnes valeurs
    const fullRdv = rendezvous.find((r) => r.id === rdv.id);
    if (!fullRdv) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Rendez-vous introuvable",
      });
      return;
    }

    console.log("Données du rendez-vous à modifier:", {
      fullRdv,
      id_acte: fullRdv.id_acte,
      id_medecin: fullRdv.id_medecin,
      actes: actes,
      medecins: medecins,
    });

    // Vérifier que les IDs sont valides
    if (!fullRdv.id_acte || !fullRdv.id_medecin) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: `Données incomplètes: id_acte=${fullRdv.id_acte}, id_medecin=${fullRdv.id_medecin}. Veuillez recharger la page.`,
      });
      return;
    }

    setFormData({
      nom_patient: fullRdv.nom_patient || "",
      date: fullRdv.date,
      heure: fullRdv.heure,
      id_acte: String(fullRdv.id_acte),
      id_medecin: String(fullRdv.id_medecin),
    });
    setEditingRdvId(fullRdv.id || null);
    setShowModal(true);
  };

  // Formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nom_patient.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Veuillez entrer le nom du patient",
      });
      return;
    }

    if (!formData.date) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Veuillez sélectionner une date",
      });
      return;
    }

    // Validation de la date (pas dans le passé, pas un dimanche)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = selectedDate.getDay();

    if (selectedDate < today) {
      Swal.fire({
        icon: "error",
        title: "Date invalide",
        text: "La date ne peut pas être dans le passé",
      });
      return;
    }

    if (dayOfWeek === 0) {
      Swal.fire({
        icon: "error",
        title: "Date invalide",
        text: "Les rendez-vous ne peuvent pas être programmés le dimanche",
      });
      return;
    }

    if (!formData.heure) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Veuillez sélectionner une heure",
      });
      return;
    }

    // Validation de l'heure (entre 8h et 17h, ou 13h max le samedi)
    const [hours, minutes] = formData.heure.split(":").map(Number);
    const hourValue = hours + minutes / 60;
    const isSaturday = new Date(formData.date).getDay() === 6;
    const maxHour = isSaturday ? 13 : 17;

    if (hourValue < 8 || hourValue > maxHour) {
      Swal.fire({
        icon: "error",
        title: "Heure invalide",
        text: `L'heure doit être entre 8h et ${maxHour}h${isSaturday ? " (samedi)" : ""}`,
      });
      return;
    }

    if (!formData.id_acte) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Veuillez sélectionner un acte",
      });
      return;
    }

    if (!formData.id_medecin) {
      Swal.fire({
        icon: "warning",
        title: "Champ requis",
        text: "Veuillez sélectionner un médecin",
      });
      return;
    }

    const idActe = Number(formData.id_acte);
    const idMedecin = Number(formData.id_medecin);

    if (isNaN(idActe) || idActe <= 0 || isNaN(idMedecin) || idMedecin <= 0) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez sélectionner un acte et un médecin valides",
      });
      return;
    }

    const payload: RendezVous = {
      nom_patient: formData.nom_patient.trim(),
      date: formData.date,
      heure: formData.heure,
      id_acte: idActe,
      id_medecin: idMedecin,
    };

    try {
      if (editingRdvId !== null) {
        // 🔁 MODIFICATION
        console.log("Tentative de modification du rendez-vous:", {
          id: editingRdvId,
          payload,
        });
        
        await updateRendezVous(editingRdvId, payload);

        // Recharger les données
        const rdvs = await getRendezVous();
        setRendezvous(
          rdvs.map((r: any) => ({
            id: r.id,
            nom_patient: r.nom_patient,
            date: r.date,
            heure: r.heure,
            id_acte: r.acte?.Id_Acte || r.id_acte,
            id_medecin: r.medecin?.id || r.id_medecin,
          }))
        );

        Swal.fire({
          icon: "success",
          title: "Modifié",
          text: "Le rendez-vous a été modifié avec succès",
          timer: 2000,
          showConfirmButton: false,
        });

        setShowModal(false);
        setEditingRdvId(null);
        setFormData({
          nom_patient: "",
          date: "",
          heure: "",
          id_acte: "",
          id_medecin: "",
        });
      } else {
        // ➕ AJOUT
        await createRendezVous(payload);

        // Recharger les données
        const rdvs = await getRendezVous();
        setRendezvous(
          rdvs.map((r: any) => ({
            id: r.id,
            nom_patient: r.nom_patient,
            date: r.date,
            heure: r.heure,
            id_acte: r.acte?.Id_Acte || r.id_acte,
            id_medecin: r.medecin?.id || r.id_medecin,
          }))
        );

        Swal.fire({
          icon: "success",
          title: "Ajouté",
          text: "Le rendez-vous a été ajouté avec succès",
          timer: 2000,
          showConfirmButton: false,
        });

        setShowModal(false);
        setFormData({
          nom_patient: "",
          date: "",
          heure: "",
          id_acte: "",
          id_medecin: "",
        });
      }
    } catch (err: any) {
      console.error("Erreur:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Une erreur est survenue",
      });
    }
  };
  const handleDelete = async () => {
    if (editingRdvId === null) return;

    const rdvToDelete = rendezvous.find((r) => r.id === editingRdvId);
    if (!rdvToDelete) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Rendez-vous introuvable",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous vraiment supprimer le rendez-vous de "${rdvToDelete.nom_patient}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteRendezVous(editingRdvId);

      // Recharger les données
      const rdvs = await getRendezVous();
      setRendezvous(
        rdvs.map((r: any) => ({
          id: r.id,
          nom_patient: r.nom_patient,
          date: r.date,
          heure: r.heure,
          id_acte: r.acte?.Id_Acte || r.id_acte,
          id_medecin: r.medecin?.id || r.id_medecin,
        }))
      );

      setShowModal(false);
      setEditingRdvId(null);
      setFormData({
        nom_patient: "",
        date: "",
        heure: "",
        id_acte: "",
        id_medecin: "",
      });

      Swal.fire({
        icon: "success",
        title: "Supprimé",
        text: "Le rendez-vous a été supprimé avec succès",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("Erreur:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err?.message || "Impossible de supprimer le rendez-vous",
      });
    }
  };

  const getRdvForDay = (day: number) => {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return rendezvous.filter((r) => r.date === dayStr);
  };

  // Construire semaines
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const weeks: (number | null)[][] = [];
  let dayCounter = 1 - firstDay;
  for (let i = 0; i < 6; i++) {
    const week: (number | null)[] = [];
    for (let j = 0; j < 7; j++) {
      if (dayCounter < 1 || dayCounter > daysInMonth) week.push(null);
      else week.push(dayCounter);
      dayCounter++;
    }
    weeks.push(week);
  }

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const today = new Date();

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
        >
          &lt;
        </button>
        <h2 className="text-lg font-bold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
        >
          &gt;
        </button>
      </div>

      <div className="w-full max-w-full rounded-[10px] bg-white shadow-md dark:bg-gray-dark">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 bg-primary text-white">
              {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((d) => (
                <th
                  key={d}
                  className="flex h-14 items-center justify-center font-semibold"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, row) => (
              <tr key={row} className="grid grid-cols-7">
                {week.map((day, col) => {
                  if (!day) return <td key={col}></td>;
                  const dayDate = new Date(currentYear, currentMonth, day);
                  const isPast = dayDate < new Date(today.setHours(0, 0, 0, 0));
                  const isDimanche = dayDate.getDay() === 0;

                  return (
                    <td
                      key={col}
                      className={`relative h-32 border border-stroke p-1.5 text-center ${
                        isPast || isDimanche
                          ? "cursor-not-allowed bg-gray-100 dark:bg-dark-2 opacity-60"
                          : "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10"
                      } dark:border-dark-3 transition-colors`}
                      onClick={() =>
                        !isPast && !isDimanche && handleDayClick(day)
                      }
                    >
                      <span className={`block font-semibold mb-1 ${
                        isPast || isDimanche
                          ? "text-gray-400 dark:text-gray-600"
                          : "text-dark dark:text-white"
                      }`}>
                        {day}
                      </span>
                      <div className="space-y-0.5 max-h-20 overflow-y-auto">
                        {(() => {
                          const rdvsForDay = getRdvForDay(day).sort((a, b) => 
                            a.heure.localeCompare(b.heure)
                          );
                          const maxVisible = 4;
                          const visibleRdvs = rdvsForDay.slice(0, maxVisible);
                          const remainingCount = rdvsForDay.length - maxVisible;

                          return (
                            <>
                              {visibleRdvs.map((r) => {
                                const rdvHour = Number(r.heure.split(":")[0]);
                                const disableRdv =
                                  dayDate.getDay() === 6 && rdvHour > 13;
                                return (
                                  <span
                                    key={r.id}
                                    className={`block rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate transition-colors ${
                                      disableRdv
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                                        : "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer dark:bg-primary/30 dark:text-primary"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      !disableRdv && handleRdvClick(r);
                                    }}
                                    title={`${r.nom_patient} - ${r.heure}`}
                                  >
                                    <span className="font-semibold">{r.nom_patient}</span>
                                    <span className="block text-[9px] opacity-80">{r.heure}</span>
                                  </span>
                                );
                              })}
                              {remainingCount > 0 && (
                                <button
                                  type="button"
                                  className="w-full rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const rdvsForDay = getRdvForDay(day).sort((a, b) => 
                                      a.heure.localeCompare(b.heure)
                                    );
                                    Swal.fire({
                                      title: `Rendez-vous du ${day} ${monthNames[currentMonth]} ${currentYear}`,
                                      html: `
                                        <div class="text-left max-h-96 overflow-y-auto">
                                          ${rdvsForDay.map((r) => {
                                            const rdvHour = Number(r.heure.split(":")[0]);
                                            const disableRdv = dayDate.getDay() === 6 && rdvHour > 13;
                                            const acteNom = actes.find(a => a.id === r.id_acte)?.nom || "Acte inconnu";
                                            const medecinNom = medecins.find(m => m.id === r.id_medecin)?.nom || "Médecin inconnu";
                                            return `
                                              <div class="mb-3 p-3 border rounded-lg ${disableRdv ? 'bg-gray-100 border-gray-300' : 'bg-primary/5 border-primary/20'}">
                                                <div class="font-semibold text-primary">${r.nom_patient}</div>
                                                <div class="text-sm text-gray-600 mt-1">
                                                  <div>⏰ ${r.heure}</div>
                                                  <div>🏥 ${acteNom}</div>
                                                  <div>👨‍⚕️ ${medecinNom}</div>
                                                </div>
                                                ${disableRdv ? '<div class="text-xs text-red-500 mt-1">⚠️ Samedi après 13h</div>' : ''}
                                                <button 
                                                  onclick="window.handleRdvEdit && window.handleRdvEdit(${r.id}); return false;"
                                                  class="mt-2 px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90 cursor-pointer"
                                                >
                                                  Modifier
                                                </button>
                                              </div>
                                            `;
                                          }).join('')}
                                        </div>
                                      `,
                                      width: "600px",
                                      showCloseButton: true,
                                      confirmButtonText: "Fermer",
                                      didOpen: () => {
                                        (window as any).handleRdvEdit = (id: number) => {
                                          const rdv = rendezvous.find(r => r.id === id);
                                          if (rdv) {
                                            Swal.close();
                                            handleRdvClick(rdv);
                                          }
                                        };
                                      },
                                    });
                                  }}
                                  title={`Cliquez pour voir les ${remainingCount} rendez-vous supplémentaires`}
                                >
                                  +{remainingCount} plus
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            <h2 className="mb-4 text-xl font-semibold text-dark dark:text-white">
              {editingRdvId !== null
                ? "Modifier le rendez-vous"
                : "Ajouter un rendez-vous"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block font-medium">Nom du patient</label>
                <input
                  type="text"
                  name="nom_patient"
                  value={formData.nom_patient}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block font-medium">Heure</label>
                {(() => {
                  // Vérifier si l'heure actuelle est dans la plage valide (8h-17h)
                  const isHourInRange = formData.heure ? (() => {
                    const [hours] = formData.heure.split(":").map(Number);
                    return hours >= 8 && hours <= 17;
                  })() : true;
                  
                  const maxHour = new Date(formData.date).getDay() === 6 ? "13:00" : "17:00";
                  
                  return (
                    <>
                      <input
                        type="time"
                        name="heure"
                        value={formData.heure}
                        onChange={handleChange}
                        className={`w-full rounded border p-2 ${
                          formData.heure && !isHourInRange 
                            ? "border-red-300 bg-red-50" 
                            : "border-gray-300"
                        }`}
                        required
                        min="08:00"
                        max={maxHour}
                      />
                      {formData.heure && !isHourInRange && (
                        <p className="mt-1 text-xs text-red-500">
                          ⚠️ L'heure doit être entre 8h et 17h
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block font-medium">Acte</label>
                <select
                  name="id_acte"
                  value={formData.id_acte} // <- React choisira l'option correspondant à cette valeur
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                >
                  <option value="">-- Sélectionner un acte --</option>
                  {actes.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium">Médecin</label>
                <select
                  name="id_medecin"
                  value={formData.id_medecin} // <- React choisira l'option correspondant à cette valeur
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                >
                  <option value="">-- Sélectionner un médecin --</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                {editingRdvId !== null && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRdvId(null);
                    setFormData({
                      nom_patient: "",
                      date: "",
                      heure: "",
                      id_acte: "",
                      id_medecin: "",
                    });
                  }}
                  className="rounded-lg border border-stroke px-4 py-2 font-medium text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
                >
                  {editingRdvId !== null ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarBox;
