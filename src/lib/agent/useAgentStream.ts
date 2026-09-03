'use client';

import { useCallback, useRef, useState } from 'react';
import type {
  AgentEvent,
  ConfigArtifact,
  CostEstimate,
  InfraPlan,
  InputVerification,
  PipelineStep,
  ValidationResult,
} from './types';

export interface StepState {
  step: PipelineStep;
  status: 'idle' | 'running' | 'succeeded' | 'failed';
  attempt: number;
  error?: string;
}

const STEP_ORDER: PipelineStep[] = ['verify', 'parse', 'generate', 'validate', 'explain'];

export function useAgentStream() {
  const [steps, setSteps] = useState<StepState[]>(
    STEP_ORDER.map((step) => ({ step, status: 'idle', attempt: 0 })),
  );
  const [verification, setVerification] = useState<InputVerification | null>(null);
  const [plan, setPlan] = useState<InfraPlan | null>(null);
  const [artifacts, setArtifacts] = useState<ConfigArtifact[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setSteps(STEP_ORDER.map((step) => ({ step, status: 'idle', attempt: 0 })));
    setVerification(null);
    setPlan(null);
    setArtifacts([]);
    setValidation(null);
    setCostEstimate(null);
    setFatalError(null);
  }, []);

  const updateStep = useCallback((step: PipelineStep, patch: Partial<StepState>) => {
    setSteps((prev) => prev.map((s) => (s.step === step ? { ...s, ...patch } : s)));
  }, []);

  const start = useCallback(
    async (inputMode: 'TEXT' | 'FILE' | 'CODE', rawInput: string) => {
      reset();
      setIsRunning(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputMode, rawInput }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `Server error (${res.status})`);
        }

        if (!res.body) throw new Error('No response body from server');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() ?? '';

          for (const chunk of chunks) {
            const line = chunk.replace(/^data: /, '').trim();
            if (!line) continue;
            try {
              handleEvent(JSON.parse(line) as AgentEvent);
            } catch {
              // skip unparseable SSE line
            }
          }
        }
      } catch (err) {
        setFatalError(err instanceof Error ? err.message : 'Connection error');
      } finally {
        setIsRunning(false);
      }

      function handleEvent(event: AgentEvent) {
        switch (event.type) {
          case 'step_started':
            updateStep(event.step, { status: 'running', attempt: event.attempt });
            break;
          case 'step_succeeded':
            updateStep(event.step, { status: 'succeeded', attempt: event.attempt });
            break;
          case 'step_failed':
            updateStep(event.step, { status: 'failed', attempt: event.attempt, error: event.error });
            break;
          case 'input_verification':
            setVerification(event.verification);
            break;
          case 'infra_plan':
            setPlan(event.plan);
            break;
          case 'artifacts':
            setArtifacts(event.artifacts);
            break;
          case 'validation':
            setValidation(event.result);
            break;
          case 'cost_estimate':
            setCostEstimate(event.estimate);
            break;
          case 'fatal_error':
            setFatalError(event.error);
            break;
          case 'complete':
            break;
        }
      }
    },
    [reset, updateStep],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  return { steps, verification, plan, artifacts, validation, costEstimate, fatalError, isRunning, start, cancel };
}
