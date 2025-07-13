import apiClient from './client';

export interface SeedResponse {
  seed: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSeedRequest {
  seed: number;
}

// 시드 조회
export async function getSeedApi(): Promise<SeedResponse> {
  const response = await apiClient.get<SeedResponse>('/seed');
  return response.data;
}

// 시드 업데이트 (생성 또는 수정)
export async function updateSeedApi(request: UpdateSeedRequest): Promise<SeedResponse> {
  const response = await apiClient.put<SeedResponse>('/seed', request);
  return response.data;
}
