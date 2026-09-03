'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InputPanel } from '@/components/InputPanel';
import { StepTracker } from '@/components/StepTracker';
import { ArtifactEditor } from '@/components/ArtifactEditor';
import { useAgentStream } from '@/lib/agent/useAgentStream';
import { useSession } from '@/lib/auth-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

const TEMPLATE_PROMPTS: Record<string, string> = {
  'nextjs-postgres':
    'Fullstack Next.js 14 app with Prisma ORM, PostgreSQL database, and standalone output mode',
  'fastapi-celery':
    'FastAPI service with asynchronous Celery background task workers and a Redis broker',
  'go-gin-microservice':
    'Ultra-light Go REST API built with Gin, scratch runtime container, and automatic Horizontal Pod Autoscaler based on CPU utilization',
};

function DemoContent() {
  const searchParams = useSearchParams();
  const templateKey = searchParams.get('template');
  const initialPrompt = templateKey ? TEMPLATE_PROMPTS[templateKey] || '' : '';

  const { data: session } = useSession();
  const { steps, artifacts, validation, costEstimate, fatalError, isRunning, verification, start } =
    useAgentStream();

  const isGenerating = steps.find((s) => s.step === 'generate')?.status === 'running';

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col gap-3 p-4 md:p-6 overflow-hidden">
      {/* Guest Mode Banner (if unauthenticated) */}
      {!session?.user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
            <span>
              <strong>Guest Review Mode:</strong> All generation features are fully functional and live. Sign in to automatically persist runs to your account.
            </span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-7 text-xs border-blue-500/40 hover:bg-blue-500/20 text-blue-200">
              Sign In to Save
            </Button>
          </Link>
        </div>
      )}

      {/* Main Two-Column Workspace */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[400px_1fr]">
        {/* Left Column: Input, Pipeline, and Diagnostics */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Input Controller */}
          <InputPanel
            onSubmit={start}
            disabled={isRunning}
            initialText={initialPrompt}
          />

          {/* Pipeline Tracker */}
          <div className="rounded-xl border border-border/80 bg-card/80 p-4 backdrop-blur-md shadow-md">
            <StepTracker
              steps={steps}
              artifactsCount={artifacts.length}
              totalExpected={7}
            />
          </div>

          {/* Fatal Error / Input Verification Notice */}
          {fatalError && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-300">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>
                  {verification && !verification.isValid ? 'Input Verification Failed' : 'Generation Error'}
                </span>
              </div>
              <p className="leading-relaxed whitespace-pre-line">{fatalError}</p>
            </div>
          )}

          {/* Validation Report */}
          {validation && (
            <div
              className={`rounded-xl border p-4 text-xs ${
                validation.passed
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                  : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1.5">
                {validation.passed ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>All Validation Checks Passed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Unresolved Issues ({validation.issues.length}):</span>
                  </>
                )}
              </div>

              {!validation.passed && (
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-300/90">
                  {validation.issues.map((i, idx) => (
                    <li key={idx}>{i.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Cost Estimate Card */}
          {costEstimate && (
            <div className="rounded-xl border border-border/80 bg-card/80 p-4 text-xs backdrop-blur-md shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <DollarSign className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Estimated Monthly Cost</span>
                </div>
                <Badge variant="warning" className="font-mono text-xs">
                  ~${costEstimate.monthlyUsd} / mo
                </Badge>
              </div>

              <div className="space-y-1.5 border-t border-border/50 pt-2 text-muted-foreground">
                {costEstimate.breakdown.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span>{b.item}</span>
                    <span className="font-mono text-foreground">${b.monthlyUsd}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Artifact Monaco Editor */}
        <div className="overflow-hidden rounded-xl border border-border/80 shadow-2xl bg-card/80">
          <ArtifactEditor
            artifacts={artifacts}
            isGenerating={isGenerating}
            totalExpected={7}
          />
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading workspace...</div>}>
          <DemoContent />
        </Suspense>
      </main>
    </div>
  );
}
