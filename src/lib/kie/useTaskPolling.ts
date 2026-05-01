'use client';

import { useState, useCallback, useRef } from 'react';

export type TaskState = 'idle' | 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

export interface PollResult {
  state: TaskState;
  taskId?: string;
  resultUrls?: string[];
  resultJson?: string;
  failMsg?: string;
  progress?: number;
}

interface StartOptions {
  endpoint: string;
  body: Record<string, unknown>;
  taskType?: string;
  onSuccess?: (urls: string[]) => void;
  onError?: (msg: string) => void;
  maxWaitMs?: number;
  pollIntervalMs?: number;
}

export function useTaskPolling() {
  const [result, setResult] = useState<PollResult>({ state: 'idle' });
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setResult({ state: 'idle' });
  }, []);

  const start = useCallback(async (opts: StartOptions) => {
    const {
      endpoint,
      body,
      taskType = 'market',
      onSuccess,
      onError,
      maxWaitMs = 600000,
      pollIntervalMs = 5000,
    } = opts;

    abortRef.current = false;
    setResult({ state: 'waiting' });

    try {
      // 1. Create task
      const createRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const createData = await createRes.json();

      if (!createData.success || !createData.taskId) {
        const errMsg = createData.error || 'Task creation failed';
        setResult({ state: 'fail', failMsg: errMsg });
        onError?.(errMsg);
        return;
      }

      const taskId = createData.taskId as string;
      setResult({ state: 'queuing', taskId });

      // 2. Poll for result
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        if (abortRef.current) return;

        const statusRes = await fetch(
          `/api/task/${taskId}?type=${taskType}`
        );
        const statusData = await statusRes.json();

        if (statusData.state === 'success' || statusData.successFlag === 1) {
          const urls = statusData.resultUrls || [];
          setResult({
            state: 'success',
            taskId,
            resultUrls: urls,
            resultJson: statusData.resultJson,
          });
          onSuccess?.(urls);
          return;
        }

        if (
          statusData.state === 'fail' ||
          statusData.successFlag === 2 ||
          statusData.successFlag === 3
        ) {
          const errMsg = statusData.failMsg || 'Generation failed';
          setResult({ state: 'fail', taskId, failMsg: errMsg });
          onError?.(errMsg);
          return;
        }

        // Still generating
        setResult({ state: 'generating', taskId });
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }

      setResult({ state: 'fail', taskId, failMsg: 'Task timed out' });
      onError?.('Task timed out');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setResult({ state: 'fail', failMsg: msg });
      onError?.(msg);
    }
  }, []);

  return { result, start, reset };
}
