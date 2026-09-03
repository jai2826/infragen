'use client';

import * as React from 'react';
import type { StepState } from '@/lib/agent/useAgentStream';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  FileCode2,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCw,
  ScanSearch,
} from 'lucide-react';

const STEP_METADATA: Record<
  StepState['step'],
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  verify: {
    label: 'Verify Input',
    description: 'AI check for query relevance, stack feasibility & safety',
    icon: ScanSearch,
  },
  parse: {
    label: 'Parse & Plan',
    description: 'Extract dependencies, ports & volume bindings',
    icon: Layers,
  },
  generate: {
    label: 'Generate Artifacts',
    description: 'Multi-stage Dockerfiles, Compose & Kubernetes specs',
    icon: FileCode2,
  },
  validate: {
    label: 'Static Validation',
    description: 'Self-healing validation loop against linter rules',
    icon: ShieldCheck,
  },
  explain: {
    label: 'Explain & Estimate',
    description: 'Architectural decisions & monthly cloud costs',
    icon: DollarSign,
  },
};

export function StepTracker({ steps }: { steps: StepState[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Agent Pipeline Progress
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          {steps.filter((s) => s.status === 'succeeded').length} / {steps.length} Complete
        </span>
      </div>

      <ol className="relative space-y-2">
        {steps.map((s) => {
          const meta = STEP_METADATA[s.step];
          const StepIcon = meta.icon;
          const isRunning = s.status === 'running';
          const isSucceeded = s.status === 'succeeded';
          const isFailed = s.status === 'failed';

          return (
            <li
              key={s.step}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                isRunning
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-sm shadow-blue-500/10'
                  : isSucceeded
                    ? 'border-border/70 bg-card/60'
                    : isFailed
                      ? 'border-red-500/40 bg-red-500/10'
                      : 'border-border/40 bg-background/30 opacity-60'
              }`}
            >
              {/* Status Indicator Icon */}
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                ) : isSucceeded ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isFailed ? (
                  <XCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <StepIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Step Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isRunning
                        ? 'text-blue-300'
                        : isSucceeded
                          ? 'text-foreground'
                          : isFailed
                            ? 'text-red-300'
                            : 'text-muted-foreground'
                    }`}
                  >
                    {meta.label}
                  </span>

                  {s.attempt > 1 && (
                    <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                      <RotateCw className="h-2.5 w-2.5 animate-spin" />
                      <span>Retry {s.attempt}</span>
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground truncate">
                  {meta.description}
                </p>

                {isFailed && s.error && (
                  <p className="mt-1 text-[11px] font-mono text-red-400">
                    {s.error}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
