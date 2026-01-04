import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { useMQTTContext } from "@/contexts/MQTTContext";
import type { Table } from "@/types/mqtt";

interface AvailableTablesProps {
  onBack: () => void;
  onSelectTable: (table: Table) => void;
}

const AvailableTables = ({ onBack, onSelectTable }: AvailableTablesProps) => {
  const { requestAvailableTables, isConnected } = useMQTTContext();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      if (!isConnected) {
        setError("Not connected to reservation system");
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].substring(0, 5);
        
        const availableTables = await requestAvailableTables(date, time);
        setTables(availableTables);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [isConnected, requestAvailableTables]);

  const handleConfirm = () => {
    if (selectedTable) {
      onSelectTable(selectedTable);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-light/30 via-transparent to-transparent pointer-events-none" />
        <div className="text-center space-y-4 z-10">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto" />
          <p className="text-muted-foreground font-body text-lg">
            Loading available tables...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-light/30 via-transparent to-transparent pointer-events-none" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute top-8 left-8 text-gold hover:text-gold-light hover:bg-gold/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="text-center space-y-4 z-10">
          <p className="text-destructive font-body text-lg">{error}</p>
          <Button variant="gold-outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
            {tables.length} tables available right now
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
            onClick={() => setSelectedTable(table)}
            className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300 animate-fade-in-up
              ${
                selectedTable?.id === table.id
                  ? "border-gold bg-gold/20 shadow-gold"
                  : "border-border bg-card hover:border-gold/50 hover:bg-card/80"
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
                <span className="font-display text-3xl">{table.capacity}</span>
              </div>
              <p className="text-foreground font-body text-sm">seats</p>
              <p className="text-muted-foreground font-body text-xs mt-2">
                {table.location}
              </p>
            </div>

            {/* Available badge */}
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500" />

            {/* Selected indicator */}
            {selectedTable?.id === table.id && (
              <div className="absolute inset-0 rounded-2xl ring-2 ring-gold animate-pulse-gold pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-body text-lg">
            No tables available at the moment
          </p>
        </div>
      )}

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
