export interface Table {
  id: number;
  capacity: number;
  location: string;
  available?: boolean;
}

export interface Reservation {
  reservation_id: string;
  table_id: number;
  customer_name: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  created_at?: string;
}

export interface TableRequest {
  request_id: string;
  date: string;
  time: string;
  capacity?: number;
}

export interface TableResponse {
  request_id: string;
  success: boolean;
  available_tables: Table[];
  total: number;
  error?: string;
}

export interface ReservationRequest {
  request_id: string;
  table_id: number;
  customer_name: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
}

export interface ReservationResponse {
  request_id: string;
  success: boolean;
  reservation?: Reservation;
  error?: string;
  message?: string;
}

export interface ReservationLookupRequest {
  request_id: string;
  name?: string;
  phone?: string;
}

export interface ReservationLookupResponse {
  request_id: string;
  success: boolean;
  reservation?: Reservation;
  error?: string;
}
