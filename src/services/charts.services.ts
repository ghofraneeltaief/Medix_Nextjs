export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      name: "Desktop",
      percentage: 0.65,
      amount: 1625,
    },
    {
      name: "Tablet",
      percentage: 0.1,
      amount: 250,
    },
    {
      name: "Mobile",
      percentage: 0.2,
      amount: 500,
    },
    {
      name: "Unknown",
      percentage: 0.05,
      amount: 125,
    },
  ];

  if (timeFrame === "yearly") {
    data[0].amount = 19500;
    data[1].amount = 3000;
    data[2].amount = 6000;
    data[3].amount = 1500;
  }

  return data;
}

export async function getPaymentsOverviewData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (timeFrame === "yearly") {
    return {
      received: [
        { x: 2020, y: 450 },
        { x: 2021, y: 620 },
        { x: 2022, y: 780 },
        { x: 2023, y: 920 },
        { x: 2024, y: 1080 },
      ],
      due: [
        { x: 2020, y: 1480 },
        { x: 2021, y: 1720 },
        { x: 2022, y: 1950 },
        { x: 2023, y: 2300 },
        { x: 2024, y: 1200 },
      ],
    };
  }

  return {
    received: [
      { x: "Jan", y: 0 },
      { x: "Feb", y: 20 },
      { x: "Mar", y: 35 },
      { x: "Apr", y: 45 },
      { x: "May", y: 35 },
      { x: "Jun", y: 55 },
      { x: "Jul", y: 65 },
      { x: "Aug", y: 50 },
      { x: "Sep", y: 65 },
      { x: "Oct", y: 75 },
      { x: "Nov", y: 60 },
      { x: "Dec", y: 75 },
    ],
    due: [
      { x: "Jan", y: 15 },
      { x: "Feb", y: 9 },
      { x: "Mar", y: 17 },
      { x: "Apr", y: 32 },
      { x: "May", y: 25 },
      { x: "Jun", y: 68 },
      { x: "Jul", y: 80 },
      { x: "Aug", y: 68 },
      { x: "Sep", y: 84 },
      { x: "Oct", y: 94 },
      { x: "Nov", y: 74 },
      { x: "Dec", y: 62 },
    ],
  };
}

