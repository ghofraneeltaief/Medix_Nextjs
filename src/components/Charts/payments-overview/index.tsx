// components/dashboard/RendezVousOverview.tsx

import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getRendezVousOverviewData } from "@/services/rendezvous.service";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function PaymentsOverview({ timeFrame = "monthly", className }: PropsType) {
  // ⚠️ cast ici pour TypeScript
  const data = await getRendezVousOverviewData(timeFrame as "monthly" | "yearly");

  return (
    <div className={cn(
      "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
      className
    )}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Rendez-vous Overview
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="rendezvous_overview" />
      </div>

      <PaymentsOverviewChart data={data.chart} />

      <div className="text-center mt-4">
        <span className="text-xl font-bold text-dark dark:text-white">
          Total Rendez-vous: {data.total}
        </span>
      </div>
    </div>
  );
}

