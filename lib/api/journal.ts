import apiClient from './client';
import {
    GetJournalsParams,
    GetJournalsResponse,
    addJournalRequest,
    updateJournalRequest
} from "@/type/dto/addJournalRequest";

export async function createJournal(request: addJournalRequest): Promise<any> {
    const { data } = await apiClient.post('/journals', request);
    return data;
}

export async function updateJournal(id:number, request: updateJournalRequest): Promise<any> {
    const { data } = await apiClient.put(`/journals/${id}`, request);
    return data;
}

export async function getJournals(params: GetJournalsParams): Promise<GetJournalsResponse> {
    const { data } = await apiClient.get<GetJournalsResponse>('/journals', { params });
    return data;
}

export async function deleteJournals(ids: number[]): Promise<void> {
    // Backend supports single delete by ID: DELETE /journals/{id}
    await Promise.all(ids.map(id => apiClient.delete(`/journals/${id}`)));
}

export async function uploadChart(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ url: string }>('/journals/upload/chart', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
    });
    return data.url;
}
