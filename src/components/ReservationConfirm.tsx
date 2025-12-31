import { Button } from "@/components/ui/button";
import { Check, Users, Clock, MapPin } from "lucide-react";

interface Reservation {
  name: string;
  phone: string;
  time: string;
  guests: number;
  table: number;
}

interface ReservationConfirmProps {
  reservation: Reservation;
  onConfirm: () => void;
}

const ReservationConfirm = ({ reservation, onConfirm }: ReservationConfirmProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-light/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />

      {/* Main content */}
      <div className="w-full max-w-lg space-y-8 animate-fade-in-up z-10">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center animate-scale-in">
            <Check className="w-12 h-12 text-gold" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-5xl md:text-6xl text-foreground">
            Reservation Found!
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            Welcome back, <span className="text-gold">{reservation.name}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />

        {/* Reservation details */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-6 shadow-card">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-gold" />
              </div>
              <p className="text-muted-foreground font-body text-sm">Time</p>
              <p className="text-foreground font-display text-xl">{reservation.time}</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-gold" />
              </div>
              <p className="text-muted-foreground font-body text-sm">Guests</p>
              <p className="text-foreground font-display text-xl">{reservation.guests}</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-gold" />
              </div>
              <p className="text-muted-foreground font-body text-sm">Table</p>
              <p className="text-foreground font-display text-xl">#{reservation.table}</p>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <Button
          variant="gold"
          size="xl"
          onClick={onConfirm}
          className="w-full"
        >
          Check In & Continue
        </Button>
      </div>
    </div>
  );
};

export default ReservationConfirm;
