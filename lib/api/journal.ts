import apiClient from './client';
import {
    GetJournalsParams,
    GetJournalsResponse,
    addJournalRequest,
    updateJournalRequest
} from "@/type/dto/addJournalRequest";

export async function createJournal(request: addJournalRequest): Promise<any> {
    const { data } = await apiClient.post('/journal', request);
    return data;
}

export async function updateJournal(id:number, request: updateJournalRequest): Promise<any> {
    const { data } = await apiClient.put(`/journal/${id}`, request);
    return data;
}

export async function getJournals(params: GetJournalsParams): Promise<GetJournalsResponse> {
    const { data } = await apiClient.get<GetJournalsResponse>('/journal', { params });
    return data;
}

export async function deleteJournals(ids: number[]): Promise<void> {
    const params = new URLSearchParams();
    ids.forEach(id => params.append('id', id.toString()));
    await apiClient.delete(`/journal?${params.toString()}`);
}
