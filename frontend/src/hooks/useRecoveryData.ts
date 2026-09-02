import { useState, useEffect, useCallback } from 'react';
import type {
  TransactionItem,
  RecoveryCaseItem,
  DashboardMetrics,
  ToastMessage,
} from '../types/recovery';
import { recoveryApi } from '../api/recoveryApi';

export function useRecoveryData() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [cases, setCases] = useState<RecoveryCaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [executingCaseId, setExecutingCaseId] = useState<number | null>(null);
  const [isCreatingCase, setIsCreatingCase] = useState<boolean>(false);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAllData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [metricsData, transactionsData, casesData] = await Promise.all([
        recoveryApi.getMetrics().catch((err) => {
          console.warn('Metrics failed to load', err);
          return null;
        }),
        recoveryApi.getTransactions(undefined, 100).catch((err) => {
          console.warn('Transactions failed to load', err);
          return [] as TransactionItem[];
        }),
        recoveryApi.getRecoveryCases().catch((err) => {
          console.warn('Cases failed to load', err);
          return [] as RecoveryCaseItem[];
        }),
      ]);

      if (metricsData) setMetrics(metricsData);
      setTransactions(transactionsData);
      setCases(casesData);

      if (isManual) {
        addToast('info', 'Live Data Synchronized', 'Fetched latest transaction metrics and cases from database.');
      }
    } catch (error) {
      console.error('Failed to load RecoverAI data', error);
      addToast('error', 'Connection Notice', 'Could not sync with RecoverAI backend. Check if FastAPI server is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleCreateRecoveryCase = async (txnId: number) => {
    setIsCreatingCase(true);
    try {
      const newCase = await recoveryApi.createRecoveryCase(txnId);
      addToast(
        'success',
        'Recovery Case Created',
        `Case #${newCase.recovery_case_id} established with action: ${newCase.recommended_action || 'Determined'}`
      );
      await refreshAllData();

      // Update selected transaction if currently open in modal
      if (selectedTransaction && selectedTransaction.id === txnId) {
        setSelectedTransaction((prev) =>
          prev
            ? {
                ...prev,
                has_recovery_case: true,
                recovery_case_id: newCase.recovery_case_id,
                recovery_case_status: 'open',
                recovery_probability: newCase.recovery_probability,
              }
            : null
        );
      }
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to create recovery case.';
      addToast('error', 'Case Creation Notice', detail);
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleExecuteRecoveryCase = async (caseId: number) => {
    setExecutingCaseId(caseId);
    try {
      const result = await recoveryApi.executeRecoveryCase(caseId);
      addToast(
        'success',
        'Recovery Executed Successfully',
        `Action "${result.action}" executed. Result: ${result.result}`
      );
      await refreshAllData();

      // Update selected transaction if currently open
      if (selectedTransaction && selectedTransaction.recovery_case_id === caseId) {
        setSelectedTransaction((prev) =>
          prev
            ? {
                ...prev,
                recovery_case_status: 'executed',
              }
            : null
        );
      }
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to execute recovery action.';
      addToast('error', 'Execution Notice', detail);
    } finally {
      setExecutingCaseId(null);
    }
  };

  return {
    metrics,
    transactions,
    cases,
    loading,
    isRefreshing,
    toasts,
    selectedTransaction,
    executingCaseId,
    isCreatingCase,
    setSelectedTransaction,
    refreshAllData,
    dismissToast,
    addToast,
    handleCreateRecoveryCase,
    handleExecuteRecoveryCase,
  };
}
