'use client';

import {useEffect, useMemo, useState, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus, Trash2, BookOpen, ChevronLeft, ChevronRight,
    LayoutGrid, List, TrendingUp, TrendingDown, BarChart3,
    Search, X, ArrowUpDown, ArrowUp, ArrowDown,
    StickyNote, ChevronDown, Zap, FileSpreadsheet
} from 'lucide-react';
import JournalRegisterModal from '@/components/JournalRegisterModal';
import JournalDetailModal from '@/components/JournalDetailModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import CsvImportModal from '@/components/CsvImportModal';
import { useToast } from '@/components/Toast';
import {deleteJournals, getJournals} from '@/lib/api/journal';
import {Journal} from "@/type/domain/journal";
import {AssetType, TradeType, AssetTypeLabel, TradeTypeLabel} from "@/type/domain/journal.enum";
import {useSeed} from '@/hooks/useSeed';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeBanner from '@/components/UpgradeBanner';

function formatTradeDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${m}.${d}`;
    } catch {
        return dateStr;
    }
}

type SortField = 'symbol' | 'date' | 'pnl' | 'roi' | 'investment' | null;
type SortDir = 'asc' | 'desc';

export default function JournalPage() {
    const router = useRouter();
    const {seed: totalSeed, isLoading: isSeedLoading} = useSeed();
    const { showToast } = useToast();
    const [tableData, setTableData] = useState<Journal[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTarget, setDetailTarget] = useState<Journal | null>(null);
    const [editTarget, setEditTarget] = useState<Journal | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [singleDeleteTarget, setSingleDeleteTarget] = useState<number | null>(null);
    const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const subscription = useSubscription();

    const [searchQuery, setSearchQuery] = useState('');
    const [assetFilter, setAssetFilter] = useState<'all' | AssetType>('all');
    const [tradeTypeFilter, setTradeTypeFilter] = useState<'all' | TradeType>('all');
    const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'win' | 'loss' | 'open'>('all');

    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const fetchJournals = useCallback(() => {
        getJournals({page: currentPage, pageSize: itemsPerPage})
            .then((res) => {
                setTableData(res.journals);
                setTotalItems(res.total);
            })
            .catch((error) => {
                // silently handle fetch errors
            });
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const calculatedTableData = useMemo(() => {
        return tableData.map(entry => ({
            ...entry,
            roi: totalSeed > 0 ? (entry.profit / totalSeed) * 100 : 0
        }));
    }, [tableData, totalSeed]);

    const filteredAndSortedData = useMemo(() => {
        let data = [...calculatedTableData];

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            data = data.filter(e => e.symbol.toLowerCase().includes(q));
        }
        if (assetFilter !== 'all') data = data.filter(e => e.assetType === assetFilter);
        if (tradeTypeFilter !== 'all') data = data.filter(e => e.tradeType === tradeTypeFilter);
        if (outcomeFilter === 'win') data = data.filter(e => e.profit > 0);
        else if (outcomeFilter === 'loss') data = data.filter(e => e.profit < 0);
        else if (outcomeFilter === 'open') data = data.filter(e => e.profit === 0);

        if (sortField) {
            data.sort((a, b) => {
                let cmp = 0;
                switch (sortField) {
                    case 'symbol': cmp = a.symbol.localeCompare(b.symbol); break;
                    case 'date': cmp = new Date(a.tradedAt).getTime() - new Date(b.tradedAt).getTime(); break;
                    case 'pnl': cmp = a.profit - b.profit; break;
                    case 'roi': cmp = a.roi - b.roi; break;
                    case 'investment': cmp = a.investment - b.investment; break;
                }
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return data;
    }, [calculatedTableData, searchQuery, assetFilter, tradeTypeFilter, outcomeFilter, sortField, sortDir]);

    const summaryStats = useMemo(() => {
        const all = calculatedTableData;
        const total = all.length;
        const wins = all.filter(e => e.profit > 0).length;
        const losses = all.filter(e => e.profit < 0).length;
        const winRate = total > 0 ? (wins / total) * 100 : 0;
        const totalPnl = all.reduce((s, e) => s + e.profit, 0);
        const avgPnl = total > 0 ? totalPnl / total : 0;
        return {total, wins, losses, winRate, totalPnl, avgPnl};
    }, [calculatedTableData]);

    const selectedStats = useMemo(() => {
        const sel = calculatedTableData.filter(e => selectedRows.has(e.id));
        const totalProfit = sel.reduce((s, e) => s + e.profit, 0);
        const avgRoi = sel.length > 0 ? sel.reduce((s, e) => s + e.roi, 0) / sel.length : 0;
        const winRate = sel.length > 0 ? (sel.filter(e => e.profit > 0).length / sel.length) * 100 : 0;
        return {count: sel.length, totalProfit, avgRoi, winRate};
    }, [calculatedTableData, selectedRows]);

    const getOutcomeBadge = (entry: Journal) => {
        if (entry.profit === 0) return {label: '진행중', className: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'};
        if (entry.profit > 0) return {label: '이익', className: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'};
        return {label: '손실', className: 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300'};
    };

    const toggleRow = (id: number) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300 ml-1" />;
        if (sortDir === 'asc') return <ArrowUp size={12} className="text-emerald-500 ml-1" />;
        return <ArrowDown size={12} className="text-emerald-500 ml-1" />;
    };

    const handleBatchDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteJournals(Array.from(selectedRows));
            const updated = tableData.filter(e => !selectedRows.has(e.id));
            const updTotal = totalItems - selectedRows.size;
            setTableData(updated);
            setTotalItems(updTotal);
            const deletedCount = selectedRows.size;
            setSelectedRows(new Set());
            const newTP = Math.ceil(updTotal / itemsPerPage);
            if (currentPage > newTP && newTP > 0) setCurrentPage(newTP);
            else if (newTP === 0) setCurrentPage(1);
            showToast(`${deletedCount}건의 거래가 삭제되었습니다`, 'success');
        } catch {
            showToast('삭제에 실패했습니다', 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleSingleDelete = async () => {
        if (!singleDeleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteJournals([singleDeleteTarget]);
            const upd = tableData.filter(e => e.id !== singleDeleteTarget);
            const updT = totalItems - 1;
            setTableData(upd);
            setTotalItems(updT);
            const newTP = Math.ceil(updT / itemsPerPage);
            if (currentPage > newTP && newTP > 0) setCurrentPage(newTP);
            else if (newTP === 0) setCurrentPage(1);
            setShowDetailModal(false);
            setDetailTarget(null);
            showToast('거래가 삭제되었습니다', 'success');
        } catch {
            showToast('삭제에 실패했습니다', 'error');
        } finally {
            setIsDeleting(false);
            setSingleDeleteTarget(null);
        }
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasActiveFilters = !!(searchQuery || assetFilter !== 'all' || tradeTypeFilter !== 'all' || outcomeFilter !== 'all');

    const resetFilters = () => {
        setSearchQuery(''); setAssetFilter('all'); setTradeTypeFilter('all'); setOutcomeFilter('all');
    };

    const handleNavigate = useCallback((journal: Journal) => setDetailTarget(journal), []);

    const currentDetailIndex = useMemo(() => {
        if (!detailTarget) return -1;
        return filteredAndSortedData.findIndex(e => e.id === detailTarget.id);
    }, [detailTarget, filteredAndSortedData]);

    if (isSeedLoading) {
        return (
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64" />
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                <div>
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-1">매매일지</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">매매 히스토리</h1>
                    <p className="text-slate-500 mt-1">총 <span className="font-semibold text-slate-600 dark:text-slate-300">{totalItems}건</span>의 거래를 기록했습니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5">
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                            <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    {selectedRows.size > 0 && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium rounded-lg text-sm transition-colors"
                        >
                            <Trash2 size={15} /> 삭제 ({selectedRows.size})
                        </button>
                    )}
                    <button
                        onClick={() => setIsCsvImportOpen(true)}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV 가져오기
                    </button>
                    <button
                        onClick={() => { setEditTarget(null); setShowModal(true); }}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-sm border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                        <Zap size={14} /> 퀵 엔트리
                    </button>
                    <Link href="/journal/new" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors">
                        <Plus size={16} /> 새 거래
                    </Link>
                </div>
            </div>

            {/* Upgrade Banner */}
            {(subscription.effectiveTier === 'FREE' || subscription.isTrialActive) && (
                <div className="mb-4">
                    <UpgradeBanner
                        tradesUsed={subscription.tradesUsed}
                        tradeLimit={subscription.tradeLimit}
                        usagePercent={subscription.usagePercent}
                        isTrialActive={subscription.isTrialActive}
                        trialDaysLeft={subscription.trialDaysLeft}
                    />
                </div>
            )}

            {/* Summary Stat Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 overflow-x-auto border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-slate-500">총 거래</span><span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{summaryStats.total}건</span></div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-slate-500">이익</span><span className="text-sm font-bold text-emerald-400 tabular-nums">{summaryStats.wins}건</span></div>
                <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-slate-500">손실</span><span className="text-sm font-bold text-red-400 tabular-nums">{summaryStats.losses}건</span></div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-slate-500">승률</span><span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{summaryStats.winRate.toFixed(1)}%</span></div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-slate-500">총 P&L</span><span className={`text-sm font-bold tabular-nums ${summaryStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{summaryStats.totalPnl > 0 ? '+' : ''}{summaryStats.totalPnl.toLocaleString()}원</span></div>
                <div className="flex items-center gap-2 shrink-0"><span className="text-xs text-slate-500">평균 P&L</span><span className={`text-sm font-bold tabular-nums ${summaryStats.avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{summaryStats.avgPnl > 0 ? '+' : ''}{Math.round(summaryStats.avgPnl).toLocaleString()}원</span></div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input type="text" placeholder="종목명으로 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm h-9 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={14} /></button>}
                    </div>
                    <div className="relative">
                        <select value={assetFilter} onChange={e => setAssetFilter(e.target.value as 'all' | AssetType)} className="h-9 pl-3 pr-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer">
                            <option value="all">전체 자산</option><option value={AssetType.STOCK}>주식</option><option value={AssetType.CRYPTO}>암호화폐</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select value={tradeTypeFilter} onChange={e => setTradeTypeFilter(e.target.value as 'all' | TradeType)} className="h-9 pl-3 pr-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer">
                            <option value="all">전체 유형</option><option value={TradeType.SPOT}>현물</option><option value={TradeType.FUTURES}>선물</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value as 'all' | 'win' | 'loss' | 'open')} className="h-9 pl-3 pr-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer">
                            <option value="all">전체 결과</option><option value="win">이익</option><option value="loss">손실</option><option value="open">진행중</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                </div>
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">적용된 필터:</span>
                        {searchQuery && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded text-xs font-medium">&quot;{searchQuery}&quot;<button onClick={() => setSearchQuery('')} className="hover:text-emerald-300 ml-1"><X size={12} /></button></span>}
                        {assetFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded text-xs font-medium">{AssetTypeLabel[assetFilter]}<button onClick={() => setAssetFilter('all')} className="hover:text-emerald-300 ml-1"><X size={12} /></button></span>}
                        {tradeTypeFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded text-xs font-medium">{TradeTypeLabel[tradeTypeFilter]}<button onClick={() => setTradeTypeFilter('all')} className="hover:text-emerald-300 ml-1"><X size={12} /></button></span>}
                        {outcomeFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded text-xs font-medium">{outcomeFilter === 'win' ? '이익' : outcomeFilter === 'loss' ? '손실' : '진행중'}<button onClick={() => setOutcomeFilter('all')} className="hover:text-emerald-300 ml-1"><X size={12} /></button></span>}
                        <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-300 font-medium ml-1">전체 초기화</button>
                    </div>
                )}
            </div>

            {/* Selected Stats Bar */}
            {selectedRows.size > 0 && (
                <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div><span className="text-slate-500">선택됨</span><span className="ml-2 font-bold text-slate-900 dark:text-white tabular-nums">{selectedStats.count}</span></div>
                        <div><span className="text-slate-500">총 P&L</span><span className={`ml-2 font-bold tabular-nums ${selectedStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{selectedStats.totalProfit > 0 ? '+' : ''}{selectedStats.totalProfit.toLocaleString()}</span></div>
                        <div><span className="text-slate-500">평균 ROI</span><span className={`ml-2 font-bold tabular-nums ${selectedStats.avgRoi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{selectedStats.avgRoi > 0 ? '+' : ''}{selectedStats.avgRoi.toFixed(2)}%</span></div>
                        <div><span className="text-slate-500">승률</span><span className="ml-2 font-bold text-slate-900 dark:text-white tabular-nums">{selectedStats.winRate.toFixed(1)}%</span></div>
                    </div>
                </div>
            )}

            {/* Table View */}
            {!isMobileView && viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="px-4 py-3 text-left w-12">
                                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                                        onChange={e => { e.target.checked ? setSelectedRows(new Set(filteredAndSortedData.map(x => x.id))) : setSelectedRows(new Set()); }}
                                        checked={selectedRows.size === filteredAndSortedData.length && filteredAndSortedData.length > 0} />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none" onClick={() => handleSort('symbol')}>
                                    <span className="inline-flex items-center">종목 {getSortIcon('symbol')}</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">포지션</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none" onClick={() => handleSort('date')}>
                                    <span className="inline-flex items-center">날짜 {getSortIcon('date')}</span>
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none" onClick={() => handleSort('pnl')}>
                                    <span className="inline-flex items-center justify-end">P&L {getSortIcon('pnl')}</span>
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none" onClick={() => handleSort('roi')}>
                                    <span className="inline-flex items-center justify-end">ROI {getSortIcon('roi')}</span>
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none" onClick={() => handleSort('investment')}>
                                    <span className="inline-flex items-center justify-end">투자금 {getSortIcon('investment')}</span>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">결과</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-12" />
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAndSortedData.map((entry, index) => {
                                const isSelected = selectedRows.has(entry.id);
                                const badge = getOutcomeBadge(entry);
                                const isEven = index % 2 === 0;
                                return (
                                    <tr key={entry.id} className={`border-b border-slate-200 dark:border-slate-800 transition-colors cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-800/70 ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : isEven ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                                        onClick={() => { setDetailTarget(entry); setShowDetailModal(true); }}>
                                        <td className="px-4 py-3.5"><input type="checkbox" checked={isSelected} onClick={e => e.stopPropagation()} onChange={() => toggleRow(entry.id)} className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500" /></td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${entry.assetType === AssetType.CRYPTO ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}><span className={`text-xs font-bold ${entry.assetType === AssetType.CRYPTO ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{entry.symbol.charAt(0)}</span></div>
                                                <div><div className="font-semibold text-slate-900 dark:text-white">{entry.symbol}</div><div className="text-xs text-slate-500 dark:text-slate-400">{AssetTypeLabel[entry.assetType] || entry.assetType}</div></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${entry.tradeType === TradeType.FUTURES && entry.position === 'LONG' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : entry.tradeType === TradeType.FUTURES && entry.position === 'SHORT' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                {entry.tradeType === TradeType.FUTURES ? `${entry.position || '선물'}${entry.leverage && entry.leverage > 1 ? ` ${entry.leverage}x` : ''}` : '현물'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-sm tabular-nums font-medium">{formatTradeDate(entry.tradedAt)}</td>
                                        <td className="px-4 py-3.5 text-right"><span className={`font-semibold tabular-nums ${entry.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : entry.profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>{entry.profit > 0 ? '+' : ''}{entry.profit.toLocaleString()}</span></td>
                                        <td className="px-4 py-3.5 text-right"><span className={`font-semibold text-sm tabular-nums ${entry.roi > 0 ? 'text-emerald-600 dark:text-emerald-400' : entry.roi < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>{entry.roi > 0 ? '+' : ''}{entry.roi.toFixed(2)}%</span></td>
                                        <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200 tabular-nums">{entry.investment.toLocaleString()}</td>
                                        <td className="px-4 py-3.5 text-center"><span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${badge.className}`}>{badge.label}</span></td>
                                        <td className="px-4 py-3.5 text-center">{entry.memo && <StickyNote size={14} className="text-slate-400 dark:text-slate-500 mx-auto" />}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    {filteredAndSortedData.length === 0 && (
                        <div className="text-center py-16">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            {hasActiveFilters ? (
                                <><p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">검색 결과가 없습니다</p><p className="text-sm text-slate-400 mb-4">다른 검색어나 필터를 시도해보세요</p><button onClick={resetFilters} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg text-sm transition-colors">필터 초기화</button></>
                            ) : (
                                <><p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">아직 기록된 거래가 없습니다</p><p className="text-sm text-slate-400 mb-4">첫 번째 거래를 기록하고 성과를 추적해보세요</p><Link href="/journal/new" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors"><Plus size={16} /> 새 거래</Link></>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Grid/Card View */}
            {(isMobileView || viewMode === 'grid') && (
                <div className={`grid gap-4 ${!isMobileView ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredAndSortedData.map(entry => {
                        const isSelected = selectedRows.has(entry.id);
                        const badge = getOutcomeBadge(entry);
                        const isWin = entry.profit > 0;
                        const isLoss = entry.profit < 0;
                        return (
                            <div key={entry.id} className={`group bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-colors cursor-pointer ${isSelected ? 'border-emerald-700 ring-1 ring-emerald-800' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                onClick={() => { setDetailTarget(entry); setShowDetailModal(true); }}>
                                <div className="relative h-40 overflow-hidden">
                                    {entry.chartScreenshotUrl ? (
                                        <img src={entry.chartScreenshotUrl.split(',')[0]} alt={`${entry.symbol} chart`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                                            <BarChart3 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute top-2.5 left-2.5"><input type="checkbox" checked={isSelected} onClick={e => e.stopPropagation()} onChange={() => toggleRow(entry.id)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-emerald-500 focus:ring-emerald-500" /></div>
                                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${badge.className}`}>{badge.label}</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${entry.tradeType === TradeType.FUTURES && entry.position === 'LONG' ? 'bg-emerald-900/70 text-emerald-400' : entry.tradeType === TradeType.FUTURES && entry.position === 'SHORT' ? 'bg-red-900/70 text-red-400' : 'bg-slate-200 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400'}`}>
                                            {entry.tradeType === TradeType.FUTURES ? entry.position : '현물'}{entry.leverage && entry.leverage > 1 ? ` ${entry.leverage}x` : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${isWin ? 'bg-emerald-900/50 text-emerald-400' : isLoss ? 'bg-red-900/50 text-red-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>{entry.symbol.charAt(0)}</div>
                                            <div><div className="font-medium text-slate-900 dark:text-white text-sm leading-tight">{entry.symbol}</div><div className="text-xs text-slate-500">{AssetTypeLabel[entry.assetType] || entry.assetType}</div></div>
                                        </div>
                                        <span className="text-xs text-slate-400">{formatTradeDate(entry.tradedAt)}</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div><div className="text-xs text-slate-500 mb-0.5">P&L</div><div className={`text-lg font-bold tabular-nums ${isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-slate-500'}`}>{entry.profit > 0 ? '+' : ''}{entry.profit.toLocaleString()}</div></div>
                                        <div className="text-right"><div className="text-xs text-slate-500 mb-0.5">ROI</div><div className={`text-lg font-bold tabular-nums flex items-center gap-1 ${isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-slate-500'}`}>{isWin && <TrendingUp className="w-4 h-4" />}{isLoss && <TrendingDown className="w-4 h-4" />}{entry.roi > 0 ? '+' : ''}{entry.roi.toFixed(2)}%</div></div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                                        <span>{entry.investment.toLocaleString()} 투자</span>
                                        {entry.memo && <StickyNote size={12} className="text-slate-300" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredAndSortedData.length === 0 && (
                        <div className="col-span-full text-center py-16">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            {hasActiveFilters ? (
                                <><p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">검색 결과가 없습니다</p><p className="text-sm text-slate-400 mb-4">다른 검색어나 필터를 시도해보세요</p><button onClick={resetFilters} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg text-sm transition-colors">필터 초기화</button></>
                            ) : (
                                <><p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">아직 기록된 거래가 없습니다</p><p className="text-sm text-slate-400 mb-4">첫 번째 거래를 기록하고 성과를 추적해보세요</p><Link href="/journal/new" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors"><Plus size={16} /> 새 거래</Link></>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {filteredAndSortedData.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                        <div className="flex items-center gap-1">
                            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                                let page;
                                if (totalPages <= 5) page = i + 1;
                                else if (currentPage <= 3) page = i + 1;
                                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                else page = currentPage - 2 + i;
                                return (<button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{page}</button>);
                            })}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                    </div>
                    <select value={itemsPerPage} onChange={e => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500">
                        {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}개씩 보기</option>)}
                    </select>
                </div>
            )}

            {/* Mobile FAB */}
            <Link href="/journal/new" className="fixed bottom-6 right-6 lg:hidden z-40 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500 active:scale-95 transition-all">
                <Plus size={24} />
            </Link>

            {/* Modals */}
            {showModal && (
                <JournalRegisterModal
                    editTarget={editTarget ?? undefined}
                    recentJournals={tableData}
                    onClose={() => { setShowModal(false); setEditTarget(null); if (detailTarget) setShowDetailModal(true); }}
                    onSuccessAction={(newData) => {
                        if (editTarget) { setTableData(prev => prev.map(item => item.id === newData.id ? newData : item)); if (detailTarget && detailTarget.id === newData.id) setDetailTarget(newData); }
                        else { getJournals({page: currentPage, pageSize: itemsPerPage}).then(res => { setTableData(res.journals); setTotalItems(res.total); }).catch(() => {}); }
                        setShowModal(false); setEditTarget(null); if (detailTarget) setShowDetailModal(true);
                    }}
                />
            )}

            {showDetailModal && detailTarget && (
                <JournalDetailModal
                    journal={detailTarget}
                    journals={filteredAndSortedData}
                    currentIndex={currentDetailIndex}
                    totalSeed={totalSeed}
                    onClose={() => { setShowDetailModal(false); setDetailTarget(null); }}
                    onEdit={() => { router.push(`/journal/${detailTarget.id}/edit`); }}
                    onDelete={() => {
                        setSingleDeleteTarget(detailTarget.id);
                    }}
                    onNavigate={handleNavigate}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="거래 삭제"
                message={`선택한 ${selectedRows.size}건의 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                confirmLabel="삭제"
                variant="danger"
                onConfirm={handleBatchDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={!!singleDeleteTarget}
                title="거래 삭제"
                message="이 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                confirmLabel="삭제"
                variant="danger"
                onConfirm={handleSingleDelete}
                onCancel={() => setSingleDeleteTarget(null)}
                isLoading={isDeleting}
            />

            <CsvImportModal
                isOpen={isCsvImportOpen}
                onClose={() => setIsCsvImportOpen(false)}
                onComplete={() => {
                    setIsCsvImportOpen(false);
                    fetchJournals();
                }}
            />
        </div>
    );
}
