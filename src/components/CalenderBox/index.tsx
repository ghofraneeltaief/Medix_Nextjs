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
  const [editingRdvIndex, setEditingRdvIndex] = useState<number | null>(null);
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
    id_acte: r.acte?.Id_Acte,      // 👈 ICI
    id_medecin: r.medecin?.id,     // 👈 ICI
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
    setEditingRdvIndex(null);
    setShowModal(true);
  };

  // Click sur RDV pour modification
  const handleRdvClick = (rdv: RendezVous, index: number) => {
    setFormData({
      nom_patient: rdv.nom_patient,
      date: rdv.date,
      heure: rdv.heure,
      id_acte: String(rdv.id_acte),
      id_medecin: String(rdv.id_medecin),
    });
    setEditingRdvIndex(index);
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

  const payload: RendezVous = {
    nom_patient: formData.nom_patient,
    date: formData.date,
    heure: formData.heure,
    id_acte: Number(formData.id_acte),
    id_medecin: Number(formData.id_medecin),
  };

  try {
    if (editingRdvIndex !== null) {
      // 🔁 MODIFICATION
      const rdvToUpdate = rendezvous[editingRdvIndex];
      await updateRendezVous(rdvToUpdate.id!, payload);

      await Swal.fire({
        icon: "success",
        title: "Rendez-vous modifié",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.reload(); // 🔄
    } else {
      // ➕ AJOUT
      await createRendezVous(payload);

      await Swal.fire({
        icon: "success",
        title: "Rendez-vous ajouté",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.reload(); // 🔄
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Une erreur est survenue",
    });
    console.error(err);
  }
};
  const handleDelete = async () => {
  if (editingRdvIndex === null) return;

  const rdvToDelete = rendezvous[editingRdvIndex];

  const result = await Swal.fire({
    title: "Êtes-vous sûr ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  });

  if (!result.isConfirmed) return;

  try {
    if (rdvToDelete.id) {
      await deleteRendezVous(rdvToDelete.id);
    }

    setRendezvous((prev) =>
      prev.filter((_, i) => i !== editingRdvIndex)
    );

    setShowModal(false);
    setEditingRdvIndex(null);

    Swal.fire({
      icon: "success",
      title: "Supprimé",
      text: "Le rendez-vous a été supprimé",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Impossible de supprimer le rendez-vous",
    });
    console.error(err);
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
                      className={`relative h-28 border border-stroke p-1 text-center ${
                        isPast || isDimanche
                          ? "cursor-not-allowed bg-gray-200"
                          : "cursor-pointer hover:bg-gray-100"
                      } dark:border-dark-3 dark:hover:bg-dark-2`}
                      onClick={() =>
                        !isPast && !isDimanche && handleDayClick(day)
                      }
                    >
                      <span className="font-medium text-dark dark:text-white">
                        {day}
                      </span>
                      {getRdvForDay(day).map((r, idx) => {
                        const rdvHour = Number(r.heure.split(":")[0]);
                        const disableRdv =
                          dayDate.getDay() === 6 && rdvHour > 13;
                        return (
                          <span
                            key={idx}
                            className={`mt-1 block rounded p-1 text-xs ${disableRdv ? "bg-gray-300 text-gray-500" : "bg-primary/20 text-primary"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              !disableRdv &&
                                handleRdvClick(
                                  r,
                                  rendezvous.findIndex((rv) => rv === r),
                                );
                            }}
                          >
                            {r.nom_patient} ({r.heure})
                          </span>
                        );
                      })}
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
              {editingRdvIndex !== null
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
                <label className="block font-medium">Heure</label>
                <input
                  type="time"
                  name="heure"
                  value={formData.heure}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                  max={
                    new Date(formData.date).getDay() === 6 ? "13:00" : undefined
                  }
                />
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
                {editingRdvIndex !== null && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded bg-gray-200 px-4 py-2 text-dark hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  {editingRdvIndex !== null ? "Modifier" : "Enregistrer"}
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
