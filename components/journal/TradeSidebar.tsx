'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { getJournals } from '@/lib/api/journal';
import { Journal } from '@/type/domain/journal';

interface TradeSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function TradeSidebar({ collapsed, onToggle }: TradeSidebarProps) {
    const [trades, setTrades] = useState<Journal[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getJournals({ page: 1, pageSize: 50 })
            .then((res) => setTrades(res.journals))
            .catch(console.error);
    }, []);

    const filteredTrades = trades.filter(t =>
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Split into active (profit === 0 as proxy for open) and history
    const activeTrades = filteredTrades.filter(t => t.profit === 0);
    const historyTrades = filteredTrades.filter(t => t.profit !== 0);

    // Stats
    const totalTrades = historyTrades.length;
    const winTrades = historyTrades.filter(t => t.profit > 0).length;
    const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : '0.0';
    const totalPnl = historyTrades.reduce((sum, t) => sum + t.profit, 0);

    const getBadge = (trade: Journal) => {
        if (trade.profit === 0) return { label: '진행중', className: 'bg-emerald-900/200 text-white' };
        if (trade.profit > 0) return { label: '수익', className: 'bg-emerald-900/30 text-emerald-400' };
        return { label: '손실', className: 'bg-red-900/30 text-red-400' };
    };

    if (collapsed) {
        return (
            <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center py-4 shrink-0">
                <button onClick={onToggle} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all">
                    <ChevronRight className="w-4 h-4" />
                </button>
                {/* Mini stats when collapsed */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="text-center">
                        <div className="text-xs font-bold text-emerald-400">{winRate}%</div>
                        <div className="text-[10px] text-slate-400">승률</div>
                    </div>
                    <div className="w-6 h-px bg-slate-300 dark:bg-slate-700" />
                    <div className="text-center">
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{totalTrades}</div>
                        <div className="text-[10px] text-slate-400">거래</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 xl:w-96 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col shrink-0 h-[calc(100vh-64px)] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">최근 거래</h3>
                <button onClick={onToggle} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Quick Stats */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">승률</div>
                        <div className="text-sm font-extrabold text-emerald-400">{winRate}%</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">총 거래</div>
                        <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{totalTrades}</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">누적 손익</div>
                        <div className={`text-sm font-extrabold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="종목 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm h-9 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Trade Lists */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
                {/* Active Positions */}
                {activeTrades.length > 0 && (
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">진행 중</span>
                            <span className="text-xs font-bold text-emerald-500 ml-auto">{activeTrades.length}</span>
                        </div>
                        <div className="space-y-2">
                            {activeTrades.map(trade => {
                                const badge = getBadge(trade);
                                return (
                                    <div key={trade.id} className="bg-slate-100 dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 p-3 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{trade.symbol}</span>
                                                {trade.position && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        trade.position === 'LONG' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'
                                                    }`}>
                                                        {trade.position}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>{trade.tradedAt}</span>
                                            <span className="font-medium">{trade.buyPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* History */}
                {historyTrades.length > 0 && (
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                            <BarChart3 className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">히스토리</span>
                        </div>
                        <div className="space-y-2">
                            {historyTrades.slice(0, 20).map(trade => {
                                const badge = getBadge(trade);
                                return (
                                    <div key={trade.id} className="bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{trade.symbol}</span>
                                                {trade.position && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        trade.position === 'LONG' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'
                                                    }`}>
                                                        {trade.position}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">{trade.tradedAt}</span>
                                            <span className={`font-semibold ${trade.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {trade.profit > 0 ? '+' : ''}{trade.profit.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {filteredTrades.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                        거래 내역이 없습니다
                    </div>
                )}
            </div>
        </div>
    );
}
