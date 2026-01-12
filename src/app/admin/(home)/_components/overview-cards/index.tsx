"use client";

import React, { useEffect, useState } from "react";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { compactFormat } from "@/lib/format-number";
import { getOverviewData, OverviewData } from "@/services/dashboard.service";

export function OverviewCardsGroup() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overview = await getOverviewData();
        setData(overview);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!data) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Nombre des actes"
        data={{ value: compactFormat(data.actes.value), growthRate: 0 }}
        Icon={icons.Product}
      />
      <OverviewCard
        label="Médecins"
        data={{ value: compactFormat(data.medecins.value), growthRate: 0 }}
        Icon={icons.Users}
      />
      <OverviewCard
        label="Techniciens"
        data={{ value: compactFormat(data.techniciens.value), growthRate: 0 }}
        Icon={icons.Users}
      />
      <OverviewCard
        label="Médecins radiologues"
        data={{ value: compactFormat(data.radiologues.value), growthRate: 0 }}
        Icon={icons.Users}
      />
    </div>
  );
}
