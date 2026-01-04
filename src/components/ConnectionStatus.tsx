import { Wifi, WifiOff } from "lucide-react";
import { useMQTTContext } from "@/contexts/MQTTContext";

const ConnectionStatus = () => {
  const { isConnected, brokerIP } = useMQTTContext();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 backdrop-blur border border-border">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-muted-foreground font-body">
            Connected to Pi
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-destructive" />
          <span className="text-xs text-muted-foreground font-body">
            Disconnected ({brokerIP})
          </span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
