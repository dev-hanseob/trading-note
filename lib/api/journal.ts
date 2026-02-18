import apiClient from './client';
import {
    GetJournalsParams,
    GetJournalsResponse,
    addJournalRequest,
} from "@/type/dto/addJournalRequest";
import { Journal } from "@/type/domain/journal";
import { CsvAnalyzeResponse, CsvConfirmResponse, CsvPreviewRow } from '@/type/dto/csvImport';

export async function createJournal(request: addJournalRequest): Promise<any> {
    const { data } = await apiClient.post('/journals', request);
    return data;
}

export async function getJournal(id: number): Promise<Journal> {
    const { data } = await apiClient.get<Journal>(`/journals/${id}`);
    return data;
}

export async function updateJournal(id: number, request: addJournalRequest): Promise<any> {
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

export async function analyzeCsv(file: File): Promise<CsvAnalyzeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<CsvAnalyzeResponse>(
        '/journals/import/csv/analyze',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
        }
    );
    return data;
}

export async function confirmCsvImport(rows: CsvPreviewRow[]): Promise<CsvConfirmResponse> {
    const { data } = await apiClient.post<CsvConfirmResponse>(
        '/journals/import/csv/confirm',
        { rows }
    );
    return data;
}
