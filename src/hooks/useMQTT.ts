import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Paho: {
      MQTT: {
        Client: new (host: string, port: number, clientId: string) => MQTTClient;
        Message: new (payload: string) => MQTTMessage;
      };
    };
  }
}

interface MQTTClient {
  connect: (options: ConnectOptions) => void;
  disconnect: () => void;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
  send: (message: MQTTMessage) => void;
  isConnected: () => boolean;
  onConnectionLost: (response: { errorMessage: string }) => void;
  onMessageArrived: (message: { destinationName: string; payloadString: string }) => void;
}

interface MQTTMessage {
  destinationName: string;
  payloadString: string;
}

interface ConnectOptions {
  onSuccess: () => void;
  onFailure: (error: { errorMessage: string }) => void;
  reconnect?: boolean;
  keepAliveInterval?: number;
}

interface MQTTConfig {
  broker: string;
  port: number;
  clientId?: string;
}

interface UseMQTTReturn {
  isConnected: boolean;
  error: string | null;
  publish: (topic: string, message: unknown) => void;
  subscribe: (topic: string, callback: (message: unknown) => void) => void;
  unsubscribe: (topic: string) => void;
}

export const useMQTT = (config: MQTTConfig): UseMQTTReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MQTTClient | null>(null);
  const subscriptionsRef = useRef<Map<string, (message: unknown) => void>>(new Map());

  useEffect(() => {
    if (!window.Paho) {
      console.error('❌ Paho MQTT library not loaded');
      setError('MQTT library not loaded');
      return;
    }

    const clientId = config.clientId || 'tablet_' + Math.random().toString(16).substr(2, 8);
    const client = new window.Paho.MQTT.Client(config.broker, config.port, clientId);

    client.onConnectionLost = (response) => {
      console.error('❌ MQTT Connection Lost:', response.errorMessage);
      setIsConnected(false);
      setError('Connection lost: ' + response.errorMessage);
    };

    client.onMessageArrived = (message) => {
      const topic = message.destinationName;
      const payload = message.payloadString;

      console.log('📥 Message received on:', topic);

      try {
        const data = JSON.parse(payload);
        const callback = subscriptionsRef.current.get(topic);
        if (callback) {
          callback(data);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    const connectOptions: ConnectOptions = {
      onSuccess: () => {
        console.log('✅ Connected to MQTT Broker');
        setIsConnected(true);
        setError(null);
      },
      onFailure: (err) => {
        console.error('❌ MQTT Connection Failed:', err);
        setIsConnected(false);
        setError('Connection failed: ' + err.errorMessage);
      },
      reconnect: true,
      keepAliveInterval: 30,
    };

    try {
      client.connect(connectOptions);
      clientRef.current = client;
    } catch (err) {
      console.error('❌ MQTT Connection Error:', err);
      setError('Failed to connect');
    }

    return () => {
      if (clientRef.current?.isConnected()) {
        clientRef.current.disconnect();
      }
    };
  }, [config.broker, config.port, config.clientId]);

  const publish = useCallback((topic: string, message: unknown) => {
    if (!clientRef.current || !isConnected) {
      console.error('Cannot publish: Not connected');
      return;
    }

    const payload = JSON.stringify(message);
    const mqttMessage = new window.Paho.MQTT.Message(payload);
    mqttMessage.destinationName = topic;
    clientRef.current.send(mqttMessage);

    console.log('📤 Published to:', topic);
  }, [isConnected]);

  const subscribe = useCallback((topic: string, callback: (message: unknown) => void) => {
    if (!clientRef.current || !isConnected) {
      console.error('Cannot subscribe: Not connected');
      return;
    }

    clientRef.current.subscribe(topic);
    subscriptionsRef.current.set(topic, callback);

    console.log('📡 Subscribed to:', topic);
  }, [isConnected]);

  const unsubscribe = useCallback((topic: string) => {
    if (!clientRef.current) return;

    clientRef.current.unsubscribe(topic);
    subscriptionsRef.current.delete(topic);

    console.log('📴 Unsubscribed from:', topic);
  }, []);

  return {
    isConnected,
    error,
    publish,
    subscribe,
    unsubscribe,
  };
};
