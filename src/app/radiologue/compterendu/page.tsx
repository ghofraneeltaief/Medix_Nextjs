import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableCompteRendu } from "@/components/Tables/compteRendu/TableCompteRendu";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comptes rendus",
};

export default function CompteRenduPage() {
  return (
    <>
      <Breadcrumb pageName="Comptes rendus" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <TableCompteRendu />
      </div>
    </>
  );
}
