import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Wifi, WifiOff, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useMQTTContext } from "@/contexts/MQTTContext";

const Admin = () => {
  const { isConnected, brokerIP, setBrokerIP, error } = useMQTTContext();
  const [newIP, setNewIP] = useState(brokerIP);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (newIP.trim() && newIP !== brokerIP) {
      setBrokerIP(newIP.trim());
      setSaved(true);
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
          asChild
          className="text-gold hover:text-gold-light hover:bg-gold/10"
        >
          <Link to="/">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-gold" />
          <h1 className="font-display text-4xl md:text-5xl text-foreground">
            Admin Settings
          </h1>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8" />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-lg space-y-8 animate-fade-in-up">
          {/* Connection Status */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Connection Status
            </h2>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <Wifi className="w-6 h-6 text-green-500" />
                  <span className="text-green-500 font-body">Connected to Raspberry Pi</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-destructive" />
                  <span className="text-destructive font-body">Disconnected</span>
                </>
              )}
            </div>
            {error && (
              <p className="text-destructive text-sm font-body mt-2">{error}</p>
            )}
          </div>

          {/* Broker IP Configuration */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Raspberry Pi IP Address
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-4">
              Enter the IP address of your Raspberry Pi running the MQTT broker.
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="192.168.1.100"
                value={newIP}
                onChange={(e) => {
                  setNewIP(e.target.value);
                  setSaved(false);
                }}
                className="h-14 px-4 text-lg bg-background border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant="gold"
                size="lg"
                onClick={handleSave}
                disabled={!newIP.trim() || newIP === brokerIP}
                className="w-full"
              >
                <Save className="w-5 h-5 mr-2" />
                Save & Reconnect
              </Button>
              {saved && (
                <p className="text-gold text-center font-body text-sm">
                  Settings saved! Reconnecting...
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Setup Instructions
            </h2>
            <ol className="text-muted-foreground font-body text-sm space-y-2 list-decimal list-inside">
              <li>Ensure Raspberry Pi and this tablet are on the same WiFi network</li>
              <li>Run <code className="text-gold bg-background px-1 rounded">hostname -I</code> on your Pi to get its IP</li>
              <li>Enter the IP address above and save</li>
              <li>Make sure the Python server is running on the Pi</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
