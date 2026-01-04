import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import AvailableTables from "@/components/AvailableTables";
import ReservationLookup from "@/components/ReservationLookup";
import ReservationConfirm from "@/components/ReservationConfirm";
import SuccessScreen from "@/components/SuccessScreen";
import ReservationForm from "@/components/ReservationForm";
import ConnectionStatus from "@/components/ConnectionStatus";
import type { Table, Reservation } from "@/types/mqtt";

type Screen = "welcome" | "tables" | "reservation" | "confirm" | "form" | "success";

// Adapter type for ReservationConfirm which expects the old format
interface LegacyReservation {
  name: string;
  phone: string;
  time: string;
  guests: number;
  table: number;
}

const Index = () => {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);

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
    setReservationId(null);
  };

  const handleReservationFound = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setScreen("confirm");
  };

  const handleTableSelected = (table: Table) => {
    setSelectedTable(table);
    setScreen("form");
  };

  const handleReservationCreated = (resId: string) => {
    setReservationId(resId);
    setScreen("success");
  };

  const handleReservationConfirmed = () => {
    setScreen("success");
  };

  const handleStartOver = () => {
    setScreen("welcome");
    setSelectedReservation(null);
    setSelectedTable(null);
    setReservationId(null);
  };

  // Convert MQTT Reservation to legacy format for ReservationConfirm
  const getLegacyReservation = (): LegacyReservation | null => {
    if (!selectedReservation) return null;
    return {
      name: selectedReservation.customer_name,
      phone: selectedReservation.phone,
      time: selectedReservation.time,
      guests: selectedReservation.party_size,
      table: selectedReservation.table_id,
    };
  };

  return (
    <main className="min-h-screen bg-background">
      <ConnectionStatus />

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

      {screen === "confirm" && getLegacyReservation() && (
        <ReservationConfirm
          reservation={getLegacyReservation()!}
          onConfirm={handleReservationConfirmed}
        />
      )}

      {screen === "form" && selectedTable && (
        <ReservationForm
          table={selectedTable}
          onBack={() => setScreen("tables")}
          onSuccess={handleReservationCreated}
        />
      )}

      {screen === "success" && (
        <SuccessScreen
          tableNumber={selectedReservation?.table_id || selectedTable?.id || 1}
          guestCount={selectedReservation?.party_size || selectedTable?.capacity}
          isReservation={!!selectedReservation}
          onStartOver={handleStartOver}
        />
      )}
    </main>
  );
};

export default Index;
