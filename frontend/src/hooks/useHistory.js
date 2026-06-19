import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';

export function useHistory(token) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await apiFetch('/api/history', { token });
      setHistory(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setSessionExpired(true);
      } else {
        console.error('Error fetching history:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const prependEntry = useCallback((entry) => {
    setHistory((prev) => [entry, ...prev]);
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const deleteEntry = useCallback(async (id) => {
    await apiFetch(`/api/history/${id}`, { method: 'DELETE', token });
    removeEntry(id);
  }, [token, removeEntry]);

  return {
    history,
    loading,
    sessionExpired,
    reload,
    prependEntry,
    removeEntry,
    deleteEntry,
  };
}