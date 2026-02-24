'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp, Zap, BarChart3, Clock, Check, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-14 sm:pt-28 pb-10 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">트레이딩 저널</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-4 tracking-tight">
            복기하는 트레이더가<br />
            <span className="text-emerald-500">결국 이긴다.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-lg">
            좋은 트레이더와 그렇지 않은 트레이더의 차이는<br className="hidden sm:block" />
            기억력이 아니라 기록 습관입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              무료로 기록 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            가입 즉시 사용 가능 · 설치 없음
          </p>
        </div>
      </section>

      {/* Social Proof Numbers */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
          {[
            { value: '30초', label: '거래 기록 시간', accent: false },
            { value: '무료', label: '시작 비용', accent: true },
            { value: '5가지', label: '성과 지표 자동 계산', accent: false },
            { value: '설치 없음', label: '브라우저에서 바로', accent: false },
          ].map((item, i) => (
            <div key={i} className="min-w-[80px]">
              <div className={`text-2xl font-bold mb-1 ${item.accent ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                {item.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900/80">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-0.5 bg-slate-200 dark:bg-slate-800/50 rounded text-[11px] text-slate-400 dark:text-slate-600 font-mono">
                  trabit.app/dashboard
                </div>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* Today summary bar */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">오늘의 성과</div>
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">+485,000원</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-500">3건 거래</span>
                  <span className="text-emerald-500">2W</span>
                  <span className="text-red-500">1L</span>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: '총 잔고', value: '12,450,000', sub: '+24.5%', color: 'text-slate-900 dark:text-white', subColor: 'text-emerald-500' },
                  { label: '누적 손익', value: '+2,450,000', sub: '32건', color: 'text-emerald-400', subColor: 'text-slate-500' },
                  { label: '승률', value: '68.7%', sub: '22W / 10L', color: 'text-slate-900 dark:text-white', subColor: 'text-slate-500' },
                  { label: 'Profit Factor', value: '2.14', sub: 'Good', color: 'text-slate-900 dark:text-white', subColor: 'text-emerald-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-800/30 rounded-lg p-3">
                    <div className="text-[11px] text-slate-500 mb-1">{stat.label}</div>
                    <div className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                    <div className={`text-[11px] ${stat.subColor}`}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-slate-50 dark:bg-slate-800/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 font-medium">자산 추이</span>
                  <div className="flex gap-1.5">
                    {['1W', '1M', '3M', 'ALL'].map(p => (
                      <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded ${p === '1M' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-600'}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <svg className="w-full h-24" viewBox="0 0 500 90" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,70 Q50,62 100,50 T200,35 T300,26 T400,10 T500,3 L500,90 L0,90Z" fill="url(#chartFill)" />
                  <path d="M0,70 Q50,62 100,50 T200,35 T300,26 T400,10 T500,3" fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2" />
                </svg>
              </div>

              {/* Recent trades */}
              <div className="space-y-1">
                {[
                  { symbol: 'BTC', type: 'LONG', pnl: '+320,000', roi: '+3.2%', win: true, time: '14:32' },
                  { symbol: 'ETH', type: 'SHORT', pnl: '-85,000', roi: '-1.7%', win: false, time: '11:15' },
                  { symbol: 'SOL', type: 'LONG', pnl: '+250,000', roi: '+8.3%', win: true, time: '09:48' },
                ].map((trade, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-900 dark:text-white w-8">{trade.symbol}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                        trade.type === 'LONG' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                      }`}>{trade.type}</span>
                      <span className="text-[11px] text-slate-600">{trade.time}</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className={`text-xs font-medium ${trade.win ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl}</span>
                      <span className={`text-[11px] w-12 text-right ${trade.win ? 'text-emerald-500' : 'text-red-500'}`}>{trade.roi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
            시작은 간단합니다
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-10 sm:mb-14">
            복잡한 설정 없이, 3단계로 매매 분석을 시작하세요.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              {
                step: '01',
                title: '거래 직후, 30초 기록',
                desc: '종목과 손익만 입력하세요. ROI, 누적 수익은 자동으로 계산됩니다.',
                icon: Zap,
              },
              {
                step: '02',
                title: '통계가 자동으로 쌓인다',
                desc: '승률, Profit Factor, 연승/연패 패턴. 기록이 쌓일수록 데이터가 말해줍니다.',
                icon: BarChart3,
              },
              {
                step: '03',
                title: '약점을 발견하고 개선한다',
                desc: '어느 종목에서 손실이 나는지, 어느 시간대에 판단이 흐려지는지 확인하세요.',
                icon: TrendingUp,
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 tracking-widest">STEP {item.step}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Benefit oriented */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
            왜 Trabit인가
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-10 sm:mb-14">
            기록이 귀찮았던 이유는 복잡해서였습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            <div>
              <Zap className="w-5 h-5 text-emerald-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                거래 후 30초, 습관이 된다
              </h3>
              <p className="text-xs text-red-400/80 dark:text-red-400/60 mb-1.5">
                엑셀 매매일지는 작성에만 30분이 걸린다.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                종목과 손익만 입력하면 ROI, 누적 수익이 자동으로 계산됩니다. 귀찮아서 안 쓰는 매매일지, 이제 없습니다.
              </p>
            </div>
            <div>
              <BarChart3 className="w-5 h-5 text-emerald-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                "감"이 "실력"이 되는 순간
              </h3>
              <p className="text-xs text-red-400/80 dark:text-red-400/60 mb-1.5">
                감으로 매매하다 같은 실수를 반복한다.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                승률, Profit Factor, 연속 손실 패턴. Trabit이 당신의 약점을 데이터로 보여줍니다.
              </p>
            </div>
            <div>
              <Clock className="w-5 h-5 text-emerald-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                오늘 잘 했는지, 1초 안에 안다
              </h3>
              <p className="text-xs text-red-400/80 dark:text-red-400/60 mb-1.5">
                장 마감 후 내가 잘 했는지조차 모른다.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                대시보드를 열면 바로 보입니다. 오늘의 손익, 이번 달 추이, 최장 연승까지 한눈에.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
            데이터가 패턴을 발견한다
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-10 sm:mb-14">
            기록이 쌓일수록, 당신의 매매 습관이 숫자로 드러납니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Symbol Analysis */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">종목별 손익</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { symbol: 'BTC', pnl: 2450000, max: 2450000 },
                  { symbol: 'SOL', pnl: 1280000, max: 2450000 },
                  { symbol: 'ETH', pnl: 450000, max: 2450000 },
                  { symbol: 'XRP', pnl: -320000, max: 2450000 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-900 dark:text-white w-8">{item.symbol}</span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800/50 rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm ${item.pnl >= 0 ? 'bg-emerald-500/70' : 'bg-red-500/70'}`}
                        style={{ width: `${Math.abs(item.pnl / item.max) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium tabular-nums w-20 text-right ${item.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.pnl >= 0 ? '+' : ''}{(item.pnl / 10000).toFixed(0)}만
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">어떤 종목에서 수익이 나는지 한눈에</p>
            </div>

            {/* Time Analysis */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">시간대별 성과</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { slot: '새벽', time: '00-06', winRate: 45, trades: 8, color: 'text-red-400' },
                  { slot: '오전', time: '06-12', winRate: 72, trades: 45, color: 'text-emerald-400' },
                  { slot: '오후', time: '12-18', winRate: 65, trades: 38, color: 'text-emerald-400' },
                  { slot: '야간', time: '18-24', winRate: 52, trades: 21, color: 'text-slate-400' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-2.5 bg-slate-100 dark:bg-slate-800/30 rounded-lg">
                    <div className="text-[11px] text-slate-500 mb-1">{item.slot}</div>
                    <div className={`text-lg font-bold tabular-nums ${item.color}`}>{item.winRate}%</div>
                    <div className="text-[10px] text-slate-500">{item.trades}건</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">언제 매매해야 승률이 높은지 확인</p>
            </div>

            {/* Day Analysis */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">요일별 평균 손익</span>
              </div>
              <div className="flex items-end gap-1.5 px-1" style={{ height: '96px' }}>
                {[
                  { day: '월', value: 35, positive: true },
                  { day: '화', value: 65, positive: true },
                  { day: '수', value: 20, positive: false },
                  { day: '목', value: 80, positive: true },
                  { day: '금', value: 50, positive: true },
                  { day: '토', value: 15, positive: false },
                  { day: '일', value: 10, positive: false },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-sm ${item.positive ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                      style={{ height: `${item.value}%`, minHeight: '4px' }}
                    />
                    <span className="text-[10px] text-slate-500 mt-1">{item.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">요일별 패턴으로 리스크를 관리</p>
            </div>

            {/* Rules Compliance */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">매매원칙 준수 효과</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">원칙 준수 시</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-500 tabular-nums">승률 78%</span>
                    <span className="text-xs font-bold text-emerald-500 tabular-nums">+82만</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">원칙 미준수 시</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-500 tabular-nums">승률 41%</span>
                    <span className="text-xs font-bold text-red-500 tabular-nums">-45만</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">원칙을 지키면 얼마나 달라지는지 증명</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/login" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition-colors">
              분석 기능 직접 체험하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
            자주 묻는 질문
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-10">
            궁금한 점이 있으시면 언제든 문의해 주세요.
          </p>
          <div className="space-y-2">
            {[
              { q: '정말 무료로 사용할 수 있나요?', a: '네, Free 플랜은 월 30건까지 무료로 이용 가능합니다. 더 많은 기록과 고급 분석이 필요하면 Basic 플랜으로 업그레이드할 수 있습니다.' },
              { q: '내 거래 데이터는 안전한가요?', a: '모든 데이터는 암호화되어 저장되며, 본인만 열람할 수 있습니다. 제3자에게 데이터를 공유하거나 판매하지 않습니다.' },
              { q: '모바일에서도 사용할 수 있나요?', a: '네, 반응형 웹으로 모바일 브라우저에서도 최적화된 화면으로 이용 가능합니다. 별도 앱 설치가 필요 없습니다.' },
              { q: '어떤 결제 수단을 지원하나요?', a: '신용카드, 체크카드, 카카오페이, 네이버페이를 지원합니다. 언제든 원클릭으로 해지할 수 있습니다.' },
              { q: '암호화폐와 주식 모두 기록할 수 있나요?', a: '네, 암호화폐(현물/선물)와 주식(현물/선물) 모두 지원합니다. 자산 유형별로 분리된 통계도 제공됩니다.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">{q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            수익률이 달라지는 습관
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            무료로 시작 · 언제든 취소 가능 · 설치 없음
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            지금 기록하기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Basic 플랜 월 10,400원 (연간) · 언제든 해지 가능
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
