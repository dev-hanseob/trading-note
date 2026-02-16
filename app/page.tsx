'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, Clock, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero - Minimal, direct */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">트레이딩 저널</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
            기록하지 않는 매매는<br />
            <span className="text-slate-500">반복될 뿐이다.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-lg">
            모든 거래를 30초 안에 기록하고, 승률과 수익률을 데이터로 확인하세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm"
            >
              시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-sm"
            >
              대시보드 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Live-style Dashboard Preview */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900/80">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-0.5 bg-slate-200 dark:bg-slate-800/50 rounded text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                  trading-note.app/dashboard
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
                    <div className="text-xs text-slate-500">오늘의 성과</div>
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
                    <div className="text-[10px] text-slate-500 mb-1">{stat.label}</div>
                    <div className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                    <div className={`text-[10px] ${stat.subColor}`}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-slate-50 dark:bg-slate-800/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-medium">자산 추이</span>
                  <div className="flex gap-1.5">
                    {['1W', '1M', '3M', 'ALL'].map(p => (
                      <span key={p} className={`text-[9px] px-1.5 py-0.5 rounded ${p === '1M' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-600'}`}>
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
                  <path d="M0,70 L25,65 L50,60 L75,62 L100,50 L125,45 L150,48 L175,38 L200,35 L225,37 L250,28 L275,24 L300,26 L325,18 L350,14 L375,16 L400,10 L425,8 L450,9 L475,5 L500,3 L500,90 L0,90Z" fill="url(#chartFill)" />
                  <polyline fill="none" stroke="rgb(16, 185, 129)" strokeWidth="1.5" points="0,70 25,65 50,60 75,62 100,50 125,45 150,48 175,38 200,35 225,37 250,28 275,24 300,26 325,18 350,14 375,16 400,10 425,8 450,9 475,5 500,3" />
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        trade.type === 'LONG' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                      }`}>{trade.type}</span>
                      <span className="text-[10px] text-slate-600">{trade.time}</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className={`text-xs font-medium ${trade.win ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl}</span>
                      <span className={`text-[10px] w-12 text-right ${trade.win ? 'text-emerald-500' : 'text-red-500'}`}>{trade.roi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - 3 cols, icon + text only */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <Zap className="w-5 h-5 text-emerald-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">30초 퀵 엔트리</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                종목, 가격, 손익. 핵심만 빠르게 입력. 나머지는 자동 계산.
              </p>
            </div>
            <div>
              <BarChart3 className="w-5 h-5 text-emerald-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">데이터로 복기</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                승률, 수익률, Profit Factor, 연속 스트릭. 감이 아닌 숫자로 실력을 확인.
              </p>
            </div>
            <div>
              <Clock className="w-5 h-5 text-emerald-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">오늘의 성과</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                대시보드에서 오늘 거래 현황을 실시간 확인. 일별, 월별 추이 분석.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - minimal */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            첫 번째 거래를 기록하세요
          </p>
          <p className="text-sm text-slate-500 mb-8">무료. 설치 없음. 바로 시작.</p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm"
          >
            시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-600">Trading Note</span>
          <div className="flex items-center gap-6 text-xs text-slate-700">
            <Link href="/journal" className="hover:text-slate-400 transition-colors">서비스</Link>
            <Link href="/dashboard" className="hover:text-slate-400 transition-colors">대시보드</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
