import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TableCompteRendu } from "@/components/Tables/compteRendu/TableCompteRendu";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tables",
};

export default function CompteRenduPage() {
  return (
    <>
      <Breadcrumb pageName="Comptes rendus" />

      <div className="space-y-10">
        <TableCompteRendu />
      </div>
    </>
  );
};


