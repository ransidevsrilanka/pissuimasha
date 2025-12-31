import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import AvailableTables from "@/components/AvailableTables";
import ReservationLookup from "@/components/ReservationLookup";
import ReservationConfirm from "@/components/ReservationConfirm";
import SuccessScreen from "@/components/SuccessScreen";

type Screen = "welcome" | "tables" | "reservation" | "confirm" | "success";

interface Reservation {
  name: string;
  phone: string;
  time: string;
  guests: number;
  table: number;
}

interface Table {
  id: number;
  seats: number;
  available: boolean;
  location: string;
}

const Index = () => {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleHasReservation = () => {
    setScreen("reservation");
  };

  const handleNoReservation = () => {
    setScreen("tables");
  };

  const handleBack = () => {
    setScreen("welcome");
    setSelectedReservation(null);
    setSelectedTable(null);
  };

  const handleReservationFound = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setScreen("confirm");
  };

  const handleTableSelected = (table: Table) => {
    setSelectedTable(table);
    setScreen("success");
  };

  const handleReservationConfirmed = () => {
    setScreen("success");
  };

  const handleStartOver = () => {
    setScreen("welcome");
    setSelectedReservation(null);
    setSelectedTable(null);
  };

  return (
    <main className="min-h-screen bg-background">
      {screen === "welcome" && (
        <WelcomeScreen
          onHasReservation={handleHasReservation}
          onNoReservation={handleNoReservation}
        />
      )}

      {screen === "tables" && (
        <AvailableTables
          onBack={handleBack}
          onSelectTable={handleTableSelected}
        />
      )}

      {screen === "reservation" && (
        <ReservationLookup
          onBack={handleBack}
          onFound={handleReservationFound}
          onNotFound={() => setScreen("tables")}
        />
      )}

      {screen === "confirm" && selectedReservation && (
        <ReservationConfirm
          reservation={selectedReservation}
          onConfirm={handleReservationConfirmed}
        />
      )}

      {screen === "success" && (
        <SuccessScreen
          tableNumber={selectedReservation?.table || selectedTable?.id || 1}
          guestCount={selectedReservation?.guests || selectedTable?.seats}
          isReservation={!!selectedReservation}
          onStartOver={handleStartOver}
        />
      )}
    </main>
  );
};

export default Index;
