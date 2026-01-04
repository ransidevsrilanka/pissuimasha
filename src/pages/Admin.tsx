import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, Wifi, WifiOff, Save, RefreshCw, Send, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMQTTContext } from "@/contexts/MQTTContext";

const Admin = () => {
  const { isConnected, status, brokerConfig, setBrokerConfig, error, reconnect, sendTestRequest } = useMQTTContext();
  
  const [newHost, setNewHost] = useState(brokerConfig.host);
  const [newPort, setNewPort] = useState(brokerConfig.port.toString());
  const [newPath, setNewPath] = useState(brokerConfig.path);
  const [newUseSSL, setNewUseSSL] = useState(brokerConfig.useSSL);
  const [saved, setSaved] = useState(false);

  const hasChanges = 
    newHost !== brokerConfig.host ||
    parseInt(newPort) !== brokerConfig.port ||
    newPath !== brokerConfig.path ||
    newUseSSL !== brokerConfig.useSSL;

  const handleSave = () => {
    if (newHost.trim() && hasChanges) {
      setBrokerConfig({
        host: newHost.trim(),
        port: parseInt(newPort) || 9001,
        path: newPath || '/mqtt',
        useSSL: newUseSSL,
      });
      setSaved(true);
    }
  };

  const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';

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
        <div className="w-full max-w-lg space-y-6 animate-fade-in-up">
          
          {/* HTTPS Warning */}
          {isHTTPS && !newUseSSL && (
            <div className="p-4 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-500 font-body text-sm font-medium">
                    HTTPS → WS Connection Issue
                  </p>
                  <p className="text-yellow-500/80 font-body text-xs mt-1">
                    This page is served over HTTPS, but you're trying to connect to an insecure WebSocket (ws://). 
                    Browsers block this. Either enable SSL below, or run this app locally with HTTP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Connection Status
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status === 'connected' ? (
                  <>
                    <Wifi className="w-6 h-6 text-green-500" />
                    <span className="text-green-500 font-body">Connected to Raspberry Pi</span>
                  </>
                ) : status === 'connecting' ? (
                  <>
                    <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" />
                    <span className="text-yellow-500 font-body">Connecting...</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-6 h-6 text-destructive" />
                    <span className="text-destructive font-body">Disconnected</span>
                  </>
                )}
              </div>
              {status !== 'connecting' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reconnect}
                  className="border-gold/50 text-gold hover:bg-gold/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
            {error && (
              <p className="text-destructive text-sm font-body mt-3 p-3 rounded-lg bg-destructive/10">
                {error}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted-foreground font-body text-xs">
                Current: {brokerConfig.useSSL ? 'wss' : 'ws'}://{brokerConfig.host}:{brokerConfig.port}{brokerConfig.path}
              </p>
            </div>
          </div>

          {/* Broker Configuration */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Broker Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground font-body text-sm mb-2 block">
                  Raspberry Pi IP Address
                </Label>
                <Input
                  type="text"
                  placeholder="192.168.1.100"
                  value={newHost}
                  onChange={(e) => {
                    setNewHost(e.target.value);
                    setSaved(false);
                  }}
                  className="h-12 px-4 text-lg bg-background border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground font-body text-sm mb-2 block">
                    Port
                  </Label>
                  <Input
                    type="number"
                    placeholder="9001"
                    value={newPort}
                    onChange={(e) => {
                      setNewPort(e.target.value);
                      setSaved(false);
                    }}
                    className="h-12 px-4 bg-background border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground font-body text-sm mb-2 block">
                    WebSocket Path
                  </Label>
                  <Input
                    type="text"
                    placeholder="/mqtt"
                    value={newPath}
                    onChange={(e) => {
                      setNewPath(e.target.value);
                      setSaved(false);
                    }}
                    className="h-12 px-4 bg-background border-2 border-border focus:border-gold rounded-xl font-body text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                <div>
                  <Label className="text-foreground font-body">Use SSL (wss://)</Label>
                  <p className="text-muted-foreground font-body text-xs mt-1">
                    Enable for secure connections (requires TLS on Pi)
                  </p>
                </div>
                <Switch
                  checked={newUseSSL}
                  onCheckedChange={(checked) => {
                    setNewUseSSL(checked);
                    setSaved(false);
                  }}
                />
              </div>

              <Button
                variant="gold"
                size="lg"
                onClick={handleSave}
                disabled={!newHost.trim() || !hasChanges}
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

          {/* Test Tools */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Debug Tools
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                onClick={sendTestRequest}
                disabled={!isConnected}
                className="w-full border-gold/50 text-gold hover:bg-gold/10 disabled:opacity-50"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Test Table Request
              </Button>
              <p className="text-muted-foreground font-body text-xs text-center">
                {isConnected 
                  ? "Click to send a test request. Check browser console (F12) and Pi terminal for logs."
                  : "Connect to the broker first to send test requests."}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Setup Instructions
            </h2>
            <ol className="text-muted-foreground font-body text-sm space-y-2 list-decimal list-inside">
              <li>Ensure Raspberry Pi and this device are on the same WiFi network</li>
              <li>Run <code className="text-gold bg-background px-1 rounded">hostname -I</code> on your Pi to get its IP</li>
              <li>Enter the IP address above (default port 9001, path /mqtt)</li>
              <li>Make sure the Python server is running on the Pi</li>
              <li>If on HTTPS, you may need to enable SSL or run locally</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
