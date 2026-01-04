import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { useMQTT, ConnectionStatus, MQTTConfig } from '@/hooks/useMQTT';
import type { Table, Reservation, TableResponse, ReservationResponse, ReservationLookupResponse } from '@/types/mqtt';

const TOPICS = {
  tableRequest: 'restaurant/table/request',
  tableResponse: 'restaurant/table/response',
  reservationCreate: 'restaurant/reservation/create',
  reservationResponse: 'restaurant/reservation/response',
  reservationLookup: 'restaurant/reservation/lookup',
  reservationLookupResponse: 'restaurant/reservation/lookup/response',
};

interface BrokerConfig {
  host: string;
  port: number;
  path: string;
  useSSL: boolean;
}

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

interface MQTTContextValue {
  isConnected: boolean;
  status: ConnectionStatus;
  error: string | null;
  brokerConfig: BrokerConfig;
  setBrokerConfig: (config: BrokerConfig) => void;
  reconnect: () => void;
  requestAvailableTables: (date: string, time: string, capacity?: number) => Promise<Table[]>;
  createReservation: (
    tableId: number,
    customerName: string,
    phone: string,
    date: string,
    time: string,
    partySize: number
  ) => Promise<Reservation>;
  lookupReservation: (name?: string, phone?: string) => Promise<Reservation | null>;
  sendTestRequest: () => void;
}

const MQTTContext = createContext<MQTTContextValue | undefined>(undefined);

const BROKER_CONFIG_KEY = 'mqtt_broker_config';
const DEFAULT_BROKER_CONFIG: BrokerConfig = {
  host: '192.168.1.100',
  port: 9001,
  path: '/mqtt',
  useSSL: false,
};

