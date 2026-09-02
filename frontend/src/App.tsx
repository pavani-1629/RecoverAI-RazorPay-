import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionSection } from './components/TransactionSection';
import { RecoveryCasesSection } from './components/RecoveryCasesSection';
import { AIIntelligencePanel } from './components/AIIntelligencePanel';
import { WorkflowVisualization } from './components/WorkflowVisualization';
import { AgentToolsVisualization } from './components/AgentToolsVisualization';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { ToastContainer } from './components/Toast';
import { useRecoveryData } from './hooks/useRecoveryData';
import type { TransactionItem } from './types/recovery';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedAgentTxnId, setSelectedAgentTxnId] = useState<number>(1003);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('recoverai_splash_seen');
  });

  const {
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
    handleCreateRecoveryCase,
    handleExecuteRecoveryCase,
  } = useRecoveryData();

  const handleSplashComplete = () => {
    sessionStorage.setItem('recoverai_splash_seen', 'true');
    setShowSplash(false);
  };

  const handleRunAgentForTxn = (txnId: number) => {
    setSelectedAgentTxnId(txnId);
    setActiveTab('ai-insights');
  };

  const handleInspectTransaction = (txnId: number) => {
    const txn = transactions.find((t) => t.id === txnId);
    if (txn) {
      setSelectedTransaction(txn);
    } else {
      setActiveTab('transactions');
    }
  };

  const failedCount = transactions.filter((t) => t.status === 'failed').length;
  const openCasesCount = cases.filter((c) => c.status === 'open').length;

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex selection:bg-sky-500/30 selection:text-white relative">
      {/* 1. Full-Screen Splash Launch Experience */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* 2. Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* 3. Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onCreateCase={handleCreateRecoveryCase}
        onExecuteCase={handleExecuteRecoveryCase}
        isCreatingCase={isCreatingCase}
        isExecutingCase={executingCaseId !== null}
      />

      {/* 4. Desktop Sidebar Navigation */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={() => refreshAllData(true)}
          isRefreshing={isRefreshing}
          caseCount={openCasesCount}
          failedTxnCount={failedCount}
        />
      </div>

      {/* 5. Main Application Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <MobileHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          caseCount={openCasesCount}
        />

        {/* Page Content Container with Smooth Reveal */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 animate-fade-in">
          {activeTab === 'overview' && (
            <OverviewPage
              metrics={metrics}
              transactions={transactions}
              loading={loading}
              onNavigateToTransactions={() => setActiveTab('transactions')}
              onNavigateToAI={() => setActiveTab('ai-insights')}
              onSelectTransaction={(txn: TransactionItem) => setSelectedTransaction(txn)}
            />
          )}

          {activeTab === 'transactions' && (
            <div className="animate-fade-in">
              <TransactionSection
                transactions={transactions}
                loading={loading}
                onSelectTransaction={setSelectedTransaction}
                onRunAgent={handleRunAgentForTxn}
                onCreateCase={handleCreateRecoveryCase}
              />
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="animate-fade-in">
              <RecoveryCasesSection
                cases={cases}
                loading={loading}
                onExecuteCase={handleExecuteRecoveryCase}
                executingCaseId={executingCaseId}
                onInspectTransaction={handleInspectTransaction}
              />
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="space-y-12 animate-fade-in">
              <AIIntelligencePanel initialTxnId={selectedAgentTxnId} />
              <div className="pt-8 border-t border-slate-800/80">
                <AgentToolsVisualization />
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-12 animate-fade-in">
              <WorkflowVisualization />
              <div className="pt-8 border-t border-slate-800/80">
                <AgentToolsVisualization />
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="animate-fade-in">
              <AuditTrailPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
