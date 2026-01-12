"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { x: string; y: number }[];
};

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function PaymentsOverviewChart({ data }: PropsType) {
  const isMobile = useIsMobile();

  const options: ApexOptions = {
    chart: { type: "area", height: 310, toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#5750F1"],
    stroke: { curve: "smooth", width: isMobile ? 2 : 3 },
    dataLabels: { enabled: false },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { strokeDashArray: 5, yaxis: { lines: { show: true } } },
    tooltip: { marker: { show: true } },
  };

  return (
    <div className="-ml-4 -mr-5 h-[310px]">
      <Chart series={[{ name: "Rendez-vous", data }]} options={options} type="area" height={310} />
    </div>
  );
}
