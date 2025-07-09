// Centralized type definitions for the application

interface Metric {
  paging?: {
    total_items: number;
  };
}

interface FunnelData {
  [key: string]: Metric | undefined;
}

export interface MonthlyData {
  month: string;
  ogx?: {
    data?: FunnelData;
  };
  icx?: {
    data?: FunnelData;
  };
}
