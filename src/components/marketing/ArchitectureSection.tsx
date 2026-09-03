'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

export function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-20 md:py-32 border-t border-border/50 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
            Transparent Agent Lifecycle
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How the Infragen Agent Works
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Unlike black-box chat models, Infragen runs an orchestrated state-machine with static verification and an automatic retry loop before delivering final artifacts.
          </p>
        </div>

        {/* Visual Architecture Flow */}
        <div className="relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 md:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col rounded-xl border border-border/80 bg-background/80 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  1
                </span>
                <Badge variant="outline" className="text-[10px] text-blue-300 border-blue-500/30">
                  Structured JSON
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1">
                Parse &amp; Plan
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gemini extracts the application language, runtime dependencies, environment variables, stateful requirements, and port bindings into an internal <code className="text-blue-300">InfraPlan</code>.
              </p>
              <div className="mt-4 rounded bg-neutral-950 p-2.5 font-mono text-[10px] text-blue-300/80 border border-neutral-800">
                {`{ "appType": "nextjs", "db": "postgres", "targetPorts": [3000] }`}
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex flex-col rounded-xl border border-border/80 bg-background/80 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  2
                </span>
                <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-500/30">
                  Parallel Artifacts
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1">
                Generation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generates Dockerfiles (dev &amp; prod variants), Compose manifests, K8s Deployments, Services, ConfigMaps, and autoscaling HPA specs.
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                <span className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                  Dockerfile
                </span>
                <span className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                  k8s-deploy.yaml
                </span>
                <span className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                  k8s-hpa.yaml
                </span>
              </div>
            </motion.div>

            {/* Step 3: Self-Healing Loop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex flex-col rounded-xl border-2 border-emerald-500/40 bg-emerald-950/10 p-5 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  3
                </span>
                <Badge variant="success" className="text-[10px] flex items-center gap-1">
                  <RotateCw className="h-2.5 w-2.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Self-Healing Loop</span>
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1 flex items-center gap-1.5">
                <span>Validation &amp; Retry</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Static validation checks for unpinned versions, root execution, and missing probes. If issues are caught, the agent feeds errors back into Step 2 (up to 3 retries) until it passes.
              </p>
              <div className="mt-4 rounded bg-emerald-950/40 p-2 text-[11px] text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Zero syntax errors guaranteed</span>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative flex flex-col rounded-xl border border-border/80 bg-background/80 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                  4
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
                  Decision &amp; Cost
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1">
                Explain &amp; Estimate
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Produces plain-English rationale for architectural decisions alongside an itemized monthly dollar estimate for running the workloads on Kubernetes.
              </p>
              <div className="mt-4 rounded bg-amber-950/20 p-2.5 text-[11px] text-amber-300 border border-amber-500/30 flex items-center justify-between font-mono">
                <span>Est. Cloud Cost:</span>
                <span className="font-bold">~$40 - $70/mo</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
