// Exchange names supported by the backend
export type ExchangeName = 'BITGET' | 'BINANCE' | 'BYBIT' | 'UPBIT';

// Credential stored on the backend (apiKey is masked)
export interface ExchangeCredential {
  id: number;
  exchangeName: ExchangeName;
  apiKey: string;          // masked, e.g. "abc...xyz"
  label: string;
  createdAt: string;
  lastSyncedAt?: string | null;
}

// Request to register a new credential
export interface CreateCredentialRequest {
  exchangeName: ExchangeName;
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  label: string;
}

// Sync request
export interface SyncRequest {
  credentialId: number;
  startDate: string;       // "YYYY-MM-DD"
  endDate: string;         // "YYYY-MM-DD"
}

// Sync result from the backend
export interface SyncResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}