const loadBrokerConfig = (): BrokerConfig => {
  try {
    const stored = localStorage.getItem(BROKER_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        host: parsed.host || DEFAULT_BROKER_CONFIG.host,
        port: parsed.port || DEFAULT_BROKER_CONFIG.port,
        path: parsed.path || DEFAULT_BROKER_CONFIG.path,
        useSSL: parsed.useSSL ?? DEFAULT_BROKER_CONFIG.useSSL,
      };
    }
  } catch (e) {
    console.error('Failed to load broker config:', e);
  }
  return DEFAULT_BROKER_CONFIG;
};

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brokerConfig, setBrokerConfigState] = useState<BrokerConfig>(loadBrokerConfig);

  const mqttConfig: MQTTConfig = {
    broker: brokerConfig.host,
    port: brokerConfig.port,
    path: brokerConfig.path,
    useSSL: brokerConfig.useSSL,
  };

  const { status, isConnected, error, publish, subscribe, unsubscribe, reconnect } = useMQTT(mqttConfig);

  const pendingRequestsRef = useRef<Map<string, PendingRequest<unknown>>>(new Map());

  const setBrokerConfig = useCallback((config: BrokerConfig) => {
    localStorage.setItem(BROKER_CONFIG_KEY, JSON.stringify(config));
    setBrokerConfigState(config);
    // Force page reload to reconnect with new config
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    console.log('🔗 Setting up MQTT subscriptions...');

    subscribe(TOPICS.tableResponse, (response) => {
      console.log('📥 Table response received:', response);
      const res = response as TableResponse;
      const pending = pendingRequestsRef.current.get(res.request_id);
      if (pending) {
        pendingRequestsRef.current.delete(res.request_id);
        if (res.success) {
          pending.resolve(res.available_tables);
        } else {
          pending.reject(new Error(res.error || 'Failed to get tables'));
        }
      }
    });

    subscribe(TOPICS.reservationResponse, (response) => {
      console.log('📥 Reservation response received:', response);
      const res = response as ReservationResponse;
      const pending = pendingRequestsRef.current.get(res.request_id);
      if (pending) {
        pendingRequestsRef.current.delete(res.request_id);
        if (res.success && res.reservation) {
          pending.resolve(res.reservation);
        } else {
          pending.reject(new Error(res.error || 'Failed to create reservation'));
        }
      }
    });

    subscribe(TOPICS.reservationLookupResponse, (response) => {
      console.log('📥 Lookup response received:', response);
      const res = response as ReservationLookupResponse;
      const pending = pendingRequestsRef.current.get(res.request_id);
      if (pending) {
        pendingRequestsRef.current.delete(res.request_id);
        if (res.success) {
          pending.resolve(res.reservation || null);
        } else {
          pending.reject(new Error(res.error || 'Reservation not found'));
        }
      }
    });

    return () => {
      unsubscribe(TOPICS.tableResponse);
      unsubscribe(TOPICS.reservationResponse);
      unsubscribe(TOPICS.reservationLookupResponse);
    };
  }, [isConnected, subscribe, unsubscribe]);

  const sendTestRequest = useCallback(() => {
    const requestId = 'test_' + Date.now();
    const request = {
      request_id: requestId,
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      capacity: 2,
    };
    console.log('🧪 Sending TEST table request:', request);
    publish(TOPICS.tableRequest, request);
  }, [publish]);

  const requestAvailableTables = useCallback(
    (date: string, time: string, capacity?: number): Promise<Table[]> => {
      return new Promise((resolve, reject) => {
        if (!isConnected) {
          reject(new Error('Not connected to reservation system'));
          return;
        }

        const requestId = Date.now().toString() + Math.random();

        pendingRequestsRef.current.set(requestId, { 
          resolve: resolve as (value: unknown) => void, 
          reject 
        });

        const request = {
          request_id: requestId,
          date,
          time,
          capacity,
        };

        console.log('📤 Requesting tables:', request);
        publish(TOPICS.tableRequest, request);

        setTimeout(() => {
          if (pendingRequestsRef.current.has(requestId)) {
            pendingRequestsRef.current.delete(requestId);
            reject(new Error('Request timeout - Raspberry Pi not responding'));
          }
        }, 10000);
      });
    },
    [isConnected, publish]
  );

  const createReservation = useCallback(
    (
      tableId: number,
      customerName: string,
      phone: string,
      date: string,
      time: string,
      partySize: number
    ): Promise<Reservation> => {
      return new Promise((resolve, reject) => {
        if (!isConnected) {
          reject(new Error('Not connected to reservation system'));
          return;
        }

        const requestId = Date.now().toString() + Math.random();

        pendingRequestsRef.current.set(requestId, { 
          resolve: resolve as (value: unknown) => void, 
          reject 
        });

        const request = {
          request_id: requestId,
          table_id: tableId,
          customer_name: customerName,
          phone,
          date,
          time,
          party_size: partySize,
        };

        console.log('📤 Creating reservation:', request);
        publish(TOPICS.reservationCreate, request);

        setTimeout(() => {
          if (pendingRequestsRef.current.has(requestId)) {
            pendingRequestsRef.current.delete(requestId);
            reject(new Error('Reservation timeout'));
          }
        }, 10000);
      });
    },
    [isConnected, publish]
  );

  const lookupReservation = useCallback(
    (name?: string, phone?: string): Promise<Reservation | null> => {
      return new Promise((resolve, reject) => {
        if (!isConnected) {
          reject(new Error('Not connected to reservation system'));
          return;
        }

        const requestId = Date.now().toString() + Math.random();

        pendingRequestsRef.current.set(requestId, { 
          resolve: resolve as (value: unknown) => void, 
          reject 
        });

        const request = {
          request_id: requestId,
          name,
          phone,
        };

        console.log('📤 Looking up reservation:', request);
        publish(TOPICS.reservationLookup, request);

        setTimeout(() => {
          if (pendingRequestsRef.current.has(requestId)) {
            pendingRequestsRef.current.delete(requestId);
            reject(new Error('Lookup timeout'));
          }
        }, 10000);
      });
    },
    [isConnected, publish]
  );

  return (
    <MQTTContext.Provider
      value={{
        isConnected,
        status,
        error,
        brokerConfig,
        setBrokerConfig,
        reconnect,
        requestAvailableTables,
        createReservation,
        lookupReservation,
        sendTestRequest,
      }}
    >
      {children}
    </MQTTContext.Provider>
  );
};

export const useMQTTContext = () => {
  const context = useContext(MQTTContext);
  if (!context) {
    throw new Error('useMQTTContext must be used within MQTTProvider');
  }
  return context;
};
