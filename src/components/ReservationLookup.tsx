import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, User, Phone, Loader2 } from "lucide-react";
import { useMQTTContext } from "@/contexts/MQTTContext";
import type { Reservation } from "@/types/mqtt";

interface ReservationLookupProps {
  onBack: () => void;
  onFound: (reservation: Reservation) => void;
  onNotFound: () => void;
}

const ReservationLookup = ({ onBack, onFound, onNotFound }: ReservationLookupProps) => {
  const { lookupReservation, isConnected } = useMQTTContext();
  const [searchType, setSearchType] = useState<"name" | "phone">("name");
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setError("");
    setLoading(true);

    try {
      const reservation = await lookupReservation(
        searchType === "name" ? searchValue : undefined,
        searchType === "phone" ? searchValue : undefined
      );

      if (reservation) {
        onFound(reservation);
      } else {
        setError("No reservation found. Please check your details or speak with our staff.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup reservation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-light/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="absolute top-8 left-8 text-gold hover:text-gold-light hover:bg-gold/10"
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>

      {/* Main content */}
      <div className="w-full max-w-lg space-y-8 animate-fade-in-up z-10">
        <div className="text-center space-y-4">
          <h1 className="font-display text-5xl md:text-6xl text-foreground">
            Find Your Reservation
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            Search by name or phone number
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />

        {/* Search type toggle */}
        <div className="flex gap-4 justify-center">
          <Button
            variant={searchType === "name" ? "gold" : "gold-outline"}
            size="lg"
            onClick={() => setSearchType("name")}
            className="min-w-[120px]"
          >
            <User className="w-4 h-4 mr-2" />
            Name
          </Button>
          <Button
            variant={searchType === "phone" ? "gold" : "gold-outline"}
            size="lg"
            onClick={() => setSearchType("phone")}
            className="min-w-[120px]"
          >
            <Phone className="w-4 h-4 mr-2" />
            Phone
          </Button>
        </div>

        {/* Search input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={searchType === "phone" ? "tel" : "text"}
              placeholder={
                searchType === "name"
                  ? "Enter your name..."
                  : "Enter your phone number..."
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-16 pl-6 pr-14 text-xl bg-card border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          </div>

          {error && (
            <p className="text-destructive text-center font-body animate-fade-in-up">
              {error}
            </p>
          )}

          {!isConnected && (
            <p className="text-destructive text-center font-body text-sm">
              Not connected to reservation system
            </p>
          )}
        </div>

        {/* Search button */}
        <Button
          variant="gold"
          size="xl"
          onClick={handleSearch}
          disabled={!searchValue.trim() || loading || !isConnected}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            "Find Reservation"
          )}
        </Button>

        {/* No reservation option */}
        <div className="text-center">
          <button
            onClick={onNotFound}
            className="text-gold hover:text-gold-light font-body transition-colors"
          >
            Don't have a reservation? View available tables →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationLookup;
