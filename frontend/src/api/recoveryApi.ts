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

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const recoveryApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get<DashboardMetrics>('/metrics');
    return response.data;
  },

  async getTransactions(status?: string, limit = 100): Promise<TransactionItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    const response = await apiClient.get<TransactionItem[]>(`/transactions?${params.toString()}`);
    return response.data;
  },

  async getRecoveryCases(): Promise<RecoveryCaseItem[]> {
    const response = await apiClient.get<RecoveryCaseItem[]>('/cases');
    return response.data;
  },

  async getRecoveryCaseDetail(caseId: number): Promise<RecoveryCaseDetail> {
    const response = await apiClient.get<RecoveryCaseDetail>(`/cases/${caseId}`);
    return response.data;
  },

  async getRecoveryCaseActions(caseId: number): Promise<RecoveryActionHistory[]> {
    const response = await apiClient.get<RecoveryActionHistory[]>(`/cases/${caseId}/actions`);
    return response.data;
  },

  async predictRecovery(transactionId: number): Promise<RecoveryPrediction> {
    const response = await apiClient.get<RecoveryPrediction>(`/predict/${transactionId}`);
    return response.data;
  },

  async createRecoveryCase(transactionId: number): Promise<RecoveryCaseItem> {
    const response = await apiClient.post<RecoveryCaseItem>(`/cases/${transactionId}`);
    return response.data;
  },

  async executeRecoveryCase(caseId: number): Promise<RecoveryExecutionResult> {
    const response = await apiClient.post<RecoveryExecutionResult>(`/cases/${caseId}/execute`);
    return response.data;
  },

  async runAgentAnalysis(transactionId: number): Promise<AgentAnalysisResult> {
    const response = await apiClient.post<AgentAnalysisResult>(`/agent/${transactionId}`);
    return response.data;
  },

  async getAuditEvents(limit = 50): Promise<AuditEventItem[]> {
    const response = await apiClient.get<AuditEventItem[]>(`/audit-events?limit=${limit}`);
    return response.data;
  },
};
