'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ComparisonSection() {
  const comparisonItems = [
    {
      feature: 'Base Image Hygiene',
      manual: 'Unpinned :latest tags, bloated 1.2GB default distributions',
      infragen: 'Strictly pinned LTS digests, lightweight Alpine/distroless layers (~85MB)',
    },
    {
      feature: 'Container Security',
      manual: 'Default root execution, vulnerable filesystem write access',
      infragen: 'Enforces non-root user creation, drops privileges, isolates secrets',
    },
    {
      feature: 'Docker Cache Optimization',
      manual: 'Full directory copied first, breaking cache on every code change',
      infragen: 'Multi-stage stages; dependency manifests copied & installed first',
    },
    {
      feature: 'Kubernetes Reliability',
      manual: 'Missing readiness/liveness probes and CPU limits; risk of OOMKilled',
      infragen: 'Probes, resource requests/limits, and autoscaling (HPA) configured',
    },
    {
      feature: 'Error Handling',
      manual: 'Manual trial-and-error debugging with kubectl and build errors',
      infragen: 'Automated static validation with up to 3 self-healing retry iterations',
    },
    {
      feature: 'Cost Transparency',
      manual: 'Cloud bill surprises at the end of the month',
      infragen: 'Instant upfront monthly cloud cost estimate itemized by workload',
    },
  ];

  return (
    <section id="compare" className="relative py-20 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
            Side-by-Side Evaluation
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Why engineers prefer Infragen
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Compare hand-crafted boilerplate and generic chat prompts with Infragen&apos;s deterministic self-healing generation.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border/80">
            {/* Manual Header */}
            <div className="p-6 bg-red-950/10 border-b md:border-b-0 md:border-r border-border/70">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  Manual DevOps &amp; Generic LLMs
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Fragile, Bloated &amp; Unchecked
              </h3>
            </div>

            {/* Infragen Header */}
            <div className="p-6 bg-blue-950/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Infragen Agent Pipeline
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Hardened, Validated &amp; Production-Ready
              </h3>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {comparisonItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2">
                {/* Manual side */}
                <div className="p-5 flex items-start gap-3.5 bg-background/30 md:border-r border-border/60">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 mt-0.5">
                    <X className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-400 mb-0.5">
                      {item.feature}
                    </div>
                    <div className="text-sm text-neutral-400/90 leading-relaxed">
                      {item.manual}
                    </div>
                  </div>
                </div>

                {/* Infragen side */}
                <div className="p-5 flex items-start gap-3.5 bg-blue-500/[0.02]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-blue-400 mb-0.5">
                      {item.feature}
                    </div>
                    <div className="text-sm text-foreground font-medium leading-relaxed">
                      {item.infragen}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-neutral-900/40 p-8 sm:p-12 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to generate your production configs?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Experience the self-healing pipeline firsthand. No signup or credit card required to try.
            </p>
            <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
              <Link href="/demo">
                <Button size="lg" variant="glow" className="gap-2 px-8">
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Live Demo (Guest Mode)</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-border/80">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
