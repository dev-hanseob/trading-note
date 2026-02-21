import apiClient from './client';

// Backend response: { id, price, currency, userId, createdAt, updatedAt }
export interface SeedEntity {
  id: number;
  price: number;
  currency: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSeedRequest {
  price: number;
  currency: string;
}

// Fetch all seeds (returns array)
export async function getSeedsApi(): Promise<SeedEntity[]> {
  const response = await apiClient.get<SeedEntity[]>('/seed');
  return response.data;
}

// Create a new seed
export async function createSeedApi(request: CreateSeedRequest): Promise<SeedEntity> {
  const response = await apiClient.post<SeedEntity>('/seed', request);
  return response.data;
}

// Update an existing seed by ID
export async function updateSeedByIdApi(id: number, request: CreateSeedRequest): Promise<SeedEntity> {
  const response = await apiClient.put<SeedEntity>(`/seed/${id}`, request);
  return response.data;
}

// Legacy compatibility wrappers
export interface SeedResponse {
  seed: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSeedRequest {
  seed: number;
  currency: string;
}

export async function getSeedApi(): Promise<SeedResponse> {
  const seeds = await getSeedsApi();
  if (seeds.length > 0) {
    return { seed: seeds[0].price, currency: seeds[0].currency || 'KRW', createdAt: seeds[0].createdAt, updatedAt: seeds[0].updatedAt };
  }
  return { seed: 0, currency: 'KRW' };
}

export async function updateSeedApi(request: UpdateSeedRequest): Promise<SeedResponse> {
  const seeds = await getSeedsApi();
  let result: SeedEntity;
  if (seeds.length > 0) {
    result = await updateSeedByIdApi(seeds[0].id, { price: request.seed, currency: request.currency });
  } else {
    result = await createSeedApi({ price: request.seed, currency: request.currency });
  }
  return { seed: result.price, currency: result.currency || 'KRW', createdAt: result.createdAt, updatedAt: result.updatedAt };
}
