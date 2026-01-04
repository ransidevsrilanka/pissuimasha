import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { useMQTT } from '@/hooks/useMQTT';
import type { Table, Reservation, TableResponse, ReservationResponse, ReservationLookupResponse } from '@/types/mqtt';

const MQTT_PORT = 9001;

const TOPICS = {
  tableRequest: 'restaurant/table/request',
  tableResponse: 'restaurant/table/response',
  reservationCreate: 'restaurant/reservation/create',
  reservationResponse: 'restaurant/reservation/response',
  reservationLookup: 'restaurant/reservation/lookup',
  reservationLookupResponse: 'restaurant/reservation/lookup/response',
};

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

interface MQTTContextValue {
  isConnected: boolean;
  error: string | null;
  brokerIP: string;
  setBrokerIP: (ip: string) => void;
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
}

const MQTTContext = createContext<MQTTContextValue | undefined>(undefined);

const BROKER_IP_KEY = 'mqtt_broker_ip';
const DEFAULT_BROKER_IP = '192.168.1.100';

export const MQTTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brokerIP, setBrokerIPState] = useState(() => {
    return localStorage.getItem(BROKER_IP_KEY) || DEFAULT_BROKER_IP;
  });

  const { isConnected, error, publish, subscribe, unsubscribe } = useMQTT({
    broker: brokerIP,
    port: MQTT_PORT,
  });

  const pendingRequestsRef = useRef<Map<string, PendingRequest<unknown>>>(new Map());

  const setBrokerIP = useCallback((ip: string) => {
    localStorage.setItem(BROKER_IP_KEY, ip);
    setBrokerIPState(ip);
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    subscribe(TOPICS.tableResponse, (response) => {
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
        error,
        brokerIP,
        setBrokerIP,
        requestAvailableTables,
        createReservation,
        lookupReservation,
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
