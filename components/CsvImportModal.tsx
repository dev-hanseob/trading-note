'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { analyzeCsv, confirmCsvImport } from '@/lib/api/journal';
import { CsvAnalyzeResponse, CsvPreviewRow } from '@/type/dto/csvImport';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'upload' | 'preview' | 'result';

export default function CsvImportModal({ isOpen, onClose, onComplete }: CsvImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<CsvAnalyzeResponse | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    setAnalyzeResult(null);
    setSavedCount(0);
    setError('');
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('CSV 파일만 업로드 가능합니다.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setIsAnalyzing(true);

    try {
      const result = await analyzeCsv(selectedFile);
      setAnalyzeResult(result);
      setStep('preview');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || 'CSV 분석에 실패했습니다. 파일 형식을 확인해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleConfirm = async () => {
    if (!analyzeResult) return;
    setIsSaving(true);
    setError('');

    try {
      const result = await confirmCsvImport(analyzeResult.preview);
      setSavedCount(result.savedCount);
      setStep('result');
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDone = () => {
    handleClose();
    onComplete();
  };

  if (!isOpen) return null;

  const formatNumber = (n: number | null) => {
    if (n === null || n === undefined) return '-';
    return n.toLocaleString('ko-KR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {step === 'upload' && 'CSV 가져오기'}
              {step === 'preview' && '미리보기'}
              {step === 'result' && '가져오기 완료'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && !isAnalyzing && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
            >
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                CSV 파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                최대 5MB, 1000행 이하
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>
          )}

          {/* Analyzing spinner */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">AI가 데이터를 분석하고 있습니다...</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{file?.name}</p>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && analyzeResult && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  전체 <span className="font-medium text-slate-900 dark:text-white">{analyzeResult.totalRows}</span>건 중{' '}
                  <span className="font-medium text-emerald-500">{analyzeResult.successRows}</span>건 변환 성공
                  {analyzeResult.errorRows.length > 0 && (
                    <span className="text-red-500 ml-2">{analyzeResult.errorRows.length}건 오류</span>
                  )}
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">#</th>
                      <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">거래일</th>
                      <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400 font-medium">종목</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">매수가</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">매도가</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">수량</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">투자금</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">손익</th>
                      <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 font-medium">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {analyzeResult.preview.map((row: CsvPreviewRow) => (
                      <tr key={row.rowNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 text-slate-500">{row.rowNumber}</td>
                        <td className="px-3 py-2 text-slate-900 dark:text-white">{row.tradedAt || '-'}</td>
                        <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{row.symbol || '-'}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.entryPrice)}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.exitPrice)}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.quantity)}</td>
                        <td className="px-3 py-2 text-right text-slate-900 dark:text-white tabular-nums">{formatNumber(row.investment)}</td>
                        <td className={`px-3 py-2 text-right tabular-nums font-medium ${
                          (row.profit ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {row.profit !== null ? `${row.profit >= 0 ? '+' : ''}${formatNumber(row.profit)}` : '-'}
                        </td>
                        <td className={`px-3 py-2 text-right tabular-nums ${
                          (row.roi ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {row.roi !== null ? `${row.roi >= 0 ? '+' : ''}${row.roi.toFixed(2)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {analyzeResult.unmappedColumns.length > 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  매핑되지 않은 컬럼: {analyzeResult.unmappedColumns.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{savedCount}건 저장 완료</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">매매일지에서 확인할 수 있습니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          {step === 'preview' && (
            <>
              <button
                onClick={() => { reset(); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                다시 선택
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSaving || !analyzeResult?.preview.length}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg transition-colors"
              >
                {isSaving ? '저장 중...' : `${analyzeResult?.successRows ?? 0}건 저장`}
              </button>
            </>
          )}
          {step === 'result' && (
            <button
              onClick={handleDone}
              className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              매매일지 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
