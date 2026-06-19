import { useState, useRef, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/apiClient';

export function useOptimize(token) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offlineNotice, setOfflineNotice] = useState('');
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
    setOfflineNotice('');
  }, []);

  const optimize = useCallback(async (userPlan) => {
    if (!userPlan.trim() || loading) return null;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');
    setOfflineNotice('');
    setResult(null);

    try {
      const { data } = await apiFetch('/api/optimize', {
        method: 'POST',
        body: { userPlan },
        token,
        signal: controller.signal,
      });

      setResult(data.optimization);
      if (data.offlineFallback) {
        setOfflineNotice(
          data.fallbackReason
            ? `Live AI unavailable: ${data.fallbackReason} Showing estimated alternatives instead.`
            : 'Live AI is temporarily unavailable. Showing estimated alternatives instead.',
        );
      }
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message || 'Error executing optimization call.');
      return null;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [loading, token]);

  const loadFromHistory = useCallback((item) => {
    setResult(item.data);
    setError('');
    setOfflineNotice('');
  }, []);

  return {
    loading,
    result,
    error,
    offlineNotice,
    optimize,
    reset,
    loadFromHistory,
    setResult,
  };
}