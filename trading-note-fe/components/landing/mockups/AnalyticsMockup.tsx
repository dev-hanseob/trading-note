'use client';

export default function AnalyticsMockup() {
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 space-y-4 shadow-lg">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '승률', value: '57.1%', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Profit Factor', value: '1.65', color: 'text-slate-900 dark:text-white' },
          { label: '총 거래', value: '35건', color: 'text-slate-900 dark:text-white' },
        ].map((kpi, i) => (
          <div key={i} className="text-center bg-slate-50 dark:bg-slate-800/30 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-400 mb-0.5">{kpi.label}</div>
            <div className={`text-base font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div className="bg-slate-50 dark:bg-slate-800/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-500 font-medium">자산 추이</span>
          <div className="flex gap-1">
            {['1W', '1M', '3M'].map((p) => (
              <span
                key={p}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  p === '1M'
                    ? 'bg-emerald-600/20 text-emerald-500 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <svg className="w-full h-20" viewBox="0 0 400 70" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mockupChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,55 Q40,50 80,42 T160,30 T240,22 T320,12 T400,5 L400,70 L0,70Z"
            fill="url(#mockupChartFill)"
          />
          <path
            d="M0,55 Q40,50 80,42 T160,30 T240,22 T320,12 T400,5"
            fill="none"
            stroke="rgb(16, 185, 129)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Recent Trades */}
      <div>
        <div className="text-[11px] text-slate-500 font-medium mb-2">최근 거래</div>
        <div className="space-y-1">
          {[
            { symbol: 'BTC', type: 'LONG', roi: '+3.2%', win: true },
            { symbol: 'ETH', type: 'SHORT', roi: '-1.7%', win: false },
            { symbol: 'SOL', type: 'LONG', roi: '+8.3%', win: true },
            { symbol: 'BTC', type: 'LONG', roi: '+1.5%', win: true },
            { symbol: 'XRP', type: 'SHORT', roi: '-2.1%', win: false },
          ].map((trade, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/20 rounded-md"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    trade.win ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs font-medium text-slate-900 dark:text-white w-7">
                  {trade.symbol}
                </span>
                <span
                  className={`text-[10px] px-1 py-0.5 rounded font-medium ${
                    trade.type === 'LONG'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                  }`}
                >
                  {trade.type}
                </span>
              </div>
              <span
                className={`text-xs font-medium tabular-nums ${
                  trade.win
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trade.roi}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
