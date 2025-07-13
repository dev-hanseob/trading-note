'use client';

import {useEffect, useMemo, useState} from 'react';
import {Plus, Trash2, BookOpen, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight} from 'lucide-react';
import JournalRegisterModal from '@/components/JournalRegisterModal';
import JournalDetailModal from '@/components/JournalDetailModal';
import {deleteJournals, getJournals} from '@/lib/api/journal';
import {Journal} from "@/type/domain/journal";
import {TradeType} from "@/type/domain/journal.enum";
import {useSeed} from '@/hooks/useSeed';
import AdBanner from '@/components/AdBanner';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';

export default function JournalPage() {
    const { seed: totalSeed, isLoading: isSeedLoading } = useSeed();
    const [tableData, setTableData] = useState<Journal[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTarget, setDetailTarget] = useState<Journal | null>(null);
    const [editTarget, setEditTarget] = useState<Journal | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        getJournals({ page: currentPage, pageSize: itemsPerPage })
            .then((res) => {
                setTableData(res.journals);
                setTotalItems(res.total);
            })
            .catch((error) => {
                console.error('⛔️ 매매일지 조회 실패:', error);
            });
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 1024);
        };
        
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

    const selectedStats = useMemo(() => {
        const selectedEntries = calculatedTableData.filter(entry => selectedRows.has(entry.id));
        const totalProfit = selectedEntries.reduce((sum, entry) => sum + entry.profit, 0);
        const totalInvestment = selectedEntries.reduce((sum, entry) => sum + entry.investment, 0);
        const avgRoi = selectedEntries.length > 0 ? selectedEntries.reduce((sum, entry) => sum + entry.roi, 0) / selectedEntries.length : 0;
        const winRate = selectedEntries.length > 0 ? (selectedEntries.filter(entry => entry.profit > 0).length / selectedEntries.length) * 100 : 0;
        
        return {
            count: selectedEntries.length,
            totalProfit,
            totalInvestment,
            avgRoi,
            winRate
        };
    }, [calculatedTableData, selectedRows]);

    const getRoiColor = (roi: number) => {
        if (roi > 10) return 'bg-emerald-500';
        if (roi > 5) return 'bg-emerald-400';
        if (roi > 0) return 'bg-emerald-300';
        if (roi === 0) return 'bg-gray-300';
        if (roi > -5) return 'bg-red-300';
        if (roi > -10) return 'bg-red-400';
        return 'bg-red-500';
    };

    const getImportanceLevel = (entry: Journal) => {
        const absProfit = Math.abs(entry.profit);
        const absRoi = Math.abs(entry.roi);
        
        const isHighProfit = absProfit >= totalSeed * 0.1;
        const isHighRoi = absRoi >= 20;
        const isMediumRoi = absRoi >= 10;
        
        if (isHighProfit || isHighRoi) return 'high';
        if (isMediumRoi) return 'medium';
        return 'normal';
    };

    const getRowStyle = (entry: Journal, index: number, isSelected: boolean) => {
        const importance = getImportanceLevel(entry);
        
        if (isSelected) {
            return 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500';
        }
        
        if (importance === 'high') {
            return index % 2 === 0 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-l-4 border-yellow-400'
                : 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400';
        }
        
        if (importance === 'medium') {
            return index % 2 === 0 
                ? 'bg-blue-50 dark:bg-blue-900/10 border-l-2 border-blue-300'
                : 'bg-blue-100 dark:bg-blue-900/20 border-l-2 border-blue-300';
        }
        
        return index % 2 === 0 
            ? 'bg-white dark:bg-gray-800'
            : 'bg-gray-50 dark:bg-gray-800/50';
    };

    const toggleRow = (id: number) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (isSeedLoading) {
        return (
            <div className="flex justify-center w-full px-2 sm:px-4 relative z-0">
                <aside className="hidden 2xl:block w-[240px] p-3">
                    <AdBanner position="left" />
                </aside>
                <main className="w-full max-w-[1600px] px-2 sm:px-4 min-h-screen relative z-0">
                    <div className="p-4 sm:p-6 flex justify-center">
                        <div className="w-full max-w-[1600px] space-y-4">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <aside className="hidden 2xl:block w-[240px] p-3">
                    <AdBanner position="right" />
                </aside>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full px-2 sm:px-4 relative z-0">
            <aside className="hidden 2xl:block w-[240px] p-3">
                <AdBanner position="left" />
            </aside>
            <main className="w-full max-w-[1600px] px-2 sm:px-4 min-h-screen relative z-0">
                <div className="p-4 sm:p-6 flex justify-center">
                    <div className="w-full max-w-[1600px] space-y-4">
                        <section>
                            <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                                    <BookOpen size={20} />
                                    매매일지
                                </h2>
                                <div className="btn-group-trendy flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            setEditTarget(null);
                                            setShowModal(true);
                                        }}
                                        className="btn-trendy-primary flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                                        <Plus size={14} className="sm:w-4 sm:h-4" /> 
                                        <span className="hidden sm:inline">새 거래 등록</span>
                                        <span className="sm:hidden">등록</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await deleteJournals(Array.from(selectedRows));
                                                const updatedTableData = tableData.filter(entry => !selectedRows.has(entry.id));
                                                const updatedTotal = totalItems - selectedRows.size;
                                                setTableData(updatedTableData);
                                                setTotalItems(updatedTotal);
                                                setSelectedRows(new Set());
                                                const newTotalPages = Math.ceil(updatedTotal / itemsPerPage);
                                                if (currentPage > newTotalPages && newTotalPages > 0) {
                                                    setCurrentPage(newTotalPages);
                                                } else if (newTotalPages === 0) {
                                                    setCurrentPage(1);
                                                }
                                            } catch (e) {
                                                console.error('❌ 삭제 실패:', e);
                                            }
                                        }}
                                        disabled={selectedRows.size === 0}
                                        className="btn-trendy-danger flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                        <Trash2 size={14} className="sm:w-4 sm:h-4" /> 
                                        <span className="hidden sm:inline">선택 삭제 ({selectedRows.size})</span>
                                        <span className="sm:hidden">삭제 ({selectedRows.size})</span>
                                    </button>
                                </div>
                            </div>

                            {selectedRows.size > 0 && (
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">선택된 항목:</span>
                                            <span className="font-bold">{selectedStats.count}개</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">총 손익:</span>
                                            <span className={`font-bold ${selectedStats.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {selectedStats.totalProfit > 0 ? '+' : ''}{selectedStats.totalProfit.toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">평균 수익률:</span>
                                            <span className={`font-bold ${selectedStats.avgRoi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {selectedStats.avgRoi > 0 ? '+' : ''}{selectedStats.avgRoi.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">승률:</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{selectedStats.winRate.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-lg">
                                {!isMobileView && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        <table className="min-w-[1400px] xl:min-w-[1500px] w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left w-16">
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedRows(new Set(calculatedTableData.map(entry => entry.id)));
                                                                } else {
                                                                    setSelectedRows(new Set());
                                                                }
                                                            }}
                                                            checked={selectedRows.size === calculatedTableData.length && calculatedTableData.length > 0}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-36">날짜</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-28">종목</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-24">유형</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-24">시장</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-24">포지션</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-24">수량</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-40">단가</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-28">레버리지</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-40">투자금</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">손익</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-44">수익률</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 w-40">메모</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {calculatedTableData.map((entry, index) => {
                                                    const isProfit = entry.profit > 0;
                                                    const isSelected = selectedRows.has(entry.id);
                                                    return (
                                                        <tr 
                                                            key={entry.id} 
                                                            className={`transition-all duration-200 cursor-pointer ${getRowStyle(entry, index, isSelected)} hover:shadow-md hover:scale-[1.01] hover:z-10 relative`}
                                                            onClick={() => { setDetailTarget(entry); setShowDetailModal(true); }}
                                                        >
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRows.has(entry.id)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={() => toggleRow(entry.id)}
                                                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                                                <span className="text-sm font-medium">{entry.tradedAt}</span>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                                    {entry.symbol}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{entry.assetType}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                    entry.tradeType === 'SPOT' 
                                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                                }`}>
                                                                    {entry.tradeType}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                                                {entry.tradeType === TradeType.SPOT ? '-' : entry.position}
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{entry.quantity}</td>
                                                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">{entry.buyPrice.toLocaleString()}원</td>
                                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                                                {entry.tradeType === TradeType.FUTURE && entry.leverage ? `${entry.leverage}배` : '-'}
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">{entry.investment.toLocaleString()}원</td>
                                                            <td className="px-4 py-2">
                                                                <div className="flex flex-col">
                                                                    <span className={`font-bold ${
                                                                        getImportanceLevel(entry) === 'high' 
                                                                            ? isProfit ? 'text-emerald-700 text-base' : 'text-red-700 text-base'
                                                                            : getImportanceLevel(entry) === 'medium'
                                                                            ? isProfit ? 'text-emerald-600 text-sm' : 'text-red-600 text-sm'
                                                                            : isProfit ? 'text-emerald-600 text-sm' : entry.profit === 0 ? 'text-gray-500 text-sm' : 'text-red-500 text-sm'
                                                                    }`}>
                                                                        {entry.profit > 0 ? '+' : ''}{entry.profit.toLocaleString()}원
                                                                        {getImportanceLevel(entry) === 'high' && (
                                                                            <span className="ml-1 text-xs">🔥</span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-bold ${
                                                                            getImportanceLevel(entry) === 'high'
                                                                                ? entry.roi > 0 
                                                                                    ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100 text-xs'
                                                                                    : 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100 text-xs'
                                                                                : getImportanceLevel(entry) === 'medium'
                                                                                ? entry.roi > 0 
                                                                                    ? 'bg-emerald-150 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs'
                                                                                    : 'bg-red-150 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-xs'
                                                                                : entry.roi > 0 
                                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs'
                                                                                    : entry.roi === 0
                                                                                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs'
                                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs'
                                                                        }`}>
                                                                            {entry.roi > 0 ? '+' : ''}{entry.roi.toFixed(2)}%
                                                                        </span>
                                                                        {getImportanceLevel(entry) === 'high' && Math.abs(entry.roi) >= 30 && (
                                                                            <span className="text-xs">⚡</span>
                                                                        )}
                                                                    </div>
                                                                    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${
                                                                        getImportanceLevel(entry) === 'high' ? 'h-2' : 'h-1.5'
                                                                    }`}>
                                                                        <div 
                                                                            className={`rounded-full transition-all duration-300 ${getRoiColor(entry.roi)} ${
                                                                                getImportanceLevel(entry) === 'high' ? 'h-2 shadow-sm' : 'h-1.5'
                                                                            }`}
                                                                            style={{ 
                                                                                width: `${Math.min(Math.abs(entry.roi) * 2, 100)}%`,
                                                                                marginLeft: entry.roi < 0 ? `${Math.max(100 - Math.abs(entry.roi) * 2, 0)}%` : '0'
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={entry.memo}>
                                                                {entry.memo}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {calculatedTableData.length === 0 && (
                                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium mb-2">매매 기록이 없습니다</p>
                                                <p className="text-sm">첫 번째 매매일지를 등록해보세요!</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isMobileView && (
                                    <div className="space-y-3">
                                        {calculatedTableData.map((entry) => {
                                            const isSelected = selectedRows.has(entry.id);
                                            const isProfit = entry.profit > 0;
                                            const importance = getImportanceLevel(entry);
                                            
                                            return (
                                                <div
                                                    key={entry.id}
                                                    className={`rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                                                        isSelected
                                                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                                            : importance === 'high'
                                                            ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                    }`}
                                                    onClick={() => { setDetailTarget(entry); setShowDetailModal(true); }}
                                                >
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={() => toggleRow(entry.id)}
                                                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                />
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                                    {entry.symbol}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                    entry.tradeType === 'SPOT' 
                                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                }`}>
                                                                    {entry.tradeType}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {entry.tradedAt}
                                                            </div>
                                                        </div>

                                                        <div className="mb-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">손익</div>
                                                                    <div className={`font-bold ${
                                                                        isProfit ? 'text-emerald-600' : entry.profit === 0 ? 'text-gray-500' : 'text-red-500'
                                                                    } ${importance === 'high' ? 'text-lg' : 'text-base'}`}>
                                                                        {entry.profit > 0 ? '+' : ''}{entry.profit.toLocaleString()}원
                                                                        {importance === 'high' && (
                                                                            <span className="ml-1 text-xs">{isProfit ? '🔥' : '⚠️'}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">수익률</div>
                                                                    <div className={`font-bold ${
                                                                        isProfit ? 'text-emerald-600' : entry.profit === 0 ? 'text-gray-500' : 'text-red-500'
                                                                    } ${importance === 'high' ? 'text-lg' : 'text-base'}`}>
                                                                        {entry.roi > 0 ? '+' : ''}{entry.roi.toFixed(2)}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                                                                <div 
                                                                    className={`rounded-full transition-all duration-300 h-1.5 ${
                                                                        isProfit ? 'bg-emerald-500' : entry.profit === 0 ? 'bg-gray-400' : 'bg-red-500'
                                                                    }`}
                                                                    style={{ 
                                                                        width: `${Math.min(Math.abs(entry.roi) * 2, 100)}%`,
                                                                        marginLeft: entry.roi < 0 ? `${Math.max(100 - Math.abs(entry.roi) * 2, 0)}%` : '0'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex justify-between">
                                                                <span>투자금</span>
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.investment.toLocaleString()}원</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>수량</span>
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.quantity}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>단가</span>
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.buyPrice.toLocaleString()}원</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>레버리지</span>
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {entry.tradeType === TradeType.FUTURE && entry.leverage ? `${entry.leverage}배` : '-'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {entry.memo && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">메모</div>
                                                                <div className="text-sm text-gray-700 dark:text-gray-300">{entry.memo}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {calculatedTableData.length === 0 && (
                                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium mb-2">매매 기록이 없습니다</p>
                                                <p className="text-sm">첫 번째 매매일지를 등록해보세요!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 gap-4 sm:gap-6 px-1">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="btn-trendy-icon disabled:opacity-30 disabled:hover:scale-100"
                                    >
                                        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                    
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let page;
                                            if (totalPages <= 5) {
                                                page = i + 1;
                                            } else if (currentPage <= 3) {
                                                page = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                page = totalPages - 4 + i;
                                            } else {
                                                page = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`btn-pagination px-3 py-1.5 text-xs sm:text-sm min-w-[32px] sm:min-w-[40px] ${
                                                        currentPage === page ? 'active' : ''
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="btn-trendy-icon disabled:opacity-30 disabled:hover:scale-100"
                                    >
                                        <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium hidden sm:inline">페이지당</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(parseInt(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="btn-trendy-secondary text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] appearance-none bg-none cursor-pointer"
                                    >
                                        {[10, 20, 30, 50].map((num) => (
                                            <option key={num} value={num}>
                                                {num}개
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {showModal && (
                            <JournalRegisterModal
                                editTarget={editTarget ?? undefined}
                                onClose={() => {
                                    setShowModal(false);
                                    setEditTarget(null);
                                    if (detailTarget) {
                                        setShowDetailModal(true);
                                    }
                                }}
                                onSuccessAction={(newData) => {
                                    if (editTarget) {
                                        setTableData((prev) => 
                                            prev.map(item => item.id === newData.id ? newData : item)
                                        );
                                        if (detailTarget && detailTarget.id === newData.id) {
                                            setDetailTarget(newData);
                                        }
                                    } else {
                                        getJournals({ page: currentPage, pageSize: itemsPerPage })
                                            .then((res) => {
                                                setTableData(res.journals);
                                                setTotalItems(res.total);
                                            })
                                            .catch((error) => {
                                                console.error('⛔️ 매매일지 조회 실패:', error);
                                            });
                                    }
                                    setShowModal(false);
                                    setEditTarget(null);
                                    if (detailTarget) {
                                        setShowDetailModal(true);
                                    }
                                }}
                            />
                        )}

                        {showDetailModal && detailTarget && (
                            <JournalDetailModal
                                journal={detailTarget}
                                totalSeed={totalSeed}
                                onClose={() => {
                                    setShowDetailModal(false);
                                    setDetailTarget(null);
                                }}
                                onEdit={() => {
                                    setEditTarget(detailTarget);
                                    setShowDetailModal(false);
                                    setDetailTarget(null);
                                    setShowModal(true);
                                }}
                                onDelete={async () => {
                                    try {
                                        await deleteJournals([detailTarget.id]);
                                        
                                        const updatedTableData = tableData.filter(entry => entry.id !== detailTarget.id);
                                        const updatedTotal = totalItems - 1;
                                        
                                        setTableData(updatedTableData);
                                        setTotalItems(updatedTotal);
                                        
                                        const newTotalPages = Math.ceil(updatedTotal / itemsPerPage);
                                        if (currentPage > newTotalPages && newTotalPages > 0) {
                                            setCurrentPage(newTotalPages);
                                        } else if (newTotalPages === 0) {
                                            setCurrentPage(1);
                                        }
                                        
                                        setShowDetailModal(false);
                                        setDetailTarget(null);
                                    } catch (e) {
                                        console.error('❌ 삭제 실패:', e);
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </main>
            <aside className="hidden 2xl:block w-[240px] p-3">
                <AdBanner position="right" />
            </aside>
        </div>
    );
}