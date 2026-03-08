export interface CsvPreviewRow {
  rowNumber: number;
  tradedAt: string | null;
  symbol: string | null;
  assetType: string | null;
  tradeType: string | null;
  position: string | null;
  entryPrice: number | null;
  exitPrice: number | null;
  quantity: number | null;
  investment: number | null;
  profit: number | null;
  roi: number | null;
  leverage: number | null;
  memo: string | null;
  currency: string | null;
}

export interface CsvErrorRow {
  row: number;
  reason: string;
}

export interface CsvAnalyzeResponse {
  mappings: Record<string, Record<string, string>>;
  preview: CsvPreviewRow[];
  totalRows: number;
  successRows: number;
  errorRows: CsvErrorRow[];
  unmappedColumns: string[];
}

export interface CsvConfirmResponse {
  savedCount: number;
  message: string;
}
