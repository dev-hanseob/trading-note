'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlState(defaults: Record<string, string>) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const getParam = useCallback(
        (key: string): string => {
            return searchParams.get(key) ?? defaults[key] ?? '';
        },
        [searchParams, defaults],
    );

    const setParams = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString());

            for (const [key, value] of Object.entries(updates)) {
                if (value === defaults[key] || value === '') {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            }

            const qs = params.toString();
            router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        },
        [searchParams, pathname, router, defaults],
    );

    return { getParam, setParams };
}
