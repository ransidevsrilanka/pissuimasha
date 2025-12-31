import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

interface Table {
  id: number;
  seats: number;
  available: boolean;
  location: string;
}

interface AvailableTablesProps {
  onBack: () => void;
  onSelectTable: (table: Table) => void;
}

const tables: Table[] = [
  { id: 1, seats: 2, available: true, location: "Window" },
  { id: 2, seats: 2, available: true, location: "Garden View" },
  { id: 3, seats: 4, available: true, location: "Center" },
  { id: 4, seats: 4, available: false, location: "Private" },
  { id: 5, seats: 6, available: true, location: "Corner" },
  { id: 6, seats: 6, available: true, location: "Terrace" },
  { id: 7, seats: 8, available: false, location: "VIP Room" },
  { id: 8, seats: 4, available: true, location: "Bar Side" },
];

const AvailableTables = ({ onBack, onSelectTable }: AvailableTablesProps) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const availableTables = tables.filter((t) => t.available);

  const handleConfirm = () => {
    if (selectedTable) {
      onSelectTable(selectedTable);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-light/30 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gold hover:text-gold-light hover:bg-gold/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground">
            Available Tables
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            {availableTables.length} tables available right now
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8" />

      {/* Tables Grid */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 z-10">
        {tables.map((table, index) => (
          <button
            key={table.id}
            onClick={() => table.available && setSelectedTable(table)}
            disabled={!table.available}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300 animate-fade-in-up
              ${
                table.available
                  ? selectedTable?.id === table.id
                    ? "border-gold bg-gold/20 shadow-gold"
                    : "border-border bg-card hover:border-gold/50 hover:bg-card/80"
                  : "border-border/50 bg-card/30 opacity-50 cursor-not-allowed"
              }
            `}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Table number */}
            <div className="absolute top-4 left-4 text-muted-foreground font-body text-sm">
              Table {table.id}
            </div>

            {/* Seats indicator */}
            <div className="flex flex-col items-center justify-center h-full pt-4">
              <div className="flex items-center gap-2 text-gold mb-2">
                <Users className="w-6 h-6" />
                <span className="font-display text-3xl">{table.seats}</span>
              </div>
              <p className="text-foreground font-body text-sm">seats</p>
              <p className="text-muted-foreground font-body text-xs mt-2">
                {table.location}
              </p>
            </div>

            {/* Availability badge */}
            <div
              className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                table.available ? "bg-green-500" : "bg-red-500"
              }`}
            />

            {/* Selected indicator */}
            {selectedTable?.id === table.id && (
              <div className="absolute inset-0 rounded-2xl ring-2 ring-gold animate-pulse-gold pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-center z-10">
        <Button
          variant="gold"
          size="xl"
          onClick={handleConfirm}
          disabled={!selectedTable}
          className={`min-w-[240px] transition-all duration-300 ${
            !selectedTable ? "opacity-50" : ""
          }`}
        >
          {selectedTable
            ? `Confirm Table ${selectedTable.id}`
            : "Select a Table"}
        </Button>
      </div>
    </div>
  );
};

export default AvailableTables;
