import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useHistory } from '../hooks/useHistory';
import { useOptimize } from '../hooks/useOptimize';
import { HistorySidebar } from './HistorySidebar';
import { OptimizeWorkspace } from './OptimizeWorkspace';

export function DashboardPage({ auth }) {
  const token = auth?.token;
  const userEmail = auth?.email;

  const [userPlan, setUserPlan] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { history, loading: loadingHistory, sessionExpired, prependEntry, deleteEntry } = useHistory(token);
  const { loading, result, error, offlineNotice, optimize, reset, loadFromHistory } = useOptimize(token);

  useDocumentTitle('Dashboard — SmartSwap');

  useEffect(() => {
    if (sessionExpired) window.location.reload();
  }, [sessionExpired]);

  const activeEntry = history.find((item) => item._id === activeHistoryId) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await optimize(userPlan);
    if (data?.historyEntry) {
      prependEntry(data.historyEntry);
      setActiveHistoryId(data.historyEntry._id);
    } else {
      setActiveHistoryId(null);
    }
  };

  const handleSelectHistory = (item) => {
    setActiveHistoryId(item._id);
    setUserPlan(item.query);
    loadFromHistory(item);
  };

  const handleCopyShare = (id) => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch((err) => console.error('Clipboard copy failed:', err));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history log?')) return;
    try {
      await deleteEntry(id);
      if (activeHistoryId === id) {
        setActiveHistoryId(null);
        setUserPlan('');
        reset();
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        window.location.reload();
        return;
      }
      alert(err.message || 'Failed to delete history log.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', minHeight: 'calc(100vh - 120px)' }}>
      <HistorySidebar
        userEmail={userEmail}
        history={history}
        loading={loadingHistory}
        activeHistoryId={activeHistoryId}
        onSelect={handleSelectHistory}
      />
      <OptimizeWorkspace
        userPlan={userPlan}
        onPlanChange={setUserPlan}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        offlineNotice={offlineNotice}
        result={result}
        activeEntry={activeEntry}
        copiedId={copiedId}
        onCopyShare={handleCopyShare}
        onDelete={handleDelete}
      />
    </div>
  );
}