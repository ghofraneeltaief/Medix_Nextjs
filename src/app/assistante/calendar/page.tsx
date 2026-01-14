import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendrier",
};

const CalendarPage = () => {
  return (
    <>
      <Breadcrumb pageName="Calendrier" />
      <CalendarBox />
    </>
  );
};

export default CalendarPage;
