import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Paho: {
      MQTT: {
        Client: new (host: string, port: number, path: string, clientId: string) => MQTTClient;
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
  keepAliveInterval?: number;
  useSSL?: boolean;
  timeout?: number;
}

export interface MQTTConfig {
  broker: string;
  port: number;
  path?: string;
  useSSL?: boolean;
  clientId?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface UseMQTTReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  error: string | null;
  publish: (topic: string, message: unknown) => void;
  subscribe: (topic: string, callback: (message: unknown) => void) => void;
  unsubscribe: (topic: string) => void;
  reconnect: () => void;
}

export const useMQTT = (config: MQTTConfig): UseMQTTReturn => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MQTTClient | null>(null);
  const subscriptionsRef = useRef<Map<string, (message: unknown) => void>>(new Map());
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isUnmountingRef = useRef(false);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!window.Paho) {
      console.error('❌ Paho MQTT library not loaded');
      setError('MQTT library not loaded. Check that paho-mqtt.js is included in index.html');
      return;
    }

    // Cleanup any existing connection
    if (clientRef.current) {
      try {
        if (clientRef.current.isConnected()) {
          clientRef.current.disconnect();
        }
      } catch (e) {
        console.log('Cleanup disconnect error (ignored):', e);
      }
      clientRef.current = null;
    }

    setStatus('connecting');
    setError(null);

    const clientId = config.clientId || 'tablet_' + Math.random().toString(16).substr(2, 8);
    const wsPath = config.path || '/mqtt';
    const useSSL = config.useSSL || false;

    console.log(`🔌 Connecting to MQTT broker: ${useSSL ? 'wss' : 'ws'}://${config.broker}:${config.port}${wsPath}`);
    console.log(`   Client ID: ${clientId}`);

    try {
      const client = new window.Paho.MQTT.Client(
        config.broker,
        config.port,
        wsPath,
        clientId
      );

      client.onConnectionLost = (response) => {
        console.error('❌ MQTT Connection Lost:', response.errorMessage);
        setStatus('disconnected');
        setError('Connection lost: ' + response.errorMessage);

        // Auto-reconnect with exponential backoff
        if (!isUnmountingRef.current) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
          reconnectAttemptRef.current++;
          console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptRef.current})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        }
      };

      client.onMessageArrived = (message) => {
        const topic = message.destinationName;
        const payload = message.payloadString;

        console.log('📥 Message received on:', topic, payload.substring(0, 100));

        try {
          const data = JSON.parse(payload);
          const callback = subscriptionsRef.current.get(topic);
          if (callback) {
            callback(data);
          } else {
            console.log('⚠️ No callback registered for topic:', topic);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      // Connect options - ONLY valid properties for Paho MQTT JS
      const connectOptions: ConnectOptions = {
        onSuccess: () => {
          console.log('✅ Connected to MQTT Broker');
          setStatus('connected');
          setError(null);
          reconnectAttemptRef.current = 0;

          // Re-subscribe to all existing subscriptions
          subscriptionsRef.current.forEach((_, topic) => {
            console.log('📡 Re-subscribing to:', topic);
            client.subscribe(topic);
          });
        },
        onFailure: (err) => {
          console.error('❌ MQTT Connection Failed:', err.errorMessage);
          setStatus('disconnected');
          setError('Connection failed: ' + err.errorMessage);

          // Auto-reconnect with exponential backoff
          if (!isUnmountingRef.current) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
            reconnectAttemptRef.current++;
            console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptRef.current})`);
            
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, delay);
          }
        },
        keepAliveInterval: 30,
        useSSL: useSSL,
        timeout: 10,
      };

      client.connect(connectOptions);
      clientRef.current = client;
    } catch (err) {
      console.error('❌ MQTT Connection Error:', err);
      setStatus('disconnected');
      setError('Failed to connect: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [config.broker, config.port, config.path, config.useSSL, config.clientId]);

  useEffect(() => {
    isUnmountingRef.current = false;
    connect();

    return () => {
      isUnmountingRef.current = true;
      clearReconnectTimeout();
      if (clientRef.current) {
        try {
          if (clientRef.current.isConnected()) {
            clientRef.current.disconnect();
          }
        } catch (e) {
          console.log('Disconnect error on unmount (ignored):', e);
        }
      }
    };
  }, [connect, clearReconnectTimeout]);

  const publish = useCallback((topic: string, message: unknown) => {
    if (!clientRef.current || status !== 'connected') {
      console.error('Cannot publish: Not connected (status:', status, ')');
      return;
    }

    const payload = JSON.stringify(message);
    const mqttMessage = new window.Paho.MQTT.Message(payload);
    mqttMessage.destinationName = topic;
    clientRef.current.send(mqttMessage);

    console.log('📤 Published to:', topic, payload.substring(0, 100));
  }, [status]);

  const subscribe = useCallback((topic: string, callback: (message: unknown) => void) => {
    // Store the subscription (for re-subscribe on reconnect)
    subscriptionsRef.current.set(topic, callback);

    if (clientRef.current && status === 'connected') {
      clientRef.current.subscribe(topic);
      console.log('📡 Subscribed to:', topic);
    } else {
      console.log('📡 Queued subscription for:', topic, '(will subscribe when connected)');
    }
  }, [status]);

  const unsubscribe = useCallback((topic: string) => {
    subscriptionsRef.current.delete(topic);
    
    if (clientRef.current && status === 'connected') {
      clientRef.current.unsubscribe(topic);
      console.log('📴 Unsubscribed from:', topic);
    }
  }, [status]);

  const manualReconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    clearReconnectTimeout();
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect, clearReconnectTimeout]);

  return {
    status,
    isConnected: status === 'connected',
    error,
    publish,
    subscribe,
    unsubscribe,
    reconnect: manualReconnect,
  };
};
