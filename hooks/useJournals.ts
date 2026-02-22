'use client';

import { useQuery } from '@tanstack/react-query';
import { getJournals } from '@/lib/api/journal';
import { Journal } from '@/type/domain/journal';
import { GetJournalsResponse } from '@/type/dto/addJournalRequest';

interface UseJournalsParams {
    page: number;
    pageSize: number;
}

export function useJournals({ page, pageSize }: UseJournalsParams) {
    return useQuery<GetJournalsResponse>({
        queryKey: ['journals', { page, pageSize }],
        queryFn: () => getJournals({ page, pageSize }),
    });
}

export function useAllJournals() {
    return useQuery<Journal[]>({
        queryKey: ['journals', 'all'],
        queryFn: async () => {
            const pageSize = 100;
            const firstRes = await getJournals({ page: 1, pageSize });

            if (!firstRes?.journals?.length) return [];

            let allData: Journal[] = [...firstRes.journals];
            const totalPages = Math.ceil(firstRes.total / pageSize);

            if (totalPages > 1) {
                const remainingPages = Array.from(
                    { length: totalPages - 1 },
                    (_, i) => i + 2,
                );

                const batchSize = 5;
                for (let i = 0; i < remainingPages.length; i += batchSize) {
                    const batch = remainingPages.slice(i, i + batchSize);
                    const results = await Promise.all(
                        batch.map((p) => getJournals({ page: p, pageSize })),
                    );
                    for (const res of results) {
                        if (res?.journals) {
                            allData = [...allData, ...res.journals];
                        }
                    }
                }
            }

            return allData;
        },
    });
}
