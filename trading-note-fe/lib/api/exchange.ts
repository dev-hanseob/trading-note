import apiClient from './client';
import type {
  ExchangeCredential,
  CreateCredentialRequest,
  SyncRequest,
  SyncResult,
} from '@/type/domain/exchange';

// Register a new exchange credential
export async function createCredentialApi(
  request: CreateCredentialRequest,
): Promise<ExchangeCredential> {
  const response = await apiClient.post<ExchangeCredential>(
    '/exchange/credentials',
    request,
  );
  return response.data;
}

// List all credentials for the current user
export async function getCredentialsApi(): Promise<ExchangeCredential[]> {
  const response = await apiClient.get<ExchangeCredential[]>(
    '/exchange/credentials',
  );
  return response.data;
}

// Delete a credential by ID
export async function deleteCredentialApi(id: number): Promise<void> {
  await apiClient.delete(`/exchange/credentials/${id}`);
}

// Validate (test) a credential
export async function validateCredentialApi(
  id: number,
): Promise<{ valid: boolean }> {
  const response = await apiClient.post<{ valid: boolean }>(
    `/exchange/credentials/${id}/validate`,
  );
  return response.data;
}

// Sync trades from an exchange
export async function syncTradesApi(
  request: SyncRequest,
): Promise<SyncResult> {
  const response = await apiClient.post<SyncResult>(
    '/exchange/sync',
    request,
  );
  return response.data;
}
