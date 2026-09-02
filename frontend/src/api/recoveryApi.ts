import axios from 'axios';
import type {
  TransactionItem,
  RecoveryPrediction,
  RecoveryCaseItem,
  RecoveryCaseDetail,
  RecoveryActionHistory,
  RecoveryExecutionResult,
  AgentAnalysisResult,
  DashboardMetrics,
  AuditEventItem,
} from '../types/recovery';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const cleanBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const baseURL = cleanBaseUrl ? `${cleanBaseUrl}/api/recovery` : '/api/recovery';

export const isLiveApiConfigured = Boolean(cleanBaseUrl);

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to ensure we never treat HTML responses (from Vercel rewrites or 404 fallbacks) as valid JSON
apiClient.interceptors.response.use(
  (response) => {
    // If Vercel rewrote /api/* to /index.html, response.data will be a string starting with "<!doctype" or "<html"
    if (typeof response.data === 'string' && (response.data.trim().startsWith('<!') || response.data.trim().startsWith('<html'))) {
      return Promise.reject(new Error('Received HTML document instead of JSON API response. Check VITE_API_BASE_URL.'));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function assertArray<T>(data: unknown, fieldName: string): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`Expected array for ${fieldName}, received ${typeof data}`);
  }
  return data as T[];
}

function assertObject<T>(data: unknown, fieldName: string): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Expected object for ${fieldName}, received ${typeof data}`);
  }
  return data as T;
}

export const recoveryApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get<DashboardMetrics>('/metrics');
    return assertObject<DashboardMetrics>(response.data, 'metrics');
  },

  async getTransactions(status?: string, limit = 100): Promise<TransactionItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    const response = await apiClient.get<TransactionItem[]>(`/transactions?${params.toString()}`);
    return assertArray<TransactionItem>(response.data, 'transactions');
  },

  async getRecoveryCases(): Promise<RecoveryCaseItem[]> {
    const response = await apiClient.get<RecoveryCaseItem[]>('/cases');
    return assertArray<RecoveryCaseItem>(response.data, 'recovery cases');
  },

  async getRecoveryCaseDetail(caseId: number): Promise<RecoveryCaseDetail> {
    const response = await apiClient.get<RecoveryCaseDetail>(`/cases/${caseId}`);
    return assertObject<RecoveryCaseDetail>(response.data, `case #${caseId}`);
  },

  async getRecoveryCaseActions(caseId: number): Promise<RecoveryActionHistory[]> {
    const response = await apiClient.get<RecoveryActionHistory[]>(`/cases/${caseId}/actions`);
    return assertArray<RecoveryActionHistory>(response.data, `actions for case #${caseId}`);
  },

  async predictRecovery(transactionId: number): Promise<RecoveryPrediction> {
    const response = await apiClient.get<RecoveryPrediction>(`/predict/${transactionId}`);
    return assertObject<RecoveryPrediction>(response.data, `prediction for txn #${transactionId}`);
  },

  async createRecoveryCase(transactionId: number): Promise<RecoveryCaseItem> {
    const response = await apiClient.post<RecoveryCaseItem>(`/cases/${transactionId}`);
    return assertObject<RecoveryCaseItem>(response.data, `created case for txn #${transactionId}`);
  },

  async executeRecoveryCase(caseId: number): Promise<RecoveryExecutionResult> {
    const response = await apiClient.post<RecoveryExecutionResult>(`/cases/${caseId}/execute`);
    return assertObject<RecoveryExecutionResult>(response.data, `execution for case #${caseId}`);
  },

  async runAgentAnalysis(transactionId: number): Promise<AgentAnalysisResult> {
    const response = await apiClient.post<AgentAnalysisResult>(`/agent/${transactionId}`);
    return assertObject<AgentAnalysisResult>(response.data, `agent analysis for txn #${transactionId}`);
  },

  async getAuditEvents(limit = 50): Promise<AuditEventItem[]> {
    const response = await apiClient.get<AuditEventItem[]>(`/audit-events?limit=${limit}`);
    return assertArray<AuditEventItem>(response.data, 'audit events');
  },
};

