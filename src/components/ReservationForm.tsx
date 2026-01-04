import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Phone, Users, Loader2 } from "lucide-react";
import { useMQTTContext } from "@/contexts/MQTTContext";
import type { Table } from "@/types/mqtt";

interface ReservationFormProps {
  table: Table;
  onBack: () => void;
  onSuccess: (reservationId: string) => void;
}

const ReservationForm = ({ table, onBack, onSuccess }: ReservationFormProps) => {
  const { createReservation, isConnected } = useMQTTContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].substring(0, 5);

      const reservation = await createReservation(
        table.id,
        name.trim(),
        phone.trim(),
        date,
        time,
        partySize
      );

      onSuccess(reservation.reservation_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation");
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
            Your Details
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            Table {table.id} • {table.capacity} seats • {table.location}
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />

        {/* Form */}
        <div className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 pl-12 pr-4 text-lg bg-card border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 pl-12 pr-4 text-lg bg-card border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-body flex items-center gap-2">
              <Users className="w-4 h-4" />
              Party size
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5, 6].filter(n => n <= table.capacity).map((num) => (
                <button
                  key={num}
                  onClick={() => setPartySize(num)}
                  className={`w-12 h-12 rounded-xl border-2 font-display text-lg transition-all ${
                    partySize === num
                      ? "border-gold bg-gold/20 text-gold"
                      : "border-border bg-card text-foreground hover:border-gold/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-destructive text-center font-body animate-fade-in-up">
              {error}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          variant="gold"
          size="xl"
          onClick={handleSubmit}
          disabled={loading || !isConnected}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Reservation...
            </>
          ) : (
            "Confirm Reservation"
          )}
        </Button>

        {!isConnected && (
          <p className="text-center text-destructive text-sm font-body">
            Not connected to reservation system
          </p>
        )}
      </div>
    </div>
  );
};

export default ReservationForm;
