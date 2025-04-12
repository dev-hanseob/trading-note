'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { addDays, subMonths, subWeeks, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JournalRegisterModal from '@/components/JournalRegisterModal';

const SeedChart = dynamic(() => import('@/components/SeedChart'), { ssr: false });

export default function JournalPage() {
    const totalSeed = 10000000;
    const [chartData, setChartData] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [range, setRange] = useState<'1W' | '1M' | '3M' | '6M' | 'ALL'>('ALL');
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [showChartSection, setShowChartSection] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetch('/mock_chart_trade_data_100.json')
            .then((res) => res.json())
            .then((data) => setChartData(data));

        fetch('/mock_trade_data_100.json')
            .then((res) => res.json())
            .then((data) => setTableData(data));
    }, []);

    const filteredChartData = useMemo(() => {
        if (range === 'ALL') return chartData;

        const now = new Date();
        let from = new Date(now);

        switch (range) {
            case '1W': from = subWeeks(now, 1); break;
            case '1M': from = subMonths(now, 1); break;
            case '3M': from = subMonths(now, 3); break;
            case '6M': from = subMonths(now, 6); break;
        }

        return chartData.filter((d) => parseISO(d.time) >= from);
    }, [chartData, range]);

    const totalProfit = tableData.reduce((sum, e) => {
        const value = parseInt(e.profit.replace(/[+,원]/g, ''));
        return sum + (e.profit.includes('-') ? -value : value);
    }, 0);

    const totalRoi = (totalProfit / totalSeed) * 100;

    const toggleRow = (id: number) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return tableData.slice(start, start + itemsPerPage);
    }, [tableData, currentPage, itemsPerPage]);

    return (
        <div className="p-4 sm:p-6 flex justify-center">
            <div className="w-full max-w-7xl space-y-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold">현재 시드 추이</h1>
                    <button
                        onClick={() => setShowChartSection(prev => !prev)}
                        className="rounded-lg px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                    >
                        {showChartSection ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />}
                    </button>
                </div>

                <AnimatePresence>
                    {showChartSection && (
                        <motion.section
                            key="chart-section"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 mb-10 overflow-hidden"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                총 시드: {totalSeed.toLocaleString()}원 | 누적 손익: {totalProfit.toLocaleString()}원 | 총 수익률: <span className={totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{totalRoi.toFixed(2)}%</span>
                            </p>

                            <div className="flex flex-wrap gap-2 justify-end ml-auto">
                                {['1W', '1M', '3M', '6M', 'ALL'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r as any)}
                                        className={`px-2 py-1 text-xs rounded border ${range === r ? 'bg-blue-500 text-white' : 'bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <div className="overflow-x-auto">
                                <SeedChart data={filteredChartData} />
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                <section>
                    <div className="flex justify-between items-center flex-wrap gap-2 mt-20 mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold">매매일지</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded">
                                <Plus size={14} /> 등록
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1 text-sm border border-red-400 text-red-500 rounded">
                                <Trash2 size={14} /> 삭제
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[800px] w-full border border-gray-300 rounded-md overflow-hidden text-sm">
                            <thead className="bg-blue-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="px-2 py-3 border-b"></th>
                                <th className="py-3 px-4 text-left border-b">날짜</th>
                                <th className="py-3 px-4 text-left border-b">종목</th>
                                <th className="py-3 px-4 text-left border-b">유형</th>
                                <th className="py-3 px-4 text-left border-b">포지션</th>
                                <th className="py-3 px-4 text-left border-b">수량</th>
                                <th className="py-3 px-4 text-left border-b">단가</th>
                                <th className="py-3 px-4 text-left border-b">레버리지</th>
                                <th className="py-3 px-4 text-left border-b">투자금</th>
                                <th className="py-3 px-4 text-left border-b">손익</th>
                                <th className="py-3 px-4 text-left border-b">수익률</th>
                                <th className="py-3 px-4 text-left border-b">메모</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedData.map((entry) => {
                                const isProfit = entry.profit.includes('+');
                                return (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-2 py-3 border-b">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(entry.id)}
                                                onChange={() => toggleRow(entry.id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4 border-b">{entry.date}</td>
                                        <td className="py-3 px-4 border-b">{entry.symbol}</td>
                                        <td className="py-3 px-4 border-b">{entry.type}</td>
                                        <td className="py-3 px-4 border-b">{entry.position}</td>
                                        <td className="py-3 px-4 border-b">{entry.quantity}</td>
                                        <td className="py-3 px-4 border-b">{entry.price.toLocaleString()}원</td>
                                        <td className="py-3 px-4 border-b">{entry.type === '선물' && entry.leverage ? `${entry.leverage}배` : '-'}</td>
                                        <td className="py-3 px-4 border-b">{entry.investment.toLocaleString()}원</td>
                                        <td className="py-3 px-4 border-b">
                                            <span className={`font-semibold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>{entry.profit}</span>
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                            <span className={`font-semibold ${entry.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{entry.roi.toFixed(2)}%</span>
                                        </td>
                                        <td className="py-3 px-4 border-b">{entry.memo}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-6 gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="text-gray-400"
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-6 h-6 text-sm rounded-full ${
                                        page === currentPage
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="text-gray-400"
                            >
                                &gt;
                            </button>
                        </div>

                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="ml-4 border rounded px-3 py-1 text-sm"
                        >
                            {[10, 20, 30, 50].map((num) => (
                                <option key={num} value={num}>
                                    {num} / page
                                </option>
                            ))}
                        </select>
                    </div>
                </section>
                {showModal && <JournalRegisterModal onClose={() => setShowModal(false)} />}
            </div>
        </div>
    );
}