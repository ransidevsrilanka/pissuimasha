import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface SuccessScreenProps {
  tableNumber: number;
  guestCount?: number;
  isReservation?: boolean;
  onStartOver: () => void;
}

const SuccessScreen = ({ tableNumber, guestCount, isReservation, onStartOver }: SuccessScreenProps) => {
  useEffect(() => {
    // Auto-reset after 10 seconds
    const timeout = setTimeout(() => {
      onStartOver();
    }, 15000);

    return () => clearTimeout(timeout);
  }, [onStartOver]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background with celebratory feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gold/10 blur-3xl rounded-full pointer-events-none animate-pulse" />

      {/* Sparkle decorations */}
      <div className="absolute top-1/4 left-1/4 text-gold/40 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute top-1/3 right-1/4 text-gold/30 animate-pulse" style={{ animationDelay: "0.5s" }}>
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="absolute bottom-1/3 left-1/3 text-gold/20 animate-pulse" style={{ animationDelay: "1s" }}>
        <Sparkles className="w-10 h-10" />
      </div>

      {/* Main content */}
      <div className="text-center space-y-8 animate-fade-in-up z-10">
        {/* Large table number */}
        <div className="space-y-4">
          <p className="text-gold font-body text-xl tracking-widest uppercase">
            {isReservation ? "Your Reserved Table" : "Your Table"}
          </p>
          <div className="relative inline-block">
            <span className="font-display text-[180px] md:text-[220px] text-foreground leading-none">
              {tableNumber}
            </span>
            <div className="absolute -inset-4 bg-gold/10 blur-3xl rounded-full -z-10" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 max-w-md mx-auto">
          <h2 className="font-display text-4xl text-foreground">
            Please Follow Me
          </h2>
          {guestCount && (
            <p className="text-muted-foreground font-body text-lg">
              Party of {guestCount} • Table {tableNumber}
            </p>
          )}
        </div>

        {/* Animated arrow */}
        <div className="flex justify-center pt-8">
          <div className="animate-bounce">
            <ArrowRight className="w-12 h-12 text-gold" />
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <Button
          variant="ghost"
          onClick={onStartOver}
          className="text-muted-foreground hover:text-gold"
        >
          Start Over
        </Button>
      </div>

      {/* Shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 animate-shimmer" />
    </div>
  );
};

export default SuccessScreen;
