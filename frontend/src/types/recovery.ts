export interface TransactionItem {
  id: number;
  merchant_id: number;
  customer_id: number;
  customer_name?: string | null;
  customer_email?: string | null;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | string;
  failure_reason?: string | null;
  payment_method: 'upi' | 'card' | 'netbanking' | 'wallet' | string;
  retry_count: number;
  created_at: string;
  has_recovery_case: boolean;
  recovery_case_id?: number | null;
  recovery_case_status?: string | null;
  recovery_probability?: number | null;
}

export interface RecoveryPrediction {
  transaction_id: number;
  recovery_probability: number;
  recoverable: boolean;
  threshold: number;
  recommended_action: string;
  priority: 'high' | 'medium' | 'low' | string;
  reason: string;
}

export interface RecoveryCaseItem {
  recovery_case_id: number;
  transaction_id: number;
  recovery_probability: number;
  reason: string;
  status: 'open' | 'executed' | 'failed' | string;
  estimated_revenue: number;
  recommended_action?: string;
  priority?: string;
  recoverable?: boolean;
}

export interface RecoveryCaseDetail extends RecoveryCaseItem {
  action: {
    action_type: string;
    status: string;
    reason: string;
    result?: string | null;
  };
}

export interface RecoveryActionHistory {
  action_id: number;
  action_type: string;
  status: string;
  reason: string;
  result?: string | null;
  executed_at?: string | null;
}

export interface RecoveryExecutionResult {
  recovery_case_id: number;
  action: string;
  status: string;
  result: string;
}

export interface AgentAnalysisResult {
  transaction_id: number;
  analysis: string;
}

export interface DashboardMetrics {
  total_revenue_at_risk: number;
  total_recoverable_revenue: number;
  total_recovered_revenue: number;
  recovery_rate_percent: number;
  total_failed_transactions: number;
  total_successful_transactions: number;
  total_recovery_cases: number;
  executed_recovery_cases: number;
  failure_reasons_breakdown: Record<string, number>;
  payment_methods_breakdown: Record<string, number>;
}

export interface AuditEventItem {
  id: number;
  merchant_id: number;
  recovery_case_id?: number | null;
  event_type: string;
  actor: string;
  description: string;
  created_at: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
