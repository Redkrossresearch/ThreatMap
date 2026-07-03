export interface ScanResponse {
  id: string;
  indicator: string;
  type: "ip" | "url" | "domain" | "hash";
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  raw_data: Record<string, any> | null;
  created_at: string;
  linked_actors?: {
    name: string;
    country: string;
    threat_level: string;
    description: string;
  }[];
}

export interface WatchlistResponse {
  id: number;
  indicator: string;
  type: string;
  notes: string | null;
  added_at: string;
  last_scanned_at: string;
  last_risk_score: number;
}

export interface AuditLogResponse {
  id: number;
  action: string;
  resource: string;
  user_ip: string;
  details: string | null;
  timestamp: string;
}

export interface DashboardStats {
  total_scans_24h: number;
  critical_threats: number;
  high_risk_assets: number;
  monitored_iocs: number;
  recent_scans: ScanResponse[];
  threat_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  malware_prevalence: Array<{
    name: string;
    percentage: number;
    trend: "up" | "down";
  }>;
}
