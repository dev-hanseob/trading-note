'use client';

import { useState, useEffect } from 'react';
import {getSeedApi, updateSeedApi, UpdateSeedRequest} from '@/lib/api/seed';
import {addJournalRequest} from "@/type/dto/addJournalRequest";

const DEFAULT_SEED = 10000000; // 기본 시드: 1천만원

export function useSeed() {
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 서버에서 시드 값 불러오기
  useEffect(() => {
    const fetchSeed = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSeedApi();
        setSeed(response.seed);
      } catch (err) {
        console.error('시드 조회 실패:', err);
        setError('시드 정보를 불러오지 못했습니다.');
        // API 실패 시 기본값 사용
        setSeed(DEFAULT_SEED);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeed();
  }, []);

  // 시드 값 업데이트 함수
  const updateSeed = async (newSeed: number) => {
    try {
      setError(null);
      const request: UpdateSeedRequest = {seed: newSeed}
      const response = await updateSeedApi(request);
      setSeed(response.seed);
      return { success: true };
    } catch (err) {
      console.error('시드 업데이트 실패:', err);
      setError('시드 업데이트에 실패했습니다.');
      return { success: false, error: '시드 업데이트에 실패했습니다.' };
    }
  };

  return {
    seed,
    updateSeed,
    isLoading,
    error,
    refetch: async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSeedApi();
        setSeed(response.seed);
      } catch (err) {
        console.error('시드 재조회 실패:', err);
        setError('시드 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };
}
