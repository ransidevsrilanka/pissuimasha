import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTimeBasedGreeting, getCurrentTime } from "@/utils/greeting";

interface WelcomeScreenProps {
  onHasReservation: () => void;
  onNoReservation: () => void;
}

const WelcomeScreen = ({ onHasReservation, onNoReservation }: WelcomeScreenProps) => {
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
      setCurrentTime(getCurrentTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-light/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
      
      {/* Time display */}
      <div className="absolute top-8 right-8 text-muted-foreground font-body text-lg">
        {currentTime}
      </div>

      {/* Main content */}
      <div className="text-center space-y-12 animate-fade-in-up z-10">
        {/* Greeting */}
        <div className="space-y-4">
          <p className="text-gold font-body text-xl tracking-widest uppercase">Welcome to</p>
          <h1 className="font-display text-7xl md:text-8xl text-foreground tracking-tight">
            Hi, {greeting}!
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
        </div>

        {/* Question */}
        <div className="space-y-8 pt-8" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-display text-4xl md:text-5xl text-foreground/90">
            Do you have a Reservation?
          </h2>
        </div>

        {/* Buttons */}
        <div className="flex gap-8 justify-center pt-8" style={{ animationDelay: "0.4s" }}>
          <Button
            variant="gold"
            size="xl"
            onClick={onHasReservation}
            className="min-w-[180px] animate-scale-in"
            style={{ animationDelay: "0.5s" }}
          >
            Yes
          </Button>
          <Button
            variant="gold-outline"
            size="xl"
            onClick={onNoReservation}
            className="min-w-[180px] animate-scale-in"
            style={{ animationDelay: "0.6s" }}
          >
            No
          </Button>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
};

export default WelcomeScreen;
