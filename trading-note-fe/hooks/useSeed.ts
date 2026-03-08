'use client';

import { useState, useEffect } from 'react';
import { getSeedApi, updateSeedApi, UpdateSeedRequest } from '@/lib/api/seed';

const DEFAULT_SEED = 10000000; // 기본 시드: 1천만원
const DEFAULT_CURRENCY = 'KRW';

export function useSeed() {
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [seedCurrency, setSeedCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeed = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSeedApi();
        setSeed(response.seed > 0 ? response.seed : DEFAULT_SEED);
        setSeedCurrency(response.currency || DEFAULT_CURRENCY);
      } catch (err) {
        // silently handle - error state is managed via setError
        setError('시드 정보를 불러오지 못했습니다.');
        setSeed(DEFAULT_SEED);
        setSeedCurrency(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeed();
  }, []);

  const updateSeed = async (newSeed: number, currency?: string) => {
    try {
      setError(null);
      const request: UpdateSeedRequest = { seed: newSeed, currency: currency || seedCurrency };
      const response = await updateSeedApi(request);
      setSeed(response.seed);
      setSeedCurrency(response.currency || DEFAULT_CURRENCY);
      return { success: true };
    } catch (err) {
      // silently handle - error state is managed via setError
      setError('시드 업데이트에 실패했습니다.');
      return { success: false, error: '시드 업데이트에 실패했습니다.' };
    }
  };

  return {
    seed,
    seedCurrency,
    updateSeed,
    isLoading,
    error,
    refetch: async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSeedApi();
        setSeed(response.seed > 0 ? response.seed : DEFAULT_SEED);
        setSeedCurrency(response.currency || DEFAULT_CURRENCY);
      } catch (err) {
        // silently handle - error state is managed via setError
        setError('시드 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };
}
