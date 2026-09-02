import { useState, useEffect, useCallback } from 'react';
import type {
  TransactionItem,
  RecoveryCaseItem,
  DashboardMetrics,
  ToastMessage,
} from '../types/recovery';
import { recoveryApi, isLiveApiConfigured } from '../api/recoveryApi';
import {
  MOCK_METRICS,
  MOCK_TRANSACTIONS,
  MOCK_CASES,
} from '../data/mockData';

export function useRecoveryData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(MOCK_METRICS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(MOCK_TRANSACTIONS);
  const [cases, setCases] = useState<RecoveryCaseItem[]>(MOCK_CASES);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
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
          console.warn('Backend metrics unavailable:', err?.message || err);
          return null;
        }),
        recoveryApi.getTransactions(undefined, 100).catch((err) => {
          console.warn('Backend transactions unavailable:', err?.message || err);
          return null;
        }),
        recoveryApi.getRecoveryCases().catch((err) => {
          console.warn('Backend recovery cases unavailable:', err?.message || err);
          return null;
        }),
      ]);

      const hasValidLiveTransactions = Array.isArray(transactionsData) && transactionsData.length > 0;
      const hasValidLiveCases = Array.isArray(casesData);
      const hasValidMetrics = Boolean(metricsData && typeof metricsData === 'object' && 'total_revenue_at_risk' in metricsData);

      if (hasValidLiveTransactions || hasValidMetrics) {
        setIsLiveBackend(true);
        if (hasValidMetrics && metricsData) setMetrics(metricsData);
        if (hasValidLiveTransactions && transactionsData) setTransactions(transactionsData);
        if (hasValidLiveCases && casesData) setCases(casesData);

        if (isManual) {
          addToast('success', 'Live Sync Complete', 'Updated metrics from Supabase PostgreSQL database.');
        }
      } else {
        // Use Mock data fallback so screen is NEVER blank
        setIsLiveBackend(false);
        setMetrics((prev) => prev || MOCK_METRICS);
        setTransactions((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : MOCK_TRANSACTIONS));
        setCases((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : MOCK_CASES));

        if (isManual) {
          addToast(
            'info',
            'Demo Mode Active',
            isLiveApiConfigured
              ? 'Render backend is cold-starting or connecting to Supabase. Loaded offline demo dataset.'
              : 'Operating in self-contained interactive demo mode.'
          );
        }
      }
    } catch (error) {
      console.error('Failed to load RecoverAI data', error);
      setIsLiveBackend(false);
      setMetrics((prev) => prev || MOCK_METRICS);
      setTransactions((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : MOCK_TRANSACTIONS));
      setCases((prev) => (Array.isArray(prev) && prev.length > 0 ? prev : MOCK_CASES));
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
      if (isLiveBackend) {
        const newCase = await recoveryApi.createRecoveryCase(txnId);
        addToast(
          'success',
          'Recovery Case Created',
          `Case #${newCase.recovery_case_id} established with action: ${newCase.recommended_action || 'Determined'}`
        );
        await refreshAllData();
      } else {
        // Demo simulation mode
        const newCaseId = 600 + Math.floor(Math.random() * 100);
        const newCase: RecoveryCaseItem = {
          recovery_case_id: newCaseId,
          transaction_id: txnId,
          recovery_probability: 0.887,
          reason: 'Automated recovery workflow initialized via policy matrix.',
          status: 'open',
          estimated_revenue: transactions.find((t) => t.id === txnId)?.amount || 14999.0,
          recommended_action: 'alternative_payment',
          priority: 'high',
          recoverable: true,
        };

        setCases((prev) => [newCase, ...prev.filter((c) => c.transaction_id !== txnId)]);
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === txnId
              ? {
                  ...t,
                  has_recovery_case: true,
                  recovery_case_id: newCaseId,
                  recovery_case_status: 'open',
                  recovery_probability: 0.887,
                }
              : t
          )
        );

        addToast(
          'success',
          'Recovery Case Created (Demo)',
          `Case #${newCaseId} established with action: alternative_payment`
        );
      }

      // Update selected transaction if currently open in modal
      if (selectedTransaction && selectedTransaction.id === txnId) {
        setSelectedTransaction((prev) =>
          prev
            ? {
                ...prev,
                has_recovery_case: true,
                recovery_case_id: prev.recovery_case_id || 601,
                recovery_case_status: 'open',
                recovery_probability: prev.recovery_probability || 0.887,
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
      if (isLiveBackend) {
        const result = await recoveryApi.executeRecoveryCase(caseId);
        addToast(
          'success',
          'Recovery Executed Successfully',
          `Action "${result.action}" executed. Result: ${result.result}`
        );
        await refreshAllData();
      } else {
        // Demo simulation mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCases((prev) =>
          prev.map((c) =>
            c.recovery_case_id === caseId ? { ...c, status: 'executed' } : c
          )
        );
        setTransactions((prev) =>
          prev.map((t) =>
            t.recovery_case_id === caseId ? { ...t, recovery_case_status: 'executed' } : t
          )
        );
        setMetrics((prev) => ({
          ...prev,
          executed_recovery_cases: prev.executed_recovery_cases + 1,
          total_recovered_revenue: prev.total_recovered_revenue + 14999.0,
        }));
        addToast(
          'success',
          'Recovery Executed (Demo)',
          'Alternative payment link dispatched and customer notified.'
        );
      }

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
    isLiveBackend,
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