export async function getWeeksProfitData(timeFrame?: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Calculer les dates de début et fin de la semaine
  const now = new Date();
  const isLastWeek = timeFrame === "semaine dernière";
  
  // Trouver le samedi de la semaine (début de la semaine)
  // getDay() retourne 0 pour dimanche, 1 pour lundi, ..., 6 pour samedi
  const currentDay = now.getDay();
  // Calculer le nombre de jours à soustraire pour arriver au samedi
  // Si on est dimanche (0), on remonte de 1 jour pour arriver à samedi (6)
  // Si on est lundi (1), on remonte de 2 jours pour arriver à samedi (6)
  // etc.
  let daysToSubtract = 0;
  if (currentDay === 0) {
    // Dimanche, on remonte de 1 jour
    daysToSubtract = 1;
  } else if (currentDay === 6) {
    // Samedi, on ne remonte pas
    daysToSubtract = 0;
  } else {
    // Autres jours, on remonte jusqu'au samedi précédent
    daysToSubtract = currentDay + 1;
  }
  
  const saturday = new Date(now);
  saturday.setDate(now.getDate() - daysToSubtract - (isLastWeek ? 7 : 0));
  saturday.setHours(0, 0, 0, 0);

  // Créer un tableau pour les 7 jours de la semaine
  const daysOfWeek = ["Sam", "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven"];
  const weekData: { [key: string]: { images: number; comptesRendus: number } } = {};
  
  // Initialiser tous les jours à 0
  for (let i = 0; i < 7; i++) {
    const day = new Date(saturday);
    day.setDate(saturday.getDate() + i);
    const dayKey = day.toISOString().split('T')[0];
    weekData[dayKey] = { images: 0, comptesRendus: 0 };
  }

  try {
    // Récupérer les images
    const imagesRes = await fetch(`${API_URL}/imageries`, { cache: "no-store" });
    if (imagesRes.ok) {
      const images = await imagesRes.json();
      images.forEach((image: any) => {
        if (image.rendezVous?.date) {
          const imageDate = new Date(image.rendezVous.date);
          imageDate.setHours(0, 0, 0, 0);
          const imageDateStr = imageDate.toISOString().split('T')[0];
          
          // Vérifier si la date est dans la semaine
          const weekStart = new Date(saturday);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(saturday);
          weekEnd.setDate(saturday.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          
          if (imageDate >= weekStart && imageDate <= weekEnd) {
            if (weekData[imageDateStr]) {
              weekData[imageDateStr].images++;
            }
          }
        }
      });
    }

    // Récupérer les comptes rendus
    const comptesRendusRes = await fetch(`${API_URL}/compterendu`, { cache: "no-store" });
    if (comptesRendusRes.ok) {
      const comptesRendus = await comptesRendusRes.json();
      comptesRendus.forEach((cr: any) => {
        if (cr.date_creation) {
          const crDate = new Date(cr.date_creation);
          crDate.setHours(0, 0, 0, 0);
          const crDateStr = crDate.toISOString().split('T')[0];
          
          // Vérifier si la date est dans la semaine
          const weekStart = new Date(saturday);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(saturday);
          weekEnd.setDate(saturday.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          
          if (crDate >= weekStart && crDate <= weekEnd) {
            if (weekData[crDateStr]) {
              weekData[crDateStr].comptesRendus++;
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }

  // Construire les données pour le graphique
  const imagesData: { x: string; y: number }[] = [];
  const comptesRendusData: { x: string; y: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(saturday);
    day.setDate(saturday.getDate() + i);
    const dayKey = day.toISOString().split('T')[0];
    const dayName = daysOfWeek[i];
    
    imagesData.push({
      x: dayName,
      y: weekData[dayKey]?.images || 0,
    });
    
    comptesRendusData.push({
      x: dayName,
      y: weekData[dayKey]?.comptesRendus || 0,
    });
  }

  return {
    images: imagesData,
    comptesRendus: comptesRendusData,
  };
}

export async function getCampaignVisitorsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_visitors: 784_000,
    performance: -1.5,
    chart: [
      { x: "S", y: 168 },
      { x: "S", y: 385 },
      { x: "M", y: 201 },
      { x: "T", y: 298 },
      { x: "W", y: 187 },
      { x: "T", y: 195 },
      { x: "F", y: 291 },
    ],
  };
}

export async function getVisitorsAnalyticsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212, 270,
    190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312,
  ].map((value, index) => ({ x: index + 1 + "", y: value }));
}

export async function getCostsPerInteractionData() {
  return {
    avg_cost: 560.93,
    growth: 2.5,
    chart: [
      {
        name: "Google Ads",
        data: [
          { x: "Sep", y: 15 },
          { x: "Oct", y: 12 },
          { x: "Nov", y: 61 },
          { x: "Dec", y: 118 },
          { x: "Jan", y: 78 },
          { x: "Feb", y: 125 },
          { x: "Mar", y: 165 },
          { x: "Apr", y: 61 },
          { x: "May", y: 183 },
          { x: "Jun", y: 238 },
          { x: "Jul", y: 237 },
          { x: "Aug", y: 235 },
        ],
      },
      {
        name: "Facebook Ads",
        data: [
          { x: "Sep", y: 75 },
          { x: "Oct", y: 77 },
          { x: "Nov", y: 151 },
          { x: "Dec", y: 72 },
          { x: "Jan", y: 7 },
          { x: "Feb", y: 58 },
          { x: "Mar", y: 60 },
          { x: "Apr", y: 185 },
          { x: "May", y: 239 },
          { x: "Jun", y: 135 },
          { x: "Jul", y: 119 },
          { x: "Aug", y: 124 },
        ],
      },
    ],
  };
}