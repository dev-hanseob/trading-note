'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, BarChart3, ListChecks } from 'lucide-react';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

import HeroSection from '@/components/landing/HeroSection';
import SocialProofBar from '@/components/landing/SocialProofBar';
import FeatureSection from '@/components/landing/FeatureSection';
import AnalyticsShowcase from '@/components/landing/AnalyticsShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import FaqSection from '@/components/landing/FaqSection';
import BottomCta from '@/components/landing/BottomCta';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Social Proof Numbers */}
      <SocialProofBar />

      {/* Feature 1: Quick Recording - Text Left / 3D Right */}
      <FeatureSection
        eyebrow="QUICK ENTRY"
        headline="거래 후 30초, 습관이 된다"
        painPoint="엑셀 매매일지는 작성에만 30분이 걸린다."
        description="종목과 손익만 입력하면 ROI, 누적 수익이 자동으로 계산됩니다. 귀찮아서 안 쓰는 매매일지, 이제 없습니다."
        bullets={[
          '퀵 엔트리 모드로 핵심 데이터만 입력',
          'ROI, 누적 손익, 승률 자동 계산',
          '거래 직후 30초 안에 기록 완료',
        ]}
        iconType="lightning"
        fallbackIcon={Zap}
        reversed={false}
        bgVariant="dark"
      />

      {/* Feature 2: Data Analytics - 3D Left / Text Right */}
      <FeatureSection
        eyebrow="DATA ANALYTICS"
        headline={'"감"이 "실력"이 되는 순간'}
        painPoint="감으로 매매하다 같은 실수를 반복한다."
        description="승률, Profit Factor, 연속 손실 패턴. Trabit이 당신의 약점을 데이터로 보여줍니다."
        bullets={[
          '종목별, 시간대별, 요일별 성과 분석',
          '연승/연패 패턴 자동 추적',
          '감정별 트레이딩 통계',
        ]}
        iconType="chart"
        fallbackIcon={BarChart3}
        reversed={true}
        bgVariant="light"
      />

      {/* Feature 3: Trading Rules - Text Left / 3D Right */}
      <FeatureSection
        eyebrow="TRADING RULES"
        headline="원칙을 지키면 수익이 달라진다"
        painPoint="매번 다짐하지만 원칙을 어기고 손실을 본다."
        description="나만의 매매원칙을 등록하고, 매 거래마다 준수 여부를 기록하세요. 원칙이 수익으로 이어지는 과정을 데이터로 확인할 수 있습니다."
        bullets={[
          '매매원칙 등록 및 준수율 자동 계산',
          '원칙 준수 vs 미준수 시 수익 비교',
          '감정 기록으로 심리 패턴 분석',
        ]}
        iconType="checklist"
        fallbackIcon={ListChecks}
        reversed={false}
        bgVariant="dark"
      />

      {/* Analytics Showcase */}
      <AnalyticsShowcase />

      {/* How It Works */}
      <HowItWorks />

      {/* FAQ */}
      <FaqSection />

      {/* Bottom CTA */}
      <BottomCta />

      {/* Footer */}
      <Footer />
    </div>
  );
}
